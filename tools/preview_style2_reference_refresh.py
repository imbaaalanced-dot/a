#!/usr/bin/env python3
"""Create a 64/128px review board; not a runtime asset."""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'dist/assets'
TARGET = ROOT / 'docs/qa/style2-reference-20261024/preview.png'
KINDS = ('bow', 'cannon', 'mage', 'rift', 'boomerang')
panel = Image.new('RGB', (920, 1120), '#211f22')
paint = ImageDraw.Draw(panel)
paint.text((18, 12), 'Denkmal TD2 | projectile refresh 64 px + 128 px / impacts', fill='#f3dbb4')

for row, kind in enumerate(KINDS):
    y = 44+row*154
    paint.text((15, y+42), kind.upper(), fill='#e0bd7a')
    for level in range(1, 4):
        file = BASE / f'style2-reference-projectiles-v1/projectiles/projectile_{kind}_lv{level}.png'
        if not file.is_file():
            paint.text((170+(level-1)*248,y+58), 'original retained', fill='#b9b0aa')
            continue
        sprite = Image.open(file).convert('RGBA')
        for n, x in ((64, 165+(level-1)*245), (128, 240+(level-1)*245)):
            scaled = sprite.resize((n,n),Image.Resampling.LANCZOS)
            panel.paste(scaled,(x,y),scaled)
        paint.text((165+(level-1)*245,y+131),f'Level {level}',fill='#bab2a8')

paint.text((18, 828), 'New Ice shatter / Boomerang impacts, 128 px runtime frames', fill='#f3dbb4')
atlas = Image.open(BASE/'style2-reference-impacts-v1/runtime.webp').convert('RGBA')
for row, kind in enumerate(('ice','saw')):
    y = 861+row*120
    paint.text((15,y+42),kind.upper(),fill='#e0bd7a')
    for frame in range(6):
        cut=atlas.crop((frame*128,row*128,(frame+1)*128,(row+1)*128))
        resized=cut.resize((112,112),Image.Resampling.LANCZOS)
        panel.paste(resized,(125+frame*130,y),resized)
TARGET.parent.mkdir(parents=True,exist_ok=True)
panel.save(TARGET,optimize=True)
print(TARGET)
