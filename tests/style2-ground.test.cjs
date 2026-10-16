'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let allocations=0,downloads=0,patterns=0,copies=[];
const ctx=new Proxy({drawImage(...args){copies.push(args);},createPattern(){patterns++;return {};},createRadialGradient(){return {addColorStop(){}};},createLinearGradient(){return {addColorStop(){}};}},{get:(o,k)=>k in o?o[k]:()=>{}});
const box={Math,Image:class{constructor(){downloads++;}},document:{createElement(){allocations++;return {width:0,height:0,getContext:()=>ctx};}}};
vm.createContext(box);vm.runInContext(fs.readFileSync('dist/terrain-polish.js','utf8'),box);
assert.equal(downloads,0,'illustrated ground must not download the repetitive photograph');
box.DenkmalTerrain.drawGround(ctx,100,200,600,800);
assert.equal(allocations,1,'one world atlas is built lazily');
assert.equal(patterns,0,'ground is a world painting, never a repeated photo pattern');
assert.deepEqual(copies.at(-1).slice(1),[50,100,300,400,100,200,600,800]);
const count=allocations;
for(let i=0;i<20;i++)box.DenkmalTerrain.drawGround(ctx,100+i,200,600,800);
assert.equal(allocations,count,'moving camera reuses the painted atlas');
console.log('Style 2 ground: no photo download, non-repeating atlas, clipped view and warm-cache reuse passed.');

for(const file of ['preloader.js','game.js'])assert.ok(!fs.readFileSync('dist/'+file,'utf8').includes(file==='preloader.js'?'ground-photo-v2.webp':'DenkmalTerrain?.load'),'normal play no longer downloads the old ground photo');
