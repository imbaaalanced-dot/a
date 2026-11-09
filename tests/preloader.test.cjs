/* Standalone startup preload smoke tests: node tests/preloader.test.cjs */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../dist/preloader.js'),'utf8');
async function test(){
  const ids=new Map();
  const elt=id=>{if(!ids.has(id))ids.set(id,{id,style:{},classList:{add(s){this[s]=true;}},textContent:'',src:'',attrs:new Set(),setAttribute(k){this.attrs.add(k);},removeAttribute(k){this.attrs.delete(k);},remove(){this.removed=true;}});return ids.get(id);};
  let created=0;
  const loaded=[];
  class MockImage {
    set src(src){this._src=src;this.complete=true;this.naturalWidth=720;created++;loaded.push(src);queueMicrotask(()=>this.onload?.());}
    get src(){return this._src;}
  }
  const sandbox={document:{getElementById:elt},window:{matchMedia:()=>({matches:true})},Image:MockImage,setTimeout,clearTimeout,setInterval,clearInterval,Promise,console};
  vm.runInNewContext(source,sandbox);
  await new Promise(resolve=>setTimeout(resolve,500));
  assert.equal(elt('td2LoadPercent').textContent,'100%');
  assert.equal(elt('td2LoadBar').style.width,'100%');
  assert.equal(elt('td2Loading').removed,true);
  assert.equal(elt('startScreen').attrs.has('inert'),false);
  assert.equal(created,6,'three loading images and the device-appropriate menu set (scenery, crest, saved hero banner) load at startup');
  assert.ok(loaded.some(src=>src.endsWith('memorial-yard-mobile-v3.webp')),'mobile scenery preloaded on mobile viewport');
  assert.ok(!loaded.some(src=>src.endsWith('memorial-yard-v3.webp')),'desktop scenery not preloaded on mobile viewport');
  assert.ok(loaded.some(src=>src.endsWith('marcel-guardian-v6.webp')),'default approved Marcel art preloaded');
  assert.ok(!loaded.some(src=>src.endsWith('kim-marksman-v6.webp')),'other approved hero art not preloaded without saved selection');
  console.log('Preloader: success, progress 100%, game menu unlocked, device-aware menu preload verified');
}
test().catch(err=>{console.error(err);process.exitCode=1;});
