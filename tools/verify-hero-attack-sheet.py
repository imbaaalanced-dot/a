#!/usr/bin/env python3
"""Read-only first-pass pixel QA for a six-frame 3x2 hero attack concept sheet.

The only supported optional output is six UNAPPROVED RGBA frame candidates
for tools/pack-hero-action-directions.py. This does not infer identity, pose
quality or gameplay readiness and never edits the runtime asset manifest.
"""
import argparse
import hashlib
import json
import os
import tempfile
from pathlib import Path
from PIL import Image

CELL = 128
GRID = (3, 2)
FRAME_COUNT = 6
ACTOR_PIVOTS = {"marcel": (64, 116), "kim": (64, 117)}
DIRECTIONS = ("up", "down", "left", "right")


def analyze(path, actor="marcel", direction="down"):
    if actor not in ACTOR_PIVOTS or direction not in DIRECTIONS:
        raise ValueError("unsupported actor or direction")
    path = Path(path)
    result = {"file": str(path), "actor": actor, "direction": direction,
              "grid": [3, 2], "frames_checked": 0, "pixel_gate": "hold",
              "art_approval": "manual-required", "issues": [], "frames": []}
    if not path.is_file():
        result["issues"].append("missing-file")
        return result, []
    frames = []
    try:
        with Image.open(path) as sheet:
            sheet.load()
            result["source_sha256"] = hashlib.sha256(path.read_bytes()).hexdigest()
            w, h = sheet.size
            result["source_size"] = [w, h]
            if sheet.format != "PNG" or sheet.mode != "RGBA":
                result["issues"].append("requires-rgba-png")
            if w % GRID[0] or h % GRID[1] or w // GRID[0] != h // GRID[1]:
                result["issues"].append("requires-3x2-square-cells")
            source_cell = w // GRID[0]
            if source_cell < 256 or source_cell > 1024:
                result["issues"].append("source-cell-must-be-256-to-1024-px")
            if result["issues"]:
                return result, frames
            for i in range(FRAME_COUNT):
                x, y = (i % 3) * source_cell, (i // 3) * source_cell
                src = sheet.crop((x, y, x + source_cell, y + source_cell))
                alpha = src.getchannel("A")
                hist = alpha.histogram()
                transparent_ratio = sum(hist[:16]) / (source_cell * source_cell)
                bbox = alpha.point(lambda v: 255 if v >= 32 else 0).getbbox()
                problems = []
                if transparent_ratio < .10:
                    problems.append("no-true-transparent-background")
                if hist[255] < 100:
                    problems.append("no-solid-foreground")
                if not bbox:
                    problems.append("empty-frame")
                else:
                    inset = min(bbox[0], bbox[1], source_cell - bbox[2], source_cell - bbox[3])
                    if inset < max(4, round(source_cell * .018)):
                        problems.append("cell-edge-clipping")
                    bottom = round(bbox[3] * CELL / source_cell)
                    if abs(bottom - ACTOR_PIVOTS[actor][1]) > 15:
                        problems.append("foot-pivot-drift")
                if any(alpha.getpixel(p) >= 16 for p in
                       ((0, 0), (source_cell-1, 0), (0, source_cell-1),
                        (source_cell-1, source_cell-1))):
                    problems.append("nontransparent-corner")
                frame = src.resize((CELL, CELL), Image.Resampling.LANCZOS)
                # Clear invisible matte colors before the image leaves QA staging.
                pixels = bytearray(frame.tobytes())
                for j in range(0, len(pixels), 4):
                    if pixels[j+3] < 16:
                        pixels[j:j+4] = b"\x00\x00\x00\x00"
                frame = Image.frombytes("RGBA", (CELL, CELL), bytes(pixels))
                mask = frame.getchannel("A").point(lambda v: 255 if v >= 32 else 0)
                frames.append(frame)
                result["frames"].append({"index": i,
                    "transparent_percent": round(100 * transparent_ratio, 2),
                    "alpha_bbox_source": list(bbox) if bbox else None,
                    "frame_issues": problems,
                    "visible_alpha_hash": hashlib.sha256(mask.tobytes()).hexdigest()})
                result["issues"].extend(f"frame-{i}:{p}" for p in problems)
        if len({f["visible_alpha_hash"] for f in result["frames"]}) < 3:
            result["issues"].append("less-than-three-visible-silhouettes")
        if len({hashlib.sha256(f.tobytes()).hexdigest() for f in frames}) < 4:
            result["issues"].append("less-than-four-distinct-rgba-frames")
        result["frames_checked"] = len(frames)
        if not result["issues"]:
            result["pixel_gate"] = "pass"
    except (OSError, ValueError) as error:
        result["issues"].append("decode-error:" + type(error).__name__)
    return result, frames


def export_candidates(report, frames, output_root):
    """Commit only a fully validated six-frame candidate folder, never replace."""
    if report["pixel_gate"] != "pass" or len(frames) != FRAME_COUNT:
        raise ValueError("cannot export failed pixel-gate concept sheet")
    target = Path(output_root) / report["actor"] / report["direction"] / "attack"
    if target.exists():
        raise FileExistsError(f"refusing to overwrite {target}")
    target.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(dir=target.parent) as tmp:
        staged = Path(tmp) / "attack"
        staged.mkdir()
        for i, frame in enumerate(frames):
            frame.save(staged / f"{i:02d}.png", "PNG")
        os.rename(staged, target)
    return target


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--file", type=Path, required=True)
    parser.add_argument("--hero", choices=ACTOR_PIVOTS, default="marcel")
    parser.add_argument("--direction", choices=DIRECTIONS, default="down")
    parser.add_argument("--write-candidates", action="store_true",
                        help="explicitly write six unapproved source frames, never runtime art")
    parser.add_argument("--output-root", type=Path, default=Path("source-art/hero/actions-v5"))
    args = parser.parse_args()
    report, frames = analyze(args.file, args.hero, args.direction)
    if args.write_candidates and report["pixel_gate"] == "pass":
        report["candidate_directory"] = str(export_candidates(report, frames, args.output_root))
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if report["pixel_gate"] == "pass" else 2


if __name__ == "__main__":
    raise SystemExit(main())
