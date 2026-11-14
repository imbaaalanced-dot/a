'use strict';
const assert=require('node:assert/strict');
const {createRenderSandbox}=require('./helpers/render-sandbox.cjs');
const {sandbox}=createRenderSandbox();
const campaign=sandbox.DenkmalLevels,c=campaign.center;
const memorial=campaign.levels[3],church=campaign.levels[4];
assert.equal(memorial.gates.length,4,'campaign keeps its four wave entrances');
assert.ok(memorial.slots.length>=8,'eight-tower chapter remains playable');
for(const side of [1,2]){
  assert.equal(memorial.gates[side].y,c.y+memorial.street.y,'lateral lanes follow the depicted street');
  const approach=memorial.paths[side].slice(-3);
  assert.equal(approach[0].x,c.x+20,'both street entrances join the stair axis');
  assert.equal(approach[0].y,c.y+memorial.street.y);
  assert.equal(approach[1].x,c.x+20);
  assert.equal(approach[1].y,c.y+180,'entrance reaches the shallow steps');
}
for(const level of [memorial,church]){
  for(const route of level.paths){
    assert.equal(route.at(-1).x,c.x);assert.equal(route.at(-1).y,c.y);
    for(const p of route)assert.ok(p.x>=0&&p.y>=0&&p.x<=3072&&p.y<=3072);
  }
  for(const slot of level.slots)for(const route of level.paths)
    assert.ok(campaign.pathDistance(slot,route)>=64,'authored tower sites stay off paths');
}
for(const [x,y] of sandbox.DenkmalChurch.graves){
  assert.ok(x>church.churchFootprint.right,'standing stones grouped beside the church');
  const p={x:c.x+x,y:c.y+y};
  for(const route of church.paths)assert.ok(campaign.pathDistance(p,route)>=100,'grave silhouettes stay clear of the footpath');
  for(const slot of church.slots)assert.ok(Math.hypot(slot.x-p.x,slot.y-p.y)>=85,'grave group leaves tower pads visible');
}
const surfaces=[];
sandbox.DenkmalTerrain.drawRoad=(ctx,path,options)=>surfaces.push(options.surface);
church.paths.forEach((route,i)=>sandbox.DenkmalChurch.drawRoad({},route,i));
assert.deepEqual(surfaces,['slabs','slabs','slabs','flagstone'],'side passage uses plates, other routes cobbles');
assert.notEqual(memorial.name,church.name,'two separate sites stay separate chapters');
console.log('Kirchende site layout: street/stair access, separate chapters, clear tower pads and grave cluster passed.');
