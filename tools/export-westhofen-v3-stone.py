#!/usr/bin/env python3
"""V3 stone/altar source preview. No changes to dist/; 64/128px, light/dark comparison."""
from pathlib import Path
import io, json, argparse, base64, importlib.util
from PIL import Image, ImageDraw
import cairosvg
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/"docs/graphics/westhofen-v3-stone"
spec=importlib.util.spec_from_file_location("westhofen_export_v2",ROOT/"tools/export-westhofen-v2.py")
base=importlib.util.module_from_spec(spec)
spec.loader.exec_module(base)
base.SOURCE=SRC
base.NAMES=("westhofen-composite-v3-stone",)
def raster(path):
    png=cairosvg.svg2png(url=str(path),output_width=768,output_height=512)
    return Image.open(io.BytesIO(png)).convert("RGBA")
def run(out):
    base.export(out)
    old=raster(ROOT/"docs/graphics/westhofen-v2/westhofen-composite-v2.svg")
    fresh=raster(SRC/"westhofen-composite-v3-stone.svg")
    panel=Image.new("RGB",(1100,740),"#19221e")
    d=ImageDraw.Draw(panel)
    d.text((20,16),"WESTHOFEN V2 vs V3 BRONZE + STONE / SOURCE REVIEW ONLY",fill="#eee1ba")
    for col,(label,im) in enumerate((("V2 CURRENT",old),("V3 STONE + BRONZE CANDIDATE",fresh))):
        x=20+540*col
        d.text((x,52),label,fill="#e4d9bb")
        at128=im.resize((128,85),Image.Resampling.LANCZOS)
        for row,color in enumerate(("#d8d6cc","#202a27")):
            preview=Image.new("RGBA",(128,85),color)
            preview.alpha_composite(at128)
            panel.paste(preview.convert("RGB").resize((480,319),Image.Resampling.NEAREST),(x,82+row*322))
    montage=out/"westhofen-v2-v3-stone-128px.jpg"
    panel.save(montage,"JPEG",quality=77,optimize=True)
    print("REVIEW_IMAGE_BASE64="+base64.b64encode(montage.read_bytes()).decode("ascii"))
    strip=Image.new("RGB",(940,365),"#19221e"); q=ImageDraw.Draw(strip)
    q.text((14,14),"ACTUAL 64px SCALE / LIGHT AND DARK",fill="#eee1ba")
    for col,(name,im) in enumerate((("V2",old),("V3",fresh))):
        x=14+465*col
        q.text((x,41),name,fill="#e1d6bd")
        sprite=im.resize((64,43),Image.Resampling.LANCZOS)
        for row,color in enumerate(("#d8d6cc","#202a27")):
            canvas=Image.new("RGBA",(64,43),color)
            canvas.alpha_composite(sprite)
            strip.paste(canvas.convert("RGB").resize((448,140),Image.Resampling.NEAREST),(x,63+row*145))
    p=out/"westhofen-v2-v3-stone-64px.jpg"
    strip.save(p,"JPEG",quality=76,optimize=True)
    print("REVIEW_64_BASE64="+base64.b64encode(p.read_bytes()).decode("ascii"))
    # independent overlay PNGs only for inspection, not used in runtime
    for part in ("stone-weathering-v3","altar-weathering-v3"):
        im=raster(SRC/(part+".svg"))
        im.save(out/(part+".png"),"PNG",optimize=True)
        print(part,"isolated transparent PNG generated")

if __name__=="__main__":
    ap=argparse.ArgumentParser()
    ap.add_argument("--out",type=Path,default=ROOT/"build/westhofen-v3-stone")
    args=ap.parse_args()
    run(args.out)
