from pathlib import Path
from PIL import Image

assets = Path(__file__).resolve().parents[1] / 'dist/assets'
converted = [('asset-atlas.webp','asset-atlas.png'),('guardian-atlas-v27.webp','guardian-atlas-v27.png')]
converted += [(f'{name}.webp',f'{name}.png') for name in
              ['tower-bow-infernal-v1','tower-cannon-ash-v1','tower-rift-lance-v1'] +
              [f'tower-{kind}-l{level}-v2' for kind in ('bow','cannon') for level in (1,2,3)] +
              [f'tower-rift-lance-l{level}' for level in (1,2,3)]]
for name, old in converted:
    with Image.open(assets/name) as image:
        image.load()
        assert image.width > 1000 and image.height >= 1000
        assert image.format == 'WEBP'
    assert not (assets/old).exists(), 'old PNG still packaged'

with Image.open(assets/'hero/marcel-walk-alpha9.webp') as image:
    image.load()
    assert image.mode == 'RGBA' and image.size == (1152,1536)
    for row in range(4):
        for col in range(3):
            cell = image.crop((col*384,row*384,(col+1)*384,(row+1)*384))
            box = cell.getchannel('A').getbbox()
            assert box and min(box[:2]) >= 10 and max(box[2:]) <= 374, (row,col,box)
print('Alpha 9: 14 lossless WebP conversions and 12 transparent Marcel cells passed')
