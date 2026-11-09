"""Turn a script written with the business-doc-script template into narration segments.

Reads the "## 7. Script" section, pairs each spoken line with the visual cue above it,
and writes <episode>/narration.json:

  [{"id": "s001", "chapter": "COLD OPEN", "cue": "[GFX: ...]", "text": "Two a day."}, ...]

Usage:
  python3 extract_narration.py ../subway-script.md episodes/subway
"""
import json
import re
import sys
from pathlib import Path

SKIP_PREFIXES = ("◆", ">", "---", "|")


def extract(script_path: Path):
    text = script_path.read_text(encoding="utf-8")
    start = text.index("## 7. Script")
    end = text.index("\n## 8.", start)
    body = text[start:end].splitlines()[1:]

    segments, chapter, cue = [], "", ""
    for raw in body:
        line = raw.strip()
        if not line:
            continue
        if line.startswith("### "):
            chapter = line[4:].strip()
            cue = ""
            continue
        sot = re.fullmatch(r"`?\[SOT\s*([\d.]+)?\s*s?\s*:\s*(.+?)\]`?", line, flags=re.I)
        if sot:
            # Real-voice clip: not voiced by TTS; the timeline reserves its length.
            segments.append({"chapter": chapter, "cue": cue, "text": sot.group(2).strip(),
                             "type": "sot", "duration": float(sot.group(1) or 6.0)})
            cue = ""
            continue
        pause = re.fullmatch(r"`?\[PAUSE\s+([\d.]+)\s*s?\]`?", line, flags=re.I)
        if pause:
            if segments:
                segments[-1]["pause_after"] = float(pause.group(1))
            continue
        if line.startswith("`[") and line.endswith("]`"):
            cue = line.strip("`")
            continue
        if line.startswith(SKIP_PREFIXES) or line.startswith("#"):
            continue
        # Strip inline loop markers and markdown emphasis.
        spoken = re.sub(r"◆.*$", "", line).strip()
        spoken = re.sub(r"[*_]{1,2}([^*_]+)[*_]{1,2}", r"\1", spoken)
        if not spoken:
            continue
        segments.append({"chapter": chapter, "cue": cue, "text": spoken})
        cue = ""  # a cue applies to the first line after it; later lines continue the shot

    for i, seg in enumerate(segments, 1):
        seg["id"] = f"s{i:03d}"
    out = []
    for s in segments:
        row = {"id": s["id"], "chapter": s["chapter"], "cue": s["cue"], "text": s["text"]}
        if "pause_after" in s:
            row["pause_after"] = s["pause_after"]
        if s.get("type") == "sot":
            row["type"], row["duration"] = "sot", s["duration"]
        out.append(row)
    return out


def main():
    script_path, out_dir = Path(sys.argv[1]), Path(sys.argv[2])
    out_dir.mkdir(parents=True, exist_ok=True)
    segments = extract(script_path)
    (out_dir / "narration.json").write_text(json.dumps(segments, indent=2, ensure_ascii=False), encoding="utf-8")
    spoken = [s for s in segments if s.get("type") != "sot"]
    sots = [s for s in segments if s.get("type") == "sot"]
    chars = sum(len(s["text"]) for s in spoken)
    words = sum(len(s["text"].split()) for s in spoken)
    print(f"{len(spoken)} narration lines · {words} words · {chars} characters (≈ ElevenLabs credits per full take)"
          f" · {len(sots)} real-voice clips ({sum(s['duration'] for s in sots):.0f}s)")


if __name__ == "__main__":
    main()
