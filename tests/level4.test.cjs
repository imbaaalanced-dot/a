'use strict';
// Level 4: geometry, historic-art separation, cache reuse and unlock persistence.
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'../dist');
const data=new Map(),writes=[];
const localStorage={
  getItem(k){return data.get(k)||null;},
  setItem(k,v){writes.push([k,v]);data.set(k,v);}
};
let canvases=0,drawn=0,lionDate=false;
const ctx=new Proxy({
  drawImage(){drawn++;},
  fillText(t){if(t==='1879')lionDate=true;},
  createRadialGradient(){return {addColorStop(){}};},
  createLinearGradient(){return {addColorStop(){}};}
},{get:(obj,key)=>key in obj?obj[key]:()=>{}});
const sandbox={
  Math,localStorage,console,
  document:{createElement(tag){
    assert.equal(tag,'canvas');
    canvases++;return {width:0,height:0,getContext:()=>ctx};
  }}
};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'levels.js'),'utf8'),sandbox);
const campaign=sandbox.DenkmalLevels,level=campaign.levels[4],c=campaign.center;
assert.ok(level&&level.approximate,'Level 4 should be marked as illustrative');
assert.match(level.name,/LÖWE/);
assert.equal(level.firstWave,13);assert.equal(level.lastWave,16);
assert.equal(level.startEssence,245);assert.equal(level.maxTowers,10);
assert.equal(level.gates.length,4);assert.equal(level.paths.length,4);
assert.ok(level.slots.length>=6,'churchyard needs accessible build plots');
for(const [index,route] of level.paths.entries()){
  assert.ok(route.length>=4,'lane '+index+' has authored bends');
  assert.equal(route[0].x,level.gates[index].x);assert.equal(route[0].y,level.gates[index].y);
  assert.equal(route.at(-1).x,c.x,'every lane ends at the lion');
  assert.equal(route.at(-1).y,c.y,'every lane ends at the lion');
}
for(const pad of level.slots){
  for(const route of level.paths)
    assert.ok(campaign.pathDistance(pad,route)>=84,'tower pads never overlap cobbles');
  assert.ok(Math.hypot(pad.x-c.x,pad.y-c.y)>=165,'protect the lion plinth');
  assert.ok(!(pad.x>c.x+70&&pad.x<c.x+690&&pad.y>c.y-750&&pad.y<c.y+30),
    'church footprint never serves as a tower pad');
}
assert.deepEqual(Array.from(campaign.getWaveGates(4,13)),[0,1]);
assert.deepEqual(Array.from(campaign.getWaveGates(4,14)),[0,1,2]);
assert.deepEqual(Array.from(campaign.getWaveGates(4,15)),[0,1,2,3]);
assert.equal(campaign.level4Completed,false,'fresh account has no chapter 4 clear');
assert.equal(campaign.completeLevel4(),true);
assert.equal(campaign.level4Completed,true);
assert.equal(localStorage.getItem('denkmal-level4-completed-v1'),'true');
assert.ok(writes.length>0,'completion is durable across browser sessions');
vm.runInContext(fs.readFileSync(path.join(root,'church-art.js'),'utf8'),sandbox);
const art=sandbox.DenkmalChurch;
art.drawGround(ctx,{x:c.x-400,y:c.y-400},800,800);
art.drawBackdrop(ctx,c);
art.drawSite(ctx,c);
art.drawCanopies(ctx,c,[]);
art.drawLion(ctx,{...c,hp:500,maxHp:500});
assert.ok(lionDate,'sleeping lion honors the 1879 memorial, not the 1927 memorial');
const n=canvases;
art.drawBackdrop(ctx,c);art.drawSite(ctx,c);art.drawCanopies(ctx,c,[]);
assert.equal(canvases,n,'building and paving canvases must be reused');
assert.ok(drawn>=4,'both cached scenery layers must render');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const game=fs.readFileSync(path.join(root,'game.js'),'utf8');
for(const id of ['level4Btn','endless4Btn'])
  assert.match(html,new RegExp('id="'+id+'"'),'new chapter navigation must be reachable');
assert.ok(html.includes('church-art.js?v=v400a6church1'));
assert.ok(game.includes('campaign.completeLevel4()'),'wave 16 persists completion');
assert.ok(game.includes("game.level===4&&game.wave===16"),'wave 16 ends the campaign');
assert.ok(game.includes('DenkmalChurch?.drawLion'),'lion is the combat objective');
assert.ok(game.includes('DenkmalChurch?.drawBackdrop'),'churchyard backdrop is rendered');
assert.ok(game.includes('DenkmalChurch?.drawCanopies'),'tree overlap uses separate scenery layer');
console.log('Level 4 paths, build pads, wave gates, saved unlock and cached church/lion artwork passed.');
