from pathlib import Path
import re
from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / 'dist' / 'alpha1-5'
assets = ROOT / 'assets'
webps = sorted(assets.glob('*.webp'))
assert len(webps) == 60, f'expected 59 game WebPs plus ui-slate.webp, found {len(webps)}'
manifest_text = (ROOT / 'asset-manifest.js').read_text()
manifest = dict(re.findall(r'"([^"]+)":"([^"]+)"', manifest_text))
assert len(manifest) == 59, f'manifest should contain 59 game images, found {len(manifest)}'
assert len(set(manifest.values())) == 59, 'manifest paths must be unique'
assert all((ROOT / path).is_file() for path in manifest.values()), 'manifest points to a missing file'
assert 'ui-slate.webp' not in manifest_text, 'CSS texture should stay outside the sprite cache'
for p in webps:
    with Image.open(p) as image:
        assert image.format == 'WEBP', p.name
        expected_mode = 'RGB' if p.name == 'ui-slate.webp' else 'RGBA'
        assert image.mode == expected_mode, f'{p.name} should use {expected_mode}'
        assert image.getchannel('A').getbbox() if image.mode == 'RGBA' else image.getbbox(), f'{p.name} is empty'
config = (ROOT / 'config.js').read_text()
upgrade_section = config.split('export const UPGRADES = {', 1)[1].split('\n};', 1)[0]
upgrades = re.findall(r'^\s*([a-z]+):\{name:', upgrade_section, re.M)
assert len(upgrades) == 7, f'expected seven active weapon families, found {len(upgrades)}'
for upgrade in upgrades:
    for level in (1, 2, 3):
        assert f'"weapon_{upgrade}_{level}"' in manifest_text, f'missing {upgrade} stage {level}'
model = (ROOT / 'model.js').read_text()
for key in ('effect_bolt', 'effect_lance', 'effect_lightning', 'effect_ice', 'effect_fire', 'effect_blast'):
    assert key in model, f'{key} is not used by a combat effect'
for file in ('ui-stone.svg', 'ui-bronze.svg'):
    assert (assets / file).is_file() and '<svg' in (assets / file).read_text(), f'missing generated texture {file}'
css = (ROOT / 'styles.css').read_text()
for name in ('ui-stone.svg', 'ui-bronze.svg', 'ui-slate.webp'):
    assert f'assets/{name}' in css, f'{name} is not applied to the interface'
print('Alpha 1.5 asset checks passed: 59 game WebPs, seven weapon families, combat effects, and three interface textures.')
