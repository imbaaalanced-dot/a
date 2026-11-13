#!/usr/bin/env python3
"""Review-only V3 source export and V2-versus-V3 pixel-scale QA. Never writes dist/."""
from pathlib import Path
import argparse
import base64
import importlib.util
import io

from PIL import Image, ImageDraw
import cairosvg

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("westhofen_export_v2", ROOT / "tools/export-westhofen-v2.py")
base = importlib.util.module_from_spec(spec)
spec.loader.exec_module(base)
base.SOURCE = ROOT / "docs/graphics/westhofen-v3"
base.NAMES = ("westhofen-emblem-v3", "westhofen-composite-v3")

def img(source):
    png = cairosvg.svg2png(url=str(source), output_width=768, output_height=512)
    return Image.open(io.BytesIO(png)).convert("RGBA")

def review(out):
    # Compare unchanged V2 against isolated bronze V3 at native small sizes.
    left = img(ROOT / "docs/graphics/westhofen-v2/westhofen-composite-v2.svg")
    right = img(ROOT / "docs/graphics/westhofen-v3/westhofen-composite-v3.svg")
    # Real 64px and 128px signal; nearest-neighbor enlargement intentionally shows readability.
    panel = Image.new("RGB", (1120, 750), "#1a2320")
    d = ImageDraw.Draw(panel)
    d.text((18, 18), "WESTHOFEN V2 vs V3 BRONZE - REVIEW ONLY / NOT APPROVED", fill="#eee2bf")
    for col,(name,source) in enumerate((("V2 CURRENT",left),("V3 BRONZE CANDIDATE",right))):
        x=20+col*550
        d.text((x,52),name,fill="#eee0ba")
        at128=source.resize((128,85),Image.Resampling.LANCZOS)
        for row,bg in enumerate(("#d8d6cc","#202a27")):
            c=Image.new("RGBA",(128,85),bg)
            c.alpha_composite(at128)
            panel.paste(c.convert("RGB").resize((480,319),Image.Resampling.NEAREST),(x,82+row*323))
        d.text((x,724),"128px source raster, shown 3.75x; top light / bottom dark",fill="#c6cfbe")
    f=out/"westhofen-v2-v3-bronze-review.jpg"
    panel.save(f,"JPEG",quality=78,optimize=True)
    print("REVIEW_IMAGE_BASE64="+base64.b64encode(f.read_bytes()).decode("ascii"))
    print("REVIEW_IMAGE_BYTES="+str(f.stat().st_size))
    small = Image.new("RGB", (920, 400), "#1a2320")
    sd = ImageDraw.Draw(small)
    sd.text((16, 14), "64PX ACTUAL RASTER / NEAREST-NEIGHBOR ZOOM", fill="#eee2bf")
    for col,(label,source) in enumerate((("V2 ORIGINAL",left),("V3 BRONZE",right))):
        x = 16 + 460*col
        sd.text((x, 46), label, fill="#eee2bf")
        sprite = source.resize((64,43), Image.Resampling.LANCZOS)
        for row,bg in enumerate(("#d8d6cc", "#202a27")):
            baseimg = Image.new("RGBA",(64,43),bg)
            baseimg.alpha_composite(sprite)
            small.paste(baseimg.convert("RGB").resize((448,150),Image.Resampling.NEAREST),(x,66+row*160))
    sf=out/"westhofen-v2-v3-64px-review.jpg"
    small.save(sf,"JPEG",quality=80,optimize=True)
    print("REVIEW_64_BASE64="+base64.b64encode(sf.read_bytes()).decode("ascii"))
    for name,source in (("v2",left),("v3",right)):
        for width in (64,128):
            p=out/f"westhofen-{name}-{width}-dark-light.png"
            base.preview(source,width,p)

if __name__ == "__main__":
    ap=argparse.ArgumentParser()
    ap.add_argument("--out",type=Path,default=ROOT/"build/westhofen-v3")
    args=ap.parse_args()
    base.export(args.out)
    review(args.out)
