/* One shared V2 impact texture. Old Canvas effects remain the cold/error/low-mode fallback. */
(()=>{'use strict';
  const url='assets/impacts-v2/runtime.webp?v=impact2';
  const rows={bow:0,cannon:1,mage:2,rift:3,boomerang:4};
  let requested=false,pending=false,retryAt=0;
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
    if(!p||p.reduced||!Object.hasOwn(rows,p.kind)||![p.x,p.y,p.life,p.max].every(Number.isFinite)||p.life<=0||p.max<=0)return false;
    const tier=Math.max(1,Math.min(3,Math.floor(Number(p.level)||1)));
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
  globalThis.Style2ImpactsV2={draw,warm,getDiagnostics:()=>({requested,pending,retryAt})};
})();
