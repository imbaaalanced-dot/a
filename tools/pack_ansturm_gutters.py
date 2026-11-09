"""Package a transparent replacement PNG at a legacy Ansturm WebP cell size.

Usage: python tools/pack_ansturm_gutters.py generated.png enemy_gargoyle.webp
No image synthesis here: only center, scale down to safe gutters and encode.
Copies identical bytes to the main and standalone Ansturm directories.
"""
from pathlib import Path
from PIL import Image,ImageOps
import sys

ROOT=Path(__file__).resolve().parent.parent
if len(sys.argv)!=3:
    raise SystemExit('Usage: pack_ansturm_gutters.py artwork.png existing_name.webp')
source=Path(sys.argv[1]);name=Path(sys.argv[2]).name
target=ROOT/'dist/ansturm/assets'/name
if not target.exists() or not source.is_file():
    raise SystemExit('Both the source PNG and existing target asset must exist')
with Image.open(target) as previous:
    cell=previous.size
with Image.open(source) as original:
    image=Image.new('RGBA',cell,(0,0,0,0))
    fitted=ImageOps.contain(original.convert('RGBA'),(int(cell[0]*.88),int(cell[1]*.88)),Image.Resampling.LANCZOS)
    image.alpha_composite(fitted,((cell[0]-fitted.width)//2,(cell[1]-fitted.height)//2))
    for destination in [target,ROOT/'ansturm-alpha1-5/assets'/name]:
        image.save(destination,'WEBP',lossless=True,method=6)
        print(destination.relative_to(ROOT),destination.stat().st_size)
