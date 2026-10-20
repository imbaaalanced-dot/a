const assert=require('node:assert/strict'),B=require('../dist/campaign-balance.js');
assert.equal(B.profile(1,{pilot:true}).localWaves,8);
assert.equal(B.profile(2,{pilot:true}),null);assert.equal(B.profile(1,{pilot:false}),null);
assert.deepEqual(B.profile(1,{pilot:true}).phases,[[1,2],[3,5],[6,8]]);
assert.equal(B.profile(1,{pilot:true}).slots.length,8);
console.log('campaign balance: eight-wave pilot profile and scope isolation passed');
