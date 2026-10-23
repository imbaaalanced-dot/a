"""Deterministic slicing/normalization only; never paints, recolors or invents pixels.

Usage: python tools/export-v2-impacts-icons.py IMPACT_SOURCE ICON_SOURCE
The generated sheets have irregular source spacing, so audited rectangles replace
an unsafe equal-grid crop. Source opacity >64 must never touch a crop boundary.
"""
import hashlib
import io
import json
import os
from pathlib import Path
import sys
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
impact_source, icon_source = map(Path, sys.argv[1:3])
impact = Image.open(impact_source).convert('RGBA')
icons = Image.open(icon_source).convert('RGBA')
assert impact.size == (1374, 1145) and icons.size == (1774, 887)
out = ROOT / 'dist/assets/impacts-v2'
out.mkdir(parents=True, exist_ok=True)
(out / 'frames').mkdir(exist_ok=True)
items = ROOT / 'dist/assets/items'
(items / 'v2-masters').mkdir(exist_ok=True)

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def edge_max(image):
    a = image.getchannel('A')
    w, h = image.size
    return max(a.crop(box).getextrema()[1] for box in [(0,0,w,1),(0,h-1,w,h),(0,0,1,h),(w-1,0,w,h)])

def safe_crop(source, box):
    crop = source.crop(box)
    assert edge_max(crop) <= 64, ('visible source clipped', box, edge_max(crop))
    return crop

def save_image(image,path,format,**options):
    data=io.BytesIO();image.save(data,format=format,**options)
    payload=data.getvalue();assert len(payload)>100
    temporary=path.with_name(path.name+'.tmp')
    with temporary.open('wb') as stream:
        stream.write(payload);stream.flush();os.fsync(stream.fileno())
    os.replace(temporary,path)

def runtime_webp(image, size, path):
    image=image.resize(size,Image.Resampling.LANCZOS)
    # Canonical invisible RGB avoids diagnostic-viewer matte artifacts; visible pixels stay intact.
    image.paste((0,0,0,0),mask=image.getchannel('A').point(lambda a:255 if a==0 else 0))
    save_image(image,path,'WEBP',lossless=True,exact=True,method=6)

# Each row is one six-frame effect, not three separately painted upgrade sets.
xs = [0,229,458,716,940,1168,1374]
ys = [0,270,502,735,931,1145]
anchors_x = [126,350,584,824,1052,1267]
anchors_y = [218,444,674,876,1066]
kinds = ['bow','cannon','mage','rift','boomerang']
atlas = Image.new('RGBA', (1536,1280))
manifest = {'version':2,'source_sha256':digest(impact_source),'source_size':list(impact.size),
    'master_cell':[256,256],'runtime_cell':[128,128],'columns':6,'rows':kinds,
    'pivot_master':[128,174],'pivot_runtime':[64,87],
    'normalization':'uniform 0.72 scale, manually audited source impact centers; no recoloring',
    'crop_limit':'source edge opacity <=64; faint boundary haze can be cropped',
    'tier_policy':'cannon and boomerang atlas rows apply only to tier 3; lower tiers retain existing effects',
    'runtime':'runtime.webp','frames':[]}
for row, kind in enumerate(kinds):
    for column in range(6):
        box = [xs[column],ys[row],xs[column+1],ys[row+1]]
        crop = safe_crop(impact, box)
        scaled = crop.resize((round(crop.width*.72),round(crop.height*.72)), Image.Resampling.LANCZOS)
        pivot = [anchors_x[column],anchors_y[row]]
        xy = [round(128-(pivot[0]-box[0])*.72),round(174-(pivot[1]-box[1])*.72)]
        assert xy[0]>=0 and xy[1]>=0 and xy[0]+scaled.width<=256 and xy[1]+scaled.height<=256
        frame = Image.new('RGBA',(256,256));frame.alpha_composite(scaled,xy)
        assert edge_max(frame)==0
        path = out/'frames'/f'impact_{kind}_{column:02}.png';save_image(frame,path,'PNG')
        atlas.alpha_composite(frame,(column*256,row*256))
        manifest['frames'].append({'kind':kind,'frame':column,'source_rect':box,'source_pivot':pivot,
            'master_path':str(path.relative_to(out)),'sha256':digest(path),
            'runtime_rect':[column*128,row*128,128,128]})
runtime_webp(atlas,(768,640),out/'runtime.webp')
manifest['runtime_sha256']=digest(out/'runtime.webp')
(out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')

rects = [(0,0,486,456),(485,0,893,480),(893,0,1345,500),(1345,0,1774,480),
         (0,456,480,887),(480,478,887,887),(887,500,1345,887),(1345,500,1774,887)]
slots = ['weapon','head','armor','gloves','boots','amulet','ring1','ring2']
item_atlas = Image.new('RGBA',(1024,512))
item_manifest={'version':2,'source_sha256':digest(icon_source),'source_size':list(icons.size),
    'runtime':'equipment-v2.webp','runtime_cell':[128,128],'columns':4,'rows':2,
    'scope':'eight slot-category icons; unique template art and old Kirchende power icons remain separate','icons':[]}
for i,(slot,box) in enumerate(zip(slots,rects)):
    crop=safe_crop(icons,box);bbox=crop.getchannel('A').getbbox();crop=crop.crop(bbox)
    crop.thumbnail((204,204),Image.Resampling.LANCZOS)
    master=Image.new('RGBA',(256,256));master.alpha_composite(crop,((256-crop.width)//2,(256-crop.height)//2))
    path=items/'v2-masters'/f'icon_{slot}.png';save_image(master,path,'PNG')
    assert edge_max(master)==0
    item_atlas.alpha_composite(master,((i%4)*256,(i//4)*256))
    item_manifest['icons'].append({'slot':slot,'source_rect':list(box),'master_path':str(path.relative_to(items)),
        'sha256':digest(path),'runtime_rect':[(i%4)*128,(i//4)*128,128,128]})
runtime_webp(item_atlas,(512,256),items/'equipment-v2.webp')
item_manifest['runtime_sha256']=digest(items/'equipment-v2.webp')
(items/'equipment-v2-manifest.json').write_text(json.dumps(item_manifest,indent=2)+'\n')
print('Exported 30 centered impact PNGs, 8 icon PNGs, 2 lossless WebP runtime atlases and manifests')
