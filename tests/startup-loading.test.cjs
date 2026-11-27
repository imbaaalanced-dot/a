'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('dist/preloader.js','utf8');
const flush=async()=>{for(let i=0;i<32;i++)await Promise.resolve();};
function setup(){
 let active=0,peak=0;const timers=[],requests=[],elements=new Map();
 const el=id=>{if(!elements.has(id))elements.set(id,{style:{},textContent:'',src:'',attrs:new Map(),
  classList:{add(s){this[s]=true;}},setAttribute(k,v){this.attrs.set(k,v);},getAttribute(k){return this.attrs.get(k)||null;},
  hasAttribute(k){return this.attrs.has(k);},removeAttribute(k){this.attrs.delete(k);},remove(){this.removed=true;}});
  return elements.get(id);};
 el('td2LoadArt').setAttribute('data-td2-asset','assets/loading/kim-marcel-loading-v8.webp');
 class Image{
  set src(url){this.url=url;requests.push(this);active++;peak=Math.max(peak,active);}
  get src(){return this.url;}
  finish(ok=true){assert.ok(!this.done);this.done=true;active--;this.naturalWidth=ok?810:0;this.complete=true;(ok?this.onload:this.onerror)?.();}
 }
 const box={document:{readyState:'complete',getElementById:el},window:{matchMedia:()=>({matches:true})},Image,Promise,console,
  setTimeout(fn,ms){const t={fn,ms};timers.push(t);return t;},clearTimeout(t){if(t)t.canceled=true;}};
 vm.runInNewContext(source,box);
 return {el,timers,requests,peak:()=>peak};
}
async function run(){
 const fast=setup();await flush();
 assert.equal(fast.requests.length,4,'one cover, selected viewport, crest and selected hero only');
 assert.equal(fast.peak(),4,'at most four parallel initial preload downloads');
 assert.ok(fast.requests.every(x=>x.url.endsWith('.webp')||x.url.includes('.webp?v=')),'only lightweight WebP art is startup-critical');
 assert.ok(!fast.timers.some(t=>t.ms<=3500),'slow connections must not be treated as failed after 3.5 seconds');
 const cover=fast.requests.find(x=>x.url.includes('kim-marcel-loading-v8'));
 assert.ok(cover,'new cover is requested');
 cover.finish();await flush();
 assert.equal(fast.el('td2LoadArt').src,cover.url,'cover appears before remaining assets complete');
 assert.ok(!fast.el('td2Loading').removed);
 for(const item of fast.requests.filter(x=>!x.done))item.finish();
 await flush();
 assert.equal(fast.el('td2LoadPercent').textContent,'100%');
 assert.ok(fast.el('td2Loading').removed);
 assert.ok(!fast.el('app').hasAttribute('inert'));

 const slow=setup();await flush();
 assert.equal(slow.requests.length,4);
 assert.ok(slow.el('app').hasAttribute('inert'));
 const deadline=slow.timers.find(t=>!t.canceled&&t.ms===15000);
 assert.ok(deadline,'global soft deadline exists');
 deadline.fn();await flush();
 assert.ok(slow.el('td2Loading').removed,'slow images do not block menu release');
 assert.ok(!slow.el('app').hasAttribute('inert'));
 assert.match(slow.el('td2LoadStatus').textContent,/weitere Grafiken laden/);
 assert.equal(slow.el('td2LoadPercent').textContent,'20%','only DOM step is complete at deadline');
 const status=slow.el('td2LoadStatus').textContent;
 for(const item of slow.requests)item.finish();
 await flush();
 assert.equal(slow.requests.length,4,'deadline must not start a second parallel batch');
 assert.equal(slow.peak(),4);
 assert.equal(slow.el('td2LoadStatus').textContent,status,'late assets cannot overwrite final status');
 console.log('Startup: bounded downloads, early cover, slow-network release, honest progress and lightweight assets passed');
}
run().catch(e=>{console.error(e);process.exitCode=1;});
