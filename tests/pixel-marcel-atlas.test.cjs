const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'dist', 'hero-saga.js'), 'utf8');
assert.match(source, /typeof URLSearchParams === 'function'.*get\('td2PixelMarcel'\) === '1'/);
assert.match(source, /pixelMarcel \? 'assets\/hero\/marcel-walk-reference-v1\.webp\?v=1' : 'assets\/hero\/marcel-sword-walk\.webp'/);
assert.match(source, /walkAtlases\.kim\.src='assets\/hero\/kim-bow-walk\.webp'/);
console.log('Pixel Marcel atlas: opt-in selection, default fallback and Kim path verified');
