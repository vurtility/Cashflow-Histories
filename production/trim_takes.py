"""Measure where the voice really starts and stops in every take, so the edit isn't padded with silence.

ElevenLabs' character timings run ~0.5s past the last word; timing the edit to them adds dead air at
every join. This writes "speech": [start, end] (seconds, lightly padded) into each vo/sNNN.json, which
tts_elevenlabs.py render uses for the timeline. Re-measures only takes that changed.

  .venv/bin/python trim_takes.py episodes/subway
"""
import json
import sys
from pathlib import Path

import numpy as np
from faster_whisper.audio import decode_audio

PAD_IN, PAD_OUT = 0.03, 0.08  # keep the attack and the decay of the last consonant


def bounds(mp3: Path):
    x = decode_audio(str(mp3), sampling_rate=16000)
    f = 320  # 20 ms frames
    e = np.array([np.sqrt(np.mean(x[i:i + f] ** 2)) for i in range(0, max(1, len(x) - f), f)])
    if not len(e) or e.max() <= 0:
        return 0.0, len(x) / 16000
    v = np.nonzero(e > max(0.01, e.max() * 0.04))[0]
    on, off = v[0] * f / 16000, (v[-1] + 1) * f / 16000
    return round(max(0.0, on - PAD_IN), 3), round(min(len(x) / 16000, off + PAD_OUT), 3)


def main(ep: Path):
    n = 0
    for meta_path in sorted((ep / "vo").glob("s*.json")):
        mp3 = meta_path.with_suffix(".mp3")
        if not mp3.exists():
            continue
        meta = json.loads(meta_path.read_text())
        stamp = [mp3.stat().st_size, int(mp3.stat().st_mtime)]
        if meta.get("speech") and meta.get("speech_of") == stamp:
            continue
        meta["speech"], meta["speech_of"] = list(bounds(mp3)), stamp
        meta_path.write_text(json.dumps(meta, ensure_ascii=False))
        n += 1
    print(f"measured {n} takes")


if __name__ == "__main__":
    main(Path(sys.argv[1]))
