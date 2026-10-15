'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '../dist');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'menu.css'), 'utf8');
const game = fs.readFileSync(path.join(root, 'game.js'), 'utf8');
const levels = fs.readFileSync(path.join(root, 'levels.js'), 'utf8');

assert.match(levels, /1:\{name:'EINLEITUNG'/, 'Level 1 is titled Einleitung');
assert.match(html, /<small id="levelLabel">EINLEITUNG<\/small>/);
assert.match(html, /id="startBtn"[^>]*>[\s\S]*?<strong>EINLEITUNG<\/strong>/);

const coach = html.match(/<section[^>]*id="introTutorial"[\s\S]*?<\/section>/);
assert.ok(coach, 'tutorial coach bubble exists');
assert.match(coach[0], /aria-live="polite"/);
assert.match(coach[0], /id="tutorialTitle"/);
assert.match(coach[0], /id="tutorialText"/);
assert.match(coach[0], /id="tutorialArrow"/);
assert.match(coach[0], /id="tutorialNext"/);
assert.match(coach[0], /id="tutorialSkip"/);

for (const phrase of ['Bewegen', 'Seelenruf', 'Ausweichen', 'Turm', 'Welle', 'Inventar', 'Beute']) {
  assert.match(game, new RegExp(phrase, 'i'), 'tutorial explains ' + phrase);
}
assert.match(game, /tutorialActive/);
assert.match(game, /tutorialSeen/);
assert.match(game, /tutorialNext/);
assert.match(game, /tutorialSkip/);
assert.match(game, /introTutorial/);
assert.match(game, /tutorialActive\)return/, 'simulation stays paused while tutorial is open');
assert.match(game, /Wähle einen Turmtyp/);
assert.doesNotMatch(game, /Turmart/);
assert.match(css, /\.tutorial-arrow/);
assert.match(css, /@media\s*\(pointer:coarse\)/);

console.log('Level 1 intro title and first-run tutorial guidance checks passed');
