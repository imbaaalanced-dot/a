"""Pixel-level QA for the four actual V5b runtime atlases."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'dist/assets/hero'
SPEC = {
    'kim-walk-v5b.webp': (3, 4, (768, 1024)),
    'marcel-walk-v5b.webp': (3, 4, (768, 1024)),
    'kim-side-actions-v5b.webp': (6, 6, (768, 768)),
    'marcel-side-actions-v5b.webp': (6, 6, (768, 768)),
}

for name, (columns, rows, size) in SPEC.items():
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
                assert bounds is not None, (name, row, column, 'empty frame')
                left, top, right, bottom = bounds
                assert min(left, top, cell_w - right, cell_h - bottom) >= 2, (
                    name, row, column, 'frame risks bleeding into neighbor', bounds)
print('V5b WebP decode, true alpha, grid, all 96 frames and safe margins passed')
