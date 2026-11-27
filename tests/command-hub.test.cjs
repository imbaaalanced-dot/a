'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '../dist/index.html'), 'utf8');

// Regression: the three TD destinations must be available directly; nested "Spielen" is not a destination.
const home = html.match(/<nav id="menuHomeActions"[^>]*>([\s\S]*?)<\/nav>/)?.[1] || '';
assert.ok(home, 'home menu must exist');
for (const id of ['menuCampaignBtn', 'menuCharacterBtn', 'menuOptionsBtn']) {
  assert.match(home, new RegExp(`id="${id}"`), `${id} must be directly reachable on home`);
}
assert.equal((home.match(/class="menu-command(?:\s|")/g) || []).length, 3, 'home has exactly three navigation cards');
assert.doesNotMatch(home, /menuAnsturmBtn|ansturm\/index\.html/);
assert.doesNotMatch(home, /id="menuPlayBtn"/, 'no redundant play gateway');

console.log('Command Hub exposes three direct destinations');
