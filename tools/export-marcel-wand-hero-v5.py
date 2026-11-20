#!/usr/bin/env python3
"""Import the wand-retasked Marcel sheets produced against the 2026-11-15
reference into the runtime atlases.

- side (right, canonical base sheet): rows attack/hit/death only, others transparent
- walk atlas: 3 frames per direction (down/up/left/right), 256 px cells

Sources: source-art/hero/actions-v5/marcel/right/* and
source-art/hero/walk-v5/marcel/*. Both targets keep their locked v5b filenames;
callers refresh the ?v= cache busters in the asset registries afterwards.
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
HERO = ROOT / "source-art/hero/actions-v5/marcel/right"
WALK = ROOT / "source-art/hero/walk-v5/marcel"
CELL = 128
WALKCELL = 256
ROWS = {"attack": 2, "hit": 4, "death": 5}


def export_side():
    atlas = Image.new("RGBA", (CELL * 6, CELL * 6), (0, 0, 0, 0))
    for action, row in ROWS.items():
        for i in range(6):
            src = HERO / action / f"{i:02d}.png"
            if not src.is_file():
                raise FileNotFoundError(src)
            with Image.open(src) as frame:
                frame.load()
                if frame.size != (CELL, CELL) or frame.mode != "RGBA":
                    raise ValueError(f"{src}: expected RGBA {CELL}x{CELL}")
                atlas.paste(frame, (i * CELL, row * CELL))
    target = ROOT / "dist/assets/hero/marcel-side-actions-v5b.webp"
    staged = ROOT / "dist/assets/hero/.marcel-side-actions-staged.webp"
    atlas.save(staged, "WEBP", lossless=True, method=6, exact=True)
    with Image.open(staged) as check:
        check.load()
        if check.size != atlas.size or check.mode != "RGBA":
            raise ValueError("staged side sheet failed verification")
    staged.replace(target)
    return target


def export_walk():
    atlas = Image.new("RGBA", (WALKCELL * 3, WALKCELL * 4), (0, 0, 0, 0))
    for row, direction in enumerate(("down", "up", "left", "right")):
        for i in range(3):
            src = WALK / direction / f"{i:02d}.png"
            if not src.is_file():
                raise FileNotFoundError(src)
            with Image.open(src) as frame:
                frame.load()
                if frame.size != (WALKCELL, WALKCELL) or frame.mode != "RGBA":
                    raise ValueError(f"{src}: expected RGBA {WALKCELL}x{WALKCELL}")
                atlas.paste(frame, (i * WALKCELL, row * WALKCELL))
    target = ROOT / "dist/assets/hero/marcel-walk-v5b.webp"
    staged = ROOT / "dist/assets/hero/.marcel-walk-staged.webp"
    atlas.save(staged, "WEBP", lossless=True, method=6, exact=True)
    with Image.open(staged) as check:
        check.load()
        if check.size != atlas.size or check.mode != "RGBA":
            raise ValueError("staged walk sheet failed verification")
    staged.replace(target)
    return target


if __name__ == "__main__":
    print(export_side().relative_to(ROOT))
    print(export_walk().relative_to(ROOT))
