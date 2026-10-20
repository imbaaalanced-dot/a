"""Inventory packaged assets. Usage is a literal reference scan, not runtime proof."""
from __future__ import annotations

import csv
import hashlib
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "dist/assets"
SOURCES = [p for p in (ROOT / "dist").glob("*") if p.suffix in {".js", ".css", ".html"}]
CONTENTS = {p.name: p.read_text(errors="replace") for p in SOURCES}


def inventory() -> list[dict]:
    rows = []
    for path in sorted(p for p in ASSETS.rglob("*") if p.is_file()):
        relative = path.relative_to(ASSETS).as_posix()
        with path.open("rb") as stream:
            digest = hashlib.sha256(stream.read()).hexdigest()
        width = height = alpha = ""
        try:
            with Image.open(path) as img:
                width, height = img.size
                alpha = "yes" if "A" in img.getbands() or "transparency" in img.info else "no"
        except (OSError, ValueError):
            pass
        mentions = sum(relative in text for text in CONTENTS.values())
        rows.append({"asset": relative, "format": path.suffix[1:].lower(),
                     "bytes": path.stat().st_size, "width": width, "height": height,
                     "alpha": alpha, "literal_references": mentions,
                     "sha256": digest})
    return rows


if __name__ == "__main__":
    output = ROOT / "docs/ALPHA9_ASSET_INVENTORY.csv"
    rows = inventory()
    with output.open("w", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)
    print(f"{len(rows)} assets; {sum(r['bytes'] for r in rows):,} bytes; {output}")
    print("No literal reference is inconclusive for dynamically assembled paths.")
