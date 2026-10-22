from pathlib import Path
from PIL import Image
import json,hashlib
root=Path('dist/assets/expansion-v2');manifest=json.loads((root/'manifest.json').read_text())
for rec in manifest['assets']:
 p=root/rec['file'];assert hashlib.sha256(p.read_bytes()).hexdigest()==rec['sha256']
 with Image.open(p) as im:
  im.load();assert list(im.size)==rec['size'];assert im.mode=='RGBA';assert im.getchannel('A').getextrema()[0]==0
for name,spec in manifest['actors'].items():
 im=Image.open(root/spec['file']);c=spec['cell']
 for row in range(3):
  for frame in range(4):assert im.crop((frame*c,(spec['row']+row)*c,(frame+1)*c,(spec['row']+row+1)*c)).getchannel('A').getbbox(),(name,row,frame)
assert len(manifest['actors'])==23 and len(manifest['items'])==21
assert max(max(a['size']) for a in manifest['assets'])<=4096
assert sum(a['size'][0]*a['size'][1]*4 for a in manifest['assets'])<32*1024*1024
print('V2 runtime art: hashes, decode, alpha, all 276 action cells, GPU texture bounds and <32 MiB expansion decode budget passed.')
