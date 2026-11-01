"""Export authored 4x12 source atlases to padded, fixed-pivot RGBA runtime cells.
No image synthesis, rotation or mirroring. Full sources stay in QA source storage.
"""
from pathlib import Path
from PIL import Image
from io import BytesIO
import hashlib,json,re
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'docs/qa/v410/source'
OUT=ROOT/'dist/assets/directional-v410'
def extract_frames(im):
 """Separate complete authored sprites, including pixels outside nominal cells.

 The grid identifies bodies, never cuts them. Ambiguous connected bodies fail.
 All nontransparent pixels are assigned to their nearest isolated body seed.
 Pivots are measured from the lower opaque body, not the weapon bounding box.
 """
 import numpy as np
 from scipy import ndimage
 rgba=np.asarray(im.convert('RGBA'));alpha=rgba[:,:,3];h,w=alpha.shape
 selected=None
 for threshold in (64,96,128,192,240):
  labels,n=ndimage.label(alpha>threshold)
  counts=np.bincount(labels.ravel());boxes=ndimage.find_objects(labels)
  if n<48:continue
  minimum=max(40,counts[1:].max()*.06)
  bodies=[i for i in range(1,n+1) if counts[i]>=minimum]
  if len(bodies)<48:continue
  bodies=sorted(bodies,key=lambda ident:counts[ident],reverse=True)[:48]
  # Generated row spacing is irregular. Sort complete bodies into twelve
  # horizontal groups, then order each group left-to-right; do not crop cells.
  centers=[]
  for ident in bodies:
   ys,xs=np.where(labels==ident)
   centers.append((float(np.median(ys)),float(np.median(xs)),ident))
  centers.sort()
  slots={}
  valid=True
  for row in range(12):
   group=sorted(centers[row*4:(row+1)*4],key=lambda item:item[1])
   if max(t[0] for t in group)-min(t[0] for t in group)>h/12*.75:valid=False;break
   for col,(y,x,ident) in enumerate(group):
    if abs(x-(col+.5)*w/4)>w/4*.65:valid=False;break
    slots[row,col]=ident
  if valid and len(slots)==48:
   selected=(threshold,labels,slots);break
 if selected is None:raise ValueError('Cannot isolate exactly 48 bodies in distinct cells; merged or missing sprites require source correction')
 threshold,labels,slots=selected
 seeds=np.zeros_like(labels)
 for (row,col),ident in slots.items():seeds[labels==ident]=row*4+col+1
 nearest=ndimage.distance_transform_edt(seeds==0,return_distances=False,return_indices=True)
 owners=seeds[tuple(nearest)]
 frames=[];metadata=[]
 for i in range(48):
  mask=(owners==i+1)&(alpha>0)
  ys,xs=np.where(mask)
  x0,x1,y0,y1=int(xs.min()),int(xs.max())+1,int(ys.min()),int(ys.max())+1
  data=rgba[y0:y1,x0:x1].copy();data[~mask[y0:y1,x0:x1]]=0
  core=(seeds[y0:y1,x0:x1]==i+1)
  cy,cx=np.where(core)
  # Feet/lower body establish contact. Exclude isolated translucent glow.
  floor=float(np.quantile(cy,.98))+1
  lower=cx[cy>=np.quantile(cy,.70)]
  pivot=[float(np.median(lower))+.5,floor]
  frames.append(Image.fromarray(data))
  metadata.append({'sourceBounds':[x0,y0,x1,y1],'sourcePivot':[pivot[0]+x0,pivot[1]+y0],'pivot':pivot})
 if sum(int(np.count_nonzero(np.asarray(frame)[:,:,3])) for frame in frames)!=int(np.count_nonzero(alpha)):raise ValueError('Source alpha lost or duplicated during extraction')
 return frames,{'opaqueSourcePixels':int(np.count_nonzero(alpha)),'threshold':threshold,'frames':metadata,'method':'isolated-body-nearest-alpha; measured-lower-body-pivot'}

def main():
 source_paths={p.stem:p for p in SOURCE.glob('*.png') if p.stem in ['marcel','kim'] or re.fullmatch(r'enemy-\d{2}',p.stem)}
 expected={'marcel','kim',*(f'enemy-{i:02d}' for i in range(21))}
 if set(source_paths)!=expected:raise ValueError('Restore the complete23 author sources before export; runtime files were not changed. Missing: '+', '.join(sorted(expected-set(source_paths))))
 OUT.mkdir(parents=True,exist_ok=True)
 actors={};records=[]
 # Only a complete block remap may change the direction assignment. This is not mirroring.
 remaps={};calibrations={}
 for report in ['art-a.json','art-b.json']:
  p=ROOT/'docs/qa/v410'/report
  if p.exists():
   data=json.loads(p.read_text())
   entries=data if isinstance(data,list) else data.get('actors',data.get('assets',[]))
   if isinstance(entries,dict): entries=[dict(value,actor=key) for key,value in entries.items()]
   for entry in entries:
    if not isinstance(entry,dict):continue
    key=entry.get('actor',entry.get('id'))
    if isinstance(entry.get('rowRemap'),dict):remaps[key]=entry['rowRemap']
    calibrations[key]={'viewScale':entry.get('viewScale',{}),'frameScale':entry.get('frameScale',{})}
 for path in sorted(SOURCE.glob('*.png')):
  actor=path.stem
  if actor not in ['marcel','kim'] and not re.fullmatch(r'enemy-\d{2}',actor):continue
  im=Image.open(path).convert('RGBA');w,h=im.size
  if abs(w/h-1/3)>.015:raise ValueError(f'{actor}: source must be4x12 ratio1:3, got{im.size}')
  c=192 if actor in ['marcel','kim'] else 128
  try:frames,extraction=extract_frames(im)
  except ValueError as error:raise ValueError(f'{actor}: {error}') from error
  # Author calibration corrects different source drawing scales before the
  # common actor scale. It never changes facing, clips weapons or alters source.
  calibration=calibrations.get(actor,{})
  for i,(frame,info) in enumerate(zip(frames,extraction['frames'])):
   direction=['down','left','right','up'][i//12]
   factor=calibration.get('frameScale',{}).get(f'{i//4},{i%4}',calibration.get('viewScale',{}).get(direction,1))
   if not isinstance(factor,(int,float)) or not .25<=factor<=4:raise ValueError(f'{actor}: invalid author scale')
   info['authorScale']=factor
   if factor!=1:
    frames[i]=frame.resize((max(1,round(frame.width*factor)),max(1,round(frame.height*factor))),Image.Resampling.LANCZOS)
    info['pivot']=[value*factor for value in info['pivot']]
  # One actor scale and one runtime anchor across all actions and directions.
  extents=[(m['pivot'][0],f.width-m['pivot'][0],m['pivot'][1],f.height-m['pivot'][1]) for f,m in zip(frames,extraction['frames'])]
  left=max(e[0] for e in extents);right=max(e[1] for e in extents)
  above=max(e[2] for e in extents);below=max(e[3] for e in extents)
  scale=min((c-20)/(left+right),(c-20)/(above+below))
  anchor=[10+left*scale,10+above*scale]
  atlas=Image.new('RGBA',(c*4,c*12));frameinfo=[]
  for i,(frame,info) in enumerate(zip(frames,extraction['frames'])):
   size=(max(1,round(frame.width*scale)),max(1,round(frame.height*scale)))
   cut=frame.resize(size,Image.Resampling.LANCZOS)
   position=(round(anchor[0]-info['pivot'][0]*scale),round(anchor[1]-info['pivot'][1]*scale))
   cell=Image.new('RGBA',(c,c));cell.alpha_composite(cut,position)
   if not cell.getbbox() or min(position)<0 or position[0]+size[0]>c or position[1]+size[1]>c:raise ValueError(f'{actor}: extraction exceeds padded runtime cell')
   atlas.alpha_composite(cell,((i%4)*c,(i//4)*c))
   frameinfo.append({'row':i//4,'column':i%4,**info,'runtimeBounds':list(cell.getbbox())})
  file=OUT/(actor+'.webp');buffer=BytesIO();atlas.save(buffer,'WEBP',lossless=True,method=6)
  encoded=buffer.getvalue();check=Image.open(BytesIO(encoded));check.load()
  temporary=file.with_suffix('.webp.tmp');temporary.write_bytes(encoded);temporary.replace(file)
  rows={direction:{action:index*3+j for j,action in enumerate(['attack','hit','death'])} for index,direction in enumerate(['down','left','right','up'])}
  if actor in remaps:
   for direction,index in remaps[actor].items():rows[direction]={action:index*3+j for j,action in enumerate(['attack','hit','death'])}
  actors[actor]={'file':'assets/directional-v410/'+actor+'.webp?v=v410a1','cell':c,'anchor':anchor,'height':max(1,round(frames[0].height*scale)),'frames':4,'rows':rows}
  records.append({'actor':actor,'source':str(path.relative_to(ROOT)),'sourceSize':[w,h],'authorCalibration':calibration,'extractionMethod':extraction['method'],'opaqueSourcePixels':extraction['opaqueSourcePixels'],'extractionThreshold':extraction['threshold'],'sourceSha256':hashlib.sha256(path.read_bytes()).hexdigest(),'runtime':str(file.relative_to(ROOT)),'runtimeSha256':hashlib.sha256(file.read_bytes()).hexdigest(),'decodedBytes':c*4*c*12*4,'frames':frameinfo})
 (ROOT/'dist/directional-assets-v410.js').write_text('/* Authored directions; no rotations or mirrors in export. */\nglobalThis.TD2DirectionalAssets='+json.dumps(actors,separators=(',',':'))+';\n')
 (OUT/'manifest.json').write_text(json.dumps({'actors':actors,'exports':records,'decodedBytesAllAtlases':sum(r['decodedBytes'] for r in records),'artReview':'See docs/qa/v410/art-a.json, art-b.json and hero-art-review.md; technical export does not imply visual acceptance.'},indent=2)+'\n')
 print(f'Exported{len(actors)} atlases, {len(actors)*48} frames; decoded{sum(r["decodedBytes"] for r in records)/1048576:.1f} MiB if all retained')

if __name__=='__main__':main()
