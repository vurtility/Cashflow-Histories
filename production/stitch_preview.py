"""Stitch an episode's narration clips into one MP3 for listening, using timeline.json gaps.

Uses the ffmpeg bundled with Remotion (run from a folder with @remotion/cli installed).
Usage: python3 stitch_preview.py episodes/subway <remotion-project-dir>
"""
import json
import subprocess
import sys
from pathlib import Path

ep = Path(sys.argv[1]).resolve()
remotion_dir = Path(sys.argv[2]).resolve()
tl = json.loads((ep / "timeline.json").read_text())
work = ep / "preview"
work.mkdir(exist_ok=True)


def ffmpeg(*args):
    subprocess.run(["npx", "remotion", "ffmpeg", "-v", "error", "-y", *args], cwd=remotion_dir, check=True)


def silence(seconds):
    f = work / f"gap_{seconds:.2f}.mp3"
    if not f.exists():
        ffmpeg("-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", f"{seconds:.3f}", "-c:a", "libmp3lame", "-b:a", "128k", str(f))
    return f


lines = []
for seg in tl["segments"]:
    if seg.get("audio"):
        # Play only the spoken part of each take (trim/duration from timeline.json), then the edit's pause.
        lines += [f"file '{(ep / seg['audio']).as_posix()}'", f"inpoint {seg.get('trim', 0):.3f}",
                  f"outpoint {seg.get('trim', 0) + seg['duration']:.3f}"]
    else:  # real-voice clip placeholder: silence for its length
        lines.append(f"file '{silence(seg['duration']).as_posix()}'")
    if seg.get("pause_after", 0) > 0.01:
        lines.append(f"file '{silence(seg['pause_after']).as_posix()}'")
(work / "list.txt").write_text("\n".join(lines) + "\n")

out = ep / f"{ep.name}-voiceover-preview.mp3"
ffmpeg("-f", "concat", "-safe", "0", "-i", str(work / "list.txt"), "-c:a", "libmp3lame", "-b:a", "128k", str(out))
print(out)
