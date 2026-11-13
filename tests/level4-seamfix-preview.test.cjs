/* Level 4 material preview: opt-in, cached textures, V3 fallback, no geometry changes. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../dist/terrain-polish.js'),'utf8');
const church=fs.readFileSync(path.join(__dirname,'../dist/church-art.js'),'utf8');
const game=fs.readFileSync(path.join(__dirname,'../dist/game.js'),'utf8');
async function simulate(search,fail=false){
  const requests=[],strokes=[];
  let patterns=0;
  class ImageMock{
    constructor(){this.naturalWidth=512;this.naturalHeight=512;}
    set src(url){
      this.url=url;requests.push(url);
      Promise.resolve().then(()=>url.includes('/level4/')&&fail?this.onerror?.():this.onload?.());
    }
  }
  const sandbox={globalThis:null,Image:ImageMock,Math,Promise,location:{search},
    TD2GroundV3:{load:()=>Promise.resolve(true),material:()=> 'churchyard_cobble',
      pattern:(_ctx,name)=>'V3:'+name}};
  sandbox.globalThis=sandbox;
  vm.runInNewContext(source,sandbox,{filename:'terrain-polish.js'});
  const terrain=sandbox.DenkmalTerrain;
  assert.equal(await terrain.load(),true,'base ground still loads');
  const ctx={
    save(){},restore(){},setLineDash(){},beginPath(){},moveTo(){},lineTo(){},
    stroke(){strokes.push(this.strokeStyle);},
    createPattern(image,repeat){assert.equal(repeat,'repeat');patterns++;return {source:image.url};}
  };
  const lane=[{x:0,y:0},{x:140,y:120}];
  function draw(surface){
    const before=strokes.length;
    terrain.drawRoad(ctx,lane,{surface,groundLevel:4});
    assert.equal(strokes.length-before,9,'route uses unchanged nine strokes');
    return strokes.at(-1);
  }
  return {terrain,requests,draw,get patterns(){return patterns;}};
}
(async()=>{
  const baseline=await simulate('');
  assert.equal(baseline.terrain.level4SeamfixEnabled,false);
  assert.equal(baseline.requests.filter(x=>x.includes('/level4/')).length,0,
    'default gameplay does not request preview files');
  assert.equal(baseline.draw('slabs'),'V3:churchyard_cobble');
  const pilot=await simulate('?td2Level4Seamfix=1');
  assert.equal(pilot.terrain.level4SeamfixEnabled,true);
  assert.equal(pilot.terrain.level4SeamfixLoaded,2);
  assert.equal(pilot.requests.filter(x=>x.includes('/level4/')).length,2);
  assert.match(pilot.draw('slabs').source,/level4-cobblestone-512-seamfix\.webp/);
  assert.match(pilot.draw('flagstone').source,/level4-flagstone-512-seamfix\.webp/);
  pilot.draw('slabs');pilot.draw('flagstone');
  assert.equal(pilot.patterns,2,'patterns cached per material and context');
  const broken=await simulate('?td2Level4Seamfix=1',true);
  assert.equal(broken.terrain.level4SeamfixLoaded,0);
  assert.equal(broken.draw('slabs'),'V3:churchyard_cobble');
  assert.equal(broken.draw('flagstone'),'V3:dark_slab_lichen');
  assert.match(church,/pathIndex===3\?'flagstone':'slabs'/,
    'only existing Kirchhof West path gets a visual flagstone variant');
  assert.match(game,/DenkmalChurch\.drawRoad\(ctx,path,pathIndex\)/);
  console.log('Level 4 seamfix opt-in, two materials, cached patterns, V3 fallback passed.');
})().catch(error=>{console.error(error);process.exitCode=1;});
