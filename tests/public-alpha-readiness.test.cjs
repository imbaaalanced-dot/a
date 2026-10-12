'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const readme = read('README.md');
assert.match(readme, /Stand der Prüfung: 12\. Oktober 2026\./);
assert.match(readme, /Aktueller geprüfter Spielcode \| `dc420c3480799cc00658cde544e237751c01de56`/);
assert.match(readme, /Öffentliche PRs #23\/\#24 \| Geschlossene Draft-PRs, nicht gemergt/);
assert.match(readme, /V4-Alpha\.3 \/ Public Alpha \| Nicht freigegeben/);

const gap = read('docs/PUBLIC_ALPHA_RELEASE_GAP_ANALYSIS.md');
for (const phrase of [
  'P0 - Keine Public Alpha ohne neuen Freigabeentscheid',
  'PR #23',
  'PR #24',
  'v4-kirchende',
  'mergeable_state: dirty',
  'dc420c3480799cc00658cde544e237751c01de56',
]) {
  assert.match(gap, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
}

console.log('Public alpha release-gap documentation is explicit and test-gated.');
