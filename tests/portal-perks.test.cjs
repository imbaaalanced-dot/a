'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const fs=require('node:fs'),vm=require('node:vm');
const P=require('../dist/portal-perks.js');
const context={heroId:'marcel',turretKinds:['bow']};
const base={heroDamage:100,maxHp:100,moveSpeed:100,towerDamage:100,towerRange:100,towerAttackSpeed:100};
test('catalog contains twelve perks with exact three-rank values',()=>{
  assert.equal(P.catalog.length,12);
  assert.deepEqual(P.catalog.find(p=>p.id==='engpass').values,[.08,.12,.16]);
  assert.deepEqual(P.catalog.find(p=>p.id==='zielmarkierung').values,[.15,.25,.35]);
  assert.deepEqual(P.catalog.find(p=>p.id==='gegenstoss').values,[.10,.18,.26]);
});
test('same saved input gives same three distinct offers and RNG continuation',()=>{
  const a=P.offer({},123,context),b=P.offer({},123,context);
  assert.deepEqual(a,b);assert.equal(a.ids.length,3);assert.equal(new Set(a.ids).size,3);
  assert.notEqual(a.rngState,123);
});
test('max ranks never offered, including nine acquired perks and repeated resume',()=>{
  const ranks=Object.fromEntries(P.catalog.slice(0,9).map(p=>[p.id,3]));
  const a=P.offer(ranks,42,context);
  assert.equal(a.ids.length,3);assert.ok(a.ids.every(id=>!ranks[id]));
  for(let i=0;i<10;i++)assert.deepEqual(P.offer(ranks,42,context),a);
  assert.deepEqual(P.offer(Object.fromEntries(P.catalog.map(p=>[p.id,3])),42,context).ids,[]);
});
test('without towers an offer includes an immediately useful hero perk when available',()=>{
  for(let seed=0;seed<100;seed++){
    const a=P.offer({},seed,{heroId:'kim',turretKinds:[]});
    assert.ok(a.ids.some(id=>P.catalog.find(p=>p.id===id).category==='hero'));
  }
});
test('exhausted pool returns remaining choices without duplicates',()=>{
  const ranks=Object.fromEntries(P.catalog.slice(0,11).map(p=>[p.id,3]));
  assert.equal(P.offer(ranks,0,context).ids.length,1);
});
test('choose is immutable and rejects unknown, invalid and maximum ranks',()=>{
  const ranks={kraft:2};assert.deepEqual(P.choose(ranks,'kraft'),{kraft:3});assert.deepEqual(ranks,{kraft:2});
  for(const r of [{kraft:3},{kraft:-1},{kraft:NaN},{kraft:1.5},{unknown:1}])assert.throws(()=>P.choose(r,'kraft'));
  assert.throws(()=>P.choose({},'unknown'));
});
test('rank three uses total values, never compounded rank bonuses',()=>{
  const s=P.derive(base,{kraft:3,schritt:3,ausdauer:3,praezision:3,reichweite:3,taktung:3,engpass:3,erholung:3});
  assert.equal(s.heroDamage,124);assert.equal(s.moveSpeed,115);assert.equal(s.maxHp,130);
  assert.equal(s.towerDamage,124);assert.equal(s.towerRange,115);assert.equal(s.towerAttackSpeed,115);
  assert.equal(s.slowFraction,.16);assert.equal(s.extraHealFraction,.09);assert.deepEqual(base,{heroDamage:100,maxHp:100,moveSpeed:100,towerDamage:100,towerRange:100,towerAttackSpeed:100});
});
test('engpass uses 8/12/16 percent and shared coverage is boolean, not tower count',()=>{
  for(let rank=1;rank<=3;rank++)assert.equal(P.derive(base,{engpass:rank}).slowFraction,[.08,.12,.16][rank-1]);
  assert.deepEqual(P.areaModifiers({deckung:3,waechterkreis:3},{withinTowerRange:true,towerWithinGuardianRadius:true}),{incomingDamageMultiplier:.89,towerAttackSpeedMultiplier:1.11});
  assert.deepEqual(P.areaModifiers({deckung:3,waechterkreis:3},{}),{incomingDamageMultiplier:1,towerAttackSpeedMultiplier:1});
});
test('hero marks target for two seconds; next base tower hit consumes mark once',()=>{
  const ranks={zielmarkierung:3};
  const marked=P.hitEffects({}, {origin:'base',source:'hero',targetId:'mob',time:1},ranks);
  const tower=P.hitEffects(marked.state,{origin:'base',source:'tower',targetId:'mob',time:2},ranks);
  assert.equal(tower.damageMultiplier,1.35);
  assert.equal(P.hitEffects(tower.state,{origin:'base',source:'tower',targetId:'mob',time:2},ranks).damageMultiplier,1);
  assert.equal(P.hitEffects(marked.state,{origin:'base',source:'tower',targetId:'mob',time:3},ranks).damageMultiplier,1);
  assert.equal(P.hitEffects(marked.state,{origin:'base',source:'tower',targetId:'other',time:2},ranks).damageMultiplier,1);
});
test('counterstrike charges once, consumes once and has a two-second shared cooldown',()=>{
  const ranks={gegenstoss:3,engpass:2};
  const charged=P.hitEffects({}, {origin:'base',source:'tower',targetId:'a',time:1},ranks);
  assert.equal(charged.slowFraction,.12);assert.equal(charged.slowSeconds,1);
  const hit=P.hitEffects(charged.state,{origin:'base',source:'hero',targetId:'a',time:1.1},ranks);
  assert.equal(hit.damageMultiplier,1.26);
  const early=P.hitEffects(hit.state,{origin:'base',source:'tower',targetId:'a',time:2},ranks);
  assert.equal(P.hitEffects(early.state,{origin:'base',source:'hero',targetId:'a',time:2.1},ranks).damageMultiplier,1);
  const later=P.hitEffects(early.state,{origin:'base',source:'tower',targetId:'a',time:3},ranks);
  assert.equal(P.hitEffects(later.state,{origin:'base',source:'hero',targetId:'a',time:3.1},ranks).damageMultiplier,1.26);
});
test('perk-origin damage cannot trigger or consume any hit perk',()=>{
  const state={marks:{a:10},counterCharge:true,counterReadyAt:0};
  const result=P.hitEffects(state,{origin:'perk',source:'tower',targetId:'a',time:1},{zielmarkierung:3,gegenstoss:3,engpass:3});
  assert.equal(result.state,state);assert.equal(result.damageMultiplier,1);assert.equal(result.slowFraction,0);
});
test('rejects bad seed, rank and base stats without NaN output',()=>{
  for(const seed of [-1,NaN,Infinity,1.5])assert.throws(()=>P.offer({},seed,context));
  assert.throws(()=>P.derive({...base,heroDamage:NaN},{}));
  assert.throws(()=>P.derive(base,{kraft:4}));
});
test('browser global works without CommonJS',()=>{
  const c=vm.createContext({});vm.runInContext(fs.readFileSync(require.resolve('../dist/portal-perks.js'),'utf8'),c);
  assert.equal(c.PortalPerks.catalog.length,12);
});
