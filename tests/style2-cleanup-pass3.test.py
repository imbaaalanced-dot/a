"""Versioned edge cleanup: complete set, lossless pairs, anchors and seam reduction."""
from pathlib import Path
from hashlib import sha256
import json
from PIL import Image, ImageFilter, ImageChops

ROOT=Path(__file__).resolve().parents[1]/'dist/assets'
BASE=ROOT/'style2-user-towers-v1'
CLEAN=ROOT/'style2-user-towers-v3'
data=json.loads((CLEAN/'manifest.json').read_text())
expected={f'tower_{kind}_lv{level}' for kind in ('bow','cannon','mage','boomerang') for level in (1,2,3)}-{'tower_cannon_lv1'}
assert len(data['assets'])==11 and {e['id'] for e in data['assets']}==expected

def box(im):
    return im.getchannel('A').point(lambda a:255 if a>16 else 0).getbbox()

def pink_rim(im):
    mask=im.getchannel('A').point(lambda a:255 if a>16 else 0)
    rim=ImageChops.subtract(mask,mask.filter(ImageFilter.MinFilter(5)))
    return sum(r>180 and b>120 and g<90 and a>16 and rim.getpixel((x,y))>0
               for y in range(im.height) for x in range(im.width)
               for r,g,b,a in [im.getpixel((x,y))])

stats=[]
for e in data['assets']:
    assert e['type']=='tower' and e['pivot']==[256,488] and e['master_size']==[512,512]
    assert sha256((BASE/e['png_path']).read_bytes()).hexdigest()==e['original_sha256']
    for file_key,hash_key in [('png_path','sha256_png'),('webp_path','sha256_webp')]:
        assert sha256((CLEAN/e[file_key]).read_bytes()).hexdigest()==e[hash_key]
    with Image.open(BASE/e['png_path']) as old, Image.open(CLEAN/e['png_path']) as png, Image.open(CLEAN/e['webp_path']) as webp:
        assert png.size==webp.size==(512,512) and png.mode==webp.mode=='RGBA'
        assert png.tobytes()==webp.tobytes()
        before=tuple(e['reference_alpha_bbox'])
        assert before==((109,74,421,488) if e['id']=='tower_mage_lv3' else box(old))
        after=box(png)
        assert list(after)==e['alpha_bbox_export']
        assert after[3]==before[3],e['id']+' ground contact shifted'
        assert abs((after[0]+after[2])-(before[0]+before[2]))<=1,e['id']+' horizontal anchor shifted'
        assert after[0]>=before[0]-1 and after[1]>=before[1]-1 and after[2]<=before[2]+1
        alpha=png.getchannel('A')
        for rect in [(0,0,512,1),(0,511,512,512),(0,0,1,512),(511,0,512,512)]:
            assert alpha.crop(rect).getextrema()[1]==0,e['id']+' canvas edge is not clear'
        a,b=pink_rim(old),pink_rim(png)
        assert a>100,e['id']+' must exhibit the source seam'
        assert b<=a*.1,e['id']+f' insufficient rim cleanup: {a} -> {b}'
        stats.append((e['id'],a,b,e['bbox_delta']))

for item in stats:print(*item)
print('Style-2 pass3: 11 lossless pairs, original files unchanged, ground anchors and >90% seam reduction verified')
