const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'dist', 'hero-saga.js'), 'utf8');
const registry = fs.readFileSync(path.join(__dirname, '..', 'dist', 'canonical-hero-art-v5.js'), 'utf8');
assert.match(source,/TD2CanonicalHeroArt\?\.marcel\?\.walk/);
assert.match(source,/TD2CanonicalHeroArt\?\.kim\?\.walk/);
assert.match(registry,/marcel-walk-style2\.webp/);
assert.match(registry,/kim-walk-style2\.webp/);
assert.match(source,/walk\.naturalWidth%3===0&&walk\.naturalHeight%4===0/);
assert.doesNotMatch(source,/legacyAtlas\(|marcel-lantern-sprite-v1\.webp/,'old lantern fallback must never run');
console.log('V5 hero walk: only dimensionally valid 3x4 atlases drawn, no old hero fallback');
