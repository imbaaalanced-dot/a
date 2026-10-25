import test from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../run-state.js';
import {createGame,startGame,spawnEnemy,purchase,step} from '../model.js';
function sample(){const s=createGame({random:()=>.5});s.gold=2000;purchase(s,'hp');purchase(s,'tesla');startGame(s);const e=spawnEnemy(s);e.hp-=5;e.burnUntil=4;e.burnDps=2;e.slowUntil=3;s.elapsed=2;s.waveElapsed=2;s.fireClock=.3;s.spawnClock=.2;s.hp=260;return s;}
test('running snapshot preserves gameplay, discards cosmetics, and injects RNG',()=>{const s=sample();s.effects=[{life:.2}];const raw=api.serializeRun(s);const random=()=>.7,r=api.deserializeRun(raw,{random});assert.equal(r.ok,true);assert.equal(r.state.random,random);assert.deepEqual(r.state.effects,[]);assert.deepEqual(r.state.projectiles,[]);assert.equal(api.serializeRun(r.state),raw);assert.equal(r.state.gold,s.gold);assert.deepEqual(r.state.enemies,s.enemies);});
test('restored simulation produces the same next step without replaying rewards',()=>{const s=sample();const r=api.deserializeRun(api.serializeRun(s),{random:()=>.5});step(s,1/30);step(r.state,1/30);assert.equal(api.serializeRun(r.state),api.serializeRun(s));});
test('intermission roundtrip keeps the remaining countdown',()=>{const s=sample();s.enemies=[];s.spawned=s.planned;s.status='intermission';s.intermission=3.2;const r=api.deserializeRun(api.serializeRun(s));assert.equal(r.ok,true);assert.equal(r.state.intermission,3.2);assert.equal(r.state.wave,1);});
test('save remains valid after the final enemy has spawned',()=>{const s=sample();s.spawned=s.planned;s.spawnClock=.1;s.enemies[0].speed=0;s.enemies[0].dps=0;for(let i=0;i<180;i++)step(s,1/30);assert.equal(s.spawnClock,0);assert.equal(api.deserializeRun(api.serializeRun(s)).ok,true);});
for(const [name,change] of Object.entries({future:x=>x.version=2,missing:x=>delete x.state.tech.hp,negative:x=>x.state.gold=-1,duplicate:x=>x.state.enemies.push({...x.state.enemies[0]}),upgrade:x=>x.state.upgrades.tesla=4,unknown:x=>x.state.enemies[0].type='constructor',id:x=>x.state.nextId=1,nan:x=>x.state.gold=null,hp:x=>x.state.hp=99999,spawn:x=>x.state.spawned=x.state.planned+1,emptyWave:x=>x.state.wave=0,dead:x=>x.state.hp=0,invalidSprite:x=>x.state.enemies[0].spriteKey='gate_a',extraTech:x=>x.state.tech.hack=3}))test(`rejects ${name}`,()=>{const x=JSON.parse(api.serializeRun(sample()));change(x);assert.equal(api.deserializeRun(JSON.stringify(x)).ok,false);});
test('malformed and absent input is rejected',()=>{for(const raw of ['{','null','[]','',null])assert.equal(api.deserializeRun(raw).ok,false);});
test('ready and lost games cannot be serialized as resumable runs',()=>{assert.throws(()=>api.serializeRun(createGame()));const s=sample();s.status='lost';assert.throws(()=>api.serializeRun(s));});
test('rejects malicious spawn work and excessive enemy budgets before simulation',()=>{
 for(const change of [s=>{s.wave=1e9;s.planned=10+3*s.wave+1;s.spawnClock=1e100},s=>{s.spawnClock=1e100},s=>{s.wave=1001;s.planned=3013}]){
  const x=JSON.parse(api.serializeRun(sample()));change(x.state);assert.equal(api.deserializeRun(JSON.stringify(x)).ok,false);
 }
});
