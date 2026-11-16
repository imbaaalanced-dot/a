/* Denkmal TD2 V6: optional Style-2 tower replacements, no canonical assets overwritten.
 * Enable with ?td2V6Towers=1 only after installing accompanying WebP files.
 * The existing v4 renderer handles loading/missing/failed V6 candidates. */
(()=>{'use strict';
  const legacy=globalThis.UserStyle2Towers;
  const params=typeof URLSearchParams==='function'
    ?new URLSearchParams(globalThis.location?.search||''):null;
  const enabled=params?.get('td2V6Towers')==='1';
  const names=Object.freeze({bow:'bogen',cannon:'kanone',rift:'riftlanze',mage:'eis'});
  const assets=globalThis.DenkmalAssets;
  const root='assets/style2-v6-candidates/tuerme/upgrade_stufen/';
  const cache=new Map();
  const maxImages=8,maxPending=3;
  const diagnostics={requested:0,drawn:0,fallbacks:0,failed:0};
  const level=n=>Math.max(1,Math.min(3,Math.floor(Number(n)||1)));
  function urlFor(kind,tier){
    const basename=names[kind];
    return basename?`${root}${basename}_l${level(tier)}.webp`:null;
  }
  function evict(entry){
    if(entry.viaManager)assets?.release?.(entry.group);
    else if(entry.img){entry.img.onload=null;entry.img.onerror=null;entry.img.src='';}
  }
  function request(url){
    let entry=cache.get(url);
    if(entry){cache.delete(url);cache.set(url,entry);return entry;}
    if([...cache.values()].filter(v=>v.pending).length>=maxPending)return null;
    if(cache.size>=maxImages){
      const victim=[...cache].find(([,v])=>!v.pending);
      if(!victim)return null;
      cache.delete(victim[0]);evict(victim[1]);
    }
    entry={url,pending:true,failed:false,img:null,viaManager:!!(assets?.retain&&assets?.ready),group:'td2-v6-tower:'+url};
    cache.set(url,entry);diagnostics.requested++;
    const failed=()=>{if(entry.pending||!entry.failed)diagnostics.failed++;entry.pending=false;entry.failed=true;};
    if(entry.viaManager){
      try{
        Promise.resolve(assets.retain(entry.group,[url])).then(()=>{
          entry.pending=false;
          if(assets.status?.(url)==='failed')failed();
        },failed);
      }catch{failed();}
    }else{
      if(typeof Image!=='function'){failed();return entry;}
      entry.img=new Image();entry.img.decoding='async';
      entry.img.onload=async()=>{
        try{
          if(typeof entry.img.decode==='function')await entry.img.decode();
          if(entry.img.naturalWidth>0){entry.pending=false;}else failed();
        }catch{failed();}
      };
      entry.img.onerror=failed;
      entry.img.src=url;
    }
    return entry;
  }
  function drawTower(ctx,kind,x,y,tier){
    if(!enabled||!legacy?.drawTower||!Object.hasOwn(names,kind)){
      return legacy?.drawTower?.(ctx,kind,x,y,tier)||false;
    }
    const url=urlFor(kind,tier);
    const entry=request(url);
    const img=entry&&!entry.failed?(entry.viaManager?assets.ready(url):(!entry.pending?entry.img:null)):null;
    if(img?.naturalWidth>0){
      try{
        const size=112,pivotY=0.9531;
        ctx.save();
        try{ctx.drawImage(img,x-size/2,y+13-size*pivotY,size,size);}finally{ctx.restore();}
        diagnostics.drawn++;return true;
      }catch{/* The legacy renderer is the fallback on failed drawing. */}
    }
    diagnostics.fallbacks++;
    return legacy.drawTower(ctx,kind,x,y,tier);
  }
  globalThis.TD2V6Towers=Object.freeze({enabled,urlFor,getDiagnostics:()=>({...diagnostics,cacheEntries:cache.size,pending:[...cache.values()].filter(v=>v.pending).length})});
  if(enabled&&legacy?.drawTower){
    globalThis.UserStyle2Towers={...legacy,drawTower};
  }
})();
