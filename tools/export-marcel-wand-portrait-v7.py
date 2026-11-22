#!/usr/bin/env python3
"""Materialize the armory/story wand portrait (v7) for Marcel.

Source is the locked HERO_REFERENCE full-body Marcel reference from 2026-11-15
(see docs/art/HERO_REFERENCE_LOCK_20261107.md). The v6 armory portrait still
showed sword and shield; per the lock transition the runtime projection now
adopts the wand look, while the menu keeps its own dedicated illustration.

Target: dist/assets/menu/v5-avatars/marcel-guardian-v7.webp
  - SHA-256 gate against the locked reference
  - alpha bounding-box crop + 2 px padding: full figure, wand included
  - lossy WebP quality ladder (starts at q88) capped at 150 KB
  - staged write + verify + replace, so a failed run never tears the asset

Run from anywhere: python tools/export-marcel-wand-portrait-v7.py
"""
from pathlib import Path
import hashlib

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "originals/marcel-der-beschuetzer-reference-20261115.png"
SRC_SHA256 = "f8afed7cb6affc64ba9ddf5501a4eeeb9c5e103714f2a58b3e19abda353fee3f"
TARGET = ROOT / "dist/assets/menu/v5-avatars/marcel-guardian-v7.webp"
PAD = 2
MAX_BYTES = 150_000
MIN_QUALITY = 60


def build_canvas() -> Image.Image:
    data = SRC.read_bytes()
    sha = hashlib.sha256(data).hexdigest()
    if sha != SRC_SHA256:
        raise SystemExit(f"{SRC.name}: SHA-256 {sha} does not match the locked reference")
    with Image.open(SRC) as ref:
        ref.load()
        if ref.mode != "RGBA":
            raise SystemExit(f"{SRC.name}: expected RGBA, got {ref.mode}")
        bbox = ref.getchannel("A").getbbox()
        if bbox is None:
            raise SystemExit(f"{SRC.name}: reference is fully transparent")
        cropped = ref.crop(bbox)
    w, h = cropped.size
    canvas = Image.new("RGBA", (w + 2 * PAD, h + 2 * PAD), (0, 0, 0, 0))
    canvas.paste(cropped, (PAD, PAD))
    return canvas


def main() -> Path:
    canvas = build_canvas()
    staged = TARGET.with_name(".marcel-guardian-v7.staged.webp")
    quality = 88
    while True:
        canvas.save(staged, "WEBP", quality=quality, method=6, exact=True)
        if staged.stat().st_size <= MAX_BYTES or quality <= MIN_QUALITY:
            break
        quality -= 4
    with Image.open(staged) as check:
        check.load()
        if check.size != canvas.size or check.mode != "RGBA":
            staged.unlink(missing_ok=True)
            raise SystemExit("staged v7 portrait failed verification")
    staged.replace(TARGET)
    size = TARGET.stat().st_size
    if size > MAX_BYTES:
        raise SystemExit(f"v7 portrait exceeds budget: {size} > {MAX_BYTES} bytes")
    print(f"marcel-guardian-v7.webp: {canvas.size[0]}x{canvas.size[1]}, q{quality}, {size} bytes")
    return TARGET


if __name__ == "__main__":
    main()
