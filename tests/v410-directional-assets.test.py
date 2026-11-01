from PIL import Image
from pathlib import Path
import json,hashlib
root=Path(__file__).resolve().parents[1]
m=json.loads((root/'dist/assets/directional-v410/manifest.json').read_text())
assert set(m['actors'])=={'marcel','kim',*(f'enemy-{i:02d}' for i in range(21))},'all23 actor identities need authored directional sheets'
records={record['actor']:record for record in m['exports']}
assert set(records)==set(m['actors'])
for actor,spec in m['actors'].items():
 path=root/'dist'/spec['file'].split('?')[0];im=Image.open(path).convert('RGBA');c=spec['cell']
 assert im.size==(4*c,12*c)
 record=records[actor]
 assert hashlib.sha256(path.read_bytes()).hexdigest()==record['runtimeSha256'],(actor,'runtime provenance hash')
 assert len(record['frames'])==48 and record['opaqueSourcePixels']>0
 assert record['extractionThreshold'] in [64,96,128,192,240]
 direction_hashes=[]
 for row in range(12):
  for col in range(4):
   frame=im.crop((col*c,row*c,(col+1)*c,(row+1)*c));alpha=frame.getchannel('A');b=alpha.getbbox()
   assert b and 0<b[0]<b[2]<c and 0<b[1]<b[3]<c,(actor,row,col,'padding')
   assert alpha.getextrema()[0]==0 and alpha.getextrema()[1]>=250,(actor,row,col,'transparent background and near-opaque body after resampling')
 for direction in ['down','left','right','up']:
  r=spec['rows'][direction]['attack'];direction_hashes.append(hashlib.sha256(im.crop((0,r*c,4*c,(r+3)*c)).tobytes()).hexdigest())
 assert len(set(direction_hashes))==4,(actor,'direction blocks must not be duplicate copies')
assert m['decodedBytesAllAtlases']<=90*1024*1024
print('V4.1: all23 actors,1104 framed cells, real RGBA, padding, distinct direction blocks and decoded budget passed')
