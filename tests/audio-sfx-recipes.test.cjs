'use strict';
/* #371: procedural named event sounds - recipes pinned, gated, throttled and wired into game.js. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'../dist');
const fx=fs.readFileSync(path.join(root,'combat-fx.js'),'utf8');
const game=fs.readFileSync(path.join(root,'game.js'),'utf8');

assert.ok(fx.includes('function sfx(name)'), 'sfx() is the named event sound entry point');
assert.ok(fx.includes('setViewZoom,uiScale,setVolume,sfx};'), 'sfx is exported in the fx API');
assert.ok(fx.includes('voices >= 10 || audio.state !== \'running\''),
  'event sounds respect the voice cap and only play after the audio unlock');
assert.ok(fx.includes('mutedState || '), 'muted state silences event sounds');
assert.ok(fx.includes('const SFX_COOLDOWN = { monumentHit:.09, enemyDie:.05, heroHurt:.06, lootPickup:.03 };'),
  'per-name cooldowns stay pinned');
assert.ok(fx.includes('SFX_COOLDOWN[name] ?? .028'), 'every other name keeps the default 28 ms throttle');
assert.ok(fx.includes("typeof audio.createBuffer !== 'function'"),
  'noise layers degrade silently when the AudioContext is restricted (WebView mocks)');
assert.ok(fx.includes('Math.floor(audio.sampleRate * .5)') && fx.includes('noiseBuffer.getChannelData'),
  'one shared half-second noise buffer serves every noise layer');

const recipeNames=[...fx.matchAll(/ {4}([a-zA-Z]+): \[\{(?:osc|noise):1/g)].map(m=>m[1]);
const expected=['gameStart','waveLaunch','bossSpawn','bossLoot','enemyDie','towerBuild','towerUpgrade',
  'towerSell','waveCleared','victory','defeat','monumentHit','heroHurt','lootPickup','lootItem','dodge','uiClick','uiToggle'];
for(const name of expected){
  assert.ok(recipeNames.includes(name), 'recipe missing: '+name);
}
assert.equal(recipeNames.length, expected.length, 'unexpected extra recipe entries');

const wired=[...game.matchAll(/fx\.sfx\?\.\('([a-zA-Z]+)'\)/g)].map(m=>m[1]);
assert.ok(wired.length>=13, 'game.js wires the named event sounds at the event sites');
for(const name of wired){
  assert.ok(recipeNames.includes(name), 'game.js wires an unknown sound: '+name);
}
assert.ok(game.includes("fx.sfx?.(l.kind==='item'?'lootItem':'lootPickup')"),
  'loot pickups distinguish item drops from essence');
assert.ok(game.includes("fx.sfx?.(targetObj===h?'heroHurt':'monumentHit')"),
  'enemy attacks distinguish hero hits from monument hits');
assert.ok(game.includes("if(e.hp<=0){fx.sfx?.('enemyDie');"),
  'every kill plays the enemy death sound');
assert.ok(game.includes("game.intermission=0;game.spawnTimer=.4;fx.sfx?.('waveLaunch')"),
  'launching the next wave plays the war drum');
assert.ok(game.includes("focusModal($('levelComplete'));fx.sfx?.('victory');"),
  'level completion plays the victory motif');
assert.ok(game.includes('function tone(freq,dur=.05,vol=.035)'),
  'plain tone() remains in place as the saga/developer fallback');
assert.ok(game.includes('soundOn:()=>audioOn,hurtEnemy,spark,tone'),
  'the saga keeps receiving the tone fallback hook');

// Runtime smoke: drive sfx through a complete AudioContext mock with buffer support.
const param=()=>({value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}});
let started=0;
class AudioContextMock{
  state='running';currentTime=0;sampleRate=44100;destination={};
  createGain(){return {gain:param(),connect(){return this;},disconnect(){}};}
  createOscillator(){return {type:'',frequency:param(),connect(){return this;},disconnect(){},start(){started++;},stop(){},onended:null};}
  createBiquadFilter(){return {type:'',frequency:param(),Q:param(),connect(){return this;},disconnect(){}};}
  createBuffer(ch,len){return {getChannelData:()=>new Float32Array(len)};}
  createBufferSource(){return {buffer:null,loop:false,connect(){return this;},disconnect(){},start(){started++;},stop(){},onended:null};}
}
const sandbox={AudioContext:AudioContextMock,Math,console};
vm.createContext(sandbox);
vm.runInContext(fx,sandbox);
const api=sandbox.DenkmalCombatFX;
assert.ok(api&&typeof api.sfx==='function','DenkmalCombatFX exposes sfx() at runtime');
api.unlock();
assert.ok(started===0,'unlocking alone produces no sound before the context resumes');

const before=started;
api.sfx('towerBuild');
assert.ok(started>=before+2,'towerBuild layers (osc + noise) start playing');
api.sfx('towerBuild');
assert.equal(started,before+2,'the per-name throttle suppresses an immediate replay');
api.sfx('unknownName');
assert.equal(started,before+2,'unknown names are ignored without throwing');
api.mute(true);
api.sfx('waveCleared');
assert.equal(started,before+2,'mute silences event sounds');
api.mute(false);
api.sfx('waveCleared');
assert.ok(started>before+2,'unmuting lets event sounds play again');
console.log('SFX event recipes: '+expected.length+' sounds pinned, throttled and wired into game.js');
