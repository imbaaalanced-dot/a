'use strict';
/* Westhofen v4 runtime contract: single painted WebP diorama, one preload URL,
   unchanged world anchor, no deleted legacy assets referenced anywhere. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'../dist');
const filename='assets/westhofen/westhofen-memorial-style2-v4.webp';
const url=filename+'?v=westhofen-style2v4';
const asset=path.join(root,filename);
assert.ok(fs.existsSync(asset),'v4 asset exists');
const bytes=fs.statSync(asset).size;
assert.ok(bytes>30000&&bytes<=122880,'mobile transfer budget 30-120 KB, got '+bytes);
const manager=fs.readFileSync(path.join(root,'asset-manager.js'),'utf8');
const renderer=fs.readFileSync(path.join(root,'westhofen-art.js'),'utf8');
assert.ok(manager.includes(url),'level 7 must preload the exact v4 URL');
assert.ok(renderer.includes(url),'renderer must reuse that exact URL');
assert.match(renderer,/ctx\.drawImage\(memorialBitmap,m\.x-225,m\.y-265,450,300\)/,'retain world pivot and size');
assert.match(renderer,/c\.width=900;c\.height=600/,'bitmap bake stays 2x of 450x300');
for(const legacy of ['westhofen-memorial-style2-v1.webp','westhofen-memorial-style2-v2.svg','westhofen-memorial-style2-v3-preview.svg']){
  assert.ok(!manager.includes(legacy)&&!renderer.includes(legacy),'legacy asset must not be referenced: '+legacy);
  assert.ok(!fs.existsSync(path.join(root,'assets/westhofen',legacy)),'legacy asset must be deleted: '+legacy);
}
console.log('Westhofen v4: painted WebP pinned, baked anchor 450x300, legacy assets removed');
