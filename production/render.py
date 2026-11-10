"""Render an episode quickly, re-rendering only the chapters that changed.

  .venv/bin/python render.py subway            # review copy: 960x540, sized for phone delivery (< 30 MB)
  .venv/bin/python render.py subway --master   # 1080p master, sized under the 400 MiB upload limit

How it is fast:
  - The video is cut into chunks at chapter boundaries. Each chunk is cached under a hash of what it
    shows (its shots and chapter stamps, the files those shots use, and the scene code). After a change,
    only the chunks whose hash changed are rendered again; the rest are reused.
  - Video chunks are rendered without sound. The soundtrack is rendered once (no frames to draw), then
    chunks are joined and the sound muxed in without re-encoding.
  - The bitrate is set from the size budget, so there's no second encode to make the file small enough
    (the master lands under the 400 MiB chat-upload limit; review copies under 30 MB).
  - x264 runs at "fast" (master) / "veryfast" (review): YouTube re-encodes anyway, so slower presets buy nothing.
  - Any stray render still running is stopped first, so two renders never fight over the CPU.
Output: production/episodes/<ep>/<ep>-review.mp4 or <ep>-master.mp4. Cache: studio/render-cache/ (not in git).
"""
import argparse
import hashlib
import json
import shutil
import subprocess
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
STUDIO = HERE.parent / "studio"
CACHE = STUDIO / "render-cache"
CHROME = Path("/opt/pw-browsers/chromium-1243/chrome-linux64/chrome")  # cloud sessions; local Macs use Remotion's own
MODES = {
    # x264 preset: "slow" squeezes out a few percent of quality per bit at 2-3x the encode time. YouTube
    # re-encodes every upload, so "fast" for the master and "veryfast" for phone review copies (owner, Nov 2026).
    "review": {"scale": 0.5, "budget_mb": 27, "audio_kbps": 96, "suffix": "review", "x264": "veryfast"},
    "master": {"scale": 1.0, "budget_mb": 380, "audio_kbps": 192, "suffix": "master", "x264": "fast"},
}


def sh(args, **kw):
    return subprocess.run([str(a) for a in args], check=True, **kw)


def remotion(*args, quiet=False):
    extra = ["--browser-executable", CHROME, "--chrome-mode", "chrome-for-testing"] if CHROME.exists() else []
    out = subprocess.DEVNULL if quiet else None
    sh(["npx", "remotion", *args, *extra], cwd=STUDIO, stdout=out)


def tree_hash(root: Path, skip: str) -> str:
    h = hashlib.sha256()
    for p in sorted(root.rglob("*")):
        if p.is_file() and skip not in p.parts:
            h.update(str(p.relative_to(root)).encode())
            h.update(p.read_bytes())
    return h.hexdigest()


def file_sig(rel: str) -> str:
    p = STUDIO / "public" / rel
    st = p.stat() if p.exists() else None
    return f"{rel}:{st.st_size}:{int(st.st_mtime)}" if st else f"{rel}:missing"


def assets_in(obj):
    if isinstance(obj, dict):
        if isinstance(obj.get("src"), str):
            yield obj["src"]
        for v in obj.values():
            yield from assets_in(v)
    elif isinstance(obj, list):
        for v in obj:
            yield from assets_in(v)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("episode")
    ap.add_argument("--master", action="store_true", help="1080p master instead of the phone review copy")
    ap.add_argument("--concurrency", default="4")
    a = ap.parse_args()
    mode = MODES["master" if a.master else "review"]
    ep = a.episode
    t0 = time.time()

    # Never let two renders share the CPU.
    subprocess.run(["pkill", "-f", "remotion render"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    data = json.loads((STUDIO / "src" / "episode" / "data" / f"{ep}.json").read_text())
    total, fps = data["durationInFrames"], data["fps"]
    bounds = [c["from"] for c in data["chapters"]] + [total]
    bounds = sorted(set(b for b in bounds if 0 <= b <= total) | {0})

    print("→ bundle")
    remotion("bundle", "src/index.ts", "--out-dir", "build", quiet=True)
    code = tree_hash(STUDIO / "src", skip="data")

    video_kbps = int(mode["budget_mb"] * 8000 / (total / fps)) - mode["audio_kbps"]
    cdir = CACHE / ep / mode["suffix"]
    cdir.mkdir(parents=True, exist_ok=True)
    chunks, rendered = [], 0
    for i, (f0, f1) in enumerate(zip(bounds, bounds[1:])):
        shots = [s for s in data["shots"] if s["start"] < f1 and s["start"] + s["dur"] > f0]
        stamps = [c for c in data["chapters"] if c["from"] < f1 and c["from"] + 80 > f0]
        key = json.dumps({"r": [f0, f1], "shots": shots, "stamps": stamps, "code": code, "mode": mode,
                          "kbps": video_kbps, "files": sorted(set(file_sig(x) for x in assets_in(shots)))},
                         sort_keys=True)
        out = cdir / f"{i:02d}-{hashlib.sha256(key.encode()).hexdigest()[:16]}.mp4"
        chunks.append(out)
        if out.exists():
            print(f"✓ chunk {i + 1}/{len(bounds) - 1} ({(f1 - f0) / fps:.0f}s) unchanged, reused")
            continue
        print(f"→ chunk {i + 1}/{len(bounds) - 1} ({(f1 - f0) / fps:.0f}s)")
        for old in cdir.glob(f"{i:02d}-*.mp4"):
            old.unlink()
        tmp = out.with_suffix(".part.mp4")
        remotion("render", "build", f"Episode-{ep}", str(tmp), f"--frames={f0}-{f1 - 1}", "--muted",
                 f"--scale={mode['scale']}", f"--video-bitrate={video_kbps}k", f"--x264-preset={mode['x264']}",
                 f"--concurrency={a.concurrency}",
                 "--log=error")
        tmp.rename(out)
        rendered += 1

    print("→ soundtrack")
    audio = cdir / "audio.m4a"
    remotion("render", "build", f"Episode-{ep}", str(audio), "--codec=aac", f"--audio-bitrate={mode['audio_kbps']}k",
             "--log=error")

    print("→ join")
    lst = cdir / "list.txt"
    lst.write_text("".join(f"file '{c.name}'\n" for c in chunks))
    final = HERE / "episodes" / ep / f"{ep}-{mode['suffix']}.mp4"
    ff = shutil.which("ffmpeg") or "ffmpeg"
    sh([ff, "-nostdin", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-i", audio,
        "-map", "0:v", "-map", "1:a", "-c", "copy", "-movflags", "+faststart", final])
    for old in cdir.glob("*.mp4"):
        if old not in chunks:
            old.unlink()
    mb = final.stat().st_size / 1e6
    print(f"✓ {final}  {mb:.1f} MB · {rendered}/{len(chunks)} chunks rendered · {(time.time() - t0) / 60:.1f} min")


if __name__ == "__main__":
    sys.exit(main())
