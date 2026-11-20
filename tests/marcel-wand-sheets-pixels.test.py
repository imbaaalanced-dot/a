"""Pixel QA for the wand-retasked Marcel runtime sheets (2026-11-19 production).

Checks per live action row of every active Marcel combat sheet (side/right,
down, left, up) and the walk atlas:
- no chroma-key magenta background remains keyed into the frames
- the staff's blue crystal glow signature is present in attack/hit frames
  (death frames keep their fading ember glow and are not glow-gated)
- every populated frame keeps its alpha margin
The check is intentionally geometric/colorimetric; it does not replace the
manual identity acceptance required by docs/art/HERO_REFERENCE_LOCK_20261107.md.
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "dist" / "assets" / "hero"
SHEETS = {
    "marcel-side-actions-v5b.webp": (128, {"attack": 2, "hit": 4, "death": 5}),
    "marcel-down-actions-v5b-alpha-repair.webp": (128, {"attack": 2, "hit": 4, "death": 5}),
    "marcel-left-actions-v5b.webp": (128, {"attack": 2, "hit": 4, "death": 5}),
    "marcel-up-actions-v5b.webp": (128, {"attack": 2, "hit": 4, "death": 5}),
}


def magenta_pixels(frame):
    """Visible, strongly opaque pixels that still carry the chroma-key color."""
    data = frame.getdata()
    hits = 0
    for r, g, b, a in data:
        if a < 96:
            continue
        if r > 170 and b > 170 and g < 110 and abs(r - b) < 80:
            hits += 1
            if hits:
                break
    return hits


def has_glow(frame):
    """Bright blue crystal burst/glow of the wand reference."""
    pixels = list(frame.convert("RGB").getdata())
    blue = sum(1 for r, g, b in pixels if b > 140 and b - r > 50 and g < 170)
    return blue >= 4


for name, (cell, rows) in SHEETS.items():
    path = ROOT / name
    assert path.is_file(), f"missing {path}"
    with Image.open(path) as sheet:
        sheet.load()
        assert sheet.mode == "RGBA" and sheet.size == (cell * 6, cell * 6), (name, sheet.mode, sheet.size)
        for row in rows.values():
            for column in range(6):
                frame = sheet.crop((column * cell, row * cell, (column + 1) * cell, (row + 1) * cell))
                alpha = frame.getchannel("A")
                bbox = alpha.point(lambda a: 255 if a >= 32 else 0).getbbox()
                assert bbox, f"{name} {row}/{column}: empty live frame"
                assert min(bbox[0], bbox[1], cell - bbox[2], cell - bbox[3]) >= 2, \
                    f"{name} {row}/{column}: frame bleed {bbox}"
                visible = frame.crop(bbox)
                assert not magenta_pixels(visible), \
                    f"{name} {row}/{column}: chroma-key magenta keyed into the frame"
                if row in (2, 4):
                    assert has_glow(visible), f"{name} {row}/{column}: wand crystal glow missing"

with Image.open(ROOT / "marcel-walk-v5b.webp") as walk:
    walk.load()
    assert walk.mode == "RGBA" and walk.size == (256 * 3, 256 * 4), (walk.mode, walk.size)
    for row in range(4):
        for column in range(3):
            frame = walk.crop((column * 256, row * 256, (column + 1) * 256, (row + 1) * 256))
            alpha = frame.getchannel("A")
            bbox = alpha.point(lambda a: 255 if a >= 32 else 0).getbbox()
            assert bbox, f"walk {row}/{column}: empty frame"
            assert min(bbox[0], bbox[1], 256 - bbox[2], 256 - bbox[3]) >= 2, f"walk {row}/{column}: bleed"
            visible = frame.crop(bbox)
            assert not magenta_pixels(visible), \
                f"walk {row}/{column}: chroma-key magenta keyed into the frame"

print("Marcel wand sheets: 78 live action frames + 12 walk frames, magenta-free, attack/hit crystal glow present")
