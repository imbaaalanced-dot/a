#!/usr/bin/env python3
"""Deterministic, non-runtime SVG -> RGBA/WebP previews for Westhofen V2 art review.

Requires CairoSVG and Pillow. Never modifies dist/ or public game assets.
"""
from __future__ import annotations
import argparse
import hashlib
import io
import json
from pathlib import Path
import xml.etree.ElementTree as ET

from PIL import Image, ImageDraw
import cairosvg

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "docs" / "graphics" / "westhofen-v2"
NAMES = ("westhofen-frame-v2", "westhofen-altar-steps-v2", "westhofen-emblem-v2", "westhofen-composite-v2")
NS = "{http://www.w3.org/2000/svg}"

def scan(path: Path):
    tree = ET.parse(path)
    root = tree.getroot()
    assert root.tag == NS + "svg" and root.attrib.get("viewBox") == "0 0 768 512"
    for node in root.iter():
        tag = node.tag.removeprefix(NS)
        assert tag not in {"script", "image", "foreignObject", "text", "animate", "animateTransform"}, (path.name, tag)
        for k, v in node.attrib.items():
            assert not k.lower().startswith("on")
            assert "url(http" not in v.lower() and "data:" not in v.lower()
    return path.read_bytes()

def preview(img: Image.Image, width: int, filename: Path):
    height = round(width * img.height / img.width)
    small = img.resize((width, height), Image.Resampling.LANCZOS)
    panel = Image.new("RGB", (2 * width + 24, height + 16), "#202a27")
    left = Image.new("RGBA", (width, height), "#d8d6cc")
    right = Image.new("RGBA", (width, height), "#202a27")
    left.alpha_composite(small); right.alpha_composite(small)
    panel.paste(left.convert("RGB"), (8, 8)); panel.paste(right.convert("RGB"), (16 + width, 8))
    d = ImageDraw.Draw(panel)
    d.line((12 + width, 8, 12 + width, height + 8), fill="#6d766c", width=1)
    panel.save(filename, "PNG", optimize=True)

def export(out: Path):
    out.mkdir(parents=True, exist_ok=True)
    report = {"asset": "westhofen-v2-source", "status": "NOT_RUNTIME_APPROVED", "width": 768, "height": 512, "files": []}
    for name in NAMES:
        src = SOURCE / (name + ".svg")
        content = scan(src)
        png = cairosvg.svg2png(bytestring=content, output_width=768, output_height=512)
        image = Image.open(io.BytesIO(png)).convert("RGBA")
        assert image.size == (768,512)
        alpha = image.getchannel("A")
        assert alpha.getextrema()[0] == 0 and alpha.getextrema()[1] >= 200, (name, "not alpha")
        binary = alpha.point(lambda x: 255 if x >= 32 else 0)
        bounds = binary.getbbox()
        assert bounds is not None, (name, "empty")
        assert bounds[0] >= 8 and bounds[1] >= 8 and bounds[2] <= 760 and bounds[3] <= 504, (name, "clipped", bounds)
        output_png = out / (name + ".png")
        output_webp = out / (name + ".webp")
        image.save(output_png, "PNG", optimize=True)
        image.save(output_webp, "WEBP", quality=84, method=6)
        size = output_webp.stat().st_size
        assert size < 160_000, (name, "uncompressed mobile budget", size)
        preview(image, 64, out / (name + "-64px-light-dark.png"))
        preview(image, 128, out / (name + "-128px-light-dark.png"))
        report["files"].append({
            "name": name, "rgba": True, "png_bytes": output_png.stat().st_size,
            "webp_bytes": size, "alpha_32_bbox": bounds,
            "sha256_webp": hashlib.sha256(output_webp.read_bytes()).hexdigest()
        })
    (out / "export-report.json").write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", type=Path, default=ROOT / "build" / "westhofen-v2")
    args = parser.parse_args()
    export(args.out)
