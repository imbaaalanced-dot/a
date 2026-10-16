/* Style 2 levels 1/2: immutable gameplay layouts, cached painting and road readability. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'../dist');
let allocated=0,draws=0,patterns=0,radials=0,shapes=0;
const ctx=new Proxy({
  globalAlpha:1,
  drawImage(){draws++;},
  createPattern(){patterns++;return {tile:true};},
  createRadialGradient(){radials++;return {addColorStop(){}};},
  createLinearGradient(){return {addColorStop(){}};},
  fill(){shapes++;},
  stroke(){shapes++;}
},{get(o,k){return k in o?o[k]:()=>{};},set(o,k,v){o[k]=v;return true;}});
const sandbox={
  Math,document:{createElement(type){assert.equal(type,'canvas');allocated++;return{width:0,height:0,getContext(){return ctx;}};}},
  localStorage:{getItem(){return null;},setItem(){}}
};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'levels.js'),'utf8'),sandbox);
const levels=sandbox.DenkmalLevels,layoutLevel=i=>({...levels.levels[i],center:levels.center});
const original=JSON.stringify([levels.levels[1],levels.levels[2]]);
vm.runInContext(fs.readFileSync(path.join(root,'style2-maps.js'),'utf8'),sandbox);
const maps=sandbox.Style2Maps;
assert.ok(maps&&maps.draw,'new map module must exist');
assert.equal(allocated,0,'terrain art remains lazy until a map is started');
assert.equal(maps.draw(ctx,1,{x:920,y:960},1800,1550,layoutLevel(1)),true);
assert.equal(maps.stats().activeLevel,1);
assert.equal(maps.stats().canvas.width,1536,'half resolution static terrain bounds mobile memory');
assert.equal(maps.stats().canvas.height,1536);
assert.ok(radials>5,'map includes several baked static lights');
assert.ok(patterns>=1,'terrain tiles reused in the scene');
assert.ok(shapes>200,'draws physical road pavers and details');
const warmAllocations=allocated,built=maps.stats().builds;
for(let i=0;i<15;i++)maps.draw(ctx,1,{x:900+i,y:970},1200,900,layoutLevel(1));
assert.equal(allocated,warmAllocations,'same map only draws an already painted bitmap');
assert.equal(maps.stats().builds,built);
assert.equal(JSON.stringify([levels.levels[1],levels.levels[2]]),original,'gameplay geometry must never mutate');
assert.equal(maps.draw(ctx,2,{x:900,y:900},1800,1550,layoutLevel(2)),true);
assert.equal(maps.stats().builds,built+1,'one lazy scene build on changing level');
assert.equal(maps.stats().activeLevel,2);
const warmTwo=allocated;
for(let i=0;i<10;i++)maps.draw(ctx,2,{x:930,y:940},900,900,layoutLevel(2));
assert.equal(allocated,warmTwo,'maze drawing never allocates a canvas per frame');
assert.equal(JSON.stringify([levels.levels[1],levels.levels[2]]),original,'maze keeps original waypoints and pads');
assert.equal(maps.draw(ctx,3,{x:0,y:0},900,900,layoutLevel(1)),false,'style module does not affect historical maps');
assert.equal(maps.draw(ctx,1,{x:900,y:900},1100,1100,layoutLevel(1)),true);
assert.equal(maps.stats().builds,built+2,'switching back recreates one scene, not a second retained large atlas');
assert.ok(draws>=28,'cached scenes are drawn as single source rectangles');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.match(html,/style2-maps\.js\?v=v400a6s2m5/);
assert.ok(html.indexOf('style2-maps.js')<html.indexOf('game.js?v='),'map renderer loads before game');
const gameplay=fs.readFileSync(path.join(root,'game.js'),'utf8');
assert.match(gameplay,/Style2Maps\?\.draw/);
assert.match(gameplay,/Style2Maps\)continue/,'painted streets replace generic path strokes');
assert.match(gameplay,/v4-style2-maps\//,'new tester unlocks only the dedicated preview');
console.log('Style 2 maps: cached 1536px stone plaza and hedge maze, static lights, intact layout and render integration passed.');
