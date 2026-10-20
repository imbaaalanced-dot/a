#!/usr/bin/env python3
"""Export TD2 user-approved Style-2 tower/projectile atlases into isolated sprites.

Usage:
  python tools/export_user_style2_towers.py /path/to/86485.png /path/to/86488.png
Optional output:
  python tools/export_user_style2_towers.py 86485.png 86488.png --out dist/assets/style2-user-towers-v1

Non-destructive: exports files only, does not wire them into the renderer.
Requires Pillow.
"""
import argparse
import hashlib
import json
from pathlib import Path
from PIL import Image

TYPES = ("bow", "cannon", "mage", "rift", "boomerang")
# Boundaries sit in alpha-empty rows between silhouettes. A fixed 400px row
# cut would sever some tall tower tops belonging to the following tier.
TOWER_Y = {
    "bow": (0, 380, 790, 1200),
    "cannon": (0, 400, 790, 1200),
    "mage": (0, 360, 784, 1200),
    "rift": (0, 344, 790, 1200),
    "boomerang": (0, 380, 790, 1200),
}
PROJECTILE_Y = {
    "bow": (0, 144, 285, 432),
    "cannon": (0, 144, 280, 432),
    "mage": (0, 144, 277, 432),
    "rift": (0, 144, 276, 432),
    "boomerang": (0, 144, 285, 432),
}

def bounds(image):
    # Ignore a few near-transparent fringe pixels when deciding the content box,
    # but retain these pixels in the final crop wherever the body is included.
    return image.getchannel("A").point(lambda n: 255 if n > 10 else 0).getbbox()

def export(tower_path, projectile_path, output):
    towers = Image.open(tower_path).convert("RGBA")
    projectiles = Image.open(projectile_path).convert("RGBA")
    assert towers.size == (2000, 1200), towers.size
    assert projectiles.size == (720, 432), projectiles.size
    output.mkdir(parents=True, exist_ok=True)
    entries = []
    for role, atlas, columns, cuts, size in (
        ("tower", towers, 400, TOWER_Y, 512),
        ("projectile", projectiles, 144, PROJECTILE_Y, 256),
    ):
        for index, kind in enumerate(TYPES):
            y = cuts[kind]
            for level in (1, 2, 3):
                rect = (index * columns, y[level - 1],
                        (index + 1) * columns, y[level])
                source = atlas.crop(rect)
                bb = bounds(source)
                if not bb:
                    raise ValueError(f"Empty source cell: {kind} L{level}")
                canvas = Image.new("RGBA", (size, size))
                if role == "tower":
                    # Fixed x=256, foot at y=488. Tier silhouette remains its
                    # native scale; do not magnify a weak tier to look like L3.
                    cut = source.crop((0, bb[1], columns, bb[3]))
                    top_left = ((size - columns) // 2, 488 - cut.height)
                    pivot = [256, 488]
                else:
                    cut = source.crop(bb)
                    top_left = ((size - cut.width) // 2,
                                (size - cut.height) // 2)
                    pivot = [128, 128]
                if top_left[0] < 0 or top_left[1] < 0:
                    raise ValueError(f"Content out of bounds: {kind} L{level}")
                canvas.alpha_composite(cut, top_left)
                prefix = f"{role}_{kind}_lv{level}"
                png = Path(role + "s") / f"{prefix}.png"
                webp = Path("runtime-webp") / (role + "s") / f"{prefix}.webp"
                (output / png).parent.mkdir(parents=True, exist_ok=True)
                (output / webp).parent.mkdir(parents=True, exist_ok=True)
                canvas.save(output / png, optimize=True)
                canvas.save(output / webp, "WEBP",
                            lossless=True, method=6, exact=True)
                png_img = Image.open(output / png).convert("RGBA")
                webp_img = Image.open(output / webp).convert("RGBA")
                assert png_img.tobytes() == webp_img.tobytes(), prefix
                assert png_img.getchannel("A").getextrema()[0] == 0, prefix
                entries.append({
                    "id": prefix, "kind": kind, "level": level,
                    "role": role, "source_rectangle": rect,
                    "master": str(png), "runtime": str(webp),
                    "canvas": [size, size], "pivot": pivot,
                    "sha256_png": hashlib.sha256((output / png).read_bytes()).hexdigest(),
                })
    assert len(entries) == 30
    (output / "manifest.json").write_text(
        json.dumps({"version": "1.0.0", "source_towers": str(tower_path),
                    "source_projectiles": str(projectile_path),
                    "status": "exported; NOT integrated or device-tested",
                    "assets": entries}, indent=2) + "\n", encoding="utf-8")
    print(f"Validated {len(entries)} RGBA PNG + lossless WebP pairs in {output}")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("towers", type=Path)
    parser.add_argument("projectiles", type=Path)
    parser.add_argument("--out", type=Path,
                        default=Path("dist/assets/style2-user-towers-v1"))
    args = parser.parse_args()
    export(args.towers, args.projectiles, args.out)

if __name__ == "__main__":
    main()
