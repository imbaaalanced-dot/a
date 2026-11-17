/* PR #329 guard: preserve verified #351 non-rAF material polling with Canvas evidence. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../tools/verify-game-cold-start-browser.cjs'),'utf8');
assert.match(source,/async function captureGameCanvas\(/,'real gameplay Canvas evidence must remain');
assert.match(source,/finally\s*\{release\(\);\}/,'artificially held asset requests must always be released');
assert.match(source,/polling:200,timeout:45000/,'material completion polling must not depend on requestAnimationFrame');
assert.match(source,/Style2Maps\.stats\(\)\.builds>=expected/,'rebuild readiness must be checked before snapshot assertions');
assert.match(source,/polling:200,timeout:15000/,'rebuild must use interval polling');
assert.match(source,/Cold-start material timeout diagnostics:/,'late-load stalls must generate structured diagnostics');
assert.doesNotMatch(source,/new Promise\(resolve=>requestAnimationFrame\(/,'rAF wait can stall SwiftShader on CI');
console.log('Ground V3 cold-start QA retains Canvas captures, request release, explicit interval polling and diagnostics.');
