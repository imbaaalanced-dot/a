'use strict';
/* Level-3 intro: the overlay may only open when the MP4 actually ships. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'../dist');
const src=fs.readFileSync(path.join(root,'level-intro.js'),'utf8');
const match=src.match(/const CLIP_SHIPPED = (true|false);/);
assert.ok(match,'level-intro.js must declare the CLIP_SHIPPED switch');
const clip=fs.existsSync(path.join(root,'assets/intro/kirchende-intro-v1.mp4'));
assert.strictEqual(match[1]===true,clip,
  clip?'Clip liegt im Repo: CLIP_SHIPPED muss true sein, sonst spielt das Intro nie.'
      :'Clip fehlt noch: CLIP_SHIPPED muss false sein, sonst feuert jedes Spiel einen garantierten 404 (Browser-QA-Gates).');
assert.ok(src.includes('if (!CLIP_SHIPPED) return false;'),
  'show() must bail out before any video request while the clip is not shipped');
assert.ok(src.includes("video.addEventListener('error'"),
  'runtime error fallback stays in place for shipped-but-broken clips');
console.log('Level-3 intro clip availability consistent:',clip?'shipped':'not shipped (overlay inert, no 404)');
