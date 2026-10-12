'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '../dist');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'menu.css'), 'utf8');
const game = fs.readFileSync(path.join(root, 'game.js'), 'utf8');

const section = id => {
  const match = html.match(new RegExp('<section[^>]*id="' + id + '"[\\s\\S]*?<\\/section>', 'i'));
  assert.ok(match, 'missing menu section #' + id);
  return match[0];
};
const campaign = section('campaignMenu');
const endless = section('endlessMenu');

for (const [id, label] of [
  ['startBtn', 'EINLEITUNG'],
  ['level2Btn', 'LABYRINTH'],
  ['level3Btn', 'KIRCHENDE'],
]) {
  assert.match(campaign, new RegExp('id="' + id + '"'));
  assert.match(campaign, new RegExp(label, 'i'));
}
for (const [id, label] of [
  ['endless1Btn', 'VIER TORE'],
  ['endlessBtn', 'LABYRINTH'],
  ['endless3Btn', 'KIRCHENDE'],
]) {
  assert.match(endless, new RegExp('id="' + id + '"'));
  assert.match(endless, new RegExp(label, 'i'));
}
assert.doesNotMatch(campaign, /id="endless(?:1|3)?Btn"/);
assert.doesNotMatch(endless, /id="(?:startBtn|level2Btn|level3Btn)"/);
assert.match(game, /endless1Btn[^\n]*startGame\(1,'endless'\)/);
assert.match(game, /endlessBtn[^\n]*startGame\(2,'endless'\)/);
assert.match(game, /endless3Btn[^\n]*startGame\(3,'endless'\)/);
assert.match(game, /kirchendeCompleted/);
assert.doesNotMatch(endless, /Wellenrekord wird gespeichert/, 'do not promise records until persistence exists');
assert.match(html, /id="speedBtn"[^>]*>TEMPO: 1×<\/button>/);
assert.match(game, /function simulationStepsPerFrame\(\)/);
assert.match(game, /game\.level>=2\|\|game\.mode==='endless'/);
assert.match(html, /id="channelLink"[^>]*youtube\.com\/@denk-malnach/);
assert.match(html, /id="collectionBtn"/);
assert.match(html, /id="menuHeroBtn"/);
assert.match(css, /@media\s*\(pointer:coarse\)/);
assert.match(css, /min-height:\s*48px/);

console.log('Campaign, unlocked-map endless menu, channel and mobile target checks passed');
