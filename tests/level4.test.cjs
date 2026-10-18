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
let canvases=0,drawn=0,lionDate=false,style2Radials=0;
const imageCalls=[];
const ctx=new Proxy({
  drawImage(...args){drawn++;imageCalls.push(args);},
  fillText(t){if(t==='1879')lionDate=true;},
  createRadialGradient(){style2Radials++;return {addColorStop(){}};},
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
assert.ok(level.slots.length>=10,'churchyard needs at least ten accessible build plots');
const f=level.churchFootprint;
assert.ok(f&&f.top<0&&f.bottom<0&&f.left<0,'church footprint must be west/north of lion');
assert.equal(f.left,-415);assert.equal(f.bottom,-290);
function rectClearance(p){
  const x=p.x-c.x,y=p.y-c.y;
  return Math.hypot(Math.max(f.left-x,0,x-f.right),Math.max(f.top-y,0,y-f.bottom));
}
for(const [index,route] of level.paths.entries()){
  assert.ok(route.length>=4,'lane '+index+' has authored bends');
  assert.equal(route[0].x,level.gates[index].x);assert.equal(route[0].y,level.gates[index].y);
  assert.equal(route.at(-1).x,c.x,'every lane ends at the lion');
  assert.equal(route.at(-1).y,c.y,'every lane ends at the lion');
  for(const [i,begin] of route.slice(0,-1).entries()){
    const end=route[i+1];for(let step=0;step<=100;step++){
      const t=step/100;
      const p={x:begin.x+(end.x-begin.x)*t,y:begin.y+(end.y-begin.y)*t};
      assert.ok(rectClearance(p)>=48,'cobbled route must keep a 48px clearance from the church');
    }
  }
}
for(const pad of level.slots){
  for(const route of level.paths)
    assert.ok(campaign.pathDistance(pad,route)>=84,'tower pads never overlap cobbles');
  assert.ok(Math.hypot(pad.x-c.x,pad.y-c.y)>=165,'protect the lion plinth');
  assert.ok(rectClearance(pad)>=40,'church and 40px wall buffer may not host a tower');
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
const churchDraw=imageCalls.find(args=>args.length===5&&args[3]===720&&args[4]===760);
assert.ok(churchDraw,'church must be drawn from its cached bitmap at new proportions');
assert.equal(churchDraw[1],-500);
assert.equal(churchDraw[2],-930);
assert.ok(churchDraw[2]+churchDraw[4]<-150,'church must leave a clear forecourt before the lion');
const lionDraw=imageCalls.find(args=>args.length===5&&args[1]===c.x-128&&args[2]===c.y-293&&args[3]===256&&args[4]===304);
assert.ok(lionDraw,'detailed memorial art must render at the exact combat objective');
assert.ok(lionDate,'sleeping lion honors the 1879 memorial, not the 1927 memorial');
assert.ok(style2Radials>=1,'Style 2 paving should bake warm light during canvas creation');
const n=canvases;
art.drawBackdrop(ctx,c);art.drawSite(ctx,c);art.drawCanopies(ctx,c,[]);
art.drawLion(ctx,{...c,hp:300,maxHp:500});
assert.equal(canvases,n,'building, paving and lion canvases must all be reused');
assert.ok(drawn>=4,'both cached scenery layers must render');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const game=fs.readFileSync(path.join(root,'game.js'),'utf8');
for(const id of ['level4Btn','endless4Btn'])
  assert.match(html,new RegExp('id="'+id+'"'),'new chapter navigation must be reachable');
assert.ok(html.includes('church-art.js?v=v400a6lionsouth1'));
assert.ok(html.includes('kirchende-art.js?v=v400a6s2polish5'))
assert.ok(game.includes('campaign.completeLevel4()'),'wave 16 persists completion');
assert.ok(game.includes("game.level===4&&game.wave===16"),'wave 16 ends the campaign');
assert.ok(game.includes('DenkmalChurch?.drawLion'),'lion is the combat objective');
assert.ok(game.includes('DenkmalChurch?.drawBackdrop'),'churchyard backdrop is rendered');
assert.ok(game.includes('DenkmalChurch?.drawCanopies'),'tree overlap uses separate scenery layer');
assert.ok(game.includes('function churchBlocks(x,y,r=13)'),'church must block the hero');
assert.ok(game.includes('!churchBlocks(nx,h.y,h.r)'),'movement must stop before the masonry');
assert.ok(art.churchFrame&&art.churchFrame.x===-500,'church positioning must be exported for review');
console.log('Level 4 paths, build pads, wave gates, saved unlock and cached church/lion artwork passed.');
// Aerial-reference correction: north access uses the east side of the church,
// while both village-road entries originate south of the churchyard.
assert.equal(level.gateLabels[0],'IN DEN EICHEN');
assert.ok(level.gates[0].x>c.x+f.right+48);
assert.ok(level.gates[0].y<c.y+f.top);
for(const i of [1,2])assert.ok(level.gates[i].y>c.y+400);
for(const p of level.paths[0])if(p.y<c.y+f.bottom)assert.ok(p.x>c.x+f.right+48,'northern access stays east of church');
