/* Standalone startup preload smoke tests: node tests/preloader.test.cjs */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../dist/preloader.js'),'utf8');
async function test(){
  const ids=new Map();
  const elt=id=>{if(!ids.has(id))ids.set(id,{id,style:{},classList:{add(s){this[s]=true;}},textContent:'',src:'',attrs:new Set(),setAttribute(k){this.attrs.add(k);},removeAttribute(k){this.attrs.delete(k);},remove(){this.removed=true;}});return ids.get(id);};
  let created=0;
  class MockImage {
    set src(src){this._src=src;this.complete=true;this.naturalWidth=720;created++;queueMicrotask(()=>this.onload?.());}
    get src(){return this._src;}
  }
  const sandbox={document:{getElementById:elt},window:{matchMedia:()=>({matches:true})},Image:MockImage,setTimeout,clearTimeout,setInterval,clearInterval,Promise,console};
  vm.runInNewContext(source,sandbox);
  await new Promise(resolve=>setTimeout(resolve,500));
  assert.equal(elt('td2LoadPercent').textContent,'100%');
  assert.equal(elt('td2LoadBar').style.width,'100%');
  assert.equal(elt('td2Loading').removed,true);
  assert.equal(elt('startScreen').attrs.has('inert'),false);
  assert.ok(created>=20);
  console.log('Preloader: success, progress 100%, game menu unlocked');
}
test().catch(err=>{console.error(err);process.exitCode=1;});
