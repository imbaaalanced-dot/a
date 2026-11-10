import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../render.js',import.meta.url),'utf8');
const deployed=readFileSync(new URL('../../dist/ansturm/render.js',import.meta.url),'utf8');
test('Ansturm 2.0 renderer matches deployed copy',()=>assert.equal(deployed,source));
test('boss phases expose readable attack tells',()=>{
 for(const phase of ['warning','charge','haste','vulnerable','recovery'])assert.ok(source.includes("e.bossPhase==='"+phase+"'"),phase);
 assert.match(source,/Math\.sin\(s\.elapsed\*9\)/);
});
test('weapon impacts have distinct fallback colors',()=>{
 for(const key of ['effect_fire','effect_ice','effect_lance'])assert.ok(source.includes(key),key);
});
