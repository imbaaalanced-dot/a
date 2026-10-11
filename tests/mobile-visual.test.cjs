/* TD2 mobile and graphics polish regression: node tests/mobile-visual.test.cjs */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const dist=path.resolve(__dirname,'../dist');
const html=fs.readFileSync(path.join(dist,'index.html'),'utf8');
const css=fs.readFileSync(path.join(dist,'portrait-patch.css'),'utf8');
const game=fs.readFileSync(path.join(dist,'game.js'),'utf8');
assert.match(html,/portrait-patch\.css\?v=v360a7mobile1/, 'changed portrait stylesheet must bust cache');
assert.match(html,/game\.js\?v=v360a7mobile1/, 'changed game code must bust cache');
assert.match(css,/\.joystick\.active\s*\{[^}]*box-shadow:/s,'visible touch engagement');
assert.match(css,/@media\s*\(pointer:coarse\)/,'coarse pointer targets must be enhanced');
assert.match(css,/min-height:\s*48px/,'touch actions need 48px targets');
assert.match(game,/if\(document\.hidden\)\{last=now;requestAnimationFrame\(loop\);return;\}/,'background should skip simulation/render');
assert.match(game,/const dt=Math\.min\(\.034,/,'foreground delta must remain bounded');
console.log('Mobile visuals, touch targets, background render and cache references checked');
