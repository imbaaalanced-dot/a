/* Style 2 Kirchende visual-only regressions: caching and preserved interactions. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'../dist');
let canvases=0,siteRadials=0,rootRadials=0,siteLinear=0,drawn=0;
function context(offscreen=false){
  const state={globalAlpha:1};
  const ctx={
    drawImage(){drawn++;},
    createRadialGradient(){if(offscreen){siteRadials++;}return {addColorStop(){}};},
    createLinearGradient(){if(offscreen)siteLinear++;return {addColorStop(){}};
    }
  };
  return new Proxy(Object.assign(state,ctx),{
    get(obj,key){return key in obj?obj[key]:()=>{};},
    set(obj,key,value){obj[key]=value;return true;}
  });
}
const output=context(),sandbox={
  Math,document:{createElement(tag){
    assert.equal(tag,'canvas','only canvas scratch buffers may be allocated');
    canvases++;const id=canvases;
    return {width:0,height:0,getContext:()=> {
      const c=context(true);
      const oldRadial=c.createRadialGradient;
      c.createRadialGradient=(...args)=>{if(id>1)rootRadials++;return oldRadial(...args);};
      return c;
    }};
  }}
};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'kirchende-art.js'),'utf8'),sandbox,{filename:'kirchende-art.js'});
const art=sandbox.KirchendeArt,center={x:1536,y:1536};
assert.ok(art,'Kirchende renderer must register');
assert.equal(canvases,0,'do not allocate graphics before opening a level');
const before=drawn;
art.drawSite(output,center);
assert.equal(canvases,1,'first site draw creates exactly one cached canvas');
assert.equal(drawn-before,1,'site drawn as one texture');
assert.ok(siteRadials>=1&&siteLinear>=1,'plaza uses static warm dapple and shaded edges');
const firstTrees=drawn;
art.drawScenery(output,center,[],{crowns:false,low:true});
assert.equal(canvases,4,'three cached floor variants used beneath trees');
assert.equal(drawn-firstTrees,11,'each of the eleven trees receives one cheap cached root sprite');
assert.equal(rootRadials,3,'one baked shadow per root variant');
const cached=canvases,images=drawn;
art.drawSite(output,center);
art.drawScenery(output,center,[],{crowns:false,low:false});
assert.equal(canvases,cached,'repeated frames allocate no canvases');
assert.equal(drawn-images,12,'repeat render is one site and eleven root draw calls');
art.drawScenery(output,center,[{x:center.x,y:center.y}],{crowns:true});
assert.equal(canvases,cached,'canopy translucency must not allocate more buffers');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.ok(html.includes('kirchende-art.js?v=v400a6s2p2'),'updated renderer must invalidate browser cache');
const levels=fs.readFileSync(path.join(root,'levels.js'),'utf8');
assert.ok(levels.includes('Kirchende'),'existing Kir­chende level remains available');
console.log('Style 2 Kirchende: baked light, moss, roots, transparency, caching and cache-key checks passed.');
