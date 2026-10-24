import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../styles.css',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');

test('defeat dialog offers retry and the shared TD2 main menu',()=>{
  const defeat=html.match(/<dialog id="defeat"[\s\S]*?<\/dialog>/)?.[0]||'';
  assert.match(defeat,/id="again"/);
  assert.match(defeat,/id="defeatMenu"/);
  assert.match(defeat,/Hauptmenü/);
  assert.match(app,/el\('defeatMenu'\)\.onclick=leaveGame/);
});

test('Ansturm dialogs use the same primary and secondary command hierarchy',()=>{
  assert.match(html,/id="defeat"[\s\S]*class="dialogButtons defeat-actions"/);
  assert.match(css,/\.defeat-actions/);
  assert.match(css,/\.secondary-command/);
});

test('intro presents Ansturm as the second shared play mode',()=>{
  const intro=html.match(/<div class="overlay" id="intro">[\s\S]*?<\/div><\/div>/)?.[0]||'';
  assert.match(intro,/SPIELEN · MODUS II/);
  assert.match(intro,/id="introBest"/);
  assert.match(intro,/class="intro-actions"[\s\S]*id="start"[\s\S]*class="secondary-command intro-menu-return"/);
  assert.doesNotMatch(intro,/class="symbol">♜/);
});

test('intro record stays synchronized with persistent Ansturm progress',()=>{
  assert.match(app,/el\('introBest'\)\.textContent=readRecord\(storage\)/);
  assert.match(css,/\.mode-intro/);
  assert.match(css,/\.intro-actions/);
});
