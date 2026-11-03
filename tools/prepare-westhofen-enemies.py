#!/usr/bin/env python3
"""Pack the approved uploads without repainting. Usage: --sources DIR.
Only components attached to a visible character/effect are retained; alpha
within those components stays unchanged (including the censer's smoke).
"""
import argparse,hashlib,json
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage
parser=argparse.ArgumentParser();parser.add_argument('--sources',type=Path,required=True);args=parser.parse_args()
out=Path('dist/assets/enemies/westhofen');out.mkdir(parents=True,exist_ok=True)
actors=[]
for number,identity,rows in [('1911','swordsman',4),('1912','archer',4),('1913','guardian',4),('1914','censer',4),('1915','golem',5)]:
 matches=list(args.sources.glob('*'+number+'.png'));assert len(matches)==1,(number,matches)
 p=matches[0];im=Image.open(p).convert('RGBA');pixels=np.asarray(im);alpha=pixels[:,:,3]
 labels,n=ndimage.label(ndimage.binary_dilation(alpha>32,iterations=3));regions=[]
 for label,bb in enumerate(ndimage.find_objects(labels),1):
  if np.count_nonzero(labels[bb]==label)>1200:
   y,x=bb;regions.append((label,(x.start,y.start,x.stop,y.stop)))
 ordered=[]
 for row in range(rows):
  selected=[r for r in regions if int(((r[1][1]+r[1][3])/2)*rows/im.height)==row]
  assert len(selected)==4,(number,row,len(selected))
  ordered.extend(sorted(selected,key=lambda r:r[1][0]))
 scale=128/max(max(b[2]-b[0],b[3]-b[1]) for _,b in ordered)
 atlas=Image.new('RGBA',(576,rows*144));frames=[]
 for i,(label,b) in enumerate(ordered):
  x0,y0,x1,y1=b;crop=pixels[y0:y1,x0:x1].copy()
  crop[labels[y0:y1,x0:x1]!=label]=0
  tile=Image.fromarray(crop);w=max(1,round(tile.width*scale));h=max(1,round(tile.height*scale))
  tile=tile.resize((w,h),Image.Resampling.LANCZOS)
  # Drop RGB in fully transparent pixels for clean filtering and compact encoding.
  arr=np.asarray(tile).copy();arr[arr[:,:,3]==0]=0;tile=Image.fromarray(arr)
  dx=72-w//2;dy=136-h;atlas.paste(tile,((i%4)*144+dx,(i//4)*144+dy))
  frames.append({'sourceRect':[x0,y0,x1-x0,y1-y0],'destination':[dx,dy,w,h]})
 target=out/(identity+'-v1.webp');atlas.save(target,lossless=True,method=6)
 actors.append({'id':identity,'file':target.name,'source':number+'.png','sourceSha256':hashlib.sha256(p.read_bytes()).hexdigest(),'sourceSize':list(im.size),'sourceScale':scale,'rows':rows,'frames':frames,'atlasSha256':hashlib.sha256(target.read_bytes()).hexdigest()})
manifest={'version':1,'cell':144,'anchor':[72,136],'visibleHeight':128,'columns':4,'actions':['walk','attack','hit','death','special'],'facing':'one authored view; optional horizontal mirror','actors':actors}
(out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Built 84 poses; bytes',sum(p.stat().st_size for p in out.glob('*.webp')))
