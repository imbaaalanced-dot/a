/* Denkmal TD2 V4 Style 2 layered map renderer. Procedural art remains the fallback. */
(() => {
  'use strict';

  const WORLD_SIZE=3072;
  const MOBILE_TEXTURE_LIMIT=2048;
  const REQUIRED_PASSES=['ground','paths','decor-back','decor-front'];
  const records=new Map();

  function deepFreeze(value){
    if(!value||typeof value!=='object'||Object.isFrozen(value))return value;
    Object.freeze(value);for(const child of Object.values(value))deepFreeze(child);return value;
  }

  function validManifest(data,level){
    if(!data||data.id!==`level-${level}`||data.version!=='v4-style2-1')return false;
    if(data.world?.width!==WORLD_SIZE||data.world?.height!==WORLD_SIZE)return false;
    if(data.gameplay?.level!==level||data.gameplay.paths!==`DenkmalLevels.levels[${level}].paths`||data.gameplay.slots!==`DenkmalLevels.levels[${level}].slots`||data.gameplay.objective!=='game.monument')return false;
    if(!Array.isArray(data.layers)||data.layers.length!==REQUIRED_PASSES.length)return false;
    const ordered=[...data.layers].sort((a,b)=>a.order-b.order);
    return ordered.every((layer,index)=>layer?.id===REQUIRED_PASSES[index]&&layer.pass===REQUIRED_PASSES[index]&&layer.order===index&&/\.webp$/.test(layer.desktop||'')&&/\.webp$/.test(layer.mobile||''));
  }

  function deadline(promise,timeoutMs){
    let timer;
    return Promise.race([
      promise,
      new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('map load timeout')),timeoutMs);})
    ]).finally(()=>clearTimeout(timer));
  }

  function decode(src,mobile){
    return new Promise((resolve,reject)=>{
      const image=new Image();
      image.decoding='async';
      image.onload=()=>{
        if(!image.naturalWidth||!image.naturalHeight)return reject(new Error('empty map image'));
        if(mobile&&(image.naturalWidth>MOBILE_TEXTURE_LIMIT||image.naturalHeight>MOBILE_TEXTURE_LIMIT))return reject(new Error('oversized mobile map image'));
        resolve(image);
      };
      image.onerror=()=>reject(new Error('map image decode failed'));
      image.src=src;
      if(image.complete&&image.naturalWidth)image.onload();
    });
  }

  async function load(level,options={}){
    level=Number(level);if(![1,2,3,4].includes(level))return false;
    const mobile=!!options.mobile,timeoutMs=Math.max(1,Number(options.timeoutMs)||8000);
    const current=records.get(level);
    if(current?.ready&&current.mobile===mobile)return true;
    const record={level,mobile,ready:false,manifest:null,layers:[],token:{}};
    records.set(level,record);
    try{
      const work=(async()=>{
        const response=await fetch(`assets/maps/level-${level}/map.json?v=v4style2-1-video1`);
        if(!response?.ok)throw new Error(`map manifest HTTP ${response?.status||0}`);
        const parsed=await response.json();
        if(!validManifest(parsed,level))throw new Error('invalid map manifest');
        const frozen=deepFreeze(parsed);
        const ordered=[...frozen.layers].sort((a,b)=>a.order-b.order);
        const layers=await Promise.all(ordered.map(async layer=>{
          const file=mobile?layer.mobile:layer.desktop;
          const image=await decode(`assets/maps/level-${level}/${file}${frozen.revision?"?v="+encodeURIComponent(frozen.revision):""}`,mobile);
          return {definition:layer,image};
        }));
        if(records.get(level)!==record)throw new Error('map load superseded');
        record.manifest=frozen;record.layers=layers;record.ready=true;return true;
      })();
      return await deadline(work,timeoutMs);
    }catch{
      if(records.get(level)===record){record.ready=false;record.manifest=null;record.layers=[];}
      return false;
    }
  }

  function ready(level){return records.get(Number(level))?.ready===true;}
  function manifest(level){return records.get(Number(level))?.manifest||null;}

  function draw(ctx,level,pass,view={}){
    const record=records.get(Number(level));if(!ctx||!record?.ready)return false;
    const layer=record.layers.find(item=>item.definition.pass===pass);if(!layer)return false;
    const world=record.manifest.world;
    ctx.save();
    if(pass==='decor-front'&&view.actorNear)ctx.globalAlpha=Math.max(.22,Number(layer.definition.actorNearOpacity)||.22);
    ctx.drawImage(layer.image,0,0,layer.image.naturalWidth,layer.image.naturalHeight,0,0,world.width,world.height);
    ctx.restore();return true;
  }

  function drawDebug(ctx,level,definition){
    const data=manifest(level);if(!ctx||!data||!definition)return;
    ctx.save();ctx.lineWidth=8;ctx.setLineDash?.([20,12]);ctx.strokeStyle='#65e7ffcc';
    for(const path of definition.paths||[]){ctx.beginPath();for(const [index,point] of path.entries())index?ctx.lineTo(point.x,point.y):ctx.moveTo(point.x,point.y);ctx.stroke();}
    ctx.setLineDash?.([]);ctx.lineWidth=6;
    ctx.strokeStyle='#77ff86dd';for(const slot of definition.slots||[]){ctx.beginPath();ctx.arc(slot.x,slot.y,32,0,Math.PI*2);ctx.stroke();}
    ctx.strokeStyle='#ffcf66dd';for(const gate of definition.gates||[]){ctx.beginPath();ctx.arc(gate.x,gate.y,48,0,Math.PI*2);ctx.stroke();}
    ctx.strokeStyle='#ff6688dd';for(const structure of data.structures||[]){const b=structure.bounds;if(b)ctx.strokeRect(b.left,b.top,b.right-b.left,b.bottom-b.top);}
    ctx.strokeStyle='#ffffffdd';ctx.beginPath();ctx.arc(WORLD_SIZE/2,WORLD_SIZE/2,58,0,Math.PI*2);ctx.stroke();ctx.restore();
  }

  function unloadExcept(level){
    level=Number(level);for(const key of [...records.keys()])if(key!==level)records.delete(key);
  }

  globalThis.DenkmalMapArt={load,ready,draw,drawDebug,unloadExcept,manifest};
})();
