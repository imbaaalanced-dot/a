'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync('dist/index.html','utf8');
assert.doesNotMatch(html,/menuAnsturmBtn|href="ansturm\/index\.html"/);
assert.ok(html.includes('id="endlessMenu"'),'TD endless maps retained');
assert.ok(!fs.existsSync('ansturm-alpha1-5'),'legacy source must not ship');
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
assert.deepEqual(files('dist/ansturm'),['dist/ansturm/index.html']);
assert.deepEqual(files('dist/td2-ansturm-tutorial').sort(),['dist/td2-ansturm-tutorial/ansturm/index.html','dist/td2-ansturm-tutorial/index.html']);
for(const file of [...files('dist/ansturm'),...files('dist/td2-ansturm-tutorial')]){const page=fs.readFileSync(file,'utf8');assert.doesNotMatch(page,/<script|<canvas|<video/i);const href=page.match(/href="([^"]+)"/)[1];assert.equal(path.normalize(path.join(path.dirname(file),href)),'dist/ansturm-save-export.html');}
assert.ok(fs.existsSync('dist/ansturm-save-export.html'));assert.ok(fs.existsSync('dist/ansturm-save-export.mjs'));
console.log('TD runtime independent; old routes only offer same-origin save export');
