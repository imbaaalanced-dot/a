/* Optional, preview-only TD2 user-approved Style-2 tower/projectile sprites.
 * Fallbacks remain active until the requested WebP image is fully decoded. */
(()=>{'use strict';
  const kinds=new Set(['bow','cannon','mage','rift','boomerang']);
  const enabled=typeof URLSearchParams==='function'&&new URLSearchParams(globalThis.location?.search||'').get('td2UserTowers')==='1';
  const known=new Set();
  const fallbackImages=new Map();
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
      if(!known.has(url)){
        known.add(url);
        // The preview keeps only visited tower/level variants in this small group.
        void assets.retain('td2-user-towers', [url]);
      }
      return assets.ready(url);
    }
    let entry=fallbackImages.get(url);
    if(!entry){
      if(typeof Image!=='function')return null;
      entry={img:new Image(),ready:false,failed:false};
      fallbackImages.set(url,entry);
      entry.img.decoding='async';
      entry.img.onload=async()=>{
        try{if(typeof entry.img.decode==='function')await entry.img.decode();entry.ready=entry.img.naturalWidth>0;}
        catch{entry.failed=true;}
      };
      entry.img.onerror=()=>{entry.failed=true;};
      entry.img.src=url;
    }
    return entry.ready&&!entry.failed?entry.img:null;
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
  globalThis.UserStyle2Towers={enabled,drawTower,drawProjectile,getDiagnostics:()=>({enabled,debug,...diagnostics,requested:known.size,fallbackLoaded:[...fallbackImages.values()].filter(e=>e.ready).length,fallbackFailed:[...fallbackImages.values()].filter(e=>e.failed).length})};
})();
