const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('ansturm-alpha1-5/render.js','utf8').replace(/import[^;]+;/g,'').replace('export function','function');
let effects=0;const ctx=new Proxy({canvas:{},createRadialGradient:()=>({addColorStop(){}})}, {get:(o,k)=>k in o?o[k]:(()=>{})});
const box={sprite(c,key){if(key==='effect_test')effects++;return true},ENEMY:{},getStats:()=>({rangeRatio:.3}),Math};vm.createContext(box);vm.runInContext(source,box);
const state={upgrades:{},enemies:[],effects:Array.from({length:120},()=>({life:.2,type:'impact',x:0,y:0,spriteKey:'effect_test'}))};
box.renderArena(ctx,state,{width:360,height:640,pixelRatio:3,lowFX:true});assert.ok(effects<=24,`low FX should limit cosmetics: ${effects}`);assert.equal(ctx.canvas.width,360,'low FX caps pixel ratio');
effects=0;box.renderArena(ctx,state,{width:360,height:640,pixelRatio:3,lowFX:false});assert.equal(effects,120);assert.equal(ctx.canvas.width,720);
console.log('Ansturm low-FX cosmetic and pixel budgets passed');
