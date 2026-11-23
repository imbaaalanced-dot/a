'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'../dist');
const mapSource=fs.readFileSync(path.join(root,'cdn-asset-map.js'),'utf8');
const managerSource=fs.readFileSync(path.join(root,'asset-manager.js'),'utf8');

function create(search,mode='success'){
  const requests=[];
  class ImageMock{
    constructor(){this.complete=false;this.naturalWidth=0;this.decoding='';}
    set src(value){
      this._src=value;requests.push(value);
      queueMicrotask(()=>{
        this.complete=true;
        if(value.includes('res.cloudinary.com')&&mode==='network'){
          this.naturalWidth=0;this.onerror?.();return;
        }
        this.naturalWidth=64;this.onload?.();
      });
    }
    get src(){return this._src;}
    decode(){
      if(this._src.includes('res.cloudinary.com')&&mode==='decode')
        return Promise.reject(new Error('simulated CDN decode failure'));
      return Promise.resolve();
    }
  }
  const box={Image:ImageMock,Promise,Map,Set,Date,URLSearchParams,queueMicrotask,location:{search}};
  box.globalThis=box;vm.createContext(box);
  vm.runInContext(mapSource,box);vm.runInContext(managerSource,box);
  return {box,requests};
}
async function run(){
  const asset='assets/loading/gate.webp';
  let env=create('');
  assert.equal(env.box.TD2CdnMap.enabled,false,'CDN disabled by default');
  assert.deepEqual({...env.box.TD2CdnMap.resolve(asset)},{url:asset,fallback:null});
  let image=await env.box.DenkmalAssets.load(asset);
  assert.equal(image.src,asset,'default mode uses the local asset');
  assert.ok(env.requests.every(url=>!url.includes('res.cloudinary.com')));

  env=create('?td2Cdn=1');
  assert.equal(env.box.TD2CdnMap.enabled,true,'explicit query flag enables CDN');
  const mapped=env.box.TD2CdnMap.resolve(asset);
  assert.match(mapped.url,/^https:\/\/res\.cloudinary\.com\/xs5rd7mt\/image\/upload\/v1795466833\/td2\/runtime\/loading\/gate\.webp$/);
  assert.equal(mapped.fallback,asset);
  image=await env.box.DenkmalAssets.load(asset);
  assert.match(image.src,/^https:\/\/res\.cloudinary\.com\//,'successful CDN response is retained');

  env=create('?td2Cdn=1','network');
  image=await env.box.DenkmalAssets.load(asset);
  assert.deepEqual(env.requests,[mapped.url,asset],'network failure retries exactly once from local file');
  assert.equal(image.src,asset);
  assert.equal(env.box.DenkmalAssets.status(asset),'ready');

  env=create('?td2Cdn=1','decode');
  image=await env.box.DenkmalAssets.load(asset);
  assert.deepEqual(env.requests,[mapped.url,asset],'decode failure also retries exactly once from local file');
  assert.equal(image.src,asset);
  assert.equal(env.box.DenkmalAssets.status(asset),'ready');
  console.log('CDN asset map: opt-in, immutable URL, local default, network and decode fallback passed');
}
run().catch(error=>{console.error(error);process.exitCode=1;});
