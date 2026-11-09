'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../dist');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'menu.css'), 'utf8');

// One native menu works for portrait, landscape, keyboard and screen readers.
// The old JS decorator duplicated navigation and concealed original cards.
assert.doesNotMatch(html, /<script[^>]+portrait-home-v1\.js/);
assert.doesNotMatch(html, /<link[^>]+portrait-home-v1\.css/);
const home = html.match(/<nav id="menuHomeActions"[\s\S]*?<\/nav>/)?.[0] || '';
for (const id of ['menuCampaignBtn', 'menuAnsturmBtn', 'menuCharacterBtn', 'menuOptionsBtn']) {
  assert.match(home, new RegExp('id="'+id+'"'), 'missing portrait route '+id);
}
assert.match(css, /@media\(max-width:420px\)/);
assert.match(css, /#startScreen \.menu-home-actions\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)!important/);
assert.match(css, /#startScreen \.menu-command:focus-visible/);
console.log('Portrait home: unified native responsive navigation passed');
