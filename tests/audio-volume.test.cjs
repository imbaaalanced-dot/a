'use strict';
/* Beta #330 P1: shared volume levels for SFX and voice (100/70/40 %). */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'../dist');
const fx=fs.readFileSync(path.join(root,'combat-fx.js'),'utf8');
const game=fs.readFileSync(path.join(root,'game.js'),'utf8');
const saga=fs.readFileSync(path.join(root,'hero-saga.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.ok(fx.includes('function setVolume(volume) { volumeScale=Math.max(0,Math.min(1,volume));'),
  'combat-fx must clamp the shared volume to 0..1');
assert.ok(fx.includes('master.gain.value = mutedState ? 0 : .65*volumeScale;'),
  'mute and volume compose: mute wins, otherwise gain scales with the level');
assert.ok(fx.includes('master.gain.value = .65*volumeScale;'),
  'a late audio unlock must respect the chosen level');
assert.ok(fx.includes('setViewZoom,uiScale,setVolume};'), 'setVolume is exported in the fx API');
assert.ok(game.includes('const steps=[1,.7,.4];volume=steps[(steps.indexOf(volume)+1)%steps.length];'),
  'volume cycles 100 -> 70 -> 40 %');
assert.ok(game.includes("volume=[1,.7,.4].includes(preferences.volume)?preferences.volume:1;"),
  'saved levels load with a safe default');
assert.ok(game.includes("(!('volume' in p)||[1,.7,.4].includes(p.volume))"),
  'legacy saves without a volume key stay valid - no preference reset');
assert.ok(game.includes('globalThis.TD2_AUDIO_VOLUME=volume;'),
  'the chosen level is published for non-WebAudio consumers');
assert.ok(saga.includes('clip.volume=globalThis.TD2_AUDIO_VOLUME??1;'),
  'recorded hero voice clips follow the shared level');
assert.ok(saga.includes('utterance.volume=globalThis.TD2_AUDIO_VOLUME??1;'),
  'TTS narration follows the shared level');
assert.ok(html.includes('id="menuVolumeBtn"') && html.includes('id="volumeBtn"'),
  'both option surfaces expose the volume control');
assert.ok(html.includes('LAUTSTÄRKE: 100 %'),
  'the control is labelled with its level');
assert.ok(html.includes('game.js?v=levelintro-volume-20261120')
  && html.includes('combat-fx.js?v=volume-audio-20261120')
  && html.includes('hero-saga.js?v=volume-audio-20261120'),
  'all touched modules ship fresh cache keys');
console.log('Audio volume levels: 100/70/40 across SFX, voice and TTS pinned');
