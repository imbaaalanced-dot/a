"""Check the actual shipped V2 files, slot mapping and runtime/master cell pixels."""
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageChops

root=Path(__file__).resolve().parents[1]/'dist/assets'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def transparent_edges(im):
    a=im.getchannel('A');w,h=im.size
    for box in [(0,0,w,1),(0,h-1,w,h),(0,0,1,h),(w-1,0,w,h)]:assert a.crop(box).getextrema()==(0,0)

for folder,manifest_file,entries,runtime_name,expected_count,size in [
    ('impacts-v2','manifest.json','frames','runtime.webp',30,(768,640)),
    ('items','equipment-v2-manifest.json','icons','equipment-v2.webp',8,(512,256))]:
    base=root/folder;m=json.loads((base/manifest_file).read_text());assert len(m[entries])==expected_count
    runtime=Image.open(base/runtime_name).convert('RGBA');assert runtime.size==size
    assert sha(base/runtime_name)==m['runtime_sha256']
    assert (base/runtime_name).stat().st_size<500_000
    for e in m[entries]:
        master=Image.open(base/e['master_path']).convert('RGBA');assert master.size==(256,256)
        assert sha(base/e['master_path'])==e['sha256'];transparent_edges(master)
        x,y,w,h=e['runtime_rect'];cell=runtime.crop((x,y,x+w,y+h));transparent_edges(cell)
        expected=master.resize((128,128),Image.Resampling.LANCZOS)
        # Compare visible composited pixels; zero-alpha RGB is deliberately canonicalized.
        for color in [(20,25,25,255),(240,240,240,255)]:
            left=Image.new('RGBA',(128,128),color);left.alpha_composite(cell)
            right=Image.new('RGBA',(128,128),color);right.alpha_composite(expected)
            assert ImageChops.difference(left.convert('RGB'),right.convert('RGB')).getbbox() is None,e
    print(folder,expected_count,'RGBA masters, clear boundaries, hashes and lossless runtime cells passed')

icons=json.loads((root/'items/equipment-v2-manifest.json').read_text())['icons']
assert [i['slot'] for i in icons]==['weapon','head','armor','gloves','boots','amulet','ring1','ring2']
