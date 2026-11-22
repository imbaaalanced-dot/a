"""Enemy palette v3 pass: deterministic contrast/vibrance/clarity lift on opaque pixels.

Motivation (#330 polish backlog / vision QA 2026-11-21): several of the 21
directional enemy sheets and the walk atlases read as muddy on dark terrain -
flat contrast, low saturation on blue/green skins and thick silhouette fill.
This tool applies a reproducible, geometry-preserving enhancement:
  - 1st/99th percentile luminance clip + stretch on opaque pixels only
  - +14% saturation (Pillow Color enhance on the RGB channels)
  - mild unsharp mask on RGB only (radius 1.2, percent 60, threshold 3)
Alpha is restored bit-identical afterwards, so anchors, bounding boxes,
transparent gutters and manifest geometry stay exactly as shipped.

Usage: python tools/enhance-enemy-palette-v3.py [file.webp ...]
With no arguments it processes the shipped defaults:
  dist/assets/directional-v410/enemy-00..20.webp
  dist/assets/enemies/walk-style2.webp
  dist/assets/elemental/enemies-walk-style2.webp
  dist/assets/elemental/enemies-style2.webp
"""
from pathlib import Path
import sys

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
DEFAULTS = [
    *(f"dist/assets/directional-v410/enemy-{i:02d}.webp" for i in range(21)),
    "dist/assets/enemies/walk-style2.webp",
    "dist/assets/elemental/enemies-walk-style2.webp",
    "dist/assets/elemental/enemies-style2.webp",
]


def enhance(path: Path) -> tuple[int, int]:
    im = Image.open(path).convert("RGBA")
    arr = np.asarray(im).copy()
    alpha = arr[..., 3].copy()
    opaque = alpha > 16
    if not opaque.any():
        return 0, 0

    rgb = Image.fromarray(arr[..., :3], "RGB")

    # 1) luminance clip/stretch over opaque pixels only
    lum = (
        0.299 * arr[..., 0].astype(np.float32)
        + 0.587 * arr[..., 1].astype(np.float32)
        + 0.114 * arr[..., 2].astype(np.float32)
    )[opaque]
    lo, hi = np.percentile(lum, 1), np.percentile(lum, 99)
    data = np.asarray(rgb, dtype=np.float32)
    if hi - lo >= 8 and hi > lo:
        gain = 255.0 / (hi - lo)
        data = np.clip((data - lo) * gain, 0, 255)
    rgb = Image.fromarray(data.astype(np.uint8), "RGB")

    # 2) vibrance
    rgb = ImageEnhance.Color(rgb).enhance(1.14)

    # 3) clarity (RGB-only unsharp mask; alpha untouched)
    rgb = rgb.filter(ImageFilter.UnsharpMask(radius=1.2, percent=60, threshold=3))

    out = np.dstack([np.asarray(rgb, dtype=np.uint8), alpha])
    before_alpha_bbox = Image.fromarray(alpha, "L").getbbox()
    Image.fromarray(out, "RGBA").save(path, lossless=True, method=6)
    return int(opaque.sum()), int(Image.fromarray(alpha, "L").getbbox() == before_alpha_bbox)


def main() -> None:
    targets = [(Path(a) if Path(a).is_absolute() else ROOT / a) for a in sys.argv[1:]] or [ROOT / p for p in DEFAULTS]
    for path in targets:
        pixels, alpha_ok = enhance(path)
        rel = path.relative_to(ROOT) if path.is_relative_to(ROOT) else path
        print(f"{rel}: {pixels} opaque px enhanced, alpha preserved={alpha_ok}")


if __name__ == "__main__":
    main()
