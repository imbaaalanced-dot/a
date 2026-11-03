"""Validate runtime pixels, not only manifest declarations."""
from pathlib import Path
from PIL import Image
import json,hashlib
root=Path('dist/assets/enemies/westhofen')
assert (root/'manifest.json').exists(), 'Westhofen mobile atlas manifest missing'
m=json.loads((root/'manifest.json').read_text()); assert m['cell']==144 and m['anchor']==[72,136]
assert len(m['actors'])==5
memory=0;count=0
for actor in m['actors']:
 with Image.open(root/actor['file']) as im:
  im.load();assert im.mode=='RGBA';assert im.size==(576,144*actor['rows'])
  assert hashlib.sha256((root/actor['file']).read_bytes()).hexdigest()==actor['atlasSha256']
  memory+=im.width*im.height*4
  hashes=[]
  for i,frame in enumerate(actor['frames']):
   tile=im.crop(((i%4)*144,(i//4)*144,(i%4+1)*144,(i//4+1)*144))
   b=tile.getchannel('A').getbbox();assert b and b[0]>=4 and b[1]>=4 and b[2]<=140 and b[3]<=140,(actor['id'],i,b)
   assert b[3]<=136;hashes.append(hashlib.sha256(tile.tobytes()).hexdigest())
   assert frame['sourceRect'][2]>0 and frame['sourceRect'][3]>0
  assert len(set(hashes))>=12,'not enough distinct authored poses'
  assert len(actor['frames'])==4*actor['rows'];count+=len(actor['frames'])
assert count==84 and memory<=8*1024*1024
print(f'Westhofen assets: 5 RGBA atlases, {count} poses, safe gutters; decoded {memory/1048576:.2f} MiB.')
