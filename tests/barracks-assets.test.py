"""Verify actual decoded assets and original package checksum, not filenames."""
from pathlib import Path
from PIL import Image
import hashlib,json
root=Path(__file__).resolve().parents[1]/'dist/assets/barracks'
m=json.loads((root/'atlas-manifest.json').read_text())
base=root/'kasernen-atlas-96px.webp'
assert hashlib.sha256(base.read_bytes()).hexdigest()==m['sha256'][base.name]
for name,size,cell,rows in [('kasernen-atlas-96px.webp',(768,768),96,6),('states-v1.webp',(1024,384),128,3)]:
 im=Image.open(root/name);assert im.size==size and im.mode=='RGBA'
 a=im.getchannel('A');assert a.getextrema()[0]==0
 assert a.histogram()[0]>im.width*im.height*.25
 for row in range(rows):
  count=6 if name==base.name and row in (1,3) else 8
  for col in range(count):
   frame=a.crop((col*cell,row*cell,(col+1)*cell,(row+1)*cell))
   assert frame.getextrema()[1]>200,(name,row,col)
 assert im.width*im.height*4<=3*1024*1024
print('Barracks: true RGBA, all mapped cells, dimensions, memory budget and source checksum passed')
