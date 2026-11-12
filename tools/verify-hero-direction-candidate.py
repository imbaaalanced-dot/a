#!/usr/bin/env python3
"""Read-only QA for a proposed 6x6 Kim/Marcel action direction atlas.

Usage:
    python tools/verify-hero-direction-candidate.py --hero marcel --direction left \
      --file dist/assets/hero/marcel-left-actions-v5b.webp

This is a pixel-format gate, NOT approval of identity, facing, timing, or art.
Nothing is exported, registered, deleted, or modified.
"""
import argparse
import json
from pathlib import Path

from PIL import Image

ACTOR_PIVOTS = {"marcel": (64, 116), "kim": (64, 117)}
DIRECTIONS = ("down", "left", "right", "up")
ACTIONS = {"attack": 2, "hit": 4, "death": 5}
GRID = 6
CELL = 128
DIMENSIONS = (GRID * CELL, GRID * CELL)


def inspect(path, hero, direction):
    if hero not in ACTOR_PIVOTS or direction not in DIRECTIONS:
        raise ValueError("unknown actor or facing")
    path = Path(path)
    problems = []
    frames = []
    if not path.is_file():
        return {"file": str(path), "hero": hero, "direction": direction,
                "pixel_gate": "hold", "issues": ["missing-file"],
                "art_approval": "manual-required"}
    try:
        with Image.open(path) as image:
            image.load()
            fmt, size = image.format, image.size
            if fmt != "WEBP" or path.suffix.lower() != ".webp":
                problems.append("runtime-must-be-webp")
            if image.mode != "RGBA":
                problems.append("real-rgba-required")
            if size != DIMENSIONS:
                problems.append("expected-768x768-6x6-cells")
            if "A" not in image.getbands():
                problems.append("missing-alpha")
            if size == DIMENSIONS and "A" in image.getbands():
                for kind, row in ACTIONS.items():
                    for col in range(GRID):
                        rect = (col * CELL, row * CELL,
                                (col + 1) * CELL, (row + 1) * CELL)
                        frame = image.crop(rect).convert("RGBA")
                        alpha = frame.getchannel("A")
                        hist = alpha.histogram()
                        transparent = sum(hist[:16])
                        bbox = alpha.point(lambda v: 255 if v >= 32 else 0).getbbox()
                        if transparent < CELL * CELL // 10:
                            problems.append(f"{kind}/{col}:opaque-background")
                        if hist[255] == 0:
                            problems.append(f"{kind}/{col}:no-solid-pixels")
                        if not bbox:
                            problems.append(f"{kind}/{col}:empty")
                        else:
                            safe = min(bbox[0], bbox[1], CELL - bbox[2], CELL - bbox[3])
                            if safe < 2:
                                problems.append(f"{kind}/{col}:edge-bleed")
                        if any(alpha.getpixel(p) >= 16 for p in
                               ((0, 0), (CELL - 1, 0), (0, CELL - 1),
                                (CELL - 1, CELL - 1))):
                            problems.append(f"{kind}/{col}:opaque-corner")
                        frames.append({"action": kind, "frame": col,
                                       "alpha_bbox": list(bbox) if bbox else None,
                                       "transparent_percent": round(
                                           100 * transparent / (CELL * CELL), 1)})
    except (OSError, ValueError) as error:
        problems.append("decode-error:" + type(error).__name__)
    return {
        "file": str(path), "hero": hero, "direction": direction,
        "expected_canvas": list(DIMENSIONS),
        "cell": CELL, "frames_checked": len(frames),
        "canonical_foot_pivot": list(ACTOR_PIVOTS[hero]),
        "pixel_gate": "pass" if not problems else "hold",
        "issues": problems, "frames": frames,
        "art_approval": "manual-required",
        "browser_qa": "not-tested", "android_4gb_qa": "not-tested",
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--file", required=True, type=Path)
    parser.add_argument("--hero", required=True, choices=ACTOR_PIVOTS)
    parser.add_argument("--direction", required=True, choices=DIRECTIONS)
    args = parser.parse_args()
    result = inspect(args.file, args.hero, args.direction)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    raise SystemExit(0 if result["pixel_gate"] == "pass" else 2)


if __name__ == "__main__":
    main()
