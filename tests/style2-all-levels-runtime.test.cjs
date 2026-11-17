/* PR #329: verify seven-level Style-2 asset wiring, not historical fidelity. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../dist');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const kirchende=read('kirchende-art.js');
const levelCode=read('levels.js');
const maps=read('style2-maps.js');
assert.match(maps,/levels 1[–-]2|levels 1.*2/i,'Levels 1/2 use the shared Style-2 map renderer');
assert.match(maps,/function worldGround/,'Level 1/2 use cached painted ground');
assert.match(levelCode,/1:\s*\{/,'Level 1 registered');
assert.match(levelCode,/2:\s*\{/,'Level 2 registered');
assert.match(kirchende,/const pilot=!legacy/,'Style-2 monument is default for Level 3');
assert.match(kirchende,/td2KirchendeMemorialLegacy=1/,'photo mode is reversible');
assert.match(kirchende,/assets.monument='monument-photo-v2.webp'/,'failed Style-2 load can fall back');
assert.doesNotMatch(kirchende,/assets\[.?plaque.?\]/,'unapproved candle plaque cannot be loaded');
const landmarks=[
  [3,'kirchende-art.js','assets/kirchende/monument-style2-pilot.webp'],
  [4,'church-art.js','assets/level4/lion-1879-style2-2x.webp'],
  [5,'hohensyburg-art.js','assets/hohensyburg/kaiser-wilhelm-style2-qa-v2-2x.webp'],
  [6,'goethestrasse-art.js','assets/elemental/goethestrasse-memorial-style2.webp'],
  [7,'westhofen-art.js','assets/westhofen/westhofen-memorial-style2-v3-preview.svg']
];
for(const [level,loader,asset] of landmarks){
  assert.match(levelCode,new RegExp('(?:^|\\n)\\s*'+level+':\\s*\\{'),'level '+level+' registered');
  assert.ok(read(loader).includes(asset),'level '+level+' references runtime landmark '+asset);
  const filename=path.join(root,asset);
  assert.ok(fs.existsSync(filename),'level '+level+' runtime file missing: '+asset);
  const binary=fs.readFileSync(filename);
  assert.ok(binary.length>512&&binary.length<1600000,'level '+level+' asset transfer budget');
  if(asset.endsWith('.webp')){
    assert.equal(binary.toString('ascii',0,4),'RIFF','level '+level+' WebP RIFF');
    assert.equal(binary.toString('ascii',8,12),'WEBP','level '+level+' WebP signature');
  }else{
    assert.match(binary.toString('utf8',0,Math.min(binary.length,2000)),/<svg\b/i,'level '+level+' SVG');
  }
}
console.log('Style-2 levels 1–7: runtime filenames and files present; Level 1/2 shared renderer, Level 3 photo fallback verified. Historical and physical Android QA are separate.');
