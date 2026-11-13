#!/usr/bin/env python3
"""Render V2 vs V3 Westhofen bronze pilot, never touching live dist/.

Only a technical/visual *review pack*, never an automatic history approval.
"""
import argparse
import base64
import io
import json
import os
from pathlib import Path

import cairosvg
from PIL import Image, ImageDraw

ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/"docs/graphics"
CASES={
    "emblem_v2":SRC/"westhofen-v2/westhofen-emblem-v2.svg",
    "emblem_v3":SRC/"westhofen-v3/westhofen-emblem-v3.svg",
    "composite_v2":SRC/"westhofen-v2/westhofen-composite-v2.svg",
    "composite_v3":SRC/"westhofen-v3/westhofen-composite-v3-candidate.svg",
}

def render(path):
    data=cairosvg.svg2png(bytestring=path.read_bytes(),output_width=768,output_height=512)
    img=Image.open(io.BytesIO(data)).convert("RGBA")
    assert img.size==(768,512),path
    alpha=img.getchannel("A")
    assert alpha.getextrema()[0]==0 and alpha.getextrema()[1]>=200,path
    bbox=alpha.point(lambda v:255 if v>=32 else 0).getbbox()
    assert bbox and bbox[0]>=8 and bbox[1]>=8 and bbox[2]<=760 and bbox[3]<=504,(path,bbox)
    return img,bbox

def backdrop(img,w,bg):
    small=img.resize((w,round(w*img.height/img.width)),Image.Resampling.LANCZOS)
    panel=Image.new("RGBA",small.size,bg)
    panel.alpha_composite(small)
    return panel.convert("RGB")

def panels(imgs,out):
    full=Image.new("RGB",(1480,1110),"#17201d")
    drawer=ImageDraw.Draw(full)
    for row,kind in enumerate(("emblem","composite")):
        for col,version in enumerate(("v2","v3")):
            x,y=25+col*745,52+row*545
            drawer.text((x,y-29),f"Westhofen {kind} {version.upper()}   |   768 x 512 source, dark background",fill="#e4dbbd")
            p=backdrop(imgs[f"{kind}_{version}"],680,"#29352f")
            full.paste(p,(x,y))
    full.save(out/"westhofen-v3-bronze-detailed-compare.jpg",quality=77,optimize=True)

    pixels=Image.new("RGB",(1360,1460),"#16211d")
    d=ImageDraw.Draw(pixels)
    for row,(kind,w,background) in enumerate([
        ("emblem",128,"#dbd8ce"),("emblem",64,"#202a27"),
        ("composite",128,"#dbd8ce"),("composite",64,"#202a27"),
    ]):
        for col,version in enumerate(("v2","v3")):
            x,y=24+col*675,(48,414,745,1111)[row]
            key=f"{kind}_{version}"
            d.text((x,y-26),f"{key} - {w}px displayed on {'light' if row%2==0 else 'dark'}",fill="#e5d9ba")
            p=backdrop(imgs[key],w,background)
            scale=4 if w==128 else 7
            scaled=p.resize((p.width*scale,p.height*scale),Image.Resampling.NEAREST)
            pixels.paste(scaled,(x,y))
    pixels.save(out/"westhofen-v3-bronze-pixel-64-128-compare.jpg",quality=78,optimize=True)

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--out",type=Path,required=True)
    args=parser.parse_args()
    out=args.out;out.mkdir(parents=True,exist_ok=True)
    imgs={}
    report={"source_only":True,"runtime_activated":False,"historical_photo_approved":False,"android_4gb_tested":False,"files":[]}
    for key,path in CASES.items():
        im,bbox=render(path)
        im.save(out/(key+".png"),"PNG",optimize=True)
        visible64=im.resize((64,43),Image.Resampling.LANCZOS).getchannel("A").point(lambda x:255 if x>=32 else 0).getbbox()
        assert visible64,("empty at 64px",key)
        report["files"].append({"name":key,"rgba":True,"alpha_bbox_32":bbox,"alpha_bbox_64px":visible64,"png_bytes":(out/(key+".png")).stat().st_size})
        imgs[key]=im
    panels(imgs,out)
    (out/"report.json").write_text(json.dumps(report,indent=2)+"\n")
    print(json.dumps(report,indent=2))
    if os.environ.get("TD2_QA_LOG_IMAGE")=="1":
        for name in ("westhofen-v3-bronze-detailed-compare.jpg","westhofen-v3-bronze-pixel-64-128-compare.jpg"):
            raw=(out/name).read_bytes()
            assert len(raw)<350000,(name,len(raw))
            print("QA_IMAGE_"+name.removesuffix(".jpg").replace("-","_")+"="+base64.b64encode(raw).decode("ascii"))
if __name__=="__main__":main()
