'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../dist/game.js'),'utf8');

function takeLine(name){
  const line=source.split('\n').find(line=>line.trim().startsWith('function '+name+'('));
  assert.ok(line, name+' must exist in production');
  return line;
}

const limitContext={mobileRender:true,graphicsMode:'auto'};
vm.createContext(limitContext);
vm.runInContext(takeLine('targetRenderInterval'),limitContext);
assert.equal(limitContext.targetRenderInterval(),0,'mobile AUTO must not be hard-capped at 30 FPS');
limitContext.graphicsMode='high';
assert.equal(limitContext.targetRenderInterval(),0,'explicit HIGH must not be capped');
limitContext.graphicsMode='low';
assert.equal(limitContext.targetRenderInterval(),1000/30,'manual LOW retains battery/thermal 30 FPS fallback');
limitContext.mobileRender=false;
assert.equal(limitContext.targetRenderInterval(),0,'desktop remains uncapped');

// Shadows are drawn once per visible object: reduce low-tier Canvas path fill count
// without changing game state or leaking Canvas draw state.
const ops=[];
const ctx={
  save(){ops.push('save');},restore(){ops.push('restore');},
  beginPath(){ops.push('path');},ellipse(){ops.push('ellipse');},fill(){ops.push('fill');}
};
const shadowContext={ctx,Math,lowFX:()=>true};
vm.createContext(shadowContext);
vm.runInContext(takeLine('shadow'),shadowContext);
shadowContext.shadow(100,200,20);
assert.equal(ops.filter(op=>op==='fill').length,1,'LOW paints one grounding shadow per enemy');
assert.deepEqual(ops.filter(op=>op==='save'||op==='restore'),['save','restore']);
ops.length=0;
shadowContext.lowFX=()=>false;
shadowContext.shadow(100,200,20);
assert.equal(ops.filter(op=>op==='fill').length,2,'HIGH preserves both shadow layers');
assert.deepEqual(ops.filter(op=>op==='save'||op==='restore'),['save','restore']);

// The immutable level layout must reuse the existing map-polish cache rather than
// allocating a new shallow copy on every drawn frame.
assert.match(source,/Style2Maps\?\.draw\?\.\(ctx,game\.level,camera,W\/zoom,H\/\(zoom\*viewDepth\),polishedLayoutFor\(game\.level\)\)/);
console.log('Mobile FPS render-budget and low-tier Canvas shadow tests passed.');
