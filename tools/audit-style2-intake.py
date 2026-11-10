#!/usr/bin/env python3
"""Read-only pixel gate for proposed Style-2 runtime sprites.

This checks source bytes; it never converts files or grants artistic approval.
For example:
    python tools/audit-style2-intake.py --grid 3x4 --expected-size 768x1024 source.png
"""

import argparse
import hashlib
import json
from pathlib import Path

from PIL import Image


def parse_pair(value: str) -> tuple[int, int]:
    try:
        a, b = (int(part) for part in value.lower().split("x"))
        if a > 0 and b > 0:
            return a, b
    except (ValueError, TypeError):
        pass
    raise argparse.ArgumentTypeError("expected two positive integers, e.g. 3x4")


def audit(path: Path, grid=(1, 1), expected_size=None) -> dict:
    path = Path(path)
    with Image.open(path) as source:
        source.load()  # Fail closed on truncated or undecodable images.
        width, height = source.size
        format_name = source.format
        source_has_alpha = "A" in source.getbands() or "transparency" in source.info
        rgba = source.convert("RGBA")

    alpha = rgba.getchannel("A")
    pix = rgba.load()
    columns, rows = grid
    issues = []
    if format_name not in ("PNG", "WEBP"):
        issues.append("unsupported-format")
    if format_name != path.suffix[1:].upper():
        issues.append("extension-content-mismatch")
    if not source_has_alpha:
        issues.append("no-alpha-channel")
    if expected_size and (width, height) != tuple(expected_size):
        issues.append("runtime-dimensions-mismatch")
    if width % columns or height % rows:
        issues.append("atlas-not-divisible-by-grid")

    # RGBA is decoded as 4 bytes per pixel on Canvas regardless of WebP size.
    decoded_bytes = width * height * 4
    if decoded_bytes > 16 * 1024 * 1024:
        issues.append("over-16mib-decoded")

    opaque = transparent = partial = hidden_rgb = magenta = green = 0
    pixels = rgba.get_flattened_data() if hasattr(rgba, "get_flattened_data") else rgba.getdata()
    for r, g, b, a in pixels:
        if a == 0:
            transparent += 1
            if r or g or b:
                hidden_rgb += 1
        elif a == 255:
            opaque += 1
        else:
            partial += 1
        # Detect visible chroma-key leftovers, not intentionally invisible matte.
        if a >= 16 and r > 220 and b > 200 and g < 100:
            magenta += 1
        if a >= 16 and g > 110 and g > r * 1.5 and g > b * 1.5:
            green += 1

    edge_pixels = sum(1 for x in range(width) if pix[x, 0][3] > 8 or pix[x, height - 1][3] > 8)
    edge_pixels += sum(1 for y in range(1, height - 1) if pix[0, y][3] > 8 or pix[width - 1, y][3] > 8)
    if edge_pixels:
        issues.append("visible-outer-edge")
    if hidden_rgb:
        issues.append("hidden-rgb-matte-needs-cleanup")
    if magenta:
        issues.append("visible-magenta-pixels-review")
    if green:
        issues.append("visible-green-pixels-review")

    frames = []
    if width % columns == 0 and height % rows == 0:
        cell_width, cell_height = width // columns, height // rows
        for row in range(rows):
            for col in range(columns):
                x0, y0 = col * cell_width, row * cell_height
                mask = alpha.crop((x0, y0, x0 + cell_width, y0 + cell_height))
                bbox = mask.point(lambda a: 255 if a >= 32 else 0).getbbox()
                frame = {"col": col, "row": row, "bbox": list(bbox) if bbox else None}
                if bbox:
                    left, top, right, bottom = bbox
                    frame["safe_margin_px"] = min(left, top, cell_width - right, cell_height - bottom)
                    frame["foot_x_fraction"] = round((left + right) / (2 * cell_width), 3)
                    if frame["safe_margin_px"] < 2 and grid != (1, 1):
                        issues.append("frame-touches-atlas-cell")
                else:
                    issues.append("empty-atlas-frame")
                frames.append(frame)

    issues = sorted(set(issues))
    return {
        "source": path.name,
        "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
        "format": format_name,
        "mode": rgba.mode if source_has_alpha else "RGB/no-alpha",
        "size": [width, height],
        "grid": [columns, rows],
        "decoded_mib": round(decoded_bytes / 1048576, 2),
        "pixels": {"opaque": opaque, "transparent": transparent, "partial": partial,
                   "hidden_rgb": hidden_rgb, "visible_magenta": magenta, "visible_green": green,
                   "outer_edge": edge_pixels},
        "frames": frames,
        "issues": issues,
        "pixel_gate": "pass" if not issues else "hold",
        "art_approval": "not-automated",
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("images", type=Path, nargs="+", help="existing PNG/WebP source files")
    parser.add_argument("--grid", type=parse_pair, default=(1, 1), metavar="COLSxROWS")
    parser.add_argument("--expected-size", type=parse_pair, metavar="WxH")
    args = parser.parse_args()
    reports = [audit(image, args.grid, args.expected_size) for image in args.images]
    print(json.dumps(reports, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
