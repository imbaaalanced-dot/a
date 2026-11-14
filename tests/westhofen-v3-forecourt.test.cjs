'use strict';
// Structural regression for the Westhofen V3 bright rectangular floor seam.
// Browser screenshots remain the evidence for actual visual quality.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const art=fs.readFileSync(path.join(__dirname,'../dist/westhofen-art.js'),'utf8');
const before='// Gravel apron around the memorial stays oval and blends into the grass.';
const after='// Hedges with benches frame the green';
assert.ok(art.includes(before)&&art.includes(after),'expected forecourt block');
const floor=art.split(before)[1].split(after)[0];
assert.doesNotMatch(floor,/fillRect\(/,'no large overlapping rectangular flagstones in forecourt');
assert.match(floor,/q\.clip\(\)/,'stones stay within the oval apron');
assert.match(floor,/const w=29\+salt,h=13\+\(salt%4\)/,'tile bounds are smaller than grid spacing');
assert.match(floor,/const seam=q\.createRadialGradient/,'soft contact shade avoids straight edges');
assert.match(floor,/addColorStop\(1,'#27392a00'\)/,'contact shade fades into the level');
assert.doesNotMatch(floor,/#93937c|#83856f|#bfc0a026/i,'old bright continuous tile colors must be removed');
assert.match(art,/ctx\.drawImage\(memorialSprite,m\.x-225,m\.y-265,450,300\)/,'do not change monument anchor or footprint');
assert.match(art,/const memorialUrl='assets\/westhofen\/westhofen-memorial-style2-v3-preview\.svg\?v=westhofen-style2v3-preview2'/);
console.log('Westhofen V3 forecourt has clipped non-overlapping stones and a soft contact shadow; world anchor unchanged');
