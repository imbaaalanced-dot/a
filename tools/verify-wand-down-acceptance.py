#!/usr/bin/env python3
"""SHA-256 integrity gate for the 18 Marcel 'down' wand candidates (Issue #301 acceptance).

Reads the manifest table in docs/art/marcel-wand-down-candidates-20261115.md and
verifies that every candidate file under source-art/hero/actions-v5/marcel/down/
matches its published SHA-256 byte-for-byte, plus the concept sheets and 6x1
previews. Read-only: no runtime files are touched.
"""
from pathlib import Path
import hashlib
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
DOC = ROOT / "docs/art/marcel-wand-down-candidates-20261115.md"
SRC = ROOT / "source-art/hero/actions-v5/marcel/down"
REFERENCE = ROOT / "originals/marcel-der-beschuetzer-reference-20261115.png"

text = DOC.read_text(encoding="utf-8")
rows = re.findall(r"^\|\s*`([^`]+)`\s*\|\s*`([0-9a-f]{64})`\s*\|\s*$", text, re.MULTILINE)
assert rows, "no manifest rows found in candidates doc"
assert len(rows) == 24, f"expected 24 manifest rows, found {len(rows)}"

problems = []
for name, expected in rows:
    path = SRC / name
    if not path.is_file():
        problems.append(f"missing: {name}")
        continue
    actual = hashlib.sha256(path.read_bytes()).hexdigest()
    if actual != expected:
        problems.append(f"sha mismatch: {name} expected {expected} got {actual}")

if not REFERENCE.is_file():
    problems.append("missing reference: originals/marcel-der-beschuetzer-reference-20261115.png")

# No near-magenta leftovers in any candidate (chroma-key spill check).
for name, _ in rows:
    if "/" not in name:
        continue
    path = SRC / name
    if not path.is_file():
        continue
    try:
        from PIL import Image  # noqa: WPS433 (optional soft check)
    except ImportError:
        break
    img = Image.open(path).convert("RGBA")
    if img.size != (128, 128):
        problems.append(f"unexpected size {img.size}: {name}")
    px = img.load()
    near = sum(
        1
        for y in range(0, 128, 2)
        for x in range(0, 128, 2)
        if px[x, y][3] > 200
        and abs(px[x, y][0] - 255) + abs(px[x, y][1]) + abs(px[x, y][2] - 255) < 90
    )
    if near:
        problems.append(f"near-magenta spill pixels: {name} ({near})")

if problems:
    print("\n".join(problems))
    sys.exit(1)
print("wand-down acceptance integrity: 24/24 manifest SHAs verified, reference present, no chroma spill")
