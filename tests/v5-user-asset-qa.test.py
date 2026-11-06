"""Production checks for the two V5b menu cutouts; not a device benchmark."""
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
DIRECTORY = ROOT / "dist/assets/menu/v5-avatars"
NAMES = ("marcel-guardian-v5b.webp", "kim-marksman-v5b.webp")


def check_portrait(name: str) -> None:
    path = DIRECTORY / name
    assert path.is_file(), f"missing {name}"
    assert path.stat().st_size <= 150 * 1024, f"{name}: over 150 KiB"
    with Image.open(path) as image:
        assert image.format == "WEBP", f"{name}: wrong real file format"
        assert 0 < image.width <= 500 and 0 < image.height <= 680
        assert image.mode == "RGBA", f"{name}: alpha channel missing"
        alpha = image.getchannel("A")
        assert alpha.getextrema()[0] == 0 and alpha.getextrema()[1] >= 240
        for pos in ((0, 0), (image.width - 1, 0), (0, image.height - 1), (image.width - 1, image.height - 1)):
            assert alpha.getpixel(pos) == 0, f"{name}: opaque corner {pos}"
        pixels = list(image.get_flattened_data())
        assert sum(a == 0 for _, _, _, a in pixels) > len(pixels) // 3
        pink = sum(r > 170 and b > 120 and g < 80 and a > 32 for r, g, b, a in pixels)
        assert pink < 100, f"{name}: {pink} visible magenta key pixels"


for name in NAMES:
    check_portrait(name)

print("V5b menu portraits: true WebP, alpha, size, corners and magenta checks passed")
