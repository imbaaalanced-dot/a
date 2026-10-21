"""TD2 user-approved Style-2 sprites: real files, hashes, alpha and runtime pixels.

Run: python tests/alpha9-user-towers.test.py
Requires Pillow, already used by alpha9-assets.test.py.
"""
from pathlib import Path
from hashlib import sha256
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / 'dist/assets/style2-user-towers-v1'
MANIFEST = ROOT / 'manifest.json'
assert MANIFEST.is_file(), 'User tower manifest is missing'
data = json.loads(MANIFEST.read_text(encoding='utf-8'))
assets = data['assets']
assert len(assets) == 30, len(assets)
assert data['columns'] == ['bow', 'cannon', 'mage', 'rift', 'boomerang']
expected = {(role, kind, level) for role in ('tower', 'projectile') for kind in data['columns'] for level in (1, 2, 3)}
actual = {(e['type'], e['kind'], e['level']) for e in assets}
assert actual == expected, (expected - actual, actual - expected)

for e in assets:
    size = (512, 512) if e['type'] == 'tower' else (256, 256)
    pivot = [256, 488] if e['type'] == 'tower' else [128, 128]
    assert e['master_size'] == list(size), e['id']
    assert e['pivot'] == pivot, e['id']
    for key, digest in (('png_path', 'sha256_png'), ('webp_path', 'sha256_webp')):
        f = ROOT / e[key]
        assert f.is_file(), f
        assert sha256(f.read_bytes()).hexdigest() == e[digest], f
    with Image.open(ROOT / e['png_path']) as png, Image.open(ROOT / e['webp_path']) as webp:
        assert png.size == webp.size == size, e['id']
        assert png.mode == webp.mode == 'RGBA', e['id']
        assert png.tobytes() == webp.tobytes(), e['id']
        alpha = png.getchannel('A')
        assert alpha.getbbox(), e['id']
        # A 1px empty perimeter prevents obvious clipping at sprite edges.
        assert alpha.crop((0, 0, size[0], 1)).getextrema()[1] <= 16, e['id']
        assert alpha.crop((0, size[1]-1, size[0], size[1])).getextrema()[1] <= 16, e['id']
        assert alpha.crop((0, 0, 1, size[1])).getextrema()[1] <= 16, e['id']
        assert alpha.crop((size[0]-1, 0, size[0], size[1])).getextrema()[1] <= 16, e['id']
print('TD2 user towers: 30 PNG/WebP pairs, 60 SHA256, size, pivot and alpha checks passed')