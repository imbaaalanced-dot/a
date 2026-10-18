"""Rebuild boomerang/enemy fixed-cell atlases from manifest-tracked imagegen sources.
Usage: python tools/prepare-physical-followup.py /path/to/generated_images
"""
from pathlib import Path
from PIL import Image
import json,sys,hashlib
src=Path(sys.argv[1]);out=Path(__file__).resolve().parents[1]/'dist/assets/elemental'
m=json.loads((out/'manifest.json').read_text())
for kind in ['boomerang','enemies']:
    spec=m[kind];name,digest=next(iter(spec['sources'].items()));raw=src/name
    assert hashlib.sha256(raw.read_bytes()).hexdigest()==digest,'source hash mismatch'
    im=Image.open(raw).convert('RGBA');cell=256 if kind=='enemies' else 512
    atlas=Image.new('RGBA',(1024,768) if kind=='enemies' else (1536,512))
    boxes=spec.get('sourceBoxes') or [(round(i*im.width/3),0,round((i+1)*im.width/3),im.height) for i in range(3)]
    for i,box in enumerate(boxes):
        c=im.crop(box);c=c.crop(c.getbbox());c.thumbnail((224,224) if kind=='enemies' else (400,440),Image.Resampling.LANCZOS)
        cols=4 if kind=='enemies' else 3
        atlas.alpha_composite(c,((i%cols)*cell+(cell-c.width)//2,(i//cols)*cell+(240 if kind=='enemies' else 480)-c.height))
    atlas.save(out/('enemies-v1.webp' if kind=='enemies' else 'boomerang-towers-v1.webp'),lossless=True)
