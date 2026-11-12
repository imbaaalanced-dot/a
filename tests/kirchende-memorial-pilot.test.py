"""Decode and alpha-budget audit for optional Level 3 Kirchende pilot assets."""
from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]/'dist/assets/kirchende'
for name,size in [
    ('monument-style2-pilot.webp',(261,425)),
    ('opferplatte-style2-pilot.webp',(470,248)),
]:
    p=ROOT/name
    assert p.exists(),f'missing {p}'
    assert p.stat().st_size<80000,f'pilot WebP too large: {name}'
    with Image.open(p) as image:
        image.load()
        assert image.format=='WEBP',name
        assert image.size==size,(name,image.size)
        assert 'A' in image.getbands(),f'no transparency: {name}'
        lo,hi=image.getchannel('A').getextrema()
        assert lo==0 and hi==255,(name,lo,hi)
print('Kirchende pilot WebPs: decode, alpha, expected dimensions and mobile transfer budget passed')
