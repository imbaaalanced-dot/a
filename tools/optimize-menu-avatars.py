#!/usr/bin/env python3
"""Optimize the two TD2 V5 hero portraits for the mobile menu.

Sources arrive as base64 text files (*.b64) committed to the feature branch.
Each payload is an opaque studio JPEG on a near-black background, or an
alpha-transparent PNG. Opaque sources get their border-connected studio
background removed with edge-seeded flood fills so only the character
remains. The script never changes gameplay files or saves.
"""
import base64
from io import BytesIO
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1] / "dist/assets/menu/v5-avatars"
ASSETS = {
    "marcel-source.jpg.b64": "marcel-guardian-v5.webp",
    "kim-source.jpg.b64": "kim-marksman-v5.webp",
}
LIMIT = 150_000
FILL_TOLERANCE = 44
FEATHER_RADIUS = 0.8


def load_source(path: Path) -> Image.Image:
    raw = base64.b64decode(path.read_bytes())
    return Image.open(BytesIO(raw)).convert("RGBA")


def has_transparency(rgba: Image.Image) -> bool:
    return rgba.getchannel("A").getextrema()[0] < 255


def remove_studio_background(rgba: Image.Image) -> Image.Image:
    """Make the border-connected studio background transparent."""
    if has_transparency(rgba):
        return rgba

    work = rgba.copy()
    width, height = work.size
    sentinel = (255, 0, 255)
    seeds = [(0, 0), (width - 1, 0), (0, height - 1), (width - 1, height - 1)]
    for seed in seeds:
        ImageDraw.floodfill(work, seed, sentinel + (255,), thresh=FILL_TOLERANCE)

    data = bytearray(work.tobytes())
    for index in range(0, len(data), 4):
        r, g, b = data[index], data[index + 1], data[index + 2]
        if (r, g, b) == sentinel:
            data[index + 3] = 0
    result = Image.frombytes("RGBA", (width, height), bytes(data))

    alpha = result.getchannel("A").filter(ImageFilter.GaussianBlur(FEATHER_RADIUS))
    result.putalpha(alpha)
    return result


def optimize(src: Path, dst: Path) -> None:
    rgba = remove_studio_background(load_source(src))
    bounds = rgba.getchannel("A").getbbox()
    if not bounds:
        raise ValueError(f"{src.name} contains no visible pixels after background removal")
    rgba = rgba.crop(bounds)

    for maximum_width in (640, 560, 480, 400):
        candidate = rgba.copy()
        candidate.thumbnail((maximum_width, 980), Image.Resampling.LANCZOS)
        for quality in (80, 72, 64, 56, 48, 40):
            output = BytesIO()
            candidate.save(output, "WEBP", quality=quality, method=5, exact=True)
            if output.tell() <= LIMIT:
                dst.write_bytes(output.getvalue())
                with Image.open(dst) as final:
                    assert final.format == "WEBP"
                    assert final.mode == "RGBA", dst
                    final.load()
                coverage = final.getchannel("A").getbbox()
                assert coverage is not None, dst
                print(f"{src.name} -> {dst.name}: {candidate.width}x{candidate.height}, {dst.stat().st_size} bytes")
                return
    raise RuntimeError(f"Could not make {src.name} smaller than {LIMIT} bytes without unacceptable downscaling")


def main():
    missing = [name for name in ASSETS if not (ROOT / name).is_file()]
    if missing:
        raise SystemExit("Missing portrait source files: " + ", ".join(missing))
    for name, out in ASSETS.items():
        optimize(ROOT / name, ROOT / out)


if __name__ == "__main__":
    main()
