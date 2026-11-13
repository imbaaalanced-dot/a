#!/usr/bin/env python3
"""Build a NON-RUNTIME Level-7 memorial sprite candidate from reviewed RGBA layers.

Usage:
 python tools/build-westhofen-candidate.py --frame stone-frame.png \
   --altar altar-and-steps.png --emblem bronze-emblem.png --out /tmp/td2-westhofen-v2

Inputs MUST be separate, aligned 768x512 transparent full-canvas PNGs.
Never feed a screenshot, a labeled concept sheet or original user photos.
No game files, loader URLs, original assets, or save states are modified.
"""
import argparse
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageDraw

SIZE = (768, 512)
MAX_WEBP_BYTES = 160_000
ALPHA_THRESHOLD = 32
INSET = 8


def inspect_layer(path):
    path = Path(path)
    with Image.open(path) as source:
        source.load()
        if source.format != "PNG":
            raise ValueError(f"{path.name}: expected lossless RGBA PNG input, got {source.format}")
        if source.mode != "RGBA":
            raise ValueError(f"{path.name}: must be genuine RGBA; not an RGB concept sheet")
        if source.size != SIZE:
            raise ValueError(f"{path.name}: expected {SIZE}, got {source.size}")
        layer = source.copy()
    minimum, maximum = layer.getchannel("A").getextrema()
    if minimum != 0 or maximum < 64:
        raise ValueError(f"{path.name}: missing genuine transparent and visible pixels")
    return layer, hashlib.sha256(path.read_bytes()).hexdigest()


def alpha_bounds(img, threshold=ALPHA_THRESHOLD):
    return img.getchannel("A").point(lambda x: 255 if x >= threshold else 0).getbbox()


def edge_violations(img):
    a = img.getchannel("A")
    w, h = img.size
    # A faint WebP fringe should be reported separately; a new source must
    # already have its visible silhouette completely inside the safe inset.
    strips = [
        (0, 0, w, INSET), (0, h - INSET, w, h),
        (0, 0, INSET, h), (w - INSET, 0, w, h),
    ]
    return sum(sum(1 for value in a.crop(rect).getdata() if value >= ALPHA_THRESHOLD) for rect in strips)


def review_image(candidate):
    sizes = (64, 128)
    backgrounds = ((21, 28, 38), (238, 233, 222))
    tile_w, tile_h = 268, 188
    canvas = Image.new("RGB", (tile_w * 2, tile_h * 2), (49, 52, 58))
    draw = ImageDraw.Draw(canvas)
    for row, size in enumerate(sizes):
        for col, bg in enumerate(backgrounds):
            x0, y0 = col * tile_w, row * tile_h
            draw.text((x0 + 12, y0 + 9), f"{size}px | {'dunkel' if col == 0 else 'hell'}", fill=(245, 245, 245))
            # Keep 768:512 aspect, centered inside a fixed square.
            w = size
            h = round(size * SIZE[1] / SIZE[0])
            sprite = candidate.resize((w, h), Image.Resampling.LANCZOS)
            tile = Image.new("RGBA", (size, size), bg + (255,))
            tile.alpha_composite(sprite, (0, (size - h) // 2))
            canvas.paste(tile.convert("RGB"), (x0 + (tile_w - size) // 2, y0 + 35))
    return canvas


def build(frame, altar, emblem, out):
    out = Path(out)
    out.mkdir(parents=True, exist_ok=True)
    sources = {}
    layers = []
    report = {
        "kind": "westhofen-memorial-v2-candidate",
        "runtime_activated": False,
        "physical_android_tested": False,
        "source_layers": {},
        "gate": "hold",
        "errors": [],
    }
    try:
        for role, path in [("stone-frame", frame), ("altar-and-steps", altar), ("bronze-emblem", emblem)]:
            layer, sha = inspect_layer(path)
            layers.append(layer)
            sources[role] = {"input": Path(path).name, "sha256": sha, "bounds": alpha_bounds(layer)}
        image = Image.new("RGBA", SIZE, (0, 0, 0, 0))
        for layer in layers:  # Back to front; keep the historical perspective.
            image = Image.alpha_composite(image, layer)
        bounds = alpha_bounds(image)
        report.update({"source_layers": sources, "size": SIZE, "visible_bbox": bounds,
                       "edge_pixels_alpha_ge_32": edge_violations(image)})
        if bounds is None or edge_violations(image):
            raise ValueError("candidate touches 8px safe inset or has no visible silhouette")
        # Fully transparent pixels never carry hidden RGB matte into the runtime.
        pixels = list(image.getdata())
        image.putdata([(r, g, b, a) if a else (0, 0, 0, 0) for r, g, b, a in pixels])
        review_image(image).save(out / "westhofen-v2-64-128-review.png")
        tmp = out / "_westhofen-pending.webp"
        image.save(tmp, format="WEBP", quality=84, method=6, exact=True)
        with Image.open(tmp) as decoded:
            decoded.load()
            if decoded.size != SIZE or decoded.mode != "RGBA":
                raise ValueError("encoded WebP lost shape or RGBA")
            if edge_violations(decoded):
                raise ValueError("WebP encode introduced clipped visible edges")
        weight = tmp.stat().st_size
        report["webp_bytes"] = weight
        if weight >= MAX_WEBP_BYTES:
            raise ValueError(f"candidate {weight} bytes exceeds {MAX_WEBP_BYTES} budget")
        final = out / "westhofen-memorial-candidate-v2.webp"
        tmp.rename(final)
        report.update({"candidate_file": final.name, "gate": "pixel-pass-visual-review-pending"})
    except (ValueError, OSError) as error:
        report["errors"].append(str(error))
        (out / "_westhofen-pending.webp").unlink(missing_ok=True)
        report["gate"] = "hold"
    (out / "report.json").write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    return report


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--frame", type=Path, required=True)
    p.add_argument("--altar", type=Path, required=True)
    p.add_argument("--emblem", type=Path, required=True)
    p.add_argument("--out", type=Path, required=True)
    args = p.parse_args()
    report = build(args.frame, args.altar, args.emblem, args.out)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    if not report["gate"].startswith("pixel-pass"):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
