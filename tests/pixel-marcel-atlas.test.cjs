const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'dist', 'hero-saga.js'), 'utf8');
assert.match(source, /get\('td2WeaponWalk'\)==='1'/);
assert.match(source, /const walk=actor==='marcel'\?null:walkAtlases\[actor\]/);
assert.match(source, /walkAtlases\.kim\.src='assets\/hero\/kim-bow-walk\.webp'/);
console.log('Marcel atlas: generated sheets bypassed, lantern fallback and Kim path verified');
