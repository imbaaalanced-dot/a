import test from 'node:test';
import assert from 'node:assert/strict';
import {nextSpeed,SPEED_LIMITS} from '../config.js';

test('normaler Ansturm-Modus koppelt bei 2x und springt auf 1x zurueck',()=>{
  assert.equal(SPEED_LIMITS.normal,2);
  assert.equal(nextSpeed(1,false),2);
  assert.equal(nextSpeed(2,false),1);
});
test('Ansturm-Entwicklermodus erreicht 5x und springt danach auf 1x zurueck',()=>{
  assert.equal(SPEED_LIMITS.developer,5);
  let s=1;
  for(const expected of [2,3,4,5,1]){s=nextSpeed(s,true);assert.equal(s,expected);}
});
test('veraltete oder ungueltige Tempo-Werte bleiben gebunden',()=>{
  assert.equal(nextSpeed(3,false),1,'ehemaliges 3x faellt im Normalmodus auf 1x zurueck');
  assert.equal(nextSpeed(99,true),1);
  assert.equal(nextSpeed(0,true),2);
  assert.equal(nextSpeed(Number.NaN,false),2);
});