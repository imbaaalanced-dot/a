'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const dir=path.join(__dirname,'../dist');
const palettePath=path.join(dir,'style2-environment-palette.js');
assert.ok(fs.existsSync(palettePath),'Style-2 environment material palette should exist');
const src=fs.readFileSync(palettePath,'utf8');
assert.match(src,/terrain:/);assert.match(src,/stone:/);assert.match(src,/forest:/);assert.match(src,/warmLight:/);
for(const name of ['kirchende-art.js','church-art.js','hohensyburg-art.js','goethestrasse-art.js']){
 const source=fs.readFileSync(path.join(dir,name),'utf8');
 assert.match(source,/TD2Style2Materials/,`${name} must use shared material colors`);
 assert.doesNotMatch(source,/setInterval|requestAnimationFrame|Math\.random/,`${name} does not add per-frame procedural work`);
}
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
assert.ok(html.indexOf('style2-environment-palette.js')<html.indexOf('kirchende-art.js'));
console.log('Campaign 3-6 shared terrain materials and cached rendering passed');
