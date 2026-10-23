import test from 'node:test';
import assert from 'node:assert/strict';
let active=0,maximum=0;
class MockImage{
  naturalWidth=1;
  set src(_url){active++;maximum=Math.max(maximum,active);queueMicrotask(()=>{this.onload?.();active--;});}
  decode(){return Promise.reject(new Error('decode rejected after load'));}
}
globalThis.Image=MockImage;
const {spriteStats}=await import('../sprites.js');
test('sprite loader caps concurrency and keeps drawable images when decode rejects',async()=>{
  const during=spriteStats();assert.ok(during.loading<=4);
  for(let i=0;i<30&&spriteStats().queued>0;i++)await new Promise(resolve=>setTimeout(resolve,0));
  const final=spriteStats();assert.equal(final.total,59);assert.equal(final.decoded,59);assert.equal(final.failed,0);assert.equal(final.loading,0);assert.equal(final.queued,0);assert.ok(maximum<=4);
});
