#!/bin/bash
# Saves your ElevenLabs API key to production/.env (input is hidden), then checks it.
cd "$(dirname "$0")" || exit 1
echo "Paste your ElevenLabs API key and press Enter (it won't be shown):"
IFS= read -r -s KEY
echo
if [ -z "$KEY" ]; then echo "No key entered."; exit 1; fi
umask 077
printf 'ELEVENLABS_API_KEY=%s\n' "$KEY" > .env
unset KEY
echo "Saved to production/.env (readable only by you). Checking it..."
python3 -I tts_elevenlabs.py check
