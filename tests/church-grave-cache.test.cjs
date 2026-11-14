'use strict';
const assert=require('node:assert/strict');
const {createRenderSandbox}=require('./helpers/render-sandbox.cjs');
const {sandbox}=createRenderSandbox(),church=sandbox.DenkmalChurch;
const snapshot=JSON.stringify(sandbox.DenkmalLevels.levels[4]);
const canvases=[],uprights=[],draws=[];
const create=sandbox.document.createElement;
sandbox.document.createElement=(...args)=>{
  const c=create(...args);canvases.push(c);return c;
};
sandbox.Style2Phase6.upright=(ctx,point,paint)=>{uprights.push(point);paint();};
const ctx=new Proxy({drawImage(...args){draws.push(args);}},{get:(o,k)=>k in o?o[k]:()=>{}});
church.drawBackdrop(ctx,sandbox.DenkmalLevels.center);
const sprites=canvases.filter(c=>c.width===96&&c.height===144);
assert.equal(sprites.length,3,'eight graves share exactly three small cached variants');
const allocations=canvases.length;
for(let i=0;i<120;i++)church.drawBackdrop(ctx,sandbox.DenkmalLevels.center);
assert.equal(canvases.length,allocations,'warm grave rendering allocates no more canvases');
const stones=draws.filter(d=>sprites.includes(d[0]));
assert.equal(stones.length,8*121,'every frame draws all eight authored stones');
for(let i=0;i<8;i++){
  const [x,y]=church.graves[i],draw=stones[i];
  assert.deepEqual(draw.slice(1),[x-24,y-59,48,72],'padded frame keeps its authored foot anchor');
  assert.ok(uprights.some(p=>p.x===x&&p.y===y),'standing stone receives the renderer depth correction');
}
assert.equal(JSON.stringify(sandbox.DenkmalLevels.levels[4]),snapshot,'routes and tower sites stay unchanged');
console.log('Church grave cache: three 2x variants, eight anchors, upright projection and 120 warm frames passed.');
