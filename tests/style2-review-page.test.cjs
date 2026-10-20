/* The manual Art QA page must remain independent of game runtime. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync('dist/style2-sprite-review.html','utf8');
const matches=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
assert.equal(matches.length,1,'review page uses a single local self-contained script');
new vm.Script(matches[0][1],{filename:'style2-sprite-review.html'});
assert.match(html,/Rift-Türme L1–L3/);
assert.match(html,/Alle 15 Projektile/);
assert.match(html,/\[64,128,512\]/,'Rift at 64, 128 and 512px');
assert.match(html,/\[64,128\]/,'projectiles at 64 and 128px');
assert.match(html,/currentMode==='rift'\?512:256/,'source resolution must be checked');
assert.match(html,/ctx\.getImageData/,'alpha border check must exist');
assert.match(html,/version===2\?'cleanup-2':'user-towers-1'/,'Mage L2 override stays versioned');
assert.match(html,/reviewGeneration!==generation/,'stale loads must not alter current review');
assert.ok(!html.includes('game.js'), 'review may not start gameplay');
console.log('Style-2 manual review page: PASS (script syntax, sizes, alpha audit and opt-in isolation)');
