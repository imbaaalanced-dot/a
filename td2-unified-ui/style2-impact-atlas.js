/* One shared V2 impact texture. Old Canvas effects remain the cold/error/low-mode fallback. */
(()=>{'use strict';
  const url='assets/impacts-v2/runtime.webp?v=impact2';
  const referenceUrl='assets/style2-reference-impacts-v1/runtime.webp?v=reference-1';
  const referenceEnabled=typeof URLSearchParams==='function'&&new URLSearchParams(globalThis.location?.search||'').get('td2ImpactRefresh')==='1';
  const rows={bow:0,cannon:1,mage:2,rift:3,boomerang:4};
  let requested=false,pending=false,retryAt=0;
  let referenceRequested=false,referencePending=false,referenceRetryAt=0;
  function warmReference(){
    const assets=globalThis.DenkmalAssets;
    if(!assets?.retain||!assets?.ready)return null;
    if(referenceRequested){const image=assets.ready(referenceUrl);if(image)return image;}
    if(referencePending||Date.now()<referenceRetryAt)return null;
    referenceRequested=true;referencePending=true;
    try{Promise.resolve(assets.retain('style2-reference-impacts-v1',[referenceUrl])).then(()=>{
      referencePending=false;referenceRetryAt=assets.ready(referenceUrl)?0:Date.now()+10000;
    },()=>{referencePending=false;referenceRetryAt=Date.now()+10000;});}
    catch{referencePending=false;referenceRetryAt=Date.now()+10000;}
    return assets.ready(referenceUrl)||null;
  }
  function warm(){
    const assets=globalThis.DenkmalAssets;
    if(!assets?.retain||!assets?.ready)return null;
    if(requested){const image=assets.ready(url);if(image)return image;}
    if(pending||Date.now()<retryAt)return null;
    requested=true;pending=true;
    try{Promise.resolve(assets.retain('style2-impacts-v2',[url])).then(()=>{
      pending=false;retryAt=assets.ready(url)?0:Date.now()+10000;
    },()=>{pending=false;retryAt=Date.now()+10000;});}
    catch{pending=false;retryAt=Date.now()+10000;}
    return assets.ready(url)||null;
  }
  function draw(ctx,p){
    if(globalThis.V2Expansion?.impact(ctx,p))return true;
    if(!p||p.reduced||!Object.hasOwn(rows,p.kind)||![p.x,p.y,p.life,p.max].every(Number.isFinite)||p.life<=0||p.max<=0)return false;
    const tier=Math.max(1,Math.min(3,Math.floor(Number(p.level)||1)));
    if(referenceEnabled&&(p.kind==='mage'||p.kind==='boomerang'&&tier===3)){
      const reference=warmReference();
      if(reference?.naturalWidth){
        const progress=Math.max(0,Math.min(1,1-p.life/p.max));
        const frame=Math.min(5,Math.floor(progress*6));
        const size=(p.kind==='mage'?62:72)+tier*9;
        const row=p.kind==='mage'?0:1;
        ctx.save();try{
          ctx.globalAlpha*=Math.min(1,(1-progress)*2);
          ctx.drawImage(reference,frame*128,row*128,128,128,p.x-size*.5,p.y-size*(218/256),size,size);
          return true;
        }catch{return false;}finally{ctx.restore();}
      }
    }
    // The generated cannon/sawblade rows depict the explosive/steel third upgrade.
    if((p.kind==='cannon'||p.kind==='boomerang')&&tier<3)return false;
    const image=warm();if(!image?.naturalWidth)return false;
    const progress=Math.max(0,Math.min(1,1-p.life/p.max));
    const frame=Math.min(5,Math.floor(progress*6));
    const size=(p.kind==='bow'?40:60)+tier*12;
    ctx.save();try{
      ctx.globalAlpha*=Math.min(1,(1-progress)*2);
      ctx.drawImage(image,frame*128,rows[p.kind]*128,128,128,p.x-size*.5,p.y-size*(174/256),size,size);
      return true;
    }catch{return false;}finally{ctx.restore();}
  }
  globalThis.Style2ImpactsV2={draw,warm,getDiagnostics:()=>({requested,pending,retryAt,referenceEnabled,referenceRequested,referencePending,referenceRetryAt})};
})();
