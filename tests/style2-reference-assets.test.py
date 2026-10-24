"""Transparency and magenta-chroma residue QA for user and generated sprites."""
import json
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1] / 'dist/assets'
projectile_root = root / 'style2-reference-projectiles-v1'
data = json.loads((projectile_root / 'manifest.json').read_text())
assert len(data['assets']) == 12
for entry in data['assets']:
    png = Image.open(projectile_root / entry['master']).convert('RGBA')
    webp = Image.open(projectile_root / entry['runtime']).convert('RGBA')
    assert png.size == webp.size == (256, 256)
    assert png.tobytes() == webp.tobytes()
    assert any(pixel[3] > 200 for pixel in png.get_flattened_data()), entry['id']
    if entry['kind'] != 'rift':
        pink = sum(1 for r,g,b,a in png.get_flattened_data()
                   if a > 8 and r > 130 and g < 95 and b > 125
                   and r > g*1.65 and b > g*1.5)
        assert pink <= 3, f'{entry["id"]} still has {pink} magenta fringe pixels'

effect_root = root / 'style2-reference-impacts-v1'
effect = json.loads((effect_root / 'manifest.json').read_text())
assert len(effect['frames']) == 12
atlas = Image.open(effect_root / 'runtime.webp').convert('RGBA')
assert atlas.size == (768, 256)
for frame in effect['frames']:
    pic = Image.open(effect_root / frame['master']).convert('RGBA')
    assert pic.size == (256, 256)
    assert pic.getchannel('A').getbbox()
    x, y, w, h = frame['runtime_rect']
    cell = atlas.crop((x, y, x+w, y+h))
    assert cell.getchannel('A').getbbox()
print('Style-2 reference asset QA: 12 clean projectile pairs and 12 animated impact frames passed')
