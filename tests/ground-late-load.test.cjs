'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'../dist');
function setup(){
 let allocations=0;const requests=[],patterns=[];
 const ctx=new Proxy({drawImage(){},createPattern(img){patterns.push(img);return {};},createRadialGradient(){return {addColorStop(){}};},createLinearGradient(){return {addColorStop(){}};}},{get:(o,k)=>k in o?o[k]:()=>{}});
 class ImageMock{constructor(){this.naturalWidth=this.naturalHeight=256;this.complete=true;}set src(url){this.url=url;requests.push(this);}}
 const box={Math,Promise,Image:ImageMock,document:{createElement(){allocations++;return {width:0,height:0,getContext:()=>ctx};}},localStorage:{getItem(){return null;},setItem(){}}};
 vm.createContext(box);
 for(const file of ['persisted-state.js','levels.js','ground-v3.js','terrain-polish.js','style2-maps.js','hohensyburg-art.js','goethestrasse-art.js','westhofen-art.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),box,{filename:file});
 const draw=level=>{
  const layout={...box.DenkmalLevels.levels[level],center:box.DenkmalLevels.center};
  if(level<=2)box.Style2Maps.draw(ctx,level,{x:0,y:0},3072,3072,layout);
  else if(level<=4)box.DenkmalTerrain.drawGround(ctx,0,0,3072,3072,level);
  else box[{5:'DenkmalHohensyburgArt',6:'DenkmalGoetheArt',7:'DenkmalWesthofenArt'}[level]].drawGround(ctx,layout);
 };
 return {box,requests,patterns,draw,get allocations(){return allocations;}};
}
(async()=>{
 for(let level=1;level<=7;level++){
  const test=setup(),api=test.box.TD2GroundV3,original=JSON.stringify(test.box.DenkmalLevels.levels);
  const pending=api.load();assert.equal(api.revision||0,0,'no material revision before decode');
  test.draw(level);const cold=test.allocations;
  for(let frame=0;frame<12;frame++)test.draw(level);
  assert.equal(test.allocations,cold,'pending material load reuses the fallback');
  for(const img of test.requests)img.onload();
  assert.equal(await pending,true);
  test.draw(level);assert.equal(test.allocations,cold+1,`level ${level} replaces its stale ground once`);
  assert.ok(test.patterns.includes(api.imageFor(level,'base')),`level ${level} paints its decoded V3 base`);
  const warm=test.allocations;
  for(let frame=0;frame<20;frame++)test.draw(level);
  assert.equal(test.allocations,warm,'decoded ground stays cached across frames');
  assert.equal(JSON.stringify(test.box.DenkmalLevels.levels),original,'late loading never mutates layouts');
  await api.load();assert.equal(api.revision,1,'repeated load does not invalidate warm ground');
 }
 for(const succeeded of [false,true]){
  const failed=setup(),pending=failed.box.TD2GroundV3.load();failed.draw(1);const before=failed.allocations;
  failed.requests.forEach((img,i)=>i===0&&succeeded?img.onload():img.onerror());
  assert.equal(await pending,succeeded);failed.draw(1);
  assert.equal(failed.allocations,before+(succeeded?1:0),'partial success refreshes once; total failure keeps the fallback');
  assert.equal(failed.box.TD2GroundV3.revision,succeeded?1:0);
 }
 const test=setup(),terrain=test.box.DenkmalTerrain;
 const first=terrain.load();test.requests[0].onload();
 const again=terrain.load();assert.equal(again,first,'all callers wait for V3 after the legacy base has decoded');
 for(const img of test.requests.slice(1))img.onload();
 assert.equal(await first,true);assert.equal(await again,true);
 console.log('All seven grounds refresh once after delayed decode; warm caches, immutable layouts and concurrent loading passed.');
})().catch(error=>{console.error(error);process.exitCode=1;});
