"""Technical packing of the approved generated V2 PNG exports; no art synthesis."""
from pathlib import Path
from PIL import Image
import argparse, io, os, json, hashlib
p=argparse.ArgumentParser();p.add_argument('source',type=Path);args=p.parse_args()
root=Path(__file__).resolve().parents[1];out=root/'dist/assets/expansion-v2';out.mkdir(exist_ok=True)
data={'actors':{},'items':{},'assets':[],'version':'expansion2'}
def write(name,im):
 b=io.BytesIO();im.save(b,format='WEBP',quality=88,method=6);raw=b.getvalue();path=out/name;temp=path.with_suffix('.tmp')
 with temp.open('wb') as f:f.write(raw);f.flush();os.fsync(f.fileno())
 os.replace(temp,path);data['assets'].append({'file':name,'size':list(im.size),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()})
def read(name,size):return Image.open(args.source/name).convert('RGBA').resize((size,size),Image.Resampling.LANCZOS)
for group in range(3):
 atlas=Image.new('RGBA',(128*4,128*21))
 for local in range(7):
  name=f'enemy-{group*7+local:02}';base=read(f'animations/{name}/attack-00.png',128);box=base.getchannel('A').point(lambda x:255 if x>40 else 0).getbbox()
  data['actors'][name]={'file':f'enemies-{group}.webp','row':local*3,'cell':128,'anchor':[(box[0]+box[2])/2,box[3]],'height':box[3]-box[1]}
  for row,action in enumerate(['attack','hit','death']):
   for frame in range(4):atlas.alpha_composite(read(f'animations/{name}/{action}-{frame:02}.png',128),(frame*128,(local*3+row)*128))
 write(f'enemies-{group}.webp',atlas)
for name in ['marcel','kim']:
 atlas=Image.new('RGBA',(192*4,192*3));base=read(f'animations/{name}/attack-00.png',192);box=base.getchannel('A').point(lambda x:255 if x>40 else 0).getbbox()
 data['actors'][name]={'file':f'{name}.webp','row':0,'cell':192,'anchor':[(box[0]+box[2])/2,box[3]],'height':box[3]-box[1]}
 for row,action in enumerate(['attack','hit','death']):
  for frame in range(4):atlas.alpha_composite(read(f'animations/{name}/{action}-{frame:02}.png',192),(frame*192,row*192))
 write(f'{name}.webp',atlas)
manifest=json.loads((args.source/'manifest.json').read_text());names=[Path(r['file']).stem for r in manifest['assets'] if r['kind']=='item']
atlas=Image.new('RGBA',(7*128,3*128))
for i,name in enumerate(names):atlas.alpha_composite(read(f'items/{name}.png',128),(i%7*128,i//7*128));data['items'][name]=i
write('items.webp',atlas)
for name in ['bark','roots','splinter','wardlight','grove']:write(f'kirchende-{name}.webp',read(f'kirchende/item-{name}.png',192))
atlas=Image.new('RGBA',(6*128,4*128))
for row,(family,tier) in enumerate([('cannon',1),('cannon',2),('boomerang',1),('boomerang',2)]):
 for frame in range(6):atlas.alpha_composite(read(f'effects/{family}-lv{tier}/impact-{frame:02}.png',128),(frame*128,row*128))
write('impacts.webp',atlas)
for level in range(1,7):
 atlas=Image.new('RGBA',(4*128,2*128));files=[r['file'] for r in manifest['assets'] if r['file'].startswith(f'environments/level-{level}/')]
 for i,name in enumerate(files):atlas.alpha_composite(read(name,128),(i%4*128,i//4*128))
 write(f'environment-{level}.webp',atlas)
for name in ['portal-new-normal','portal-new-hover','portal-resume-normal','portal-resume-hover']:write(name+'.webp',Image.open(args.source/f'ui/{name}.png').convert('RGBA'))
atlas=Image.new('RGBA',(3*192,2*192));names=['monument','red-portal','skeleton-guard','mace-brute','crowned-boss']
for i,name in enumerate(names):atlas.alpha_composite(read(f'legacy/{name}.png',192),(i%3*192,i//3*192))
write('legacy.webp',atlas)
(out/'manifest.json').write_text(json.dumps(data,ensure_ascii=False,indent=2))
(root/'dist/v2-expansion-data.js').write_text('globalThis.V2ExpansionData='+json.dumps({'actors':data['actors'],'items':data['items']},separators=(',',':'))+';\n')
print(json.dumps({'textures':len(data['assets']),'transfer_bytes':sum(a['bytes'] for a in data['assets']),'decoded_bytes':sum(a['size'][0]*a['size'][1]*4 for a in data['assets'])}))
