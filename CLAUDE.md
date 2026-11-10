# Cashflow Histories

A faceless business-documentary YouTube channel in the style of Modern MBA: one company's economics per episode, AI narration, real footage. This repo holds everything from script to rendered video. The owner often works from their phone through Claude Code cloud sessions, so keep updates short and send finished files (preview MP3s, review MP4s) rather than describing them.

If this is a fresh checkout, run `./setup.sh` first.

## Workflow for an episode
1. **Script**: use the `business-doc-script` skill (`.claude/skills/business-doc-script/`). Save it as `<episode>-script.md` at the repo root, in the skill's template format. Mark real-voice clips as `[SOT 8s: Name, role — "exact words" | source, date]` and pauses as `[PAUSE 1.2]`.
2. **Voiceover**: `cd production && .venv/bin/python produce_voiceover.py ../<episode>-script.md <episode>`. This runs ElevenLabs takes, automatic pronunciation and pacing QA with retakes, speech trimming, the timeline and a preview MP3. Only changed lines are re-recorded.
3. **Footage**: `fetch_assets.py search …`, list items in `episodes/<episode>/wanted.json`, then `fetch_assets.py fetch episodes/<episode>`. Every asset is logged in `assets.json` with its licence or fair-use basis.
4. **Edit**: write `episodes/<episode>/edit.json` (the shots under each narration line, cutting on spoken phrases), then `build_shots.py episodes/<episode>`. Read `edit-report.md` to check the mix against the targets.
5. **Render**: `cd studio && npx remotion bundle src/index.ts --out-dir build && npx remotion render build Episode-<episode> ../production/episodes/<episode>/<episode>-roughcut.mp4`. For a phone-friendly review copy, transcode to 720p with `npx remotion ffmpeg` (keep it under 30 MB for phone delivery, e.g. 540p at CRF 32). In cloud sessions add the Chromium flags in `production/README.md`.

`production/README.md` has the details of each tool.

## Channel rules (set by the owner, don't change without asking)
- **Scripts:** retention-first, with open loops, payoffs, shocking facts and cliffhangers. Learn only from the audited competitors (`audit-log.md`, the skill's references). Never use the old Ryanair draft as an example.
- **No sponsor segments.** End each video with one earned subscribe line, tied to what the viewer learned.
- **Voice:** ElevenLabs "David - Audiobook & Documentary" (`cCYjmrGZaI86GUJ7F2Nn`), model **eleven_v4**, with request stitching between lines. See `production/channel.json`. The key is `ELEVENLABS_API_KEY` (environment or `production/.env`). Never print it, commit it or paste it into chat.
- **Brand: Ink Misprint.** Fluorescent pink `#FF3DA8` and blue `#1D5FD6` overprinted off-register, yellow `#FFE21A`, ink `#16213E`, white paper, halftone, registration marks, Ultra slab and Courier Prime, "PRINT Nº" per episode. It must look bold and ownable, never like a default AI design. The fallback, if it underperforms, is the simpler earlier design (`studio/src/brands.ts`).
- **Footage:** mostly real, clipped material, with a target of 40–50% real footage of the story.
  - Stock is capped at 10%.
  - Nothing is on screen for less than 1.5s.
  - Use 3–6 real-voice clips per episode where they fit.
  - Quotes can come from any source, shown as that source.
  - Real brand logos are fine, to identify the company and never to imply endorsement.
  - Log every source. No Hollywood film clips.
- **Fact-check** every number before publishing. Items marked ⚠️ in a script's fact-check log are unresolved.

## Status
- Episode 1, **Subway**:
  - Script: `subway-script.md` (now with 6 real-voice clips).
  - Voiceover: `production/episodes/subway/` (10.7 min, 77/77 QA pass).
  - Edit: rough cut v3. Real voices 7% (DeLuca CNBC 2013, Chidsey Fox Business 2020, CBS Roark 2023, Cancro Bloomberg 2014 and Fox Business 2021, the 2011 jingle), all from the TV News Archive.
  - Footage: news b-roll (CBS 2012 store footage, ABC 2018 closures, ABC 2023 slicers, Jersey Mike's 2024 ad with Cancro) added only where it matches the words. Real footage is 25%. The owner decided not to force the 40–50% target: the remaining chart time is explanation footage can't do. The TV News Archive index has nothing yet after 2024 (no Jersey Mike's IPO coverage).
  - Next: owner review of rough cut v3; resolve ⚠️ fact-check items; thumbnail.
