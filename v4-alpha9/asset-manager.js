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
      img.onload=()=>{current.status=img.naturalWidth>0?'ready':'failed';if(current.status==='failed')current.failedAt=Date.now();resolve(current.status==='ready'?img:null);};
      img.onerror=()=>{current.status='failed';current.failedAt=Date.now();resolve(null);};
      img.src=url;
      if(img.complete&&img.naturalWidth){current.status='ready';resolve(img);}
    });
    entries.set(url,current);return current;
  }
  function get(url){return entry(url).img;}
  function load(url){return entry(url).promise;}
  function retain(group,urls){
    const owned=groups.get(group)||new Set();
    for(const url of urls){owned.add(url);entry(url);}
    groups.set(group,owned);
    return Promise.all([...owned].map(load));
  }
  function release(group){
    groups.delete(group);
    const used=new Set([...groups.values()].flatMap(set=>[...set]));
    for(const [url,value] of entries){
      if(used.has(url)||value.status==='loading')continue;
      value.img.onload=null;value.img.onerror=null;value.img.src='';entries.delete(url);
    }
  }
  function level(n){return retain('level:'+n,[...common,...(levelAssets[n]||[])]);}
  function next(n){return n<6?level(n+1):Promise.resolve([]);}
  function status(url){return entries.get(url)?.status||'unrequested';}
  globalThis.DenkmalAssets={get,load,retain,release,level,next,status,levelAssets};
})();
