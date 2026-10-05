"""Decode the hero assets; existence alone cannot catch corrupt image uploads."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1] / 'dist' / 'assets' / 'hero'
for name in ('marcel-lantern-portrait-v1.webp', 'marcel-lantern-sprite-v1.webp'):
    with Image.open(root / name) as image:
        image.load()
        assert image.width > 0 and image.height > 0, name
        assert image.format == 'WEBP', name
        print(f'{name}: decoded {image.width}x{image.height}')
