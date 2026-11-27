/* Standalone startup preload regression tests. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../dist/preloader.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'../dist/index.html'),'utf8');
const flush=async()=>{for(let i=0;i<24;i++)await Promise.resolve();};
function setup({mobile=true,hero='marcel',loading=false,hold=[],reject=[]}={}){
  const ids=new Map(),requests=[],waiting=new Map(),timers=new Map(),listeners=new Map();
  let nextTimer=0;
  const elt=id=>{
    if(!ids.has(id))ids.set(id,{style:{},classList:{add(s){this[s]=true;}},textContent:'',src:'',attrs:new Map(),
      setAttribute(k,v){this.attrs.set(k,v);},getAttribute(k){return this.attrs.get(k)||null;},
      hasAttribute(k){return this.attrs.has(k);},removeAttribute(k){this.attrs.delete(k);},remove(){this.removed=true;}});
    return ids.get(id);
  };
  elt('td2LoadArt').setAttribute('data-td2-asset','assets/loading/kim-marcel-loading-v5.webp');
  const doc={readyState:loading?'loading':'complete',getElementById(id){return loading&&this.readyState==='loading'&&id==='app'?null:elt(id);},
    addEventListener(name,fn){listeners.set(name,fn);},querySelector(q){return q.startsWith('meta')?{content:'v6-alpha'}:null;}};
  const sandbox={document:doc,window:{matchMedia:q=>({matches:q.includes('reduced-motion')||mobile}),addEventListener(){}},
    localStorage:{getItem:key=>key==='denkmal-preferences-v1'?JSON.stringify({data:{character:hero}}):null},
    DenkmalAssets:{load(url){requests.push(url);
      if(reject.some(s=>url.includes(s)))return Promise.reject(Error('broken'));
      if(hold.some(s=>url.includes(s)))return new Promise(resolve=>waiting.set(url,resolve));
      return Promise.resolve({src:url});}},
    setTimeout(fn,ms){const id=++nextTimer;timers.set(id,{fn,ms});return id;},clearTimeout:id=>timers.delete(id),
    Promise,console};
  vm.runInNewContext(source,sandbox);
  return {elt,requests,waiting,ready(){doc.readyState='interactive';listeners.get('DOMContentLoaded')?.();},
    timeout(){for(const [id,t] of timers)if(t.ms===15000){timers.delete(id);t.fn();}}};
}
async function run(){
  const markup=html.match(/<div id="td2Loading"[\s\S]*?<script /)?.[0]||'';
  assert.ok(markup.includes('DENKMAL TD'));
  assert.ok(!markup.includes('MARCEL &amp; KIM')&&!markup.includes('DENK MAL NACH'));
  assert.ok(markup.includes('role="progressbar"'));
  let s=setup();await flush();
  assert.equal(s.elt('td2LoadPercent').textContent,'100%');
  assert.equal(s.elt('td2LoadBar').style.width,'100%');
  assert.equal(s.elt('td2Loading').removed,true);
  assert.equal(s.elt('app').hasAttribute('inert'),false);
  assert.equal(s.requests.length,4,'one cover, selected viewport, crest and selected hero only');
  assert.ok(s.requests.some(u=>u.includes('memorial-yard-mobile-v4')));
  assert.ok(!s.requests.some(u=>u.includes('memorial-yard-v4.webp')));
  assert.ok(s.requests.some(u=>u.includes('marcel-guardian-v7')));
  assert.ok(!s.requests.some(u=>u.includes('kim-marksman')));
  assert.equal(s.elt('td2LoadVersion').textContent,'v6-alpha');

  s=setup({mobile:false,hero:'kim',loading:true,hold:['memorial-yard-v4']});await flush();
  assert.ok(s.elt('td2LoadArt').src.includes('kim-marcel-loading-v5'),'cover is assigned while menu scene is pending');
  assert.ok(s.elt('td2Loading').classList['td2-art-ready']);
  assert.ok(!s.elt('td2Loading').removed);
  s.ready();await flush();
  assert.ok(s.elt('app').hasAttribute('inert'));
  assert.ok(s.requests.some(u=>u.includes('kim-marksman-v6')));
  assert.ok(!s.requests.some(u=>u.includes('marcel-guardian')));
  for(const [u,resolve] of s.waiting)resolve({src:u});await flush();
  assert.equal(s.elt('td2Loading').removed,true);
  assert.equal(s.elt('app').hasAttribute('inert'),false);

  s=setup({loading:true});await flush();
  assert.equal(s.elt('td2LoadPercent').textContent,'80%','DOM handoff is an explicit progress step');
  assert.ok(!s.elt('td2Loading').removed);
  s.ready();await flush();
  assert.equal(s.elt('td2LoadPercent').textContent,'100%');
  assert.ok(s.elt('td2Loading').removed);

  s=setup({reject:['kim-marcel-loading']});await flush();
  assert.ok(s.elt('td2Loading').removed);
  assert.ok(!s.elt('td2Loading').classList['td2-art-ready']);
  assert.match(s.elt('td2LoadStatus').textContent,/Ersatzgrafiken/);
  assert.equal(s.elt('app').hasAttribute('inert'),false);

  s=setup({hold:['memorial-yard']});await flush();
  assert.ok(s.elt('app').hasAttribute('inert'));
  s.timeout();await flush();
  assert.ok(s.elt('td2Loading').removed);
  assert.equal(s.elt('app').hasAttribute('inert'),false);
  assert.equal(s.elt('td2LoadPercent').textContent,'80%','timeout does not report a fictitious 100%');
  const status=s.elt('td2LoadStatus').textContent;
  for(const [u,resolve] of s.waiting)resolve({src:u});await flush();
  assert.equal(s.elt('td2LoadStatus').textContent,status,'late assets cannot overwrite final status');
  console.log('Preloader: 5 scenarios passed (success, early artwork, DOM gate, rejection, timeout)');
}
run().catch(err=>{console.error(err);process.exitCode=1;});
