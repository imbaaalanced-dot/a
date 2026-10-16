"""Slice imagegen reference sheets into fixed RGBA atlases; preserve original alpha.
Usage: python tools/prepare-elemental-sprites.py /path/to/generated_images
Raw generated sheets are retained separately. Never overwrite existing live assets.
"""
from PIL import Image
from pathlib import Path
import sys,json,hashlib
src=Path(sys.argv[1]);out=Path('dist/assets/elemental');out.mkdir(parents=True,exist_ok=True)
files={
'rift':('exec-c63a5633-f0e6-44a6-88b9-aa00972bbc2a.png',[0,560,1160,1881],'exec-05ad9f1b-697d-4e8e-9827-6addbd4759ab.png','exec-9fa23d09-81fd-49c5-a202-9576a0e0c5dc.png'),
'mage':('exec-b196a728-0fb2-4d02-8a23-1734c72f895d.png',[0,660,1290,1983],'exec-a2237fd0-8d15-461a-80a0-9636135a475e.png','exec-5102959c-ab02-4a16-a7ae-b43becbe7b75.png')}
manifest={}
def fit(cell,size,limit,anchor=None):
    bbox=cell.getbbox()
    if not bbox:return Image.new('RGBA',(size,size))
    cut=cell.crop(bbox);cut.thumbnail(limit,Image.Resampling.LANCZOS)
    dst=Image.new('RGBA',(size,size));pos=((size-cut.width)//2,size-cut.height-32) if anchor else ((size-cut.width)//2,(size-cut.height)//2)
    dst.alpha_composite(cut,pos);return dst
for kind,(tower,bounds,projectile,impact) in files.items():
    im=Image.open(src/tower).convert('RGBA');atlas=Image.new('RGBA',(1536,512))
    for i in range(3):atlas.alpha_composite(fit(im.crop((bounds[i],0,bounds[i+1],im.height)),512,(400,440),True),(i*512,0))
    atlas.save(out/f'{kind}-towers-v1.webp',lossless=True)
    im=Image.open(src/projectile).convert('RGBA');atlas=Image.new('RGBA',(384,128))
    projectile_bounds=[0,550,1240,im.width] if kind=='mage' else [round(i*im.width/3) for i in range(4)]
    for i in range(3):
        cell=im.crop((projectile_bounds[i],0,projectile_bounds[i+1],im.height))
        atlas.alpha_composite(fit(cell,128,(104,90)),(i*128,0))
    atlas.save(out/f'{kind}-projectiles-v1.webp',lossless=True)
    im=Image.open(src/impact).convert('RGBA');atlas=Image.new('RGBA',(768,384))
    for row in range(3):
        cells=[im.crop((round(col*im.width/6),round(row*im.height/3),round((col+1)*im.width/6),round((row+1)*im.height/3))) for col in range(6)]
        # Same scale for all six frames in a row, preserving the burst/decay progression.
        boxes=[c.getbbox() for c in cells];maxdim=max(max(b[2]-b[0],b[3]-b[1]) for b in boxes if b)
        scale=96/maxdim
        for col,(cell,b) in enumerate(zip(cells,boxes)):
            if not b:continue
            cut=cell.crop(b);cut=cut.resize((max(1,round(cut.width*scale)),max(1,round(cut.height*scale))),Image.Resampling.LANCZOS)
            atlas.alpha_composite(cut,(col*128+(128-cut.width)//2,row*128+(128-cut.height)//2))
    atlas.save(out/f'{kind}-impacts-v1.webp',lossless=True)
    manifest[kind]={'sources':{f:hashlib.sha256((src/f).read_bytes()).hexdigest() for f in [tower,projectile,impact]},'towerCell':512,'projectileCell':128,'impactCell':128,'impactFrames':6,'tiers':3}
(out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
for p in out.glob('*.webp'):print(p.name,p.stat().st_size)
