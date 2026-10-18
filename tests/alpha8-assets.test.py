from pathlib import Path
from PIL import Image
assets = Path(__file__).resolve().parents[1] / 'dist' / 'assets'
for name, rows, cols in [('church-ende-alpha8.png',1,1),('lion-ende-alpha8.png',1,1),('hero/marcel-walk-alpha8.png',4,3),('hero/kim-walk-alpha8.png',4,3),('elemental/enemies-walk-alpha8.png',3,3)]:
    with Image.open(assets/name) as image:
        image.load()
        assert image.mode == 'RGBA' and image.width >= 1000 and image.getpixel((0,0))[3] == 0, name
        for row in range(rows):
            for col in range(cols):
                cell=image.crop((col*image.width//cols,row*image.height//rows,(col+1)*image.width//cols,(row+1)*image.height//rows))
                assert cell.getchannel('A').getbbox(), (name,row,col)
        print(name, image.size, rows*cols)
