'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('dist/preloader.js','utf8');
async function run(){
 let active=0,peak=0;const timers=[],requests=[],elements=new Map();
 const el=id=>{if(!elements.has(id))elements.set(id,{style:{},textContent:'',classList:{add(){}},setAttribute(){},removeAttribute(){},remove(){}});return elements.get(id);};
 class Image{set src(url){requests.push(this);this.url=url;active++;peak=Math.max(peak,active);} finish(){active--;this.onload?.();}}
 const box={document:{getElementById:el},window:{matchMedia:()=>({matches:true})},Image,Promise,console,setTimeout(fn,ms){const t={fn,ms};timers.push(t);return t;},clearTimeout(t){t.canceled=true;},setInterval(){},clearInterval(){}};
 vm.runInNewContext(source,box);
 assert.ok(peak<=4,'at most four parallel preload downloads');
 assert.ok(!timers.some(t=>t.ms<=3500),'slow connections must not be treated as failed after 3.5 seconds');
 // Finish the loading portraits, then exercise the critical request queue.
 for(let n=0;n<100;n++){
  const next=requests.find(x=>!x.done);if(next){next.done=true;next.finish();}
  await Promise.resolve();await Promise.resolve();await Promise.resolve();
 }
 assert.ok(peak<=4,'bounded queue also applies to gameplay atlases');
 assert.ok(requests.every(x=>!x.url.endsWith('.png')),'legacy multi-megabyte PNG fallback art is not startup-critical');
 const timeout=timers.find(t=>!t.canceled&&t.ms>=10000);if(timeout)timeout.fn();
 assert.ok(!el('td2LoadStatus').textContent.includes('nicht verfügbar'),'pending download is not a missing file');
 // A separate genuinely slow connection reaches the global soft deadline.
 let slowActive=0,slowPeak=0;const slowTimers=[],slowImages=[],slowEls=new Map();
 const slowEl=id=>{if(!slowEls.has(id))slowEls.set(id,{style:{},textContent:'',classList:{add(){}},setAttribute(){},removeAttribute(){},remove(){}});return slowEls.get(id);};
 class SlowImage{set src(url){this.url=url;slowImages.push(this);slowPeak=Math.max(slowPeak,++slowActive);} finish(){slowActive--;this.onload?.();}}
 vm.runInNewContext(source,{...box,document:{getElementById:slowEl},Image:SlowImage,setTimeout(fn,ms){const t={fn,ms};slowTimers.push(t);return t;}});
 assert.equal(slowImages.length,4);slowTimers.find(t=>t.ms===15000).fn();
 for(let i=0;i<8;i++)await Promise.resolve();
 slowTimers.find(t=>t.ms===180).fn();for(let i=0;i<4;i++)await Promise.resolve();
 assert.match(slowEl('td2LoadStatus').textContent,/Hintergrund/,'slow images must keep loading after menu release');
 assert.equal(slowImages.length,4,'deadline must not start a second parallel batch');
 slowImages[0].finish();for(let i=0;i<4;i++)await Promise.resolve();
 assert.equal(slowImages.length,5);assert.equal(slowPeak,4);
 console.log('Startup: bounded downloads, slow-network menu release without false failures, lightweight critical assets');
}
run().catch(e=>{console.error(e);process.exitCode=1;});
