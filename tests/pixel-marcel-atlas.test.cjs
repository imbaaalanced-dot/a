const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'dist', 'hero-saga.js'), 'utf8');
assert.match(source,/marcel:'assets\/hero\/marcel-walk-v5b\.webp/);
assert.match(source,/kim:'assets\/hero\/kim-walk-v5b\.webp/);
assert.match(source,/walk\.naturalWidth%3===0&&walk\.naturalHeight%4===0/);
assert.match(source,/actor==='marcel'&&ready\(legacyAtlas\(\)\)/,'old lantern fallback must be Marcel-only and lazy');
console.log('V5 hero walk: only dimensionally valid 3x4 atlases drawn, old fallback guarded');
