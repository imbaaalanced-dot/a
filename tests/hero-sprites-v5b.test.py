"""Pixel-level QA for the actual V5b runtime atlases.

The four base sheets (walk + side-actions) have every grid cell painted.
The six direction sheets added for v5b-20261114 only paint the combat rows
(attack=2, hit=4, death=5) that the runtime reads; rows 0/1/3 stay empty.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'dist/assets/hero'
SPEC = {
    'kim-walk-v5b.webp': (3, 4, (768, 1024), None),
    'marcel-walk-v5b.webp': (3, 4, (768, 1024), None),
    'kim-side-actions-v5b.webp': (6, 6, (768, 768), None),
    'marcel-side-actions-v5b.webp': (6, 6, (768, 768), None),
    'marcel-down-actions-v5b.webp': (6, 6, (768, 768), (2, 4, 5)),
    'marcel-left-actions-v5b.webp': (6, 6, (768, 768), (2, 4, 5)),
    'marcel-up-actions-v5b.webp': (6, 6, (768, 768), (2, 4, 5)),
    'kim-right-actions-v5b.webp': (6, 6, (768, 768), (2, 4, 5)),
    'kim-up-actions-v5b.webp': (6, 6, (768, 768), (2, 4, 5)),
    'kim-down-actions-v5b.webp': (6, 6, (768, 768), (2, 4, 5)),
}

for name, (columns, rows, size, painted_rows) in SPEC.items():
    with Image.open(ASSETS / name) as image:
        assert image.format == 'WEBP', name
        assert image.size == size and image.mode == 'RGBA', (name, image.size, image.mode)
        assert image.getpixel((0, 0))[3] == 0, f'{name}: background not transparent'
        # Invisible RGB garbage becomes neon rectangles in broken/partial alpha
        # renderers; exported pixels must use a clean transparent-black matte.
        pixels = image.get_flattened_data() if hasattr(image, 'get_flattened_data') else image.getdata()
        hidden_colors = sum(1 for r, g, b, a in pixels
                            if a == 0 and (r != 0 or g != 0 or b != 0))
        assert hidden_colors == 0, (name, 'hidden RGB matte pixels', hidden_colors)
        cell_w, cell_h = size[0] // columns, size[1] // rows
        for row in range(rows):
            for column in range(columns):
                cell = image.crop((column * cell_w, row * cell_h,
                                   (column + 1) * cell_w, (row + 1) * cell_h))
                mask = cell.getchannel('A').point(lambda a: 255 if a >= 32 else 0)
                bounds = mask.getbbox()
                if painted_rows is not None and row not in painted_rows:
                    assert bounds is None, (name, row, column, 'row outside the runtime contract must stay empty')
                    continue
                assert bounds is not None, (name, row, column, 'empty frame')
                left, top, right, bottom = bounds
                assert min(left, top, cell_w - right, cell_h - bottom) >= 2, (
                    name, row, column, 'frame risks bleeding into neighbor', bounds)
print('V5b WebP decode, true alpha, grid, all frames, safe margins and direction-row contract passed')