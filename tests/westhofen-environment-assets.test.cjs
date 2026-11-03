/* Westhofen environment SVG contract: isolated assets, no runtime placement yet. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const folder=path.join(__dirname,'../dist/assets/westhofen');
const expected=['pergola-pilot.svg','stairs-pilot.svg','wall-pilot.svg'];
for(const filename of expected){
 const svg=fs.readFileSync(path.join(folder,filename),'utf8');
 assert.match(svg,/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/,filename+' is a standalone SVG');
 assert.match(svg,/viewBox="0 0 256 192"/,filename+' uses approved pilot camera bounds');
 assert.match(svg,/<title>[^<]+<\/title>/,filename+' has semantic title');
 assert.match(svg,/<defs>[\s\S]*?<\/defs>/,filename+' has reusable material palette');
 assert.ok(!/<(?:script|foreignObject|image|use)\b/i.test(svg),filename+' must be self-contained and script-free');
 assert.ok(!/\b(?:href|xlink:href)\s*=/.test(svg),filename+' must not reference external resources');
 assert.ok(!/<rect\b[^>]*\b(?:width="256"|height="192")/.test(svg),filename+' must have clear transparent margins');
 assert.ok(Buffer.byteLength(svg)<10000,filename+' pilot stays lightweight for mobile');
}
console.log('Westhofen environment: 3 transparent, self-contained 256x192 SVG pilots validated.');
