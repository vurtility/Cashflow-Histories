"""One command: script → narration lines → ElevenLabs takes → automatic QA + fixes → timeline → preview.

Usage (from production/):
  .venv/bin/python produce_voiceover.py ../subway-script.md subway [--budget 3000] [--remotion ../pilot]

Uses the channel voice in channel.json. Only changed lines are re-recorded. The QA report lands in
episodes/<name>/qa-report.md; the stitched preview in episodes/<name>/<name>-voiceover-preview.mp3.
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
PY = sys.executable


def run(*args):
    print("→", " ".join(str(a) for a in args[1:3]), file=sys.stderr)
    subprocess.run([str(a) for a in args], cwd=HERE, check=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("script")
    ap.add_argument("name")
    ap.add_argument("--budget", type=int, default=3000)
    ap.add_argument("--remotion", default=str(HERE.parent / "studio"))
    a = ap.parse_args()

    voice = json.loads((HERE / "channel.json").read_text())["voice"]
    ep = Path("episodes") / a.name
    run(PY, "extract_narration.py", Path(a.script).resolve(), ep)
    run(PY, "tts_elevenlabs.py", "render", ep, voice["voice_id"], "--model", voice["model"])
    run(PY, "qa_voiceover.py", ep, "--fix", "--budget", a.budget)
    run(PY, "trim_takes.py", ep)  # real speech start/end, so joins aren't padded with silence
    run(PY, "tts_elevenlabs.py", "render", ep, voice["voice_id"], "--model", voice["model"])  # timeline from final takes
    run(PY, "stitch_preview.py", ep, Path(a.remotion).resolve())
    report = (HERE / ep / "qa-report.md").read_text().splitlines()
    print("\n".join(report[:5]))


if __name__ == "__main__":
    main()
