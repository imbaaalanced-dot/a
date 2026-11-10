#!/usr/bin/env python3
"""Read-only enemy/boss alpha and atlas-cell audit.

The output is a *pixel* assessment, not an artistic or Android approval.
Fully transparent RGB residue is reported but does not count as visible art.

Examples:
    python tools/audit-enemy-boss-style2.py --grid 4x12 dist/assets/directional-v410/enemy-*.webp
    python tools/audit-enemy-boss-style2.py dist/ansturm/assets/boss_*.webp
"""

import argparse
import hashlib
import json
from pathlib import Path

from PIL import Image


def positive_grid(value):
    try:
        cols, rows = (int(part) for part in value.lower().split("x"))
        if cols > 0 and rows > 0:
            return cols, rows
    except (TypeError, ValueError):
        pass
    raise argparse.ArgumentTypeError("grid must be COLSxROWS, e.g. 4x12")


def inspect_sprite(path, grid=(1, 1), threshold=32):
    path = Path(path)
    with Image.open(path) as source:
        source.load()
        source_format = source.format
        has_alpha = "A" in source.getbands() or "transparency" in source.info
        image = source.convert("RGBA")
    width, height = image.size
    cols, rows = grid
    issues = []
    if not has_alpha:
        issues.append("no-alpha")
    if source_format not in ("WEBP", "PNG") or source_format.lower() != path.suffix[1:].lower():
        issues.append("format-mismatch")
    if width % cols or height % rows:
        issues.append("nonintegral-atlas-grid")

    pixels = image.get_flattened_data() if hasattr(image, "get_flattened_data") else image.getdata()
    hidden_rgb = sum(1 for r, g, b, a in pixels
                     if a == 0 and (r or g or b))
    margins = []
    empty = []
    contacts = []
    if "nonintegral-atlas-grid" not in issues:
        cell_width, cell_height = width // cols, height // rows
        alpha = image.getchannel("A")
        for row in range(rows):
            for col in range(cols):
                index = row * cols + col
                cell = alpha.crop((col * cell_width, row * cell_height,
                                   (col + 1) * cell_width, (row + 1) * cell_height))
                bbox = cell.point(lambda value: 255 if value >= threshold else 0).getbbox()
                if bbox is None:
                    empty.append(index)
                    margins.append(None)
                    continue
                left, top, right, bottom = bbox
                margin = min(left, top, cell_width - right, cell_height - bottom)
                margins.append(margin)
                if margin < 2:
                    contacts.append(index)
    if empty:
        issues.append("empty-cells")
    if contacts:
        issues.append("visible-cell-edge")

    return {
        "file": path.as_posix(),
        "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
        "format": source_format,
        "size": [width, height],
        "grid": [cols, rows],
        "cells": cols * rows,
        "decoded_mib": round(width * height * 4 / 1048576, 3),
        "hidden_rgb_pixels": hidden_rgb,
        "min_visible_margin": min((m for m in margins if m is not None), default=None),
        "visible_edge_cells": len(contacts),
        "edge_cell_indices": contacts,
        "empty_cells": empty,
        "issues": issues,
        "status": "hold" if issues else "pixel-pass",
        "art_approval": "not-automated",
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--grid", type=positive_grid, default=(1, 1))
    parser.add_argument("files", nargs="+", type=Path)
    args = parser.parse_args()
    result = [inspect_sprite(file, args.grid) for file in args.files]
    print(json.dumps({"sprites": result, "summary": {
        "checked": len(result),
        "pixel_pass": sum(item["status"] == "pixel-pass" for item in result),
        "hold": sum(item["status"] == "hold" for item in result),
        "art_approval": "not-automated",
    }}, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
