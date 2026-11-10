"""Turn an episode's edit plan into a frame-exact shot list for Remotion, and check it against the house rules.

  .venv/bin/python build_shots.py episodes/subway

Inputs
  timeline.json   when each narration line starts and how long it runs (from tts_elevenlabs.py render)
  vo/sNNN.json    character timings for each take, so shots can cut on a spoken word
  edit.json       the edit plan: for each line id, the shots under it
  assets.json     the asset log (fetch_assets.py)

edit.json:  {"s002": [{"k": "photo", "a": "closed_miami23"}, {"at": "every day", "k": "photo", "a": "closed_miami22"}], ...}
  k      the scene type (photo, video, bars, quote, …; see studio/src/episode/Scenes.tsx)
  at     cut to this shot when the narrator says this phrase (otherwise shots share the line's time)
  w      relative share of the line's time for un-anchored shots (default 1)
  hold   {"hold": true} as a line's only entry (or a missing line) continues the previous shot
  other keys are passed to the scene as props; "a" is resolved from the asset log.

Outputs
  studio/src/episode/data/<ep>.json   what the Remotion composition renders
  episodes/<ep>/edit-report.md        content mix vs targets, shot lengths, stock share, per-source use
"""
import json
import sys
from collections import defaultdict
from pathlib import Path

HERE = Path(__file__).resolve().parent
STUDIO = HERE.parent / "studio"
FPS = 30
MIN_SHOT = 1.5

CATEGORY = {
    "photo": "real", "video": "real",
    "bars": "charts", "cols": "charts", "line": "charts", "map": "charts", "flow": "charts", "counter": "charts",
    "example": "charts", "slice": "charts", "price": "charts", "pps": "charts", "diverge": "charts", "stat": "charts",
    "quote": "docs", "doc": "docs", "clips": "docs", "stamps": "docs", "timeline": "docs", "deal": "docs", "logo": "docs",
    "title": "text", "text": "text", "place": "text", "person": "text", "sign": "text", "handsign": "text",
    "list": "text", "teens": "text", "vs": "real", "end": "text", "sot": "voices",
}
TARGETS = {  # from research/editing-study.md
    "real": (40, 50), "archival": (5, 15), "voices": (5, 10), "docs": (12, 15), "charts": (12, 18),
    "text": (5, 8), "stock": (0, 10),
}


# Footage sits inside FootageFrame: 1760x904 px, object-fit cover, then a Ken Burns zoom of up to 1.16.
BOX_W, BOX_H, MAX_ZOOM = 1760, 904, 1.16


def face_problems(path, kind, focus, at_seconds):
    """Faces the 16:9 crop (plus zoom) would cut off. Owner rule: pictures of people show their face."""
    import cv2  # local import: keeps cv2 out of runs that never reach the face check
    cv2.utils.logging.setLogLevel(cv2.utils.logging.LOG_LEVEL_ERROR)
    if kind == "video":
        cap = cv2.VideoCapture(str(path))
        cap.set(cv2.CAP_PROP_POS_MSEC, at_seconds * 1000)
        ok, img = cap.read()
        cap.release()
        if not ok:
            return []
    else:
        img = cv2.imread(str(path))
        if img is None:
            return []
    h, w = img.shape[:2]
    scale = min(1.0, 1280 / max(w, h))  # YuNet is quick at this size and still finds small faces
    small = cv2.resize(img, (int(w * scale), int(h * scale))) if scale < 1 else img
    det = cv2.FaceDetectorYN.create(str(HERE / "models" / "face_detection_yunet_2023mar.onnx"), "",
                                    (small.shape[1], small.shape[0]), 0.75)
    _, found = det.detect(small)
    if found is None:
        return []
    faces = [tuple(float(v) / scale for v in f[:4]) for f in found if f[2] / scale >= w / 50]
    if not faces:
        return []
    c = max(BOX_W / w, BOX_H / h)
    cw, ch = BOX_W / c, BOX_H / c
    x0, y0 = (w - cw) * focus[0], (h - ch) * focus[1]
    vw, vh = cw / MAX_ZOOM, ch / MAX_ZOOM
    vx0, vy0 = x0 + (cw - vw) / 2, y0 + (ch - vh) / 2
    out = []
    for (fx, fy, fw, fh) in sorted(faces, key=lambda f: -f[2] * f[3])[:3]:
        ix = max(0, min(fx + fw, vx0 + vw) - max(fx, vx0))
        iy = max(0, min(fy + fh, vy0 + vh) - max(fy, vy0))
        if ix * iy < 0.7 * fw * fh:
            out.append(f"face at ({(fx + fw / 2) / w:.2f}, {(fy + fh / 2) / h:.2f}) of the frame is cut off; "
                       f"set \"focus\" near it")
    return out


def loudness(path):
    import subprocess
    r = subprocess.run(["ffmpeg", "-nostdin", "-i", str(path), "-af", "ebur128", "-f", "null", "-"],
                       capture_output=True, text=True)
    vals = [l for l in r.stderr.splitlines() if l.strip().startswith("I:")]
    try:
        return float(vals[-1].split()[1])
    except (IndexError, ValueError):
        return None


def word_time(ep, seg, phrase):
    """Seconds into the line at which `phrase` is spoken, from the take's character timings."""
    meta = ep / "vo" / f"{seg['id']}.json"
    if not meta.exists():
        return None
    al = json.loads(meta.read_text()).get("alignment") or {}
    chars, starts = al.get("characters") or [], al.get("character_start_times_seconds") or []
    text = "".join(chars).lower().replace("’", "'")
    i = text.find(phrase.lower().replace("’", "'"))
    return float(starts[i]) if i >= 0 and i < len(starts) else None


def main(ep: Path):
    ep = ep.resolve()
    tl = json.loads((ep / "timeline.json").read_text())
    plan = json.loads((ep / "edit.json").read_text())
    assets = {a["id"]: a for a in json.loads((ep / "assets.json").read_text())}
    warnings, shots = [], []
    video_cursor = defaultdict(float)

    for seg in tl["segments"]:
        s0 = seg["start"]
        s1 = s0 + seg["duration"] + seg.get("pause_after", 0)
        entries = plan.get(seg["id"]) or [{"hold": True}]
        if seg.get("type") == "sot" and not plan.get(seg["id"]):
            entries = [{"k": "sot", "text": seg["text"]}]
        # Resolve anchor times.
        times = [None] * len(entries)
        for i, e in enumerate(entries):
            if "at" in e:
                t = word_time(ep, seg, e["at"])
                if t is None:
                    warnings.append(f"{seg['id']}: phrase not found in take: “{e['at']}” (shot placed by share)")
                else:
                    times[i] = s0 + max(0.0, t - seg.get("trim", 0))
        if times[0] is None:
            times[0] = s0
        known = [i for i, t in enumerate(times) if t is not None] + [len(entries)]
        for a, b in zip(known, known[1:]):
            t_a, t_b = times[a], (times[b] if b < len(entries) else s1)
            ws = [float(entries[i].get("w", 1)) for i in range(a, b)]
            acc = t_a
            for i, wv in zip(range(a, b), ws):
                times[i] = acc
                acc += (t_b - t_a) * wv / sum(ws)
        for i, e in enumerate(entries):
            end = times[i + 1] if i + 1 < len(entries) else s1
            if e.get("hold"):
                if shots:
                    shots[-1]["end"] = end
                continue
            props = {k: v for k, v in e.items() if k not in ("at", "w", "k")}
            shots.append({"kind": e["k"], "start": times[i], "end": end, "seg": seg["id"], "props": props})

    # Enforce the 1.5s minimum: fold a too-short shot into the one before it.
    merged = []
    for s in shots:
        if merged and s["end"] - s["start"] < MIN_SHOT:
            warnings.append(f"{s['seg']}: {s['kind']} shot only {s['end'] - s['start']:.2f}s, folded into previous shot")
            merged[-1]["end"] = s["end"]
            continue
        merged.append(s)
    if merged and merged[0]["end"] - merged[0]["start"] < MIN_SHOT and len(merged) > 1:
        merged[1]["start"] = merged[0]["start"]
        merged.pop(0)

    # Resolve assets, video in-points, categories.
    out_shots, per_cat, per_asset, longest = [], defaultdict(float), defaultdict(float), []
    for s in merged:
        dur = s["end"] - s["start"]
        p = dict(s["props"])
        cat = CATEGORY.get(s["kind"], "text")
        for key in ("a", "left_a", "right_a", "pic"):
            if key in p:
                aid = p[key]
                if aid not in assets:
                    warnings.append(f"{s['seg']}: unknown asset {aid}")
                    continue
                rec = assets[aid]
                p[key] = {"id": aid, "src": f"{ep.name}/assets/{Path(rec['local']).name}", "credit": rec["credit"],
                          "kind": rec["kind"], "w": rec.get("w"), "h": rec.get("h")}
                if key != "pic":
                    per_asset[aid] += dur
                if key == "a" and rec.get("stock"):
                    cat = "stock"
                elif key == "a" and rec.get("archival") and cat == "real":
                    cat = "archival"
                if rec["kind"] == "video" and key == "a":
                    length = float(rec.get("seconds") or 0)
                    start = float(p.get("from", video_cursor[aid]))
                    if start + dur > length:
                        start = max(0.0, length - dur)
                        if dur > length:
                            warnings.append(f"{s['seg']}: clip {aid} is {length:.1f}s but shot is {dur:.1f}s (will freeze)")
                    p["from"] = round(start, 2)
                    video_cursor[aid] = start + dur
        per_cat[cat] += dur
        for key in ("a", "pic"):
            a = p.get(key)
            if isinstance(a, dict) and s["kind"] in ("photo", "video", "sot") and a.get("kind") in ("image", "video"):
                if s["kind"] == "sot" and key == "a" and p.get("pic"):
                    continue
                at = float(p.get("picAt", 1) if key == "pic" else p.get("from", 0)) + (0 if key == "pic" else dur / 2)
                for prob in face_problems(HERE / assets[a["id"]]["local"], a["kind"], p.get("focus", [0.5, 0.5]), at):
                    warnings.append(f"{s['seg']}: {a['id']}: {prob}")
        if s["kind"] == "sot" and isinstance(p.get("a"), dict):
            want = json.loads((HERE / "channel.json").read_text()).get("mix", {}).get("narration_lufs", -14)
            got = loudness(HERE / assets[p["a"]["id"]]["local"])
            if got is not None and got < want - 1:
                warnings.append(f"{s['seg']}: real-voice clip {p['a']['id']} is {want - got:.1f} dB quieter than the "
                                f"narration ({got:.1f} vs {want} LUFS); refetch it (sot_ ids are levelled automatically)")
        if cat in ("real", "archival", "stock") and dur > 9:
            longest.append(f"{s['seg']} {s['kind']} {(p.get('a') or {}).get('id', '')} {dur:.1f}s")
        f0 = round(s["start"] * FPS)
        out_shots.append({"kind": s["kind"], "start": f0, "dur": max(1, round(s["end"] * FPS) - f0), "seg": s["seg"],
                          "cat": cat, "p": p})

    total = tl["total_seconds"]
    vo = [{"src": f"{ep.name}/{x['audio']}", "from": round(x["start"] * FPS), "trim": round(x.get("trim", 0) * FPS),
           "len": round((x["duration"] + 0.12) * FPS)} for x in tl["segments"] if x.get("audio")]
    chapters = []
    for x in tl["segments"]:
        if not chapters or chapters[-1]["name"] != x["chapter"]:
            chapters.append({"name": x["chapter"], "from": round(x["start"] * FPS)})
    data = {"fps": FPS, "durationInFrames": round(total * FPS) + FPS, "episode": ep.name, "print": "001",
            "vo": vo, "shots": out_shots, "chapters": chapters}
    out = STUDIO / "src" / "episode" / "data" / f"{ep.name}.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(data, indent=1, ensure_ascii=False))

    # Copy narration takes where Remotion can serve them.
    pub = STUDIO / "public" / ep.name / "vo"
    pub.mkdir(parents=True, exist_ok=True)
    for x in tl["segments"]:
        if x.get("audio"):
            src, dst = ep / x["audio"], pub / Path(x["audio"]).name
            if not dst.exists() or dst.stat().st_mtime < src.stat().st_mtime:
                dst.write_bytes(src.read_bytes())

    # Report.
    lens = sorted(s["dur"] / FPS for s in out_shots)
    lines = [f"# Edit report: {ep.name}", "",
             f"{len(out_shots)} shots over {total / 60:.1f} min · average {total / len(out_shots):.1f}s · "
             f"median {lens[len(lens) // 2]:.1f}s · shortest {lens[0]:.1f}s · longest {lens[-1]:.1f}s", "",
             "## Content mix vs targets", "", "| Type | Share | Target | |", "|---|---|---|---|"]
    for cat, (lo, hi) in TARGETS.items():
        share = 100 * per_cat.get(cat, 0) / total
        mark = "✅" if lo <= share <= hi else ("⚠️ over" if share > hi else "⚠️ under")
        if cat == "stock":
            mark = "✅" if share <= hi else "❌ over the hard cap"
        lines.append(f"| {cat} | {share:.0f}% | {lo}–{hi}% | {mark} |")
    lines += ["", "## Most-used sources (seconds on screen)", ""]
    for aid, sec in sorted(per_asset.items(), key=lambda x: -x[1])[:12]:
        lines.append(f"- {aid}: {sec:.1f}s · {assets[aid]['basis']}")
    if longest:
        lines += ["", "## Footage shots over 9s (consider a cut)", ""] + [f"- {x}" for x in longest]
    if warnings:
        lines += ["", "## Warnings", ""] + [f"- {w}" for w in warnings]
    (ep / "edit-report.md").write_text("\n".join(lines) + "\n")
    print("\n".join(lines[:14 + len(TARGETS)]))
    print(f"\n{len(warnings)} warnings · report → {ep / 'edit-report.md'} · data → {out}")


if __name__ == "__main__":
    main(Path(sys.argv[1]))
