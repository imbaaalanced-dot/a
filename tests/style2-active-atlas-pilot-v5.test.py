"""Pixel QA for the already-active enemy-00 and bow L1-L3 Style-2 pilot.

These tests verify decoded bytes and pivots, not human artistic approval.
"""

import hashlib
import json
from pathlib import Path

from PIL import Image


root = Path(__file__).resolve().parents[1] / "dist/assets"


def check_frames(name, columns, rows, cell, min_margin=2):
    with Image.open(root / name) as image:
        image.load()
        assert image.format == "WEBP", name
        assert image.mode == "RGBA", name
        assert image.size == (cell * columns, cell * rows), (name, image.size)
        alpha = image.getchannel("A")
        for row in range(rows):
            for column in range(columns):
                frame = alpha.crop((column * cell, row * cell, (column + 1) * cell, (row + 1) * cell))
                bbox = frame.point(lambda a: 255 if a >= 32 else 0).getbbox()
                assert bbox, (name, row, column, "empty frame")
                left, top, right, bottom = bbox
                assert min(left, top, cell - right, cell - bottom) >= min_margin, (
                    name, row, column, "risk of bleeding into adjacent atlas cell", bbox)


enemy_manifest = json.loads((root / "enemies/manifest.json").read_text())
assert enemy_manifest["cell"] == 160
assert enemy_manifest["columns"] == 4 and enemy_manifest["rows"] == 21
assert enemy_manifest["enemies"][0]["name"] == "Untoter Hund"
check_frames("enemies/walk-v1.webp", 4, 21, 160)
check_frames("directional-v410/enemy-00.webp", 4, 12, 128)

tower_manifest = json.loads((root / "style2-user-towers-v3/manifest.json").read_text())
for level in (1, 2, 3):
    identifier = f"tower_bow_lv{level}"
    entry = next(asset for asset in tower_manifest["assets"] if asset["id"] == identifier)
    assert entry["pivot"] == [256, 488], identifier
    assert entry["master_size"] == [512, 512], identifier
    path = root / "style2-user-towers-v3" / entry["webp_path"]
    assert hashlib.sha256(path.read_bytes()).hexdigest() == entry["sha256_webp"], identifier
    check_frames(path.relative_to(root), 1, 1, 512)
    check_frames(f"style2-user-towers-v1/runtime-webp/projectiles/projectile_bow_lv{level}.webp", 1, 1, 256)

print("Style-2 pilot QA passed: 84 enemy movement frames, 48 enemy actions, 3 bow tiers and projectiles")
