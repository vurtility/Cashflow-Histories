# Production: voiceover

## One command per episode
```
.venv/bin/python produce_voiceover.py ../<episode>-script.md <episode>
```
Script → narration lines → ElevenLabs takes in the channel voice (`channel.json`) → **automatic QA with re-takes** → timeline → stitched preview. Only changed lines are re-recorded, and re-runs of an unchanged script cost nothing.

Outputs in `episodes/<episode>/`:
- `vo/sNNN.mp3` + `sNNN.json`: one take per line, with character timestamps
- `timeline.json`: when each line starts, how long it lasts, and the pause after it (used to time the visuals)
- `qa-report.md` / `qa.json`: what passed, what was fixed and how, and anything still needing attention
- `<episode>-voiceover-preview.mp3`: the full narration for listening

## What the automatic QA checks (`qa_voiceover.py`)
- **Pronunciation:** Whisper (local, free) transcribes every take and compares it with the script. Numbers, money, years, percentages, homophones and sound-alike name spellings are normalised, so only real errors are flagged (a skipped word, "sixteen" heard as "sixty", a garbled name). The pass mark is 92% of words.
- **Pacing:** syllables per second measured from the audio itself, against the episode's own median. It flags rushed punch lines, rushed or dragging long lines, and long silences inside a line.
- **Audio:** near-clipping peaks, and loudness that differs from the rest of the episode.
- **Automatic fixes, best take kept:** a new take → a slower or faster `speed` setting for pace problems → alternative spellings from `pronunciation.json` for names → steadier delivery. There's a cap of 3 attempts per line and `--budget` characters per run (default 3,000).

## Pronunciation dictionary (`pronunciation.json`)
- `always`: spoken forms applied to every line (e.g. `"MTF Enterprises": "M-T-F Enterprises"`).
- `candidates`: alternative spellings tried only when a line fails on that name. The report suggests promoting the winner to `always`.
- `homophones`: words speech recognition can't distinguish, treated as equal.

## Pauses (set by the edit, not the voice)
After a short punch line: 0.6s · before a short reveal line: 0.55s · after a question: 0.7s · between chapters: 1.0s · otherwise 0.35s. Override any line by writing `[PAUSE 1.2]` on its own line in the script, right after it.

## Real-voice clips (sound-up)
Write a real person's clip on its own line in the script:
`[SOT 8s: Fred DeLuca, founder — "exact words" | CNBC, 2010]`
It isn't voiced by ElevenLabs. The timeline reserves its 8 seconds (with short beats either side), the QA skips it, and the preview has silence there until the clip is cut in. Takes are matched by their text, so adding or moving clips never re-records existing narration.

# Production: footage and edit

## 1. Find and fetch real material (`fetch_assets.py`)
```
.venv/bin/python fetch_assets.py search "c:Subway restaurant" "i:subway commercial mediatype:movies"
.venv/bin/python fetch_assets.py fetch episodes/<episode>
```
`c:` searches Wikimedia Commons (free-licensed photos, logos, maps) and `i:` searches Internet Archive (vintage TV ads, news). List what you want in `episodes/<episode>/wanted.json`. `fetch` downloads it and copies it into the Remotion project. It also writes **`assets.json`**, the asset log: source page, author, licence, the basis for using it (licence or fair-use reason), size and length. Flags: `"stock": true` counts toward the 10% cap, and `"archival": true` counts as archival. `credits.txt` is the attribution block for the video description, which CC BY and BY-SA licences require.

## 2. Plan the edit (`episodes/<episode>/edit.json`)
For each narration line, list the shots under it:
```json
"s017": [
  {"k": "photo", "a": "store_remodel", "kb": "in", "label": "Building the store"},
  {"at": "pays the rent", "k": "photo", "a": "store_sandhill"},
  {"at": "subway takes", "k": "flow"}]
```
`at` cuts on that spoken phrase, using ElevenLabs' character timings. Shots without it share the line's time. A missing line or `{"hold": true}` continues the previous shot. The scene types are in `studio/src/episode/Scenes.tsx`: footage (photo, video, logo, vs), data (counter, stat, cols, bars, line, map, flow, example, slice, price, pps, diverge), documents (quote, doc, clips, timeline, stamps, deal), type (text, place, person, sign, handsign, list, teens) and end. Photos and video take `treat: "ink"` for the two-ink reprint, or default to natural colour so logos stay recognisable.

## 3. Build and check (`build_shots.py`)
```
.venv/bin/python build_shots.py episodes/<episode>
```
This writes the frame-exact shot list for Remotion and **`edit-report.md`**:
- content mix against the targets (real footage, archival, real voices, documents, charts, text, stock)
- shot lengths, with the 1.5s minimum enforced automatically
- seconds on screen per source, with its licence or fair-use basis
- footage shots over 6.5s
- phrases that weren't found in the take

## 4. Render
```
cd ../studio && npx remotion bundle src/index.ts --out-dir build
npx remotion render build Episode-<episode> ../production/episodes/<episode>/<episode>-roughcut.mp4
```
Preview and scrub with `npx remotion studio`. A 10-minute episode renders at 1080p in a few minutes.

## Setup (once)
1. Put your ElevenLabs API key in `production/.env` as `ELEVENLABS_API_KEY=...` (git-ignored; never paste it into chat). Check with `python3 tts_elevenlabs.py check`.
2. `python3 -m venv .venv && .venv/bin/pip install faster-whisper num2words` (Whisper's `small.en` model downloads on first run).
3. Stitching the preview uses the ffmpeg bundled with the Remotion project (`--remotion`, default `../pilot`).

## What it can't judge
Wrong stress on a word that still transcribes correctly, and whether a line *feels* flat. The watch list in the report shows names, acronyms and heteronyms (words spelled the same but pronounced differently) for spot checks.
