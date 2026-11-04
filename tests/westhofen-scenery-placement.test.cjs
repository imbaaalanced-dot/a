/* Westhofen environment placement regression: safe footprints, asynchronous cache and fallback. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../dist');
const sources=['persisted-state.js','levels.js','westhofen-art.js'];
function makeScene(withImages=true){
 const data=new Map(),drawn=[],images=[];
 const box={Math,localStorage:{getItem:key=>data.get(key)??null,setItem:(key,val)=>data.set(key,val)}};
 let gradients=0;
 const context=new Proxy({drawImage(...args){drawn.push(args)},createRadialGradient(){gradients++;return{addColorStop(){}}},createLinearGradient(){return{addColorStop(){}}}},{get:(obj,key)=>obj[key]??(()=>{})});
 let canvases=0;
 box.document={createElement(){canvases++;return{width:0,height:0,getContext(){return context}};}};
 if(withImages)box.Image=class FakeImage{
  constructor(){this.complete=false;this.naturalWidth=0;this.naturalHeight=0;images.push(this);}
  set src(value){this._src=value;}
  get src(){return this._src;}
 };
 vm.createContext(box);
 for(const name of sources)vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'),box);
 return {box,images,drawn,get canvases(){return canvases},get gradients(){return gradients},ctx:context};
}
const cases=[
 {dx:-825,dy:-420,w:165,h:124},
 {dx:850,dy:-530,w:150,h:112},
 {dx:820,dy:-115,w:152,h:114}
];
const scene=makeScene(),layout=scene.box.DenkmalLevels.levels[7],C=scene.box.DenkmalLevels.center;
for(const item of cases){
 const p={x:C.x+item.dx,y:C.y+item.dy},margin=Math.max(item.w,item.h)*.6+120;
 assert.ok(Math.hypot(item.dx,item.dy)>400,'keep scenery clear of objective');
 assert.ok(layout.paths.every(route=>scene.box.DenkmalLevels.pathDistance(p,route)>margin),'keep scenery clear of enemy route');
 assert.ok(layout.slots.every(slot=>Math.hypot(slot.x-p.x,slot.y-p.y)>margin),'keep scenery clear of tower slots');
}
const art=scene.box.DenkmalWesthofenArt;
art.drawGround(scene.ctx,layout);
assert.equal(scene.images.length,3,'one request per decoration');
assert.equal(scene.canvases,1,'first ground canvas built once');
assert.equal(scene.gradients,2,'two static lantern glows are painted once into the ground cache');
art.drawGround(scene.ctx,layout);
assert.equal(scene.canvases,1,'idle frames keep warm cache');
assert.equal(scene.gradients,2,'no per-frame lantern glow calculations');
for(const image of scene.images){image.complete=true;image.naturalWidth=256;image.naturalHeight=192;image.onload();}
art.drawGround(scene.ctx,layout);
assert.equal(scene.canvases,2,'loaded scenery causes one cache rebuild');
assert.equal(scene.drawn.filter(args=>args[0] instanceof scene.box.Image).length,3,'all safe decorative sprites rendered');
art.drawGround(scene.ctx,layout);
assert.equal(scene.canvases,2,'loaded scene uses warm cache');
assert.equal(scene.drawn.filter(args=>args[0] instanceof scene.box.Image).length,3,'no per-frame sprite paints');
const oldImages=[...scene.images];
const staleCallback=oldImages[0].onload;
art.release();
assert(oldImages.every(image=>image.src===''&&image.onload===null),'leaving level releases decoded decoration references');
art.drawGround(scene.ctx,layout);
assert.equal(scene.images.length,6,'reentering requests a fresh set of scenery images');
assert.equal(scene.canvases,3,'reentering creates a fresh ground cache');
staleCallback();
art.drawGround(scene.ctx,layout);
assert.equal(scene.canvases,3,'late callbacks from the previous level cannot invalidate the new cache');
for(const image of scene.images.slice(3)){image.complete=true;image.naturalWidth=256;image.naturalHeight=192;image.onload();}
art.drawGround(scene.ctx,layout);
assert.equal(scene.canvases,4,'newly loaded sprites rebuild the ground cache once');
const fallback=makeScene();
fallback.box.DenkmalWesthofenArt.drawGround(fallback.ctx,fallback.box.DenkmalLevels.levels[7]);
for(const image of fallback.images)image.onerror();
fallback.box.DenkmalWesthofenArt.drawGround(fallback.ctx,fallback.box.DenkmalLevels.levels[7]);
assert.equal(fallback.canvases,1,'failed SVG resources preserve the existing ground');
assert.equal(fallback.drawn.filter(args=>args[0] instanceof fallback.box.Image).length,0);
const noImage=makeScene(false);
noImage.box.DenkmalWesthofenArt.drawGround(noImage.ctx,noImage.box.DenkmalLevels.levels[7]);
assert.equal(noImage.canvases,1,'without Image API scenery is optional');
console.log('Westhofen scenery placement: 3 safe placements; cache, success and error fallback verified');
