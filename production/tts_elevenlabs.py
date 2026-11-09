"""ElevenLabs voiceover for business-doc episodes. No third-party packages needed.

The API key is read from the ELEVENLABS_API_KEY environment variable, or from a
`.env` file next to this script containing a line:  ELEVENLABS_API_KEY=...
(never paste the key into chat or commit it).

Commands:
  python3 tts_elevenlabs.py check
      Confirms the key works and shows remaining character credits.
  python3 tts_elevenlabs.py voices [--search narrator]
      Lists voices on the account (name, id, labels).
  python3 tts_elevenlabs.py audition episodes/subway VOICE_ID [VOICE_ID ...] [--segments 1-6]
      Renders the first few segments in each voice into episodes/<ep>/auditions/<voice>.mp3.
  python3 tts_elevenlabs.py render episodes/subway VOICE_ID [--model eleven_multilingual_v2]
      Renders every segment (cached; re-runs only changed lines) and writes
      episodes/<ep>/vo/sNNN.mp3, sNNN.json (character timestamps) and timeline.json.
"""
import argparse
import base64
import hashlib
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

API = "https://api.elevenlabs.io/v1"
HERE = Path(__file__).resolve().parent
DEFAULT_MODEL = "eleven_v4"
STYLE_MODELS = ("eleven_multilingual_v2",)  # models that accept the "style" setting
DEFAULT_SETTINGS = {"stability": 0.5, "similarity_boost": 0.75, "style": 0.0, "use_speaker_boost": True}
GAP_SECONDS = 0.3  # default pause between lines (measured from where the voice really stops)
TAKE_STYLE = "stitched-v1"  # bump to re-record every line with a new generation method
STITCH_WINDOW = 7000  # seconds: ElevenLabs only stitches to requests from roughly the last two hours
LAST_REQUEST_ID = None
LEXICON_PATH = HERE / "pronunciation.json"


def load_lexicon():
    if LEXICON_PATH.exists():
        return json.loads(LEXICON_PATH.read_text(encoding="utf-8"))
    return {"always": {}, "candidates": {}, "homophones": []}


def apply_lexicon(text, lexicon=None, extra=None):
    """Swap in spoken forms: the channel's 'always' entries, plus any per-line overrides."""
    lexicon = lexicon or load_lexicon()
    for src, dst in {**lexicon.get("always", {}), **(extra or {})}.items():
        text = text.replace(src, dst)
    return text


def cache_key(voice_id, model, text):
    """The key a rendered line is stored under. Based on the script text (before lexicon swaps)."""
    return hashlib.sha1(f"{voice_id}|{model}|{json.dumps(DEFAULT_SETTINGS)}|{TAKE_STYLE}|{text}".encode()).hexdigest()[:12]


def pause_after(seg, nxt):
    """Edit-controlled pauses, so emphasis beats are consistent regardless of the voice."""
    if seg.get("pause_after") is not None:
        return float(seg["pause_after"])
    if nxt is None:
        return 0.0
    if nxt.get("chapter") != seg.get("chapter"):
        return 0.8  # chapter change
    text = seg["text"].strip()
    if text.endswith("?"):
        return 0.5
    if len(text.split()) <= 4:
        return 0.45  # punchy line: let it land
    if len(nxt["text"].split()) <= 7 and text.endswith("."):
        return 0.4  # beat before a short reveal line
    return GAP_SECONDS


def api_key() -> str:
    key = os.environ.get("ELEVENLABS_API_KEY", "").strip()
    env = HERE / ".env"
    if not key and env.exists():
        for line in env.read_text().splitlines():
            if line.strip().startswith("ELEVENLABS_API_KEY="):
                key = line.split("=", 1)[1].strip().strip('"').strip("'")
    if not key:
        sys.exit("No API key found. Create production/.env with ELEVENLABS_API_KEY=<your key> (see README).")
    return key


def request(method, path, body=None, query="", headers_out=None):
    url = f"{API}{path}{query}"
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method, headers={
        "xi-api-key": api_key(), "Content-Type": "application/json", "Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            if headers_out is not None:
                headers_out.update({k.lower(): v for k, v in r.headers.items()})
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        detail = e.read().decode(errors="ignore")[:500]
        sys.exit(f"ElevenLabs API error {e.code} on {path}: {detail}")


def cmd_check(_):
    sub = request("GET", "/user/subscription")
    used, limit = sub.get("character_count"), sub.get("character_limit")
    print(f"Key OK · tier: {sub.get('tier')} · characters used {used} of {limit}")


def cmd_voices(a):
    data = request("GET", "/voices")
    for v in data.get("voices", []):
        labels = ", ".join(f"{k}: {val}" for k, val in (v.get("labels") or {}).items())
        line = f"{v.get('voice_id')} | {v.get('name')} | {v.get('category')} | {labels}"
        if not a.search or a.search.lower() in line.lower():
            print(line)


def synth(voice_id, text, model, prev_text="", next_text="", settings=None, seed=None, prev_ids=None):
    """One take. With prev_ids (request ids of the lines just before), ElevenLabs continues the delivery
    from those takes ("request stitching"), so lines flow instead of each restarting cold."""
    global LAST_REQUEST_ID
    vs = dict(settings or DEFAULT_SETTINGS)
    if model not in STYLE_MODELS:
        vs.pop("style", None)
    body = {"text": text, "model_id": model, "voice_settings": vs}
    if seed is not None:
        body["seed"] = int(seed)
    if prev_ids:
        body["previous_request_ids"] = list(prev_ids)[-3:]
    elif prev_text:
        body["previous_text"] = prev_text
    if next_text:
        body["next_text"] = next_text
    hdrs = {}
    res = request("POST", f"/text-to-speech/{voice_id}/with-timestamps", body, "?output_format=mp3_44100_128", hdrs)
    LAST_REQUEST_ID = hdrs.get("request-id")
    audio = base64.b64decode(res["audio_base64"])
    align = res.get("alignment") or res.get("normalized_alignment") or {}
    ends = align.get("character_end_times_seconds") or [0]
    return audio, align, float(ends[-1])


def fresh_ids(metas):
    """Request ids from the given takes (in order) that are recent enough to stitch to."""
    now = time.time()
    return [m["request_id"] for m in metas if m and m.get("request_id") and now - m.get("made", 0) < STITCH_WINDOW]


def speech_bounds(meta):
    """Where the voice really starts and stops in a take (written by trim_takes.py); falls back to the
    alignment, which runs ~0.5s past the last word."""
    if meta.get("speech"):
        return meta["speech"][0], meta["speech"][1]
    return 0.0, float(meta["duration"])


def load_segments(ep: Path, voiced_only=False):
    segs = json.loads((ep / "narration.json").read_text(encoding="utf-8"))
    return [s for s in segs if s.get("type") != "sot"] if voiced_only else segs


def parse_range(spec, n):
    a, _, b = spec.partition("-")
    return range(int(a) - 1, min(int(b or a), n))


def cmd_audition(a):
    ep = Path(a.episode)
    segs = load_segments(ep, voiced_only=True)
    idx = parse_range(a.segments, len(segs))
    text = " ".join(segs[i]["text"] for i in idx)
    out = ep / "auditions"
    out.mkdir(parents=True, exist_ok=True)
    for vid in a.voice_ids:
        audio, _, dur = synth(vid, apply_lexicon(text), a.model)
        (out / f"{vid}.mp3").write_bytes(audio)
        print(f"{vid}: {dur:.1f}s → {out / (vid + '.mp3')}")


def cmd_render(a):
    ep = Path(a.episode)
    segs = load_segments(ep)
    vo = ep / "vo"
    vo.mkdir(parents=True, exist_ok=True)
    lexicon = load_lexicon()
    timeline, t = [], 0.0
    voiced = [x for x in segs if x.get("type") != "sot"]
    # Takes are matched by content, not position: if lines shift (e.g. a real-voice clip is inserted),
    # existing takes are reused instead of re-recorded. Load them all first so moves can't overwrite a source.
    pool = {}
    for m in vo.glob("s*.json"):
        try:
            meta_d = json.loads(m.read_text())
            src = m.with_suffix(".mp3")
            if src.exists() and meta_d.get("hash"):
                pool.setdefault(meta_d["hash"], (src.read_bytes(), meta_d))
        except (OSError, ValueError):
            continue
    recent = []  # metas of the voiced lines just before this one, for request stitching
    for i, s in enumerate(segs):
        nxt_any = segs[i + 1] if i + 1 < len(segs) else None
        if s.get("type") == "sot":
            dur = float(s.get("duration", 6.0))
            gap = 0.25 if nxt_any else 0.0
            timeline.append({**s, "audio": None, "start": round(t, 3), "duration": dur, "pause_after": gap})
            t += dur + gap
            print(f"{s['id']} [real-voice clip] {dur:5.1f}s  {s['text'][:60]}")
            continue
        key = cache_key(a.voice_id, a.model, apply_lexicon(s["text"], lexicon))
        mp3, meta = vo / f"{s['id']}.mp3", vo / f"{s['id']}.json"
        cached = meta.exists() and json.loads(meta.read_text()).get("hash") == key and mp3.exists()
        if not cached and key in pool:  # same line recorded before under another position
            audio_b, meta_d = pool[key]
            mp3.write_bytes(audio_b)
            meta.write_text(json.dumps(meta_d, ensure_ascii=False))
            cached = True
        if cached:
            m = json.loads(meta.read_text())
        else:
            vi = voiced.index(s)
            prev_text = apply_lexicon(voiced[vi - 1]["text"], lexicon) if vi > 0 else ""
            next_text = apply_lexicon(voiced[vi + 1]["text"], lexicon) if vi + 1 < len(voiced) else ""
            spoken = apply_lexicon(s["text"], lexicon)
            audio, align, dur = synth(a.voice_id, spoken, a.model, prev_text, next_text,
                                      prev_ids=fresh_ids(recent[-3:]))
            mp3.write_bytes(audio)
            m = {"hash": key, "duration": dur, "spoken_text": spoken, "alignment": align,
                 "request_id": LAST_REQUEST_ID, "made": time.time()}
            meta.write_text(json.dumps(m, ensure_ascii=False))
        recent.append(m)
        on, off = speech_bounds(m)
        dur = off - on
        nxt = nxt_any
        gap = 0.25 if (nxt and nxt.get("type") == "sot") else pause_after(s, nxt)
        timeline.append({**s, "audio": f"vo/{s['id']}.mp3", "start": round(t, 3), "duration": round(dur, 3),
                         "trim": round(on, 3), "pause_after": gap})
        t += dur + gap
        print(f"{s['id']} {'(cached)' if cached else ''} {dur:5.1f}s  {s['text'][:70]}")
    (ep / "timeline.json").write_text(json.dumps({"voice_id": a.voice_id, "model": a.model,
                                                 "total_seconds": round(t, 2), "segments": timeline},
                                                indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nTotal ≈ {t / 60:.1f} min → {ep / 'timeline.json'}")


def main():
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("check").set_defaults(fn=cmd_check)
    v = sub.add_parser("voices")
    v.add_argument("--search", default="")
    v.set_defaults(fn=cmd_voices)
    au = sub.add_parser("audition")
    au.add_argument("episode")
    au.add_argument("voice_ids", nargs="+")
    au.add_argument("--segments", default="1-6")
    au.add_argument("--model", default=DEFAULT_MODEL)
    au.set_defaults(fn=cmd_audition)
    r = sub.add_parser("render")
    r.add_argument("episode")
    r.add_argument("voice_id")
    r.add_argument("--model", default=DEFAULT_MODEL)
    r.set_defaults(fn=cmd_render)
    a = p.parse_args()
    a.fn(a)


if __name__ == "__main__":
    main()
