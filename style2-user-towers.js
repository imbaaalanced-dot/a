/* User-approved Style-2 tower/projectile sprites.
 * Fallbacks remain active until the requested WebP image is fully decoded. */
(()=>{'use strict';
  const kinds=new Set(['bow','cannon','mage','rift','boomerang']);
  const enabled=typeof URLSearchParams==='function'&&new URLSearchParams(globalThis.location?.search||'').get('td2UserTowers')!=='0';
  // The normal game has DenkmalAssets; standalone previews use Image.
  // BOTH paths must stay bounded instead of retaining every variant visited.
  const known=new Map();
  const fallbackImages=new Map();
  const cacheLimit=12;
  const maxConcurrentLoads=4;
  const retryDelayMs=10000;
  const diagnostics={towerFallbacks:0,projectileFallbacks:0,drawErrors:0};
  const debug=typeof URLSearchParams==='function'&&new URLSearchParams(globalThis.location?.search||'').get('td2Style2Debug')==='1';
  const level=n=>Math.max(1,Math.min(3,Math.floor(Number(n)||1)));
  const cleanupOverrides=new Set(['tower_cannon_lv1','projectile_mage_lv2']);
  const cleanupPass3=new Set(['tower_bow_lv1','tower_bow_lv2','tower_bow_lv3','tower_cannon_lv2','tower_cannon_lv3','tower_mage_lv1','tower_mage_lv2','tower_mage_lv3','tower_boomerang_lv1','tower_boomerang_lv2','tower_boomerang_lv3']);
  function get(kind,tier,type){
    if(!enabled||!kinds.has(kind))return null;
    const id=`${type}_${kind}_lv${level(tier)}`;
    const version=cleanupPass3.has(id)?3:cleanupOverrides.has(id)?2:1;
    const url=`assets/style2-user-towers-v${version}/runtime-webp/${type}s/${id}.webp?v=${version===1?'user-towers-1':'cleanup-'+version}`;
    const assets=globalThis.DenkmalAssets;
    if(assets?.retain&&assets?.ready){
      let current=known.get(url);
      if(current){
        const status=assets.status?.(url);
        if(status==='failed'){
          if(!current.failedAt)current.failedAt=Date.now();
          current.loading=false;
          if(Date.now()-current.failedAt>=retryDelayMs){
            assets.release?.(current.group);
            known.delete(url);
          }
          return null;
        }
        const img=assets.ready(url);
        if(img){
          current.loading=false;
          // LRU: keep recently drawn variants decoded.
          known.delete(url);known.set(url,current);
        }
        return img||null;
      }
      // Never evict a pending image, which could restart requests every frame.
      if([...known.values()].filter(e=>e.loading).length>=maxConcurrentLoads)return null;
      if(known.size>=cacheLimit){
        const victim=[...known].find(([,e])=>!e.loading);
        if(!victim)return null;
        known.delete(victim[0]);
        assets.release?.(victim[1].group);
      }
      // Independently releasable group per sprite, not an ever-growing group.
      current={group:'td2-user-tower:'+url,loading:true,failedAt:0};
      known.set(url,current);
      try{
        Promise.resolve(assets.retain(current.group,[url])).then(
          ()=>{current.loading=false;},
          ()=>{current.loading=false;current.failedAt=Date.now();}
        );
      }catch{current.loading=false;current.failedAt=Date.now();}
      return assets.ready(url)||null;
    }
    let entry=fallbackImages.get(url);
    if(!entry){
      if(typeof Image!=='function')return null;
      // Do not evict in-flight requests: doing so can restart downloads every frame.
      const loading=[...fallbackImages.values()].filter(e=>!e.ready&&!e.failed).length;
      if(loading>=maxConcurrentLoads)return null;
      if(fallbackImages.size>=cacheLimit){
        const evict=[...fallbackImages].find(([,e])=>e.ready||e.failed);
        if(!evict)return null;
        fallbackImages.delete(evict[0]);
      }
      entry={img:new Image(),ready:false,failed:false,failedAt:0};
      fallbackImages.set(url,entry);
      entry.img.decoding='async';
      entry.img.onload=async()=>{
        try{if(typeof entry.img.decode==='function')await entry.img.decode();if(entry.img.naturalWidth>0)entry.ready=true;else{entry.failed=true;entry.failedAt=Date.now();}}
        catch{entry.failed=true;entry.failedAt=Date.now();}
      };
      entry.img.onerror=()=>{entry.failed=true;entry.failedAt=Date.now();};
      entry.img.src=url;
    }
    if(entry.failed&&Date.now()-entry.failedAt>=retryDelayMs){
      fallbackImages.delete(url);
      return null; // Next request retries; legacy drawing remains available.
    }
    if(entry.ready&&!entry.failed){
      // LRU: keep recently drawn variants warm during frequent tower switching.
      fallbackImages.delete(url);
      fallbackImages.set(url,entry);
      return entry.img;
    }
    return null;
  }
  function drawTower(ctx,kind,x,y,tier){
    const img=get(kind,tier,'tower');
    // Warm only this visible variant, not the full 18.75 MiB decoded pack.
    get(kind,tier,'projectile');
    if(!img){if(debug)diagnostics.towerFallbacks++;return false;}
    const size=112,pivotY=488/512;
    ctx.save();try{ctx.drawImage(img,x-size/2,y+13-size*pivotY,size,size);}catch{if(debug)diagnostics.drawErrors++;return false;}finally{ctx.restore();}
    return true;
  }
  function drawProjectile(ctx,b,now=0){
    if(!b)return false;
    const img=get(b.kind,b.level,'projectile');if(!img){if(debug)diagnostics.projectileFallbacks++;return false;}
    const tier=level(b.level),size=[52,60,68][tier-1];
    // Match each elongated source sprite's axis before applying velocity.
    const sourceHeading=b.kind==='bow'?Math.PI/6:
      tier<3&&(b.kind==='mage'||b.kind==='rift')?-Math.PI/4:0;
    const angle=b.kind==='boomerang'?now*13:Math.atan2(b.vy??0,b.vx??1)-sourceHeading;
    ctx.save();try{ctx.translate(b.x,b.y);ctx.rotate(angle);ctx.drawImage(img,-size/2,-size/2,size,size);}catch{if(debug)diagnostics.drawErrors++;return false;}finally{ctx.restore();}
    return true;
  }
  // Pass 4: tiny, self-contained Canvas impacts. No textures, downloads or timers.
  // Gameplay's existing hit position, velocity, damage and particle cap are unchanged.
  function drawImpact(ctx,p){
    if(!enabled||!p||!kinds.has(p.kind))return false;
    const max=Number(p.max),life=Number(p.life);
    if(!(max>0)||!Number.isFinite(life))return false;
    const t=Math.max(0,Math.min(1,1-life/max)),fade=1-t;
    const tier=level(p.level),reduced=!!p.reduced,turn=Math.PI*2;
    const radius=(reduced?8:12)+tier*3+t*(reduced?12:24);
    ctx.save();
    try{
      ctx.translate(p.x,p.y);
      ctx.globalAlpha*=fade;
      ctx.lineCap='round';
      ctx.shadowBlur=reduced?0:8;
      const arc=(r,a,b)=>{ctx.beginPath();ctx.arc(0,0,r,a,b);ctx.stroke();};
      if(p.kind==='cannon'){
        ctx.strokeStyle='#dba86b';ctx.lineWidth=reduced?2:4;
        arc(radius,0,turn);
        if(!reduced){
          ctx.strokeStyle='#766c60';ctx.lineWidth=3;
          arc(radius*.66,0,turn);
          ctx.fillStyle='#f5dfb0';
          for(let i=0;i<5;i++){
            const a=i*turn/5+t*.6,r=radius*.8;
            ctx.beginPath();ctx.arc(Math.cos(a)*r,Math.sin(a)*r,1.5+tier*.25,0,turn);ctx.fill();
          }
        }
      }else if(p.kind==='bow'){
        ctx.strokeStyle='#efc781';ctx.lineWidth=1.5+tier*.3;
        const n=reduced?3:5;
        for(let i=0;i<n;i++){
          const a=i*turn/n-.3;
          ctx.beginPath();ctx.moveTo(Math.cos(a)*radius*.42,Math.sin(a)*radius*.42);
          ctx.lineTo(Math.cos(a)*(radius+4),Math.sin(a)*(radius+4));ctx.stroke();
        }
        ctx.strokeStyle='#fff0cb';ctx.lineWidth=1.5;
        arc(radius*.35,0,turn);
      }else if(p.kind==='mage'){
        ctx.strokeStyle='#9ce8ff';ctx.lineWidth=2+tier*.2;
        arc(radius*.72,Math.PI*.18,Math.PI*1.82);
        ctx.strokeStyle='#e3fbff';ctx.lineWidth=1.5;
        const n=reduced?3:6;
        for(let i=0;i<n;i++){
          const a=i*turn/n+t*.18,r=radius*.7;
          const x=Math.cos(a)*r,y=Math.sin(a)*r;
          ctx.beginPath();ctx.moveTo(x-3,y-5);ctx.lineTo(x+3,y);ctx.lineTo(x-2,y+5);ctx.stroke();
        }
      }else if(p.kind==='rift'){
        // Intentional violet Rift energy, never a chroma-key or alpha cleanup.
        ctx.shadowColor='#a85aff';ctx.strokeStyle='#b77aff';ctx.lineWidth=2+tier*.3;
        arc(radius,-Math.PI*.78,Math.PI*.24);
        ctx.strokeStyle='#e9c9ff';ctx.lineWidth=1.5;
        arc(radius*.65,Math.PI*.3,Math.PI*1.5);
        if(!reduced){
          const n=3+tier;
          for(let i=0;i<n;i++){
            const a=i*turn/n+t*.9;
            ctx.beginPath();ctx.moveTo(Math.cos(a)*radius*.35,Math.sin(a)*radius*.35);
            ctx.lineTo(Math.cos(a)*radius*1.1,Math.sin(a)*radius*1.1);ctx.stroke();
          }
        }
      }else if(p.kind==='boomerang'){
        ctx.strokeStyle=tier===3?'#e0e5e6':tier===2?'#f2a968':'#d6ba88';
        ctx.lineWidth=reduced?2:3+tier*.4;
        arc(radius,-Math.PI*.75+t*2,Math.PI*.20+t*2);
        if(!reduced){
          ctx.strokeStyle=tier===3?'#9ba9b0':'#8b6650';ctx.lineWidth=2;
          arc(radius*.74,Math.PI*.28+t*2,Math.PI*1.07+t*2);
        }
      }
      return true;
    }catch{
      if(debug)diagnostics.drawErrors++;
      return false;
    }finally{ctx.restore();}
  }
  globalThis.UserStyle2Towers={enabled,drawTower,drawProjectile,drawImpact,getDiagnostics:()=>({enabled,debug,...diagnostics,requested:known.size,managerPending:[...known.values()].filter(e=>e.loading).length,fallbackLoaded:[...fallbackImages.values()].filter(e=>e.ready).length,fallbackFailed:[...fallbackImages.values()].filter(e=>e.failed).length})};
})();
