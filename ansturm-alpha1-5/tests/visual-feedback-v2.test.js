import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=readFileSync(new URL('../render.js',import.meta.url),'utf8');
const deployed=readFileSync(new URL('../../dist/ansturm/render.js',import.meta.url),'utf8');
const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const deployedApp=readFileSync(new URL('../../dist/ansturm/app.js',import.meta.url),'utf8');
test('Ansturm 2.0 visuals ship identically in source and dist',()=>{
 assert.equal(src,deployed);
 assert.equal(app,deployedApp);
 assert.match(app,/render\.js\?v=ansturm2a1/);
});
test('all four boss special phases have readable combat tells',()=>{
 for(const phase of ['warning','charge','haste','vulnerable','recovery'])assert.ok(src.includes("bossPhase==='"+phase+"'"),phase);
 assert.match(src,/Math\.sin\(s\.elapsed\*9\)/);
});
test('elemental impact fallback colors remain distinct',()=>{
 for(const effect of ['effect_fire','effect_ice','effect_lance'])assert.ok(src.includes(effect),effect);
});
