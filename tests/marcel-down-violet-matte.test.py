"""Catch the visible purple matte in the actual registered down-attack frame.

This check is deliberately limited to Marcel's known defective frame; purple
spell effects elsewhere are valid artwork and must not be globally keyed out.
"""
from pathlib import Path
import re
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
registry = (ROOT / 'dist/directional-hero-assets-v5.js').read_text()
url = re.search(r"down:'([^']+)'", registry).group(1)
with Image.open(ROOT / 'dist' / url.split('?')[0]) as active:
    active = active.convert('RGBA')
    assert active.size == (768, 768)
    frame = active.crop((512, 256, 640, 384))
    pixels = list(frame.get_flattened_data()) if hasattr(frame, 'get_flattened_data') else list(frame.getdata())
    purple = sum(r > 100 and b > 100 and g < 100 and a > 100 and min(r, b) > g * 1.4
                 for r, g, b, a in pixels)
    assert purple < 20, ('Marcel down attack frame 4 contains visible purple matte', purple)
    # The repair must preserve a substantial opaque character and cyan ring.
    assert sum(a > 200 for _, _, _, a in pixels) > 1000
    assert sum(g > 140 and b > 140 and r < 130 and a > 100 for r, g, b, a in pixels) > 300
    alpha = frame.getchannel('A')
    bbox = alpha.point(lambda a: 255 if a >= 32 else 0).getbbox()
    assert bbox and min(bbox[0], bbox[1], 128-bbox[2], 128-bbox[3]) >= 2
    with Image.open(ROOT / 'dist/assets/hero/marcel-down-actions-v5b.webp') as original:
        original = original.convert('RGBA')
        for row in range(6):
            for col in range(6):
                if (row, col) == (2, 4):
                    continue
                rect = (col*128, row*128, (col+1)*128, (row+1)*128)
                assert active.crop(rect).tobytes() == original.crop(rect).tobytes(), (row, col, 'unrelated frame changed')
print('Marcel down: purple matte absent, cyan ring retained, 35 other atlas cells unchanged')
