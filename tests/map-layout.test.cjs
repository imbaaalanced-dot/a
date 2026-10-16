/* Style 2 art/geometry alignment: node tests/map-layout.test.cjs --levels 1 2 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const sandbox={localStorage:{getItem(){return null;},setItem(){}}};sandbox.globalThis=sandbox;
vm.createContext(sandbox);vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist/levels.js'),'utf8'),sandbox);
const campaign=sandbox.DenkmalLevels,center=campaign.center;
const marker=process.argv.indexOf('--levels');
const selected=marker<0?[1,2]:process.argv.slice(marker+1).map(Number);

function segmentDistance(point,a,b){
  const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((point.x-a.x)*dx+(point.y-a.y)*dy)/(dx*dx+dy*dy||1)));
  return Math.hypot(point.x-a.x-t*dx,point.y-a.y-t*dy);
}

for(const level of selected){
  const definition=campaign.levels[level];assert.ok(definition,`level ${level} exists`);
  const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,`../dist/assets/maps/level-${level}/map.json`),'utf8'));
  assert.equal(Object.hasOwn(manifest.gameplay,'slotsData'),false,'manifest must not bake slot coordinates');
  assert.equal(Object.hasOwn(manifest.gameplay,'pathsData'),false,'manifest must not bake path coordinates');
  assert.equal(manifest.gameplay.slots,`DenkmalLevels.levels[${level}].slots`);
  if(manifest.classification!=='kuenstlerisch'){
    assert.ok(manifest.sources.length>0,`level ${level} documents non-artistic sources`);
    for(const source of manifest.sources){assert.ok(source.label?.trim()&&/^https:\/\//.test(source.url||''),'source label and URL are required');}
  }
  for(const slot of definition.slots){
    const clearance=Math.min(...definition.paths.flatMap(route=>route.slice(1).map((point,index)=>segmentDistance(slot,route[index],point))));
    const required={1:96,2:70,3:64,4:84}[level];
    assert.ok(clearance>=required,`level ${level} slot keeps authored road clearance`);
  }
  if(level===1){
    assert.equal(definition.paths.length,4,'tutorial retains four approaches');
    definition.paths.forEach((route,index)=>{
      assert.equal(route.length,2,'tutorial approaches remain straight');
      assert.deepEqual(route[0],definition.gates[index]);
      assert.deepEqual(route[1],center);
    });
  }
  if(level===2){
    assert.equal(definition.paths.length,1,'labyrinth retains one continuous route');
    assert.ok(definition.paths[0].length>=9,'labyrinth retains every authored turn');
    assert.deepEqual(definition.gates[0],definition.paths[0][0]);
    assert.deepEqual(definition.paths[0].at(-1),center);
  }
  if(level===3){
    const ids=new Set(manifest.structures.map(item=>item.id));
    assert.ok(ids.has('kirchende-war-memorial')&&ids.has('old-protestant-cemetery'),'Kirchende memorial and cemetery provenance remain explicit');
    assert.equal(definition.paths.length,4,'Kirchende retains four approaches');
  }
  if(level===4){
    const church=manifest.structures.find(item=>item.id==='ender-village-church');
    const lion=manifest.structures.find(item=>item.role==='sleeping-lion');
    assert.ok(church&&lion,'church scenery and sleeping-lion objective remain separate');
    assert.ok(church.position.x<lion.position.x&&church.position.y<lion.position.y,'church remains north-west of lion');
    assert.ok(Math.hypot(church.position.x-lion.position.x,church.position.y-lion.position.y)>=450,'church and lion retain visible separation');
    assert.ok(church.bounds.bottom<lion.position.y,'church bounds leave a forecourt before the lion');
    assert.ok(definition.paths.every(route=>route.at(-1).x===center.x&&route.at(-1).y===center.y),'all routes end at the lion');
    assert.ok(manifest.layers.find(item=>item.pass==='decor-front').actorNearOpacity>=.22,'foreground visibility floor is preserved');
  }
}
console.log(`Style 2 layout: authoritative paths and slot clearances passed for levels ${selected.join(', ')}.`);
