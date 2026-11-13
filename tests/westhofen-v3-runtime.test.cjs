'use strict';
/* Isolated V3 candidate contract: this does not grant historical or Android approval. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'../dist');
const filename='assets/westhofen/westhofen-memorial-style2-v3-preview.svg';
const url=filename+'?v=westhofen-style2v3-preview1';
const asset=path.join(root,filename);
const svg=fs.readFileSync(asset,'utf8');
assert.match(svg,/<svg\b/);
assert.match(svg,/viewBox="0 0 768 512"/);
assert.match(svg,/width="768" height="512"/);
for(const layer of [
    'stone-frame-v2','altar-steps-v2','bronze-emblem-v3','oval-shield-v3',
    'curved-feather-wing-left-v3','curved-feather-wing-right-v3','stone-weathering-v3',
    'altar-weathering-v3','forecourt-contact-shadow-v3']){
  assert.ok(svg.includes('id="'+layer+'"'),'V3 missing '+layer);
}
assert.doesNotMatch(svg,/<(?:script|image|foreignObject|text|animate|animateTransform)\b/i);
assert.doesNotMatch(svg,/\bon\w+\s*=|url\(https?:|data:/i);
assert.ok(Buffer.byteLength(svg)<100000,'V3 source exceeds mobile transfer budget');
const loader=fs.readFileSync(path.join(root,'asset-manager.js'),'utf8');
const renderer=fs.readFileSync(path.join(root,'westhofen-art.js'),'utf8');
assert.ok(loader.includes(url),'level 7 must preload the exact V3 URL');
assert.ok(renderer.includes(url),'renderer must reuse that exact URL');
assert.ok(!renderer.includes('westhofen-memorial-style2-v2.svg'),'V2 not loaded by V3 preview draw path');
assert.ok(!loader.includes('westhofen-memorial-style2-v2.svg'),'V2 must not be decoded a second time');
assert.match(renderer,/ctx\.drawImage\(memorialSprite,m\.x-225,m\.y-265,450,300\)/,'retain world pivot and size');
for(const rollback of ['westhofen-memorial-style2-v2.svg','westhofen-memorial-style2-v1.webp']){
  assert.ok(fs.existsSync(path.join(root,'assets/westhofen',rollback)),rollback+' must remain for rollback');
}
console.log('Westhofen V3 preview source, single preload URL, alpha-capable SVG shape and rollback assets passed; real Android/historical approval pending');
