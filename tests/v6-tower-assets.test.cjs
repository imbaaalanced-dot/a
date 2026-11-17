'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const stems = ['bogen', 'kanone', 'riftlanze', 'eis'];
const dir = path.join(root, 'dist/assets/style2-v6-candidates/tuerme/upgrade_stufen');
const expected = stems.flatMap((name) => [1, 2, 3].map((tier) => `${name}_l${tier}.webp`)).sort();
const actual = fs.existsSync(dir) ? fs.readdirSync(dir).filter((name) => name.endsWith('.webp')).sort() : [];
assert.deepEqual(actual, expected, 'all 12 V6 tower WebPs must be committed together');
let total = 0;
for (const name of expected) {
  const file = path.join(dir, name), bytes = fs.readFileSync(file);
  assert.ok(bytes.length > 1000 && bytes.length <= 80000, `${name}: invalid byte length`);
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', `${name}: RIFF header`);
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', `${name}: WEBP container`);
  assert.equal(bytes.toString('ascii', 12, 16), 'VP8X', `${name}: extended WebP format expected`);
  assert.ok((bytes[20] & 0x10) !== 0, `${name}: alpha flag must be set`);
  const width = 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16);
  const height = 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16);
  assert.deepEqual([width, height], [256, 256], `${name}: exact square dimensions`);
  total += bytes.length;
}
assert.ok(total < 960000, 'V6 bundle must fit mobile download budget');
console.log(`PASS V6 tower assets: ${expected.length} transparent WebPs, ${(total / 1024).toFixed(1)} KiB`);
