"""Lossless cleanup exports retain source footprint and remove the known artifacts."""
from pathlib import Path
from hashlib import sha256
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]/'dist/assets'
BASE = ROOT/'style2-user-towers-v1'
CLEAN = ROOT/'style2-user-towers-v2'
manifest = json.loads((CLEAN/'manifest.json').read_text())
assert {e['id'] for e in manifest['assets']} == {'tower_cannon_lv1', 'projectile_mage_lv2'}

def bounds(image):
    return image.getchannel('A').point(lambda a: 255 if a > 16 else 0).getbbox()

for entry in manifest['assets']:
    old_path = BASE/entry['png_path']
    assert sha256(old_path.read_bytes()).hexdigest() == entry['original_sha256']
    with Image.open(old_path) as old, Image.open(CLEAN/entry['png_path']) as png, Image.open(CLEAN/entry['webp_path']) as webp:
        size = (512, 512) if entry['type'] == 'tower' else (256, 256)
        assert png.size == webp.size == size
        assert png.mode == webp.mode == 'RGBA'
        assert png.tobytes() == webp.tobytes()
        box = bounds(png)
        assert list(box) == entry['alpha_bbox_export']
        assert all(abs(a-b) <= 1 for a,b in zip(bounds(old), box)), entry['id']
        assert entry['pivot'] == ([256, 488] if entry['type'] == 'tower' else [128, 128])
        alpha = png.getchannel('A')
        for region in ((0,0,size[0],1),(0,size[1]-1,size[0],size[1]),(0,0,1,size[1]),(size[0]-1,0,size[0],size[1])):
            assert alpha.crop(region).getextrema()[1] == 0
        if entry['type'] == 'tower':
            hot_pink = lambda im: sum(r > 180 and b > 120 and g < 90 and a > 16 for r,g,b,a in (im.getpixel((x,y)) for y in range(im.height) for x in range(im.width)))
            assert hot_pink(old) > 100, 'fixture must contain the original magenta seam'
            assert hot_pink(png) == 0, 'cleanup must remove hot-pink edge contamination'
        else:
            rogue_region = (185,145,202,188)
            assert old.getchannel('A').crop(rogue_region).getextrema()[1] > 0
            assert alpha.crop(rogue_region).getextrema()[1] == 0, 'detached source fragment remains'
    for file_key, hash_key in [('png_path','sha256_png'),('webp_path','sha256_webp')]:
        assert sha256((CLEAN/entry[file_key]).read_bytes()).hexdigest() == entry[hash_key]

print('Style-2 cleanup: 2 lossless pairs, stable footprint/pivots, magenta seam and detached fragment removed')
