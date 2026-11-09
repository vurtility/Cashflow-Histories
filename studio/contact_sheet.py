"""Combine each brand's sample frames into one contact sheet: out/sheet-<brand>.png"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

out = Path(sys.argv[1])
names = dict(a.split("=") for a in sys.argv[2:]) or {"ledger": "A · Ledger", "terminal": "B · Terminal", "poster": "C · Poster"}
order = ["logo", "title", "reveal", "bars", "quote", "thumb"]
W, H = 960, 540  # each tile
pad, head = 24, 90
for key, label in names.items():
    sheet = Image.new("RGB", (pad + 2 * (W + pad), head + 3 * (H + pad)), (245, 245, 245))
    d = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 44)
    except OSError:
        font = ImageFont.load_default()
    d.text((pad, 24), label, fill=(20, 20, 20), font=font)
    for i, f in enumerate(order):
        img = Image.open(out / f"{key}-{f}.png").convert("RGB")
        img = img.resize((W, int(img.height * W / img.width)))
        x = pad + (i % 2) * (W + pad)
        y = head + (i // 2) * (H + pad)
        sheet.paste(img, (x, y))
    sheet.save(out / f"sheet-{key}.png")
    print(out / f"sheet-{key}.png")
