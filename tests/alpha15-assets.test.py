from pathlib import Path
import json
import re
from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / 'dist' / 'alpha1-5'
assets = ROOT / 'assets'
webps = sorted(assets.glob('*.webp'))
assert len(webps) == 59, f'expected 59 WebP files, found {len(webps)}'
manifest_text = (ROOT / 'asset-manifest.js').read_text()
manifest = dict(re.findall(r'"([^"]+)":"([^"]+)"', manifest_text))
assert len(manifest) == 59, f'manifest should contain all 59 images, found {len(manifest)}'
assert len(set(manifest.values())) == 59, 'manifest paths must be unique'
assert all((ROOT / path).is_file() for path in manifest.values()), 'manifest points to a missing file'
for p in webps:
    with Image.open(p) as image:
        assert image.format == 'WEBP', p.name
        assert image.mode == 'RGBA', f'{p.name} needs an alpha channel'
        alpha = image.getchannel('A')
        assert alpha.getbbox(), f'{p.name} is fully transparent'

sprites = (ROOT / 'sprites.js').read_text()
for key, x, y, width, height in re.findall(r'(effect_[a-z]+):\[(\d+),(\d+),(\d+),(\d+)\]', sprites):
    with Image.open(assets / f'{key}.webp') as image:
        assert int(x) + int(width) <= image.width, f'{key} crop exceeds image width'
        assert int(y) + int(height) <= image.height, f'{key} crop exceeds image height'
assert len(re.findall(r'effect_[a-z]+:\[', sprites)) == 6, 'all six effect sprites should have explicit crops'

config = (ROOT / 'config.js').read_text()
upgrade_section = config.split('export const UPGRADES = {', 1)[1].split('\n};', 1)[0]
upgrades = re.findall(r'^\s*([a-z]+):\{name:', upgrade_section, re.M)
for upgrade in upgrades:
    for level in (1, 2, 3):
        assert f'"weapon_{upgrade}_{level}"' in manifest_text, f'missing {upgrade} stage {level}'

for file in ('ui-stone.svg', 'ui-bronze.svg'):
    assert (assets / file).is_file(), f'missing generated interface texture {file}'
    assert '<svg' in (assets / file).read_text()
css = (ROOT / 'styles.css').read_text()
assert 'assets/ui-stone.svg' in css and 'assets/ui-bronze.svg' in css
assert 'assets/research_shrine.webp' in css
print('Alpha 1.5 asset checks passed: 59 RGBA WebPs, manifest paths, five upgrade families, and effects/UI textures.')
