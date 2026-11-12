#!/usr/bin/env python3
"""Pack independently painted hero actions into a safe, opt-in V5b WebP atlas.

Expected source: <source>/<hero>/<direction>/<action>/00.png ... 05.png.
Only attack, hit and death are live; rows 0, 1 and 3 stay transparent.
This tool never authorizes a view or edits the active asset registry.
"""
import argparse
import hashlib
import json
from pathlib import Path

from PIL import Image

CELL = 128
GRID = 6
ACTORS = {"marcel": (64, 116), "kim": (64, 117)}
DIRECTIONS = ("down", "left", "right", "up")
ACTIONS = {"attack": 2, "hit": 4, "death": 5}
ORIGINAL = {"marcel": "right", "kim": "left"}


def pack(actor, facing, source_root, output_root, *, replace=False):
    if actor not in ACTORS or facing not in DIRECTIONS:
        raise ValueError("unsupported actor or facing")
    if facing == ORIGINAL[actor]:
        raise ValueError("the canonical V5b side sheet must not be overwritten")
    pivot_x, pivot_y = ACTORS[actor]
    source_root = Path(source_root)
    output_root = Path(output_root)
    target = output_root / f"{actor}-{facing}-actions-v5b.webp"
    manifest_path = output_root / f"{actor}-{facing}-actions-v5b.json"
    if (target.exists() or manifest_path.exists()) and not replace:
        raise FileExistsError("refusing to overwrite existing asset; pass --replace to opt in")
    atlas = Image.new("RGBA", (CELL * GRID, CELL * GRID), (0, 0, 0, 0))
    manifest = {
        "actor": actor, "facing": facing, "cell": CELL, "grid": [GRID, GRID],
        "frames": GRID, "anchor": [pivot_x, pivot_y], "actions": ACTIONS,
        "status": "candidate-unapproved", "manual_art_approval": False,
        "source": {}, "frame_hashes": {}, "motion_checks": {},
    }
    for action, row in ACTIONS.items():
        hashes = []
        heights = []
        silhouette_hashes = []
        manifest["source"][action] = []
        for index in range(GRID):
            src = source_root / actor / facing / action / f"{index:02d}.png"
            if not src.is_file():
                raise FileNotFoundError(f"missing action frame: {src}")
            with Image.open(src) as raw:
                raw.load()
                if raw.format != "PNG" or raw.mode != "RGBA" or raw.size != (CELL, CELL):
                    raise ValueError(f"{src}: expected true RGBA PNG {CELL}x{CELL}")
                frame = Image.alpha_composite(
                    Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0)), raw
                )
            alpha = frame.getchannel("A")
            hist = alpha.histogram()
            if sum(hist[:16]) < CELL * CELL // 10 or not hist[255]:
                raise ValueError(f"{src}: opaque background or empty sprite")
            if any(alpha.getpixel(point) >= 16 for point in
                   ((0, 0), (CELL - 1, 0), (0, CELL - 1), (CELL - 1, CELL - 1))):
                raise ValueError(f"{src}: opaque frame corner")
            bounds = alpha.point(lambda v: 255 if v >= 32 else 0).getbbox()
            if not bounds or min(bounds[0], bounds[1], CELL-bounds[2],
                                 CELL-bounds[3]) < 2:
                raise ValueError(f"{src}: clipping or cell edge bleeding")
            if abs(bounds[3] - pivot_y) > 15:
                raise ValueError(f"{src}: base shadow/ground anchor drift ({bounds[3]} vs {pivot_y})")
            pixels_hash = hashlib.sha256(frame.tobytes()).hexdigest()
            hashes.append(pixels_hash)
            # Reject color-only edits masquerading as independently authored
            # motion. This checks visible alpha shapes and does not prove
            # anatomical accuracy; visual approval remains mandatory.
            visible_shape = alpha.point(lambda value: 255 if value >= 32 else 0)
            silhouette_hashes.append(hashlib.sha256(visible_shape.tobytes()).hexdigest())
            heights.append(bounds[3] - bounds[1])
            manifest["source"][action].append(str(src))
            atlas.paste(frame, (index * CELL, row * CELL))
        # A matching first/last pose can close a recoverable animation loop;
        # holding the final death pose is equally valid. Any *other* duplicate
        # indicates a missing authored motion phase and must fail the intake.
        allowed_hold = (0, 5) if action in ("attack", "hit") else (4, 5)
        duplicated = [(i, j) for i in range(GRID) for j in range(i + 1, GRID)
                      if hashes[i] == hashes[j]]
        unexpected = [pair for pair in duplicated if pair != allowed_hold]
        if len(set(hashes)) < 4 or unexpected:
            raise ValueError(
                f"{actor}/{facing}/{action}: missing distinct motion poses "
                f"(unexpected repeats: {unexpected})")
        if len(set(silhouette_hashes)) < 3:
            raise ValueError(
                f"{actor}/{facing}/{action}: fewer than three visible "
                "alpha silhouettes; recoloring does not count as animation")
        # A full-height sprite must not turn into a horizontal corpse in one
        # frame; this geometric gate does not assess anatomy or perspective.
        drops = [heights[i - 1] - heights[i] for i in range(1, GRID)]
        if action == "death" and any(delta > 52 for delta in drops):
            raise ValueError(
                f"{actor}/{facing}/death: abrupt collapse height change "
                f"{drops}; add a transition frame")
        manifest["frame_hashes"][action] = hashes
        manifest["motion_checks"][action] = {
            "allowed_hold": list(allowed_hold) if allowed_hold in duplicated else None,
            "unique_frames": len(set(hashes)),
            "unique_alpha_silhouettes": len(set(silhouette_hashes)),
            "max_height_drop_px": max(drops),
            "manual_perspective_review": "required",
            "manual_identity_review": "required",
        }
    output_root.mkdir(parents=True, exist_ok=True)
    # Encode before touching any target. A failed save must not leave a corrupt file.
    import tempfile
    with tempfile.TemporaryDirectory(dir=output_root) as temp_dir:
        staged = Path(temp_dir) / target.name
        atlas.save(staged, "WEBP", lossless=True, method=6, exact=False)
        with Image.open(staged) as verification:
            verification.load()
            if verification.size != atlas.size or verification.mode != "RGBA":
                raise ValueError("encoded runtime WebP dimensions or alpha mismatch")
        manifest["bytes"] = staged.stat().st_size
        manifest["sha256_webp"] = hashlib.sha256(staged.read_bytes()).hexdigest()
        staged_manifest = Path(temp_dir) / manifest_path.name
        staged_manifest.write_text(json.dumps(manifest, ensure_ascii=False, indent=2)
                                   + "\n", encoding="utf-8")
        staged.replace(target)
        staged_manifest.replace(manifest_path)
    return manifest, target


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--hero", required=True, choices=ACTORS)
    parser.add_argument("--direction", required=True, choices=DIRECTIONS)
    parser.add_argument("--source-root", type=Path, default=Path("source-art/hero/actions-v5"))
    parser.add_argument("--output-root", type=Path, default=Path("dist/assets/hero"))
    parser.add_argument("--replace", action="store_true",
                        help="explicitly replace a previously produced candidate, never canonical side art")
    args = parser.parse_args()
    report, target = pack(args.hero, args.direction, args.source_root,
                          args.output_root, replace=args.replace)
    print(json.dumps({"file": str(target), "bytes": report["bytes"],
                      "sha256": report["sha256_webp"],
                      "status": "candidate-unapproved"}, indent=2))


if __name__ == "__main__":
    main()
