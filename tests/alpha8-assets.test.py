from pathlib import Path
from PIL import Image
assets = Path(__file__).resolve().parents[1] / 'dist' / 'assets'
for name, rows, cols in [('church-ende-alpha8.webp',1,1),('lion-ende-alpha8.webp',1,1),('hero/marcel-walk-alpha8.webp',4,3),('hero/kim-walk-alpha8.webp',4,3),('elemental/enemies-walk-alpha8.webp',3,3)]:
    with Image.open(assets/name) as image:
        image.verify()
    with Image.open(assets/name) as image:
        image.load()
        assert image.mode == 'RGBA' and image.width >= 1000 and image.getpixel((0,0))[3] == 0, name
        for row in range(rows):
            for col in range(cols):
                cell=image.crop((col*image.width//cols,row*image.height//rows,(col+1)*image.width//cols,(row+1)*image.height//rows))
                assert cell.getchannel('A').getbbox(), (name,row,col)
        print(name, image.size, rows*cols)

for name, rows, cols in [('elemental/cannon-projectiles-v1.webp',1,3),('elemental/cannon-impacts-v1.webp',3,6)]:
    with Image.open(assets/name) as image:
        image.load()
        assert image.mode == 'RGBA' and image.width == cols*128 and image.height == rows*128
        for row in range(rows):
            for col in range(cols):
                cell=image.crop((col*128,row*128,(col+1)*128,(row+1)*128))
                assert cell.getchannel('A').getbbox(), (name,row,col)
        print(name, image.size, rows*cols)

with Image.open(assets/'scenery-alpha8.webp') as image:
    image.load()
    assert image.mode=='RGBA' and image.size==(768,512)
    for row in range(2):
        for col in range(3):
            cell=image.crop((col*256,row*256,(col+1)*256,(row+1)*256))
            assert cell.getchannel('A').getbbox()
    print('scenery-alpha8.webp', image.size, 6)
