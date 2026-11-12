"""Decode the hero assets; existence alone cannot catch corrupt image uploads."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1] / 'dist' / 'assets' / 'hero'
for name in ('marcel-portrait-alpha9.webp', 'marcel-lantern-sprite-v1.webp'):
    with Image.open(root / name) as image:
        image.load()
        assert image.width > 0 and image.height > 0, name
        assert image.format == 'WEBP', name
        print(f'{name}: decoded {image.width}x{image.height}')

# Menu downloads stay small enough for mobile connections.
menu = root.parent / 'menu'
for name, limit in (('memorial-yard-v3.webp', 200000), ('memorial-yard-mobile-v3.webp', 120000), ('crest-v3.webp', 60000), ('hero-banner-marcel-v3.webp', 90000), ('hero-banner-kim-v3.webp', 90000)):
    with Image.open(menu / name) as image:
        image.load()
        assert image.format == 'WEBP', name
        assert image.width > 0 and image.height > 0, name
        assert (menu / name).stat().st_size < limit, name
        print(f'{name}: decoded {image.width}x{image.height}, within download budget')
with Image.open(menu / 'crest-v3.webp') as image:
    assert image.mode == 'RGBA', 'crest-v3.webp keeps transparency'
    assert image.getchannel('A').getextrema()[0] == 0, 'crest-v3.webp has transparent surroundings'

with Image.open(root.parent / "items/equipment-v1.webp") as image:
    image.load()
    assert image.size == (1024, 512)
    assert image.format == "WEBP"
    print("equipment-v1.webp: 4x2 icon atlas decoded")

# Photo-derived Kirchende materials must decode, retain sprite alpha and fit mobile budgets.
for name,limit in [('monument-photo-v2.webp',160000),('ground-photo-v2.webp',350000)]:
    asset=root.parent/'kirchende'/name
    with Image.open(asset) as image:
        image.load()
        assert image.format=='WEBP',name
        assert asset.stat().st_size<limit,name
        if name.startswith('monument'):
            assert image.mode=='RGBA',name
            assert image.getchannel('A').getextrema()[0]==0,name
            assert image.getchannel('A').getextrema()[1]>=250,name
        print(f'{name}: decoded {image.size}, within mobile budget')

# Generated elemental atlases: genuine alpha, clean cell borders and bounded download size.
elemental=root.parent/'elemental'
for kind in ['mage','rift','bow','cannon','boomerang']:
    for typ,cell,cols,rows in [('towers',512,3,1),('projectiles',128,3,1),('impacts',128,6,3)]:
        if kind in ['bow','cannon','boomerang'] and typ!='towers':continue
        asset=elemental/f'{kind}-{typ}-v1.webp'
        with Image.open(asset) as image:
            image.load()
            assert image.mode=='RGBA' and image.size==(cols*cell,rows*cell),asset.name
            assert asset.stat().st_size<450000,asset.name
            for row in range(rows):
                for col in range(cols):
                    alpha=image.getchannel('A').crop((col*cell,row*cell,(col+1)*cell,(row+1)*cell))
                    assert alpha.getextrema()[1]>0,(asset.name,col,row)
                    for edge in [(0,0,cell,4),(0,cell-4,cell,cell),(0,0,4,cell),(cell-4,0,cell,cell)]:
                        assert alpha.crop(edge).getextrema()[1]==0,(asset.name,col,row,'clipped alpha edge')
        print(f'{asset.name}: decoded, equal cells, transparent gutters verified')
with Image.open(elemental/'enemies-v1.webp') as image:
    image.load()
    assert image.mode=='RGBA' and image.size==(1024,768)
    assert (elemental/'enemies-v1.webp').stat().st_size<1500000
    for i in range(11):
        a=image.getchannel('A').crop(((i%4)*256,(i//4)*256,(i%4+1)*256,(i//4+1)*256))
        assert a.getbbox() and a.getbbox()[3]==240
        for edge in [(0,0,256,4),(0,252,256,256),(0,0,4,256),(252,0,256,256)]:assert a.crop(edge).getextrema()[1]==0
print('Eleven enemy sprites: decode, populated cells, foot anchors and transparent borders verified')
for kind in ['shadowwing','gargoyle','stormwing']:
    asset=elemental/(kind+'-v1.webp')
    with Image.open(asset) as image:
        image.load()
        assert image.mode=='RGBA' and image.size==(512,512)
        assert asset.stat().st_size<200000
        a=image.getchannel('A')
        assert a.getbbox() and a.getextrema()[1]>200
        for edge in [(0,0,512,8),(0,504,512,512),(0,0,8,512),(504,0,512,512)]:assert a.crop(edge).getextrema()[1]==0
print('Three flying sprites: decode, alpha, size budget and padded borders verified')
with Image.open(elemental/'goethestrasse-memorial-v1.webp') as image:
    image.load()
    assert image.mode=='RGBA' and image.size==(768,768)
    a=image.getchannel('A')
    assert a.getbbox() and a.getbbox()[3]<=752
    for edge in [(0,0,768,8),(0,760,768,768),(0,0,8,768),(760,0,768,768)]:assert a.crop(edge).getextrema()[1]==0
print('Goethestraße memorial: decode, alpha and ground anchor verified')


# Optional pixel-style Marcel atlas: decoded, with 12 populated 128px cells.
pixel_atlas = root / 'marcel-walk-reference-v1.webp'
with Image.open(pixel_atlas) as image:
    image.load()
    assert image.format == 'WEBP' and image.mode == 'RGBA' and image.size == (384, 512)
    assert pixel_atlas.stat().st_size < 250000
    for row in range(4):
        for col in range(3):
            cell = image.getchannel('A').crop((col*128,row*128,(col+1)*128,(row+1)*128))
            assert cell.getbbox(), ('empty pixel Marcel frame', col, row)
print('marcel-walk-reference-v1.webp: decoded 3x4 RGBA atlas, within mobile budget')


# Westhofen's live memorial is one decoded RGBA WebP, not a flattened screenshot.
# The original source photos document a different historical state; this test
# validates the current 2026-game asset's delivery contract, not historical fidelity.
westhofen = root.parent / 'westhofen' / 'westhofen-memorial-style2-v1.webp'
with Image.open(westhofen) as image:
    image.load()
    assert image.format == 'WEBP', 'Westhofen memorial must decode as WebP'
    assert image.mode == 'RGBA', 'Westhofen memorial must keep true transparency'
    assert image.size == (768, 512), 'preserve the 3:2 source ratio expected by the 450x300 renderer'
    alpha = image.getchannel('A')
    bbox = alpha.getbbox()
    assert bbox is not None, 'Westhofen memorial must contain visible pixels'
    assert alpha.getextrema()[0] == 0, 'Westhofen sprite needs transparent negative space'
    assert alpha.getextrema()[1] > 200, 'Westhofen sculpture and stonework need opaque detail'
    inset = 8
    assert bbox[0] >= inset and bbox[1] >= inset, ('clipped Westhofen top/left edge', bbox)
    assert bbox[2] <= image.width - inset and bbox[3] <= image.height - inset, ('clipped Westhofen bottom/right edge', bbox)
    assert westhofen.stat().st_size < 160000, 'Westhofen memorial WebP exceeds the current mobile download budget'
    print(f'Westhofen memorial: {image.width}x{image.height} RGBA WebP, alpha bbox {bbox}, under 160 KB')
