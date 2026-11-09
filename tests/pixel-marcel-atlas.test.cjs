const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'dist', 'hero-saga.js'), 'utf8');
assert.match(source, /get\('td2WeaponWalk'\)==='1'/);
assert.match(source, /useWeaponWalk\?'assets\/hero\/marcel-sword-walk\.webp':'assets\/hero\/marcel-walk-reference-v1\.webp\?v=2'/);
assert.match(source, /walkAtlases\.kim\.src='assets\/hero\/kim-bow-walk\.webp'/);
console.log('Marcel atlas: stable reference default, weapon atlas opt-in and Kim path verified');
