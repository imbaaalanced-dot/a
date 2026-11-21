'use strict';
/* #395-Folge: Ansturm erhaelt benannte prozedurale Ereignis-Sounds (Rezept-Teilmenge
   aus combat-fx.js) unter Beibehaltung der tone()-Unlock-Kontrakte. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const app=fs.readFileSync(path.join(__dirname,'../dist/ansturm/app.js'),'utf8');
const appAlpha=fs.readFileSync(path.join(__dirname,'../ansturm-alpha1-5/app.js'),'utf8');
const page=fs.readFileSync(path.join(__dirname,'../dist/ansturm/index.html'),'utf8');
const pageAlpha=fs.readFileSync(path.join(__dirname,'../ansturm-alpha1-5/index.html'),'utf8');

// Quelle und Deployment-Kopie bleiben byte-identisch (Parity gilt auch fuer das SFX-Set).
assert.ok(app===appAlpha,'dist/ansturm/app.js und ansturm-alpha1-5/app.js muessen identisch sein');
assert.ok(page.includes('app.js?v=ansturm-sfx-20261122'),'deployed cache key ist angehoben');
assert.ok(pageAlpha.includes('app.js?v=ansturm-sfx-20261122'),'alpha cache key folgt nach');

assert.ok(app.includes('function tone(frequency=440)'),'tone() bleibt als Fallback und Unlock-Pin erhalten');
assert.ok(app.includes('function sfx(name)'),'sfx() ist der benannte Ereignis-Sound-Einstieg');
assert.ok(!app.includes('tone(580)') && !app.includes('tone(650)'),
  'Kill- und Toggle-Blips sind auf benannte Sounds umgestellt');

// Vertraege徒步: lazy AudioContext auch im SFX-Pfad, Voice-Cap, Drossel, Noise-Degradation.
assert.ok(app.includes("const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;if(!audioCtx)audioCtx=new Audio();if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});if(audioCtx.state!=='running'||sfxVoices>=8)return;"),
  'sfx() eroeffnet den Kontext lazy, wartet auf running und respektiert das Voice-Cap');
assert.ok(app.includes('const SFX_A_COOLDOWN={monumentHit:.09,enemyDie:.05,uiClick:.028};'),
  'per-name cooldowns fuer Ansturm bleiben gepinnt');
assert.ok(app.includes('SFX_A_COOLDOWN[name] ?? .028'),'Standarddrossel 28 ms bleibt erhalten');
assert.ok(app.includes("typeof audioCtx.createBuffer!=='function'"),
  'Noise-Layer degradieren still bei eingeschraenktem AudioContext');
assert.ok(app.includes('Math.floor(audioCtx.sampleRate*.5)') && app.includes('sfxNoiseBuffer.getChannelData'),
  'ein geteilter 0,5-s-Noise-Buffer dient allen Noise-Layern');

const sfxBlock=app.slice(app.indexOf('const SFX_A={'), app.indexOf('lastMonumentHp=s.hp+s.shield;'));
const recipeNames=[...sfxBlock.matchAll(/^  ([a-zA-Z]+):\[\{(?:osc|noise):1/gm)].map(m=>m[1]);
const expected=['waveLaunch','waveCleared','bossSpawn','enemyDie','monumentHit','defeat','towerUpgrade','uiClick','uiToggle'];
for(const name of expected)assert.ok(sfxBlock.includes(name+':'),'Rezept fehlt: '+name);
assert.equal(recipeNames.length,expected.length,'unerwartete zusaetzliche Rezepte');

// Verdrahtung: jede Interaktion spielt den passenden benannten Sound.
const wired=[...new Set([...app.matchAll(/sfx\('([a-zA-Z]+)'\)/g)].map(m=>m[1]))];
for(const name of expected)assert.ok(wired.includes(name),'Ansturm verdrahtet nicht: '+name);
assert.ok(app.includes("if(s.kills>lastKills){sfx('enemyDie');"),'jeder Kill spielt den Gegner-Tod-Sound');
assert.ok(app.includes("if(s.wave>oldWave&&s.status==='running')sfx('waveLaunch');"),
  'Wellenstart (Button und Auto) spielt die Kriegstrommel');
assert.ok(app.includes("if(s.status==='intermission'&&oldStatus==='running')sfx('waveCleared');"),
  'Wellenabschluss spielt den Dreiklang');
assert.ok(app.includes("bossSeen.add(bossNow);sfx('bossSpawn');"),'erstmals lebender Boss spielt das Horn');
assert.ok(app.includes("if(hpNow<lastMonumentHp&&s.status==='running')sfx('monumentHit');"),
  'Monument-Schaden spielt das Wummern');
assert.ok(app.includes("shownDefeat=true;sfx('defeat');"),'Niederlage spielt die Moll-Klage');
assert.ok(app.includes("purchase(s,id)"),'Kaeufe bleiben ueber purchase() gekapselt');

// Runtime-Smoke: Engine-Slice mit vollständigem AudioContext-Mock fahren.
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
const sandbox={window:{AudioContext:AudioContextMock,webkitAudioContext:AudioContextMock},Math,console,setTimeout,queueMicrotask};
sandbox.audioCtx=null;sandbox.soundOn=true;
vm.createContext(sandbox);
vm.runInContext(sfxBlock,sandbox);
assert.ok(typeof sandbox.sfx==='function','Engine-Slice definiert sfx() als global');

const before=started;
sandbox.sfx('enemyDie');
assert.ok(started>=before+2,'enemyDie startet Oszillator- und Noise-Layer');
sandbox.sfx('enemyDie');
assert.equal(started,before+2,'die per-name Drossel unterdrueckt ein sofortiges Replay');
sandbox.sfx('gibtsNicht');
assert.equal(started,before+2,'unbekannte Namen werden ignoriert, ohne zu werfen');
sandbox.soundOn=false;
sandbox.sfx('bossSpawn');
assert.equal(started,before+2,'Ton: Aus schweigt auch die Ereignis-Sounds');
sandbox.soundOn=true;
sandbox.audioCtx=null; // lazy Neueroeffnung im selben Aufruf
sandbox.sfx('towerUpgrade');
assert.ok(started>before+2,'der Kontext wird lazy neu eroeffnet und der Kauf-Sound laeuft');
sandbox.audioCtx=new AudioContextMock();
sandbox.audioCtx.state='suspended';
const beforeSuspended=started;
sandbox.sfx('waveLaunch');
assert.equal(started,beforeSuspended,'suspended Kontexte spielen nichts, bis resume greift');

console.log('Ansturm SFX: '+expected.length+' Rezepte gepinnt, gedrosselt, verdrahtet (dist + alpha1-5 identisch)');
