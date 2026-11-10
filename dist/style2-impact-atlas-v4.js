/* Per-family Style-2 V4 hit atlases: 6 chronological frames × 3 tower tiers. */
(()=>{'use strict';
  const kinds=['bow','cannon','mage','rift','boomerang'];
  const entries=new Map();
  const retryDelay=10000;
  const debug=typeof URLSearchParams==='function'&&new URLSearchParams(globalThis.location?.search||'').get('td2Style2Debug')==='1';
  function warm(kind){
    const url=`assets/style2-user-towers-v4/runtime-webp/impact_${kind}_6x3.webp?v=style2-v4`;
    const assets=globalThis.DenkmalAssets;
    if(!assets?.retain||!assets?.ready)return null;
    let entry=entries.get(kind);
    if(entry){
      if(entry.failedAt){
        if(Date.now()-entry.failedAt>=retryDelay){assets.release?.(entry.group);entries.delete(kind);}
        return null;
      }
      const image=assets.ready(url);
      if(image)return image;
      if(assets.status?.(url)==='failed'){
        if(!entry.failedAt)entry.failedAt=Date.now();
        if(Date.now()-entry.failedAt>=retryDelay){assets.release?.(entry.group);entries.delete(kind);}
      }
      return null;
    }
    entry={group:`style2-v4-impact:${kind}`,failedAt:0};entries.set(kind,entry);
    try{Promise.resolve(assets.retain(entry.group,[url])).catch(()=>{entry.failedAt=Date.now();});}
    catch{entry.failedAt=Date.now();}
    return assets.ready(url)||null;
  }
  function draw(ctx,p){
    if(globalThis.V2Expansion?.impact(ctx,p))return true;
    if(!p||p.reduced||!kinds.includes(p.kind)||![p.x,p.y,p.life,p.max].every(Number.isFinite)||p.life<=0||p.max<=0)return false;
    const image=warm(p.kind);
    if(!image?.naturalWidth)return false;
    const tier=Math.max(1,Math.min(3,Math.floor(Number(p.level)||1)));
    const progress=Math.max(0,Math.min(1,1-p.life/p.max));
    const frame=Math.min(5,Math.floor(progress*6));
    const size=76+tier*6;
    ctx.save();
    try{
      ctx.globalAlpha*=Math.min(1,(1-progress)*2);
      ctx.drawImage(image,frame*128,(tier-1)*128,128,128,p.x-size/2,p.y-size/2,size,size);
      return true;
    }catch{if(debug)return false;return false;}finally{ctx.restore();}
  }
  globalThis.Style2ImpactsV4={draw,getDiagnostics:()=>({retained:entries.size,pending:[...entries.keys()].filter(k=>!globalThis.DenkmalAssets?.ready?.(`assets/style2-user-towers-v4/runtime-webp/impact_${k}_6x3.webp?v=style2-v4`)).length})};
})();