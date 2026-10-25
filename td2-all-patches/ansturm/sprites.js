import manifest from './asset-manifest.js';

// One image pipeline for the entire renderer. At most four active downloads.
const entries = new Map(Object.entries(manifest).map(([key,url])=>[key,{url,status:'queued',img:null}]));
const queue = [...entries.keys()];
let inflight=0;
const MAX_INFLIGHT=4;

function pump(){
  while(inflight<MAX_INFLIGHT && queue.length){
    const key=queue.shift();
    const item=entries.get(key);
    if(!item || item.status!=='queued')continue;
    inflight++;
    item.status='loading';
    const img=new Image();
    img.decoding='async';
    item.img=img;
    const finish=(ok)=>{
      if(item.status!=='loading')return;
      item.status=ok?'ready':'failed';
      inflight--;
      pump();
    };
    img.onload=()=>{
      if(typeof img.decode==='function')img.decode().then(()=>finish(true),()=>finish(img.naturalWidth>0));
      else finish(img.naturalWidth>0);
    };
    img.onerror=()=>finish(false);
    img.src=item.url;
  }
}
pump();

// Ground anchor: x/y is the foot of each standing object.
export function sprite(ctx,key,x,y,width,height){
  const item=entries.get(key);
  if(item?.status!=='ready'||!item.img?.naturalWidth)return false;
  ctx.drawImage(item.img,x-width/2,y-height,width,height);
  return true;
}
export function spriteStats(){
  const statuses=[...entries.values()].map(item=>item.status);
  return {decoded:statuses.filter(s=>s==='ready').length,total:entries.size,failed:statuses.filter(s=>s==='failed').length,loading:inflight,queued:queue.length};
}
export function spriteReady(key){const item=entries.get(key);return item?.status==='ready'&&!!item.img?.naturalWidth;}
