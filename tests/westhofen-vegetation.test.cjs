/* Deterministic Westhofen ground greenery and cache regression. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../dist');
const box={Math,localStorage:{getItem(){return null;},setItem(){}}};
const records={canvases:0,ellipses:[],draws:0};
const context=new Proxy({
 drawImage(){records.draws++;},
 ellipse(...args){records.ellipses.push(args.map(Number));},
 createRadialGradient(){return{addColorStop(){}}}
},{get(obj,key){return obj[key]??(()=>{});}});
box.document={createElement(){records.canvases++;return{width:0,height:0,getContext(){return context;}};}};
vm.createContext(box);
for(const name of ['persisted-state.js','levels.js','westhofen-art.js'])
 vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'),box);
const layout=box.DenkmalLevels.levels[7],renderer=box.DenkmalWesthofenArt;
assert.equal(layout.paths.length,3);
assert.equal(layout.slots.length,17);
renderer.drawGround(context,layout);
const initial=records.ellipses.length;
assert.ok(initial>2150,'deterministic plants add ground details');
assert.equal(records.canvases,1);
renderer.drawGround(context,layout);
assert.equal(records.ellipses.length,initial,'warm canvas does not redraw vegetation');
assert.equal(records.canvases,1);
const first=JSON.stringify(records.ellipses);
renderer.release();
renderer.drawGround(context,layout);
assert.equal(records.canvases,2,'explicit release produces one new canvas');
assert.equal(JSON.stringify(records.ellipses.slice(initial)),first,'dressing is stable across cache rebuilds');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const west=fs.readFileSync(path.join(__dirname,'westhofen.test.cjs'),'utf8');
const cache=fs.readFileSync(path.join(__dirname,'cache-busting.test.cjs'),'utf8');
assert.ok(html.includes('westhofen-art.js?v=whlantern1'));
assert.ok(west.includes('westhofen-art.js?v=whlantern1'));
assert.ok(cache.includes("['westhofen-art.js', 'whlantern1']"));
console.log('Westhofen ground vegetation: deterministic, cached and geometry unchanged.');
