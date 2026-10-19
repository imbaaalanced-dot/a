"""Decode the actual runtime atlas and validate all 84 isolated frame cells."""
from pathlib import Path
from PIL import Image
import json

assets=Path(__file__).resolve().parents[1]/'dist/assets/enemies'
manifest=json.loads((assets/'manifest.json').read_text())
assert len(manifest['enemies'])==21
with Image.open(assets/'walk-v1.webp') as im:
    im.load()
    assert im.mode=='RGBA' and im.size==(640,3360)
    assert im.width*im.height*4<9*1024*1024,'decoded atlas exceeds mobile memory budget'
    for row in range(21):
        frames=[]
        for col in range(4):
            cell=im.crop((col*160,row*160,(col+1)*160,(row+1)*160))
            alpha=cell.getchannel('A');box=alpha.getbbox()
            assert box is not None,(row,col,'empty frame')
            assert box[0]>=7 and box[1]>=7 and box[2]<=153 and box[3]<=153,(row,col,'edge padding')
            assert alpha.getpixel((0,0))==0 and alpha.getpixel((159,159))==0
            frames.append(cell.tobytes())
        assert len(set(frames))>1,(row,'all four poses identical')
assert (assets/'walk-v1.webp').stat().st_size<2*1024*1024,'compressed download exceeds budget'
print('Enemy atlas: RGBA decode, all 84 frames, transparent gutters, distinct poses, <2 MiB download / <9 MiB decoded passed.')
