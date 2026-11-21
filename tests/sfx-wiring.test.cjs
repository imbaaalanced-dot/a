'use strict';
/* Beta #330 P1: tower shot/impact/magic SFX must be wired into the burst path. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'../dist');
const fx=fs.readFileSync(path.join(root,'combat-fx.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.ok(fx.includes('function burst(game, bullet, impact, enabled, reduced) {\n    sound(bullet.kind, impact, enabled);'),
  'burst must trigger the matching SFX for every shot and impact');
assert.ok(fx.includes("const heavy = kind === 'cannon' || kind === 'mortar', arrow = kind === 'bow' || kind === 'ballista', magic = kind === 'magic' || kind === 'wand';"),
  'SFX profiles must cover heavy, arrow and magic (Zauber) kinds');
assert.ok(fx.includes('magic ? 240 : 460'), 'magic shots use the dedicated magic base frequency');
assert.ok(fx.includes('magic ? 900 : 800'), 'magic shots sweep to the dedicated magic target');
assert.ok(fx.includes("voices >= 8"), 'polyphony capped at eight simultaneous voices');
assert.ok(fx.includes("(now - (lastSound.get(key) ?? -1) < .055) return;"),
  'per-kind rate limit prevents SFX spam during large waves');
assert.ok(fx.includes("audio.state !== 'running'"), 'SFX only plays after the audio unlock');
assert.ok(fx.includes('unlock,mute,burst'), 'burst remains exported in the combat-fx API');
assert.ok(fx.includes('setViewZoom,uiScale,setVolume,sfx};'),
  'the sfx event API is exported alongside the fx controls');
assert.ok(html.includes('combat-fx.js?v=procedural-sfx-20261121'),
  'index.html must reference the new combat-fx cache key');
console.log('SFX wiring: burst triggers shot/impact/magic profiles with caps and unlock gate');
