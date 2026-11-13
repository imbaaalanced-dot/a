/* Canopy visual parity / zero-allocation actor collection. No Android hardware claim. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const dist=path.join(__dirname,'../dist');
const gameSrc=fs.readFileSync(path.join(dist,'game.js'),'utf8');
const kirchSrc=fs.readFileSync(path.join(dist,'kirchende-art.js'),'utf8');
const churchSrc=fs.readFileSync(path.join(dist,'church-art.js'),'utf8');

const start=gameSrc.indexOf('  const layoutCache={},drawObjs=[],wrapPool=[];');
const end=gameSrc.indexOf('  function draw(){',start);
assert.ok(start>=0&&end>start,'game exposes pooled scenery preparation');
assert.match(gameSrc,/if\(game\.level===3\|\|game\.level===4\)collectCanopyActors\(\)/);
assert.match(gameSrc,/drawScenery\(ctx,campaign\.center,canopyActors,\{crowns:true,low:lowFX\(\),shielded:canopyShielded\}\)/);
assert.match(gameSrc,/drawCanopies\(ctx,campaign\.center,canopyActors,canopyShielded\)/);
const game={hero:{id:'hero'},monument:{id:'monument'},towers:[],enemies:[]};
const gameBox={game};
vm.createContext(gameBox);
vm.runInContext(gameSrc.slice(start,end)+
  ';this.collect=collectCanopyActors;this.targets=()=>[canopyActors,canopyShielded];',gameBox);
const first=gameBox.targets();
let count=0;
for(let n=0;n<120;n++){
  game.towers=Array.from({length:n%9},(_,i)=>({id:'tower-'+n+'-'+i}));
  game.enemies=Array.from({length:(n%3)*600},(_,i)=>({id:'enemy-'+n+'-'+i}));
  gameBox.collect();
  const [actors,shields]=gameBox.targets();
  assert.strictEqual(actors,first[0],'canopy actors buffer reused between frames');
  assert.strictEqual(shields,first[1],'canopy shield buffer reused between frames');
  assert.deepEqual(Array.from(actors),[game.hero,game.monument,...game.towers,...game.enemies],
    'canopy actor list retains exact original ordering and identities');
  assert.deepEqual(Array.from(shields),[game.monument,...game.towers],
    'fully opaque monument and tower shields remain separate');
  count+=actors.length;
}
assert.ok(count>70000,'large enemy waves exercised');
game.towers=[];game.enemies=[];gameBox.collect();
assert.equal(first[0].length,2,'stale enemy references are cleared after waves');
assert.equal(first[1].length,1,'stale tower references are cleared after waves');

const countedMath=Object.create(Math);
let hypotCalls=0;
countedMath.hypot=(...values)=>{hypotCalls++;return Math.hypot(...values);};
const crownStart=kirchSrc.indexOf('  function nearCrown(');
const crownEnd=kirchSrc.indexOf('  // Photo-derived atmosphere',crownStart);
assert.ok(crownStart>=0&&crownEnd>crownStart,'Kirchende broad-phase is available');
const kirchBox={Math:countedMath};
vm.createContext(kirchBox);
vm.runInContext(kirchSrc.slice(crownStart,crownEnd)+';this.opacity=crownOpacity;',kirchBox);
function legacyOpacity(tree,actors,shields){
  if(shields?.some(a=>Math.hypot(a.x-tree.x,a.y-tree.y)<tree.r+30))return 0;
  return actors.some(a=>Math.hypot(a.x-tree.x,a.y-tree.y)<tree.r+25)?.25:1;
}
let seed=77;const rnd=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
for(let pass=0;pass<250;pass++){
  const tree={x:rnd()*2000,y:rnd()*2000,r:25+rnd()*120};
  const actors=Array.from({length:75},()=>({x:rnd()*3000-500,y:rnd()*3000-500}));
  const shields=actors.slice(0,pass%7);
  assert.equal(kirchBox.opacity(tree,actors,shields),legacyOpacity(tree,actors,shields),
    'exact translucency and shield parity for randomized positions');
}
const distant=Array.from({length:4000},(_,i)=>({x:5000+i,y:5000+i}));
hypotCalls=0;
assert.equal(kirchBox.opacity({x:0,y:0,r:90},distant,[]),1);
assert.equal(hypotCalls,0,'distant Kirchende enemies skip sqrt calculations');

const churchStart=churchSrc.indexOf('  function drawCanopies(');
const churchEnd=churchSrc.indexOf('  // Draw the 1879 stone monument',churchStart);
assert.ok(churchStart>=0&&churchEnd>churchStart,'church canopy drawing hook present');
const alphas=[];
const churchBox={Math:countedMath,trees:[[0,0,80]],globalThis:null};
const mockCanvas={
  save(){},restore(){},translate(){},fill(){},beginPath(){},arc(){},
  set globalAlpha(value){alphas.push(value);},
  get globalAlpha(){return alphas.at(-1)||1;}
};
churchBox.globalThis=churchBox;
vm.createContext(churchBox);
vm.runInContext(churchSrc.slice(churchStart,churchEnd)+';this.draw=drawCanopies;',churchBox);
const center={x:1536,y:1536};
hypotCalls=0;
churchBox.draw(mockCanvas,center,distant,[]);
assert.equal(alphas.at(-1),1,'far enemies do not fade church trees');
assert.equal(hypotCalls,0,'distant church enemies skip sqrt calculations');
churchBox.draw(mockCanvas,center,[{x:center.x,y:center.y}],[]);
assert.equal(alphas.at(-1),.22,'near enemies still reveal church trees');
churchBox.draw(mockCanvas,center,[{x:center.x,y:center.y}],[{x:center.x,y:center.y}]);
assert.equal(alphas.at(-1),0,'near towers still fully reveal the playable area');
console.log('Canopy CPU: 120 reusable-frame batches, randomized visual parity, and 4k-enemy broad-phase checks passed. Android hardware untested.');
