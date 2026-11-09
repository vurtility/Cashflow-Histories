#!/usr/bin/env bash
# One-shot setup for a fresh checkout (your Mac or a Claude Code cloud environment). Safe to re-run.
# Needs: python3 (3.9+), node 18+, network access. The ElevenLabs key comes from the
# ELEVENLABS_API_KEY environment variable (cloud: add it as a secret) or production/.env (local).
set -euo pipefail
cd "$(dirname "$0")"

echo "→ Python tools"
python3 -m venv production/.venv
production/.venv/bin/pip install -q --upgrade pip
production/.venv/bin/pip install -q -r production/requirements.txt

echo "→ Remotion (video)"
(cd studio && npm ci --no-audit --no-fund)
(cd studio && npx remotion browser ensure >/dev/null 2>&1 || true)

echo "→ Footage and narration into the video project"
for ep in production/episodes/*/; do
  [ -f "$ep/assets.json" ] && production/.venv/bin/python production/fetch_assets.py fetch "$ep" | tail -1
  [ -f "$ep/edit.json" ] && (cd production && .venv/bin/python build_shots.py "episodes/$(basename "$ep")" | tail -1)
done
echo "✓ Ready. See CLAUDE.md for the workflow."
