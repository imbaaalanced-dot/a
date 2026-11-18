'use strict';
/* Beta #330 audio unlock: wiring must stay in place for the browser gate. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'../dist');
const game=fs.readFileSync(path.join(root,'game.js'),'utf8');
const fx=fs.readFileSync(path.join(root,'combat-fx.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.ok(game.includes("document.addEventListener('pointerdown',()=>{fx.unlock();fx.mute(!audioOn);});"),
  'pointerdown must unlock the audio context and apply the sound preference');
assert.ok(game.includes("document.addEventListener('keydown',()=>{fx.unlock();fx.mute(!audioOn);});"),
  'keydown must unlock the audio context and apply the sound preference');
assert.ok(fx.includes('function unlock()'), 'combat-fx must expose the unlock routine');
assert.ok(fx.includes('const AC = globalThis.AudioContext || globalThis.webkitAudioContext;'),
  'unlock must create the AudioContext lazily inside the user gesture');
const unlockBody=fx.match(/function unlock\(\) \{[\s\S]*?\n  }/)?.[0]||'';
assert.ok(unlockBody.includes('audio = new AC();'),
  'AudioContext must be created only inside unlock(), never at module load');
assert.ok(fx.includes('getContext,getMaster'), 'gate relies on getContext/getMaster exposure');
assert.ok(fx.includes('master.gain.value = muted ? 0 : .65'), 'mute must toggle master gain between 0 and 0.65');
assert.ok(html.includes('id="menuSoundBtn"') && html.includes('TON: AN'),
  'menu must expose the sound button with a readable label');
assert.ok(game.includes("if(ac.state==='suspended')void ac.resume();"),
  'menu tone must resume a suspended context');
const ansturm=fs.readFileSync(path.join(root,'ansturm/app.js'),'utf8');
assert.ok(ansturm.includes("if(!audioCtx)audioCtx=new Audio();") && ansturm.includes("if(audioCtx.state==='suspended')audioCtx.resume()"),
  'Ansturm must lazily create and resume its AudioContext inside tone()');
console.log('Audio unlock wiring pinned: pointerdown/keydown, lazy AudioContext, mute toggle, Ansturm tone');
