/* Regression tests for the nearest-target squared-distance hot-path. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../dist/game.js'),'utf8');
const match=source.match(/function nearest\(from,range\)\{[^\n]+\}/);
assert.ok(match,'nearest() should remain a locally testable hot-path');
assert.match(match[0],/dx\*dx\+dy\*dy/,'avoid sqrt in every enemy iteration');
const box={game:{enemies:[]}};
vm.createContext(box);
vm.runInContext(match[0]+';this.select=nearest;',box);
const expected=(from,range,enemies)=>{
 let best=null,bestDistance=range;
 for(const e of enemies){
  if(e.dead)continue;
  const distance=Math.hypot(from.x-e.x,from.y-e.y);
  if(distance<bestDistance){best=e;bestDistance=distance;}
 }
 return best;
};
const samples=[
 {from:{x:0,y:0},range:10,enemies:[]},
 {from:{x:0,y:0},range:10,enemies:[{x:10,y:0},{x:9,y:0}]},
 {from:{x:0,y:0},range:10,enemies:[{x:1,y:1,dead:true},{x:2,y:2}]},
 {from:{x:0,y:0},range:8,enemies:[{x:3,y:4},{x:-3,y:-4}]},
 {from:{x:3,y:-10},range:1,enemies:[{x:3,y:-9},{x:3,y:-10.5}]},
];
let seed=417;
function rnd(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
for(let k=0;k<300;k++){
 const from={x:rnd()*200-100,y:rnd()*200-100},range=1+rnd()*160;
 const enemies=Array.from({length:25+Math.floor(rnd()*80)},()=>({x:rnd()*250-125,y:rnd()*250-125,dead:rnd()<.12}));
 samples.push({from,range,enemies});
}
for(const {from,range,enemies} of samples){
 box.game.enemies=enemies;
 const actual=box.select(from,range);
 assert.equal(actual,expected(from,range,enemies),'target selection matches legacy hypot distance');
}
console.log('Nearest-target hot-path: '+samples.length+' legacy-parity cases passed');
