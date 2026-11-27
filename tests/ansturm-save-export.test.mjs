import test from 'node:test';
import assert from 'node:assert/strict';
import {buildLegacyExport} from '../dist/ansturm-save-export.mjs';
const storage=entries=>({getItem:k=>entries[k]??null});
test('only legacy Ansturm data exported',()=>{
const run=JSON.stringify({version:1,state:{wave:3}});
const original={'td2.denkmalAnsturm.alpha1.bestWave.v1':'5','td2.denkmalAnsturm.run.v1':run,'td2.campaign':'secret'};
const result=JSON.parse(buildLegacyExport(storage(original)));
assert.deepEqual(result,{game:'ansturm',version:1,bestWave:5,run});
assert.equal(original['td2.campaign'],'secret');
});
test('empty save',()=>assert.deepEqual(JSON.parse(buildLegacyExport(storage({}))),{game:'ansturm',version:1,bestWave:0,run:null}));
test('reject invalid save',()=>assert.throws(()=>buildLegacyExport(storage({'td2.denkmalAnsturm.run.v1':'broken'}))));
test('reject invalid record',()=>assert.throws(()=>buildLegacyExport(storage({'td2.denkmalAnsturm.alpha1.bestWave.v1':'-1'}))));
