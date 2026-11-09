"""Ansturm cutout QA: enforce repaired sprites and audit remaining edge risk.

Touches are diagnostic, not proof of corruption (e.g. intentionally long VFX).
"""
from pathlib import Path
from PIL import Image
import hashlib

ROOT=Path(__file__).resolve().parent.parent
SOURCE=ROOT/'dist/ansturm/assets'
MIRROR=ROOT/'ansturm-alpha1-5/assets'
FIXED={'enemy_gargoyle.webp','boss_stormlord.webp','icon_tesla.webp'}
ALL=sorted(p for p in SOURCE.glob('*.webp') if p.name.startswith(('enemy_','boss_','icon_','weapon_','effect_')))
assert len(ALL)>=50,'asset inventory unexpectedly shrank'
for manifest in [ROOT/'dist/ansturm/asset-manifest.js',ROOT/'ansturm-alpha1-5/asset-manifest.js']:
    content=manifest.read_text()
    for asset in FIXED:
        assert f'assets/{asset}?v=v5-style2a1' in content, f'{manifest}: no cache-busting version for {asset}'

risks=[]
for file in ALL:
    mirror=MIRROR/file.name
    assert mirror.exists(),f'missing mirrored Ansturm asset {file.name}'
    assert hashlib.sha256(file.read_bytes()).digest()==hashlib.sha256(mirror.read_bytes()).digest(),f'mirror diverged: {file.name}'
    with Image.open(file) as image:
        assert image.mode=='RGBA',f'{file.name} no alpha channel'
        width,height=image.size
        alpha=image.getchannel('A').point(lambda value:255 if value>=128 else 0)
        bbox=alpha.getbbox()
        assert bbox is not None,f'{file.name} invisible'
        touching=(bbox[0]<2 or bbox[1]<2 or bbox[2]>width-2 or bbox[3]>height-2)
        if touching:risks.append(file.name)
        if file.name in FIXED:
            margin=max(3,round(min(width,height)*.04))
            assert min(bbox[0],bbox[1],width-bbox[2],height-bbox[3])>=margin, f'repaired sprite still clipped: {file.name} {bbox}/{image.size}'

print(f'Ansturm edges: {len(ALL)} checked, {len(ALL)-len(risks)} safely inset, {len(risks)} edge-risk candidates (diagnostic only)')
print('Remaining edge-risk:',', '.join(risks))
