'use strict';
// Default-on V3 loader and explicit legacy fallback; not a physical Android test.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const file=path.join(__dirname,'../dist/ground-v3.js');
const src=fs.readFileSync(file,'utf8');
const materials=['forest_moss_roots','dark_slab_lichen','meadow_patchy','churchyard_cobble','syburg_bedrock','syburg_sandstone','memorial_gravel','goethe_brick','urban_asphalt'];
const assets=path.join(__dirname,'../dist/assets/reference-ground-v3');
for(const name of materials){
 const bytes=fs.readFileSync(path.join(assets,name+'.webp'));
 assert.equal(bytes.subarray(0,4).toString(),'RIFF');
 assert.equal(bytes.subarray(8,12).toString(),'WEBP');
 assert.ok(bytes.length<45000,name+' exceeds compressed budget');
}
let requests=[];
class ImageMock{
 constructor(){this.naturalWidth=256;this.naturalHeight=256;}
 set src(url){if(url.includes('churchyard_pavement_v4'))this.naturalWidth=this.naturalHeight=512;requests.push(url);setImmediate(()=>this.onload?.());}
}
async function run(search){
 const context={globalThis:null,location:{search},Image:ImageMock,Promise};context.globalThis=context;
 vm.runInNewContext(src,context,{filename:'ground-v3.js'});
 return context.TD2GroundV3;
}
(async()=>{
 const off=await run('?td2GroundV3=0');assert.equal(off.enabled,false);assert.equal(await off.load(),false);
 assert.equal(off.imageFor(3,'base'),null);
 assert.equal(requests.length,0,'explicit opt-out must not download V3 assets');
 const pilot=await run('?td2Style2Pilot=1');assert.equal(pilot.enabled,false);
 assert.equal(await pilot.load(),false,'legacy pilot is isolated from V3');
 assert.equal(requests.length,0,'pilot mode must not download V3 assets');
 const on=await run('');assert.equal(on.enabled,true,'V3 is now default');
 assert.equal(await on.load(),true);assert.equal(on.loadedCount,9);
 assert.equal(requests.length,9,'default-on V3 loads exactly nine assets');
 const explicit=await run('?td2GroundV3=1');assert.equal(explicit.enabled,true,'previous preview URL still works');
 await on.load();assert.equal(requests.length,9,'one load batch only');
 assert.equal(on.material(5,'road'),'syburg_sandstone');
 assert.equal(on.material(7,'street'),'urban_asphalt');
 assert.equal(on.material(4,'road'),'churchyard_cobble');
 assert.equal(on.material(3,'base'),'forest_moss_roots');
 let patterns=0,fills=0;
 const canvas={save(){},restore(){},fillRect(){fills++;},createPattern(){patterns++;return {p:patterns}}};
 assert.equal(!!on.patternFor(canvas,7,'street'),true);
 on.patternFor(canvas,7,'street');assert.equal(patterns,1,'context pattern reused');
 assert.equal(on.drawBase(canvas,3),true);assert.equal(fills,1);
 on.drawBase(canvas,3);assert.equal(patterns,2,'cached ground pattern reused');
 const v4=await run('?td2PavementV4=1');await v4.load();
 assert.equal(v4.material(4,'road'),'churchyard_pavement_v4');
 assert.equal(v4.material(1,'road'),'churchyard_cobble');
 let transform;const ctx={createPattern(){return {setTransform(t){transform=t;}}}};
 v4.patternFor(ctx,4,'road');assert.equal(transform.a,.5);assert.equal(transform.d,.5);
 console.log('Reference-ground V3: 9 WebPs, default enabled, explicit opt-out, legacy pilot isolation, caching passed.');
})().catch(e=>{console.error(e);process.exitCode=1;});