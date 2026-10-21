"""Build the 21-row runtime atlas from TD2-Gegneranimationen-v2.

Usage: python tools/prepare-enemy-animations.py /path/to/TD2-Gegneranimationen-v2
Requires Pillow for this offline asset preparation only, never at runtime.
"""
from pathlib import Path
from PIL import Image
import hashlib,json,sys

source=Path(sys.argv[1]);spec=json.loads((source/'Animationen.json').read_text())
output=Path(__file__).resolve().parents[1]/'dist/assets/enemies'
output.mkdir(parents=True,exist_ok=True)
cell=160;atlas=Image.new('RGBA',(4*cell,21*cell));provenance=[]
assert len(spec['enemies'])==21
for row,enemy in enumerate(spec['enemies']):
    asset=spec['images'][enemy['image']];path=source/asset['file']
    image=Image.open(path).convert('RGBA');frames=enemy['frames']
    assert len(frames)==4
    scale=min(136/enemy['maxWidth'],136/enemy['maxHeight'])
    for col,frame in enumerate(frames):
        x,y,w,h=(frame[key] for key in ('x','y','w','h'))
        assert 0<=x<x+w<=image.width and 0<=y<y+h<=image.height
        sprite=image.crop((x,y,x+w,y+h))
        sprite=sprite.resize((max(1,round(w*scale)),max(1,round(h*scale))),Image.Resampling.LANCZOS)
        dx=(cell-sprite.width)//2
        dy=(cell-sprite.height)//2 if enemy['floating'] else 148-sprite.height
        assert dx>=8 and dy>=8 and dx+sprite.width<=152 and dy+sprite.height<=152
        atlas.alpha_composite(sprite,(col*cell+dx,row*cell+dy))
    provenance.append({'row':row,'name':enemy['name'],'source':asset['file'],
        'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'frames':frames,'floating':enemy['floating']})
atlas.save(output/'walk-v1.webp',lossless=True,method=6)
(output/'manifest.json').write_text(json.dumps({'version':1,'cell':cell,'columns':4,'rows':21,
    'decodedBytes':atlas.width*atlas.height*4,'sourcePack':'TD2-Gegneranimationen-v2',
    'note':'Movement drafts, one facing mirrored horizontally; no new attack mechanics.',
    'enemies':provenance},ensure_ascii=False,indent=2)+'\n')
print(f'Built {atlas.width}x{atlas.height}: {len(provenance)} designs / 84 frames; {(output/"walk-v1.webp").stat().st_size} bytes')
