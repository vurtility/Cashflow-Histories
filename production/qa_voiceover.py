"""Automatic voiceover QA: pronunciation, pacing and audio checks, with automatic re-takes.

For every rendered line it:
  1. transcribes the clip with Whisper (local) and compares it to the script
     (numbers, homophones and accepted respellings normalised on both sides),
  2. measures pacing from ElevenLabs' character timestamps (words per minute,
     mid-sentence pauses, leading silence),
  3. measures loudness and peaks from the decoded audio.
Lines that fail are re-taken automatically (new seed → candidate respellings from
pronunciation.json → steadier voice settings), up to --max-attempts each and a total
character budget. The best take is kept. Writes episodes/<ep>/qa-report.md and qa.json.

Usage (from production/):
  .venv/bin/python qa_voiceover.py episodes/subway [--fix] [--budget 3000] [--max-attempts 3]
Without --fix it only checks and reports.
"""
import argparse
import json
import math
import random
import re
import statistics
import sys
import warnings
from difflib import SequenceMatcher
from pathlib import Path

warnings.filterwarnings("ignore")

import numpy as np  # noqa: E402
from faster_whisper import WhisperModel  # noqa: E402
from faster_whisper.audio import decode_audio  # noqa: E402
from num2words import num2words  # noqa: E402

import tts_elevenlabs as tts  # noqa: E402

# ---- thresholds ---------------------------------------------------------------
ACCURACY_PASS = 0.92        # share of script words heard correctly
RATE_FAST = 1.30            # long lines: flag if > 1.30 x the episode's median syllables/sec
RATE_SLOW = 0.65            # long lines: flag if < 0.65 x the median
PUNCH_FAST = 1.35           # short punch lines (< 12 syllables) must not be rushed
INTERNAL_SILENCE_MAX = 1.05 # any silence inside a clip longer than this
MID_PAUSE_MAX = 0.75        # seconds of silence inside a sentence (not after punctuation)
LEAD_SILENCE_MAX = 0.45     # seconds before the first word
LOUDNESS_DEVIATION_DB = 4.0 # vs the episode median
PEAK_MAX = 0.999            # near-clipping
HETERONYMS = {"read", "lead", "live", "close", "record", "present", "content", "minute", "object",
              "project", "wind", "tear", "bow", "row", "desert", "produce", "refuse", "use", "lives",
              "moped", "polish", "subject", "contract", "conduct", "permit", "estimate", "graduate"}

# ---- text normalisation ---------------------------------------------------------
SCALE = r"(thousand|million|billion|trillion)"


def _num_words(num_str):
    n = num_str.replace(",", "")
    try:
        if "." in n:
            return num2words(float(n))
        v = int(n)
        if 1900 <= v <= 2099 and len(n) == 4:
            return num2words(v, to="year")
        return num2words(v)
    except Exception:  # noqa: BLE001
        return n


def normalise(text, homophone_map, reverse_alias):
    t = text.replace("’", "'").replace("—", " ").replace("–", " ")
    for alias, original in reverse_alias.items():
        t = re.sub(re.escape(alias), original, t, flags=re.I)
    t = re.sub(r"\bfoot[\s-]long", "footlong", t, flags=re.I)
    t = re.sub(r"\$(\d+)\.(\d\d)\b", lambda m: f"{m.group(1)} {int(m.group(2))}", t)  # $6.99 -> six ninety-nine
    t = re.sub(r"\ba (hundred|thousand|million|billion)\b", r"one \1", t, flags=re.I)
    t = re.sub(r"(\d+) and a half", lambda m: f"{m.group(1)}.5", t)
    t = re.sub(r"\b(\w+) and a half\b", r"\1 point five", t)
    # $1.4 million -> 1.4 million dollars ; $500 -> 500 dollars
    t = re.sub(rf"\$\s?([\d,]*\.?\d+)\s*{SCALE}?", lambda m: f"{m.group(1)} {m.group(2) or ''} dollars ", t, flags=re.I)
    t = re.sub(r"([\d,]*\.?\d+)\s*%", r"\1 percent", t)
    t = re.sub(r"\d[\d,]*\.?\d*", lambda m: " " + _num_words(m.group(0).rstrip(".")) + " ", t)
    t = t.lower().replace("-", " ").replace("'s", "s").replace("'", "")
    words = re.findall(r"[a-z]+", t)
    words = [w for w in words if w not in ("and", "dollars", "dollar")]  # number-style noise
    return [homophone_map.get(w, w) for w in words]


def build_maps(lexicon):
    hmap = {}
    for group in lexicon.get("homophones", []):
        canon = re.sub(r"[^a-z]", "", group[0].lower())
        for w in group:
            hmap[re.sub(r"[^a-z]", "", w.lower())] = canon
    reverse_alias = {}
    for original, alias in lexicon.get("always", {}).items():
        reverse_alias[alias] = original
    for original, cands in lexicon.get("candidates", {}).items():
        for c in cands:
            reverse_alias[c] = original
    return hmap, reverse_alias


def sound_key(word):
    """Rough phonetic skeleton so 'roark'/'rourke' or 'cancro'/'kankro' count as the same sound."""
    w = word.lower()
    for a_, b_ in (("ph", "f"), ("ck", "k"), ("ch", "k"), ("q", "k"), ("c", "k"), ("z", "s"), ("x", "ks"),
                   ("gh", "g"), ("wr", "r"), ("kn", "n"), ("y", "i")):
        w = w.replace(a_, b_)
    head, tail = w[:1], re.sub(r"[aeiouhw]", "", w[1:])
    key = head + tail
    return re.sub(r"(.)\1+", r"\1", key)


def compare(script_text, heard_text, hmap, reverse_alias):
    ref = normalise(script_text, hmap, reverse_alias)
    hyp = normalise(heard_text, hmap, reverse_alias)
    sm = SequenceMatcher(a=ref, b=hyp, autojunk=False)
    matched = sum(b.size for b in sm.get_matching_blocks())
    issues = []
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == "equal":
            continue
        exp, got = " ".join(ref[i1:i2]), " ".join(hyp[j1:j2])
        # accept near-identical names (e.g. 'deluca' vs 'de luca')
        same_sound = (op == "replace" and (i2 - i1) == (j2 - j1)
                      and all(sound_key(x) == sound_key(y) for x, y in zip(ref[i1:i2], hyp[j1:j2])))
        if same_sound or exp.replace(" ", "") == got.replace(" ", "") or (
                exp and got and SequenceMatcher(a=exp, b=got).ratio() >= 0.85):
            matched += i2 - i1
            continue
        issues.append({"type": op, "expected": exp, "heard": got})
    acc = matched / max(len(ref), 1)
    return min(acc, 1.0), issues


# ---- pacing & audio -------------------------------------------------------------
PUNCT = set(".,;:?!—–…\"')")


def syllables(text):
    n = 0
    for word in text.split():
        w = re.sub(r"[^a-z]", "", word.lower())
        if not w:
            continue
        v = len(re.findall(r"[aeiouy]+", w))
        if w.endswith("e") and not w.endswith(("le", "ee")) and v > 1:
            v -= 1
        n += max(v, 1)
    return n


def voiced(path):
    """Speech span, leading silence and internal silences from the audio's energy (20 ms frames)."""
    x = decode_audio(str(path), sampling_rate=16000)
    f = 320
    n = len(x) // f
    if n == 0:
        return {"span": 0.01, "lead": 0.0, "silences": []}
    fr = x[: n * f].reshape(n, f)
    db = 20 * np.log10(np.sqrt((fr ** 2).mean(1)) + 1e-9)
    thr = max(-45.0, float(db.max()) - 35.0)
    v = np.where(db > thr)[0]
    if len(v) == 0:
        return {"span": 0.01, "lead": 0.0, "silences": []}
    silences, run = [], 0
    for i in range(v[0], v[-1] + 1):
        if db[i] <= thr:
            run += 1
        else:
            if run * f / 16000 > 0.25:
                silences.append(round(run * f / 16000, 2))
            run = 0
    return {"span": (v[-1] - v[0] + 1) * f / 16000, "lead": round(v[0] * f / 16000, 2), "silences": silences}


def pacing_from_words(text, words):
    """Pace and pauses measured on the actual audio (Whisper word timestamps)."""
    out = {"wpm": None, "mid_pauses": [], "lead_silence": 0.0}
    if not words:
        return out
    span = max(words[-1].end - words[0].start, 0.01)
    out["wpm"] = round(len(text.split()) / span * 60, 1)
    out["lead_silence"] = round(words[0].start, 2)
    for prev, cur in zip(words, words[1:]):
        gap = cur.start - prev.end
        if gap > MID_PAUSE_MAX and prev.word.strip()[-1:] not in PUNCT:
            out["mid_pauses"].append({"after": prev.word.strip(), "seconds": round(gap, 2)})
    return out


def pacing(text, align):
    chars = align.get("characters") or []
    starts = align.get("character_start_times_seconds") or []
    ends = align.get("character_end_times_seconds") or []
    out = {"wpm": None, "mid_pauses": [], "lead_silence": 0.0}
    if not chars or not starts:
        return out
    first = next((i for i, c in enumerate(chars) if c.strip()), 0)
    last = max((i for i, c in enumerate(chars) if c.strip()), default=len(chars) - 1)
    span = max(ends[last] - starts[first], 0.01)
    words = len(text.split())
    out["wpm"] = round(words / span * 60, 1)
    out["lead_silence"] = round(starts[first], 2)
    for i in range(first + 1, last + 1):
        gap = starts[i] - ends[i - 1]
        prev_non_space = next((chars[k] for k in range(i - 1, -1, -1) if chars[k].strip()), "")
        if gap > MID_PAUSE_MAX and prev_non_space not in PUNCT:
            ctx = "".join(chars[max(first, i - 15):i]).strip()
            out["mid_pauses"].append({"after": ctx, "seconds": round(gap, 2)})
    return out


def audio_stats(path):
    x = decode_audio(str(path), sampling_rate=16000)
    if x.size == 0:
        return {"rms_db": -99.0, "peak": 0.0}
    rms = float(np.sqrt(np.mean(np.square(x))))
    return {"rms_db": round(20 * math.log10(max(rms, 1e-9)), 1), "peak": round(float(np.max(np.abs(x))), 3)}


def risky_words(text, lexicon):
    known = set(lexicon.get("always", {})) | set(lexicon.get("candidates", {}))
    found = set()
    for m in re.finditer(r"(?<![.!?]\s)(?<!^)\b([A-Z][a-zA-Z'’]+(?:\s[A-Z][a-zA-Z'’]+)*)", text):
        found.add(m.group(1))
    found |= set(re.findall(r"\b[A-Z]{2,}\b", text))
    found |= {w for w in re.findall(r"[a-zA-Z]+", text.lower()) if w in HETERONYMS}
    if re.search(r"\d", text):
        found.add("(digits in text)")
    common = {"I", "The", "A", "An", "And", "But", "So", "In", "On", "It", "That", "This", "Two", "One", "Every"}
    return sorted(w for w in found if w not in common and w not in known)


# ---- evaluation ------------------------------------------------------------------
def measure(model, seg, mp3, maps):
    """Transcribe once and collect everything needed to judge a take."""
    hmap, reverse_alias = maps
    segments, _ = model.transcribe(str(mp3), language="en", beam_size=5, vad_filter=False, word_timestamps=True)
    segments = list(segments)
    heard = " ".join(s.text.strip() for s in segments).strip()
    words = [w for s in segments for w in (s.words or [])]
    acc, issues = compare(seg["text"], heard, hmap, reverse_alias)
    vz = voiced(mp3)
    syl = syllables(seg["text"])
    pace = {"syllables": syl, "rate": round(syl / vz["span"], 2),
            "wpm": round(len(seg["text"].split()) / vz["span"] * 60, 1),
            "lead_silence": vz["lead"], "silences": vz["silences"]}
    return {"heard": heard, "accuracy": round(acc, 3), "issues": issues, "pace": pace, "audio": audio_stats(mp3)}


def judge(m, seg, median_db, median_rate):
    acc, pace, stats = m["accuracy"], m["pace"], m["audio"]
    problems = []
    if acc < ACCURACY_PASS:
        problems.append(f"accuracy {acc:.0%}")
    rate, syl = pace["rate"], pace["syllables"]
    if syl >= 12:
        if rate > median_rate * RATE_FAST:
            problems.append(f"rushed: {rate} syll/s vs episode {median_rate}")
        elif rate < median_rate * RATE_SLOW:
            problems.append(f"dragging: {rate} syll/s vs episode {median_rate}")
    elif rate > median_rate * PUNCH_FAST:
        problems.append(f"punch line rushed: {rate} syll/s vs episode {median_rate}")
    long_sil = [x for x in pace["silences"] if x > INTERNAL_SILENCE_MAX]
    if long_sil:
        problems.append(f"long internal silence {max(long_sil)}s")
    if pace["lead_silence"] > LEAD_SILENCE_MAX:
        problems.append(f"leading silence {pace['lead_silence']}s")
    if stats["peak"] >= PEAK_MAX:
        problems.append(f"near-clipping peak {stats['peak']}")
    if abs(stats["rms_db"] - median_db) > LOUDNESS_DEVIATION_DB:
        problems.append(f"loudness {stats['rms_db']} dB vs episode {median_db} dB")
    score = acc - 0.05 * (len(problems) - (1 if acc < ACCURACY_PASS else 0))
    return {**m, "problems": problems, "score": round(score, 3)}


def retake_plan(seg, result, lexicon):
    """Ordered list of (label, overrides, settings) to try for a failing line."""
    plans = [("new take", {}, None)]
    mismatched = " ".join(i["expected"] for i in result["issues"])
    for name, cands in lexicon.get("candidates", {}).items():
        if name in seg["text"] and (name.lower() in mismatched or result["accuracy"] < ACCURACY_PASS):
            for c in cands:
                plans.append((f"respell {name} → {c}", {name: c}, None))
    text = " ".join(result["problems"])
    if "rushed" in text:
        plans = [("slower delivery (speed 0.88)", {}, {**tts.DEFAULT_SETTINGS, "speed": 0.88})] + plans
        plans.append(("slower + steadier", {}, {**tts.DEFAULT_SETTINGS, "speed": 0.85, "stability": 0.7}))
    elif "dragging" in text:
        plans = [("faster delivery (speed 1.08)", {}, {**tts.DEFAULT_SETTINGS, "speed": 1.08})] + plans
    else:
        plans.append(("steadier delivery", {}, {**tts.DEFAULT_SETTINGS, "stability": 0.7}))
    return plans


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("episode")
    ap.add_argument("--fix", action="store_true")
    ap.add_argument("--budget", type=int, default=3000, help="max characters to spend on re-takes")
    ap.add_argument("--max-attempts", type=int, default=3)
    ap.add_argument("--whisper", default="small.en")
    a = ap.parse_args()

    ep = Path(a.episode)
    tl = json.loads((ep / "timeline.json").read_text())
    voice_id, model_id = tl["voice_id"], tl["model"]
    segs = tts.load_segments(ep, voiced_only=True)
    lexicon = tts.load_lexicon()
    maps = build_maps(lexicon)
    print("Loading Whisper…", file=sys.stderr)
    model = WhisperModel(a.whisper, device="cpu", compute_type="int8")

    vo = ep / "vo"
    metas = {s["id"]: json.loads((vo / f"{s['id']}.json").read_text()) for s in segs}
    print("Measuring every line…", file=sys.stderr)
    measured = {s["id"]: measure(model, s, vo / f"{s['id']}.mp3", maps) for s in segs}
    median_db = round(statistics.median(m["audio"]["rms_db"] for m in measured.values()), 1)
    median_rate = round(statistics.median(m["pace"]["rate"] for m in measured.values() if m["pace"]["syllables"] >= 12), 2)

    results, spent, fixed = {}, 0, []
    for idx, s in enumerate(segs):
        mp3 = vo / f"{s['id']}.mp3"
        r = judge(measured[s["id"]], s, median_db, median_rate)
        r["risky"] = risky_words(s["text"], lexicon)
        r["attempts"] = []
        if r["problems"] and a.fix:
            best = r
            best_audio = mp3.read_bytes()
            best_meta = metas[s["id"]]
            for label, overrides, settings in retake_plan(s, r, lexicon)[: a.max_attempts]:
                spoken = tts.apply_lexicon(s["text"], lexicon, overrides)
                if spent + len(spoken) > a.budget:
                    r["attempts"].append({"plan": label, "skipped": "budget"})
                    break
                prev_text = tts.apply_lexicon(segs[idx - 1]["text"], lexicon) if idx > 0 else ""
                next_text = tts.apply_lexicon(segs[idx + 1]["text"], lexicon) if idx + 1 < len(segs) else ""
                prev_metas = [metas.get(x["id"]) for x in segs[max(0, idx - 3):idx]]
                audio, align, dur = tts.synth(voice_id, spoken, model_id, prev_text, next_text,
                                              settings=settings, seed=random.randint(1, 2**31 - 1),
                                              prev_ids=tts.fresh_ids(prev_metas))
                req_id = tts.LAST_REQUEST_ID
                spent += len(spoken)
                tmp = vo / f"{s['id']}.retake.mp3"
                tmp.write_bytes(audio)
                cand = judge(measure(model, s, tmp, maps), s, median_db, median_rate)
                r["attempts"].append({"plan": label, "accuracy": cand["accuracy"], "problems": cand["problems"]})
                if cand["score"] > best["score"]:
                    best, best_audio = cand, audio
                    best_meta = {"hash": tts.cache_key(voice_id, model_id, tts.apply_lexicon(s["text"], lexicon)),
                                 "duration": dur, "spoken_text": spoken, "alignment": align,
                                 "request_id": req_id, "made": __import__("time").time(),
                                 "qa": {"plan": label, "overrides": overrides, "settings": settings}}
                tmp.unlink(missing_ok=True)
                if not cand["problems"]:
                    break
            if best is not r:
                mp3.write_bytes(best_audio)
                (vo / f"{s['id']}.json").write_text(json.dumps(best_meta, ensure_ascii=False))
                fixed.append(s["id"])
                best["attempts"], best["risky"] = r["attempts"], r["risky"]
                best["fixed_by"] = best_meta.get("qa", {}).get("plan")
                r = best
        results[s["id"]] = r
        flag = "OK " if not r["problems"] else ("FIX" if s["id"] in fixed else "!! ")
        print(f"{flag} {s['id']} acc {r['accuracy']:.0%} "
              f"{r['pace']['rate']:>5} syll/s  {'; '.join(r['problems'])}",
              file=sys.stderr)

    (ep / "qa.json").write_text(json.dumps({"median_db": median_db, "spent_chars": spent, "results": results},
                                           indent=2, ensure_ascii=False))
    write_report(ep, segs, results, median_db, median_rate, spent, fixed)
    unresolved = [k for k, v in results.items() if v["problems"]]
    print(f"\n{len(segs)} lines · {len(segs) - len(unresolved)} pass · {len(fixed)} fixed automatically · "
          f"{len(unresolved)} need attention · {spent} characters spent on re-takes → {ep / 'qa-report.md'}")
    return 0


def write_report(ep, segs, results, median_db, median_rate, spent, fixed):
    unresolved = [s for s in segs if results[s["id"]]["problems"]]
    lines = [f"# Voiceover QA: {ep.name}", "",
             f"- Lines: {len(segs)} · pass: {len(segs) - len(unresolved)} · fixed automatically: {len(fixed)} · "
             f"**need attention: {len(unresolved)}**",
             f"- Median pace: {median_rate} syllables/sec · median loudness: {median_db} dB",
             f"- Characters spent on re-takes: {spent}", ""]
    if unresolved:
        lines += ["## Needs attention", "", "| Line | Script | Heard | Problems |", "|---|---|---|---|"]
        for s in unresolved:
            r = results[s["id"]]
            lines.append(f"| {s['id']} | {s['text']} | {r['heard']} | {'; '.join(r['problems'])} |")
        lines.append("")
    if fixed:
        lines += ["## Fixed automatically", "", "| Line | Fix | Accuracy now |", "|---|---|---|"]
        for sid in fixed:
            r = results[sid]
            lines.append(f"| {sid} | {r.get('fixed_by')} | {r['accuracy']:.0%} |")
        lines.append("")
        respelled = [results[sid].get("fixed_by") for sid in fixed if "respell" in (results[sid].get("fixed_by") or "")]
        if respelled:
            lines += ["**Suggested dictionary additions** (move to 'always' in pronunciation.json): " + "; ".join(respelled), ""]
    risky = sorted({w for r in results.values() for w in r.get("risky", [])})
    if risky:
        lines += ["## Watch list (names, acronyms, heteronyms, digits): all checked by the transcript above",
                  "", ", ".join(risky), ""]
    lines += ["## All lines", "", "| Line | Acc. | Pace | Notes |", "|---|---|---|---|"]
    for s in segs:
        r = results[s["id"]]
        lines.append(f"| {s['id']} | {r['accuracy']:.0%} | {r['pace']['rate']} syll/s | {'; '.join(r['problems']) or 'ok'} |")
    (ep / "qa-report.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    sys.exit(main())
