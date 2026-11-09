'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '../dist');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'menu.css'), 'utf8');
const game = fs.readFileSync(path.join(root, 'game.js'), 'utf8');

const home = html.match(/<nav id="menuHomeActions"[\s\S]*?<\/nav>/)?.[0] || '';
assert.match(home, /id="menuCampaignBtn"/);
assert.match(home, /id="menuAnsturmBtn"/);
assert.match(home, /id="menuCharacterBtn"/);
assert.match(home, /id="menuOptionsBtn"/);
assert.doesNotMatch(home, /id="menu(?:Play|Arcade)Btn"/);
assert.doesNotMatch(home, /<img\b/i, 'top-level commands use crisp HTML labels');
assert.doesNotMatch(html, /id="playMenu"/, 'redundant play gateway is removed');

assert.match(html, /id="menuArcadeBtn"[^>]*>[^<]*Endlos verteidigen/i);
assert.match(html, /id="portalNewBtn"[^>]*hidden/);
assert.match(html, /id="portalResumeBtn"[^>]*hidden/);
assert.match(game, /campaign:'menuCampaignBtn'/);
assert.match(css, /\.menu-command\s*\{/);
assert.match(css, /min-height:\s*56px/);
assert.match(css, /@media\s*\(max-width:\s*700px\)[\s\S]*\.menu-primary-actions/);
assert.match(css, /@media\s*\(max-height:\s*430px\)\s*and\s*\(orientation:\s*landscape\)/);
assert.match(html, /menu\.css\?v=v5-command-hub1/);
// Current game.js cache key is audited centrally in cache-busting.test.cjs.

console.log('Four-destination menu hierarchy and responsive command styling passed');
