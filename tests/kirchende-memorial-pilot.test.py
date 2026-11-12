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
        if name=='monument-style2-pilot.webp':
            # The older source contained invisible saturated-red RGB pixels
            # (alpha=0), which can bleed into edges during texture filtering.
            rgba=image.convert('RGBA')
            hidden_red=sum(
                1 for red,green,blue,alpha in rgba.getdata()
                if alpha==0 and red>150 and red>green*1.7 and red>blue*2
            )
            assert hidden_red==0,f'invisible red fringe pixels: {hidden_red}'
            assert sum(1 for px in rgba.getdata() if px[3]>220)>60000,\
                'memorial silhouette lost during alpha cleanup'
print('Kirchende pilot WebPs: decode, alpha, expected dimensions and mobile transfer budget passed')
