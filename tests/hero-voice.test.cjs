'use strict';
/* Beta #330 P1: recorded hero voice clips with priority and TTS fallback. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'../dist');
const saga=fs.readFileSync(path.join(root,'hero-saga.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const clips=['intro','chapter2','chapter3','ending','ultimate','lowhp'];
/* 2026-11-22: only the unchanged lines keep their recordings; the reworded
   lines (intro, chapter2, ending, lowhp) fall back to TTS until new clips exist. */
const recorded=['chapter3','ultimate'];
for(const id of clips){
  const file=path.join(root,'assets/hero/voice',id+'.mp3');
  assert.ok(fs.existsSync(file),`voice clip ${id}.mp3 must exist on disk`);
  if(recorded.includes(id)){
    assert.ok(saga.includes(`assets/hero/voice/${id}.mp3?v=voice-saga-20261119`),
      `saga must prefer the recorded clip for the unchanged line ${id}`);
  }else{
    assert.ok(saga.includes(`${id}:''`),
      `reworded line ${id} must use the TTS fallback until a new recording exists`);
  }
}
assert.ok(saga.includes("if(!clipSrc){tts();return;}"),
  'a line without a recorded clip must fall straight back to TTS');
assert.ok(saga.includes('const VOICE_PRIORITY={intro:3,chapter2:3,chapter3:3,ending:3,ultimate:2,lowhp:1,record:2,bossnear:2,portalsecure:2};'),
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

// Chronik-Stimmen (23.11.2026): neue Meilenstein-Slots mit Pacing-Gesetz.
assert.ok(saga.includes("record:'Ein neuer Rekord"), 'record-Zeile existiert');
assert.ok(saga.includes("bossnear:'Er kommt."), 'bossnear-Zeile existiert');
assert.ok(saga.includes("portalsecure:'Ein Abschnitt mehr"), 'portalsecure-Zeile existiert');
assert.ok(saga.includes('const CHRONIK_IDS={record:1,bossnear:1,portalsecure:1},CHRONIK_COOLDOWN_MS=30000;'), 'Chronik-Cooldown-Gesetz (30 s) gepinnt');
assert.ok(saga.includes("if(!inStory&&CHRONIK_IDS[id]){if(Date.now()-lastChronikAt<CHRONIK_COOLDOWN_MS)return;"), 'Cooldown greift nur ausserhalb der Story');
assert.ok(saga.includes('lastChronikAt=0;lastChronikId=null;'), 'Cooldown wird pro Run zurueckgesetzt');
assert.ok(saga.includes('stopVoice,speak:say,lines};'), 'speak-Export fuer Spiel-Trigger');

assert.ok(html.includes('hero-saga.js?v=voice-chronik-20261123'),
  'index.html must reference the new hero-saga cache key');
console.log('Hero voice: unchanged lines keep their recordings, reworded lines use TTS fallback');
