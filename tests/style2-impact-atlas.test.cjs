'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
assert(fs.existsSync('dist/style2-impact-atlas.js'),'generated impact atlas renderer must exist');
const source=fs.readFileSync('dist/style2-impact-atlas.js','utf8');
const ready=new Map(),requests=[];
const manager={ready:url=>ready.get(url)||null,retain(group,urls){requests.push({group,urls});return Promise.resolve([]);}};
const box={DenkmalAssets:manager,Date};vm.createContext(box);vm.runInContext(source,box);
const api=box.Style2ImpactsV2;
function context(fail=false){return {globalAlpha:.8,saves:0,restores:0,draws:[],save(){this.saves++;},restore(){this.restores++;},drawImage(...args){this.draws.push(args);if(fail)throw Error('draw failed');}};}
const particle={kind:'cannon',level:3,x:40,y:60,max:.3,life:.3};
assert.equal(api.draw(context(),{...particle,reduced:true}),false,'low mode keeps lightweight effects');
assert.equal(api.draw(context(),{...particle,level:1}),false,'wood cannon must not acquire fire');
assert.equal(api.draw(context(),{...particle,kind:'boomerang',level:2}),false,'plastic boomerang must not acquire steel slash');
assert.equal(requests.length,0);
assert.equal(api.draw(context(),particle),false,'cold atlas uses existing fallback');
for(let i=0;i<20;i++)api.draw(context(),particle);
assert.equal(requests.length,1,'only one retained atlas despite repeated cold frames');
const url=requests[0].urls[0];assert.match(url,/impacts-v2\/runtime.webp\?v=impact2/);
ready.set(url,{naturalWidth:768,naturalHeight:640});
for(const [row,kind]of ['bow','cannon','mage','rift','boomerang'].entries()){
 for(let frame=0;frame<6;frame++){
  const ctx=context();assert.equal(api.draw(ctx,{...particle,kind,life:.3*(1-(frame+.1)/6)}),true);
  assert.deepEqual(ctx.draws[0].slice(1,5),[frame*128,row*128,128,128]);
  assert.equal(ctx.saves,ctx.restores);
 }
}
const broken=context(true);assert.equal(api.draw(broken,particle),false);assert.equal(broken.saves,broken.restores);
for(const change of [{max:0},{life:NaN},{life:0},{x:NaN},{kind:'unknown'}])assert.equal(api.draw(context(),{...particle,...change}),false);
assert.equal(requests.length,1,'one atlas remains bounded and shared');
console.log('V2 impacts: chronological cells, stable anchor, single retained texture, tier/low-mode fallback and draw recovery passed');
