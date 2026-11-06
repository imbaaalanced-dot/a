/* Alpha 9 image registry. Decoded images stay stable until all owning groups release them. */
(()=>{'use strict';
  const entries=new Map(), groups=new Map();
  const levelAssets={
    1:['assets/monument-level1-v2.webp'],
    2:[],
    3:['assets/kirchende/monument-photo-v2.webp?v=v400a5photo2'],
    4:['assets/church-ende-alpha8.webp?v=alpha8a2','assets/lion-ende-alpha8.webp?v=alpha8a2'],
    5:['assets/hohensyburg/kaiser-wilhelm-v1.webp?v=syburg3'],
    6:['assets/elemental/goethestrasse-memorial-v1.webp?v=goethe1']
  };
  const common=['assets/scenery-alpha8.webp?v=alpha8a2','assets/enemies/walk-v1.webp?v=enemymove1'];
  function entry(url){
    const old=entries.get(url);
    if(old?.status==='failed'&&Date.now()-old.failedAt>5000)entries.delete(url);
    else if(old)return old;
    const img=new Image();img.decoding='async';
    const current={img,status:'loading',promise:null,url};
    current.promise=new Promise(resolve=>{
      let settled=false;
      const finish=ok=>{
        if(settled)return;settled=true;
        current.status=ok?'ready':'failed';if(!ok)current.failedAt=Date.now();
        resolve(ok?img:null);
        if(current.releaseWhenReady&&!isOwned(url))evict(url,current);
      };
      img.onload=async()=>{
        if(!img.naturalWidth){finish(false);return;}
        try{if(typeof img.decode==='function')await img.decode();finish(img.naturalWidth>0);}
        catch{finish(false);}
      };
      img.onerror=()=>finish(false);
      img.src=url;
      if(img.complete&&img.naturalWidth)img.onload();
    });
    entries.set(url,current);return current;
  }
  function get(url){return entry(url).img;}
  function ready(url){const current=entry(url);return current.status==='ready'?current.img:null;}
  function load(url){return entry(url).promise;}
  function isOwned(url){for(const urls of groups.values())if(urls.has(url))return true;return false;}
  function evict(url,value){value.img.onload=null;value.img.onerror=null;value.img.src='';entries.delete(url);}
  function retain(group,urls){
    const owned=groups.get(group)||new Set();
    for(const url of urls){owned.add(url);entry(url);}
    groups.set(group,owned);
    return Promise.all([...owned].map(load));
  }
  function release(group){
    const released=groups.get(group);
    groups.delete(group);
    if(!released)return;
    for(const url of released){
      if(isOwned(url))continue;
      const value=entries.get(url);if(!value)continue;
      if(value.status==='loading'){value.releaseWhenReady=true;continue;}
      evict(url,value);
    }
  }
  function level(n){return retain('level:'+n,[...common,...(levelAssets[n]||[])]);}
  function next(n){return n<6?level(n+1):Promise.resolve([]);}
  function status(url){return entries.get(url)?.status||'unrequested';}
  globalThis.DenkmalAssets={get,ready,load,retain,release,level,next,status,levelAssets};
})();
