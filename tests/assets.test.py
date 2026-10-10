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

# Menu downloads stay small enough for mobile connections.
menu = root.parent / 'menu'
for name, limit in (('warden-desktop-v2.webp', 200000), ('warden-mobile-v2.webp', 100000), ('crest-v2.webp', 20000)):
    with Image.open(menu / name) as image:
        image.load()
        assert image.format == 'WEBP', name
        assert image.width > 0 and image.height > 0, name
        assert (menu / name).stat().st_size < limit, name
        print(f'{name}: decoded {image.width}x{image.height}, within download budget')

with Image.open(root.parent / "items/equipment-v1.webp") as image:
    image.load()
    assert image.size == (1024, 512)
    assert image.format == "WEBP"
    print("equipment-v1.webp: 4x2 icon atlas decoded")
