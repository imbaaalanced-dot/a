const assert=require('node:assert/strict'),P=require('../dist/portal-perks.js');
assert.equal(P.catalog.length,12);
const a=P.offer({},13,{}),b=P.offer({},13,{});assert.deepEqual(a,b);assert.equal(new Set(a.ids).size,3);
assert(!P.offer({power:3},13,{}).ids.includes('power'));
assert.equal(P.derive({damage:100,speed:100,towerRate:1},{power:3,step:3}).damage,124);
assert(Math.abs(P.derive({damage:100,speed:100,towerRate:1},{step:3}).speed-115)<1e-9);
assert.equal(P.derive({}, {choke:3}).slow,.16);
assert.throws(()=>P.choose({},'bad'));assert.throws(()=>P.choose({power:3},'power'));
console.log('portal perks: deterministic unique offers, caps and derived stats passed');
