'use strict';
/* Beta #330 P1: recorded hero voice clips with priority and TTS fallback. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'../dist');
const saga=fs.readFileSync(path.join(root,'hero-saga.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const clips=['intro','chapter2','chapter3','ending','ultimate','lowhp'];
for(const id of clips){
  const file=path.join(root,'assets/hero/voice',id+'.mp3');
  assert.ok(fs.existsSync(file),`voice clip ${id}.mp3 must exist on disk`);
  assert.ok(saga.includes(`assets/hero/voice/${id}.mp3?v=voice-saga-20261119`),
    `saga must prefer the recorded clip for ${id}`);
}
assert.ok(saga.includes('const VOICE_PRIORITY={intro:3,chapter2:3,chapter3:3,ending:3,ultimate:2,lowhp:1};'),
  'voice priorities must rank story above ultimate above lowhp');
assert.ok(saga.includes("currentVoice.priority>(VOICE_PRIORITY[id]||0))return;"),
  'lower-priority voice lines must not interrupt a running higher-priority line');
assert.ok(saga.includes('function speakTts(text)'),
  'TTS must remain as fallback narration path');
assert.ok(saga.includes("clip.onerror=()=>{if(!handled){handled=true;tts();}}"),
  'missing or blocked clip must fall back to TTS exactly once');
assert.ok(saga.includes("if(playing&&playing.catch)playing.catch(()=>{if(!handled){handled=true;tts();}})"),
  'autoplay-blocked clip playback must fall back to TTS');
assert.ok(saga.includes('currentVoice={id:null,priority:0};'),
  'stopVoice must reset the priority state');
assert.ok(saga.includes('if(!voiceEnabled||!api.soundOn())return;'),
  'voice must respect the voice toggle and the global sound switch');
assert.ok(html.includes('hero-saga.js?v=volume-audio-20261120'),
  'index.html must reference the new hero-saga cache key');
console.log('Hero voice: 6 recorded clips wired with priorities and TTS fallback');
