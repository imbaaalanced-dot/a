"""Normalize approved flight cutouts into padded square runtime textures."""
import sys, json, hashlib
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1]
types=['shadowwing','gargoyle','stormwing']
if len(sys.argv)!=4: raise SystemExit('Usage: prepare-flight-sprites.py shadowwing.png gargoyle.png stormwing.png')
records={}
for kind,source in zip(types,sys.argv[1:]):
    source=Path(source); im=Image.open(source).convert('RGBA')
    alpha=im.getchannel('A'); box=alpha.point(lambda p:255 if p>=16 else 0).getbbox()
    if not box: raise ValueError('Empty cutout: '+kind)
    im=im.crop(box); im.thumbnail((480,480),Image.Resampling.LANCZOS)
    out=Image.new('RGBA',(512,512));out.alpha_composite(im,((512-im.width)//2,(512-im.height)//2))
    dest=root/'dist/assets/elemental'/f'{kind}-v1.webp';out.save(dest,'WEBP',quality=88,method=6)
    records[kind]={'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'crop':box,'size':[512,512],'asset':dest.name}
(root/'dist/assets/elemental/flight-manifest.json').write_text(json.dumps(records,indent=2)+'\n')
