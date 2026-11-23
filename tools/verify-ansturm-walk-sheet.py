#!/usr/bin/env python3
"""Read-only first-pass pixel QA for ansturm walk-cycle candidate sheets.

Contract (docs/ansturm-walk-sheet-intake-20261123.md): one horizontal
RGBA PNG strip per enemy type and compass direction, 8 square frames,
true transparent background, foot anchor bottom-center. Companion to the
approved procedural walk cycle in dist/ansturm/render.js; this gate never
edits the runtime asset manifest or published assets.
"""
import argparse
import hashlib
import json
from pathlib import Path
from PIL import Image

FRAME_COUNT = 8
ENEMY_TYPES = ("normal", "runner", "armored", "cultist", "shieldbearer",
               "bomber", "gargoyle", "siege")
BOSS_TYPES = ("stonebreaker", "stormlord", "shieldwarden", "colossus")
DIRECTIONS = ("n", "e", "s", "w")
MIN_CELL, MAX_CELL = 192, 1024
FRAMES_REQUIRED = 3  # distinct visible silhouettes for a pass


def analyze(path, enemy_type, direction):
    if enemy_type not in ENEMY_TYPES + BOSS_TYPES or direction not in DIRECTIONS:
        raise ValueError("unsupported enemy type or direction")
    path = Path(path)
    result = {"file": str(path), "enemy_type": enemy_type, "direction": direction,
              "frames": FRAME_COUNT, "frames_checked": 0, "pixel_gate": "hold",
              "art_approval": "manual-required", "issues": [], "frame_report": []}
    if not path.is_file():
        result["issues"].append("missing-file")
        return result
    try:
        with Image.open(path) as sheet:
            sheet.load()
            result["source_sha256"] = hashlib.sha256(path.read_bytes()).hexdigest()
            w, h = sheet.size
            result["source_size"] = [w, h]
            if sheet.mode != "RGBA":
                result["issues"].append("requires-rgba")
            if h < MIN_CELL or h > MAX_CELL:
                result["issues"].append("cell-height-must-be-192-to-1024-px")
            if w != h * FRAME_COUNT:
                result["issues"].append("requires-8-square-frames-horizontal-strip")
            if result["issues"]:
                return result
            cell = h
            seen_alpha, seen_rgba, foot_columns = set(), set(), []
            for i in range(FRAME_COUNT):
                x = i * cell
                src = sheet.crop((x, 0, x + cell, cell))
                alpha = src.getchannel("A")
                hist = alpha.histogram()
                transparent_ratio = sum(hist[:16]) / (cell * cell)
                bbox = alpha.point(lambda v: 255 if v >= 32 else 0).getbbox()
                problems = []
                if transparent_ratio < .10:
                    problems.append("no-true-transparent-background")
                if hist[255] < 100:
                    problems.append("no-solid-foreground")
                if not bbox:
                    problems.append("empty-frame")
                else:
                    inset = min(bbox[0], bbox[1], cell - bbox[2], cell - bbox[3])
                    if inset < max(4, round(cell * .018)):
                        problems.append("cell-edge-clipping")
                    center = (bbox[0] + bbox[2]) / 2
                    if abs(center - cell / 2) > cell * .12:
                        problems.append("foot-anchor-not-bottom-center")
                    if bbox[3] < cell * .92:
                        problems.append("feet-not-grounded-at-cell-bottom")
                    foot_columns.append(center)
                if any(alpha.getpixel(p) >= 16 for p in
                       ((0, 0), (cell - 1, 0), (0, cell - 1), (cell - 1, cell - 1))):
                    problems.append("nontransparent-corner")
                mask = alpha.point(lambda v: 255 if v >= 32 else 0)
                seen_alpha.add(hashlib.sha256(mask.tobytes()).hexdigest())
                clean = bytearray(src.tobytes())
                for j in range(3, len(clean), 4):
                    if clean[j] < 16:
                        clean[j - 3:j + 1] = b"\x00\x00\x00\x00"
                seen_rgba.add(hashlib.sha256(bytes(clean)).hexdigest())
                result["frame_report"].append(
                    {"index": i,
                     "transparent_percent": round(100 * transparent_ratio, 2),
                     "alpha_bbox": list(bbox) if bbox else None,
                     "frame_issues": problems})
                result["issues"].extend(f"frame-{i}:{p}" for p in problems)
            if len(seen_alpha) < FRAMES_REQUIRED:
                result["issues"].append("less-than-three-visible-silhouettes")
            if len(seen_rgba) < FRAME_COUNT:
                result["issues"].append("duplicate-frames-in-strip")
            if foot_columns and max(foot_columns) - min(foot_columns) > cell * .12:
                result["issues"].append("foot-anchor-drifts-across-strip")
            result["frames_checked"] = len(result["frame_report"])
            if not result["issues"]:
                result["pixel_gate"] = "pass"
    except (OSError, ValueError) as error:
        result["issues"].append("decode-error:" + type(error).__name__)
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--file", type=Path, required=True)
    parser.add_argument("--type", dest="enemy_type", required=True)
    parser.add_argument("--direction", required=True, choices=DIRECTIONS)
    args = parser.parse_args()
    print(json.dumps(analyze(args.file, args.enemy_type, args.direction), indent=2))


if __name__ == "__main__":
    main()
