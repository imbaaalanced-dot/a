/* Adaptive Grafikstufen (high/medium/low) mit Hysterese: Regressionstest.
   Run: node tests/graphics-quality.test.cjs  (und mit TEST_MOBILE=1 für die Handy-Stufe) */
'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const { createRenderSandbox, buildStressScene } = require('./helpers/render-sandbox.cjs');

const MOBILE = process.env.TEST_MOBILE === '1';
const harness = createRenderSandbox({ mobile: MOBILE });
const t = harness.test;
const changes = [];
let lastTier = null;
function watchTier() { if (t.qualityTier !== lastTier) { if (lastTier !== null) changes.push({ from: lastTier, to: t.qualityTier, at: harness.test.getGame().elapsed }); lastTier = t.qualityTier; } else lastTier = t.qualityTier; }

// --- Szenario: laufende Welle mit Türmen, Gegnern, Projektilen und Partikeln ---
buildStressScene(harness, 1);
const g = t.getGame();
assert.ok(g.towers.length > 0, 'Stress-Szene hat Türme');
assert.ok(g.enemies.length > 0, 'Stress-Szene hat Gegner');

// --- 1) Stufenbildung: Modus fixiert die Stufe, Auto startet erwartungsgemäß ---
t.setGraphicsPreference('low');
assert.equal(t.qualityTier, 'low', 'Modus SPARMODUS erzwingt Stufe niedrig');
assert.equal(t.lowFX, true, 'Stufe niedrig deaktiviert Effektvolles');
t.setGraphicsPreference('high');
assert.equal(t.qualityTier, 'high', 'Modus HOCH erzwingt Stufe hoch');
assert.equal(t.lowFX, false, 'Stufe hoch rendert Effektvolles');
assert.equal(t.medFX, false, 'Stufe hoch ist nicht die Mittelstufe');
t.setGraphicsPreference('auto');
assert.equal(t.qualityTier, MOBILE ? 'low' : 'high', 'Auto erhält die bisherige Standardstufe je Gerät');

// --- 2) DPR-Auflösung pro Stufe, ohne das HUD (DOM) anzufassen ---
harness.sandbox.devicePixelRatio = 3;
t.setGraphicsPreference('high');
t.resize(false);
const highW = harness.element('game').width;
t.setGraphicsPreference('low');
t.resize(false);
const lowW = harness.element('game').width;
assert.ok(highW > lowW, 'Stufe hoch rendert in höherer Canvas-Auflösung als niedrig');
assert.ok(lowW <= Math.ceil(harness.sandbox.innerWidth * 0.86), 'Stufe niedrig klemmt den DPR unter 0.86');
if (MOBILE) assert.ok(harness.element('game').width * harness.element('game').height <= 900000, 'Handy-Canvas bleibt im Pixelbudget');
// HUD ist DOM und bleibt von der Canvas-Auflösung unberührt
const hudBefore = JSON.stringify({ hp: harness.element('playerHpText').textContent, style: harness.element('playerHpText').style });
t.setGraphicsPreference('high'); t.resize(false);
assert.equal(JSON.stringify({ hp: harness.element('playerHpText').textContent, style: harness.element('playerHpText').style }), hudBefore, 'Canvas-Umschaltung ändert das DOM-HUD nicht');
t.setGraphicsPreference('auto');

// --- 3) Adaptive Stufe mit Hysterese: anhaltend niedrige FPS senken stufenweise, kein Flattern ---
t.setGraphicsPreference('auto');
const SLOW = 1 / 30, FAST = 1 / 90;
let stepped = 0;
for (let i = 0; i < 60 * 8; i++) { // 8 s mit 30 FPS
  t.update(SLOW); t.advanceQualityMonitor(SLOW); watchTier(); stepped++;
  assert.ok(changes.length <= 1, 'innerhalb des Abklingzeit-Fensters erfolgt höchstens eine Stufenänderung je Richtung');
}
assert.equal(t.qualityTier, MOBILE ? 'low' : 'medium', 'anhalten unter 45 FPS senkt die Stufe um genau eine Stufe');
if (!MOBILE) {
  // Sofortige hohe FPS dürfen nicht sofort hochschalten: Abklingzeit + Haltezeit
  for (let i = 0; i < 60 * 10; i++) { t.update(FAST); t.advanceQualityMonitor(FAST); watchTier(); }
  assert.equal(t.qualityTier, 'medium', 'Abklingzeit verhindert schnelles Hochschalten (kein Flattern)');
  // Nach Abklingzeit + 8 s über 57 FPS darf wieder hochgeschaltet werden
  for (let i = 0; i < 60 * 20; i++) { t.update(FAST); t.advanceQualityMonitor(FAST); watchTier(); }
  assert.equal(t.qualityTier, 'high', 'anhalten über 57 FPS hebt die Stufe nach der Abklingzeit');
}
// Mindestabstand zwischen Stufenwechseln (Hysterese)
for (let i = 1; i < changes.length; i++) assert.ok(changes[i].at - changes[i - 1].at >= 14, `Stufenwechsel halten mindestens 14 s Abstand (${changes[i].at - changes[i - 1].at} s)`);

// --- 4) Gradient-Cache: Monument-Aura und Runenanker erzeugen keine radialen Gradienten pro Frame ---
t.setGraphicsPreference('high'); t.resize(false);
harness.resetCounts(); t.draw();
const firstDraw = harness.gradients.radial;
harness.resetCounts(); t.draw();
const secondDraw = harness.gradients.radial;
assert.ok(secondDraw <= 1, `zweiter Frame erzeugt keine neuen Aura-Gradienten (erster ${firstDraw}, zweiter ${secondDraw})`);

// --- 5) Sichtbarkeitsprüfung: Off-Screen-Gegner werden nicht gezeichnet ---
t.setGraphicsPreference('high'); t.resize(false);
harness.resetCounts(); t.draw();
const visibleOps = Object.values(harness.counts).reduce((s, v) => s + v, 0);
const sx = g.enemies.map(e => e.x), sy = g.enemies.map(e => e.y);
g.enemies.forEach(e => { e.x = -5000; e.y = -5000; });
harness.resetCounts(); t.draw();
const hiddenOps = Object.values(harness.counts).reduce((s, v) => s + v, 0);
g.enemies.forEach((e, i) => { e.x = sx[i]; e.y = sy[i]; });
assert.ok(hiddenOps < visibleOps - 100, `Off-Screen-Gegner sparen Zeichenoperationen (${visibleOps} → ${hiddenOps})`);

// --- 6) Gameplay und Touch bleiben auf Stufe niedrig vollständig funktionsfähig ---
t.setGraphicsPreference('low'); t.resize(false);
assert.equal(t.lowFX, true);
g.essence = 99999; g.enemies.length = 0;
// Belegtes Pad freimachen, damit der Turmbau auf Stufe niedrig geprüft werden kann
g.hero.x = g.towers[0].x; g.hero.y = g.towers[0].y;
t.sellTower();
const towersBefore = g.towers.length;
const slot = harness.sandbox.DenkmalLevels.levels[1].slots[0];
t.selectTower('bow');
g.hero.x = slot.x - 58; g.hero.y = slot.y; t.facing = { x: 1, y: 0 };
t.buildTower();
assert.equal(g.towers.length, towersBefore + 1, 'Turmbau funktioniert auf Stufe niedrig');
g.hero.x = g.monument.x; g.hero.y = g.monument.y + 60;
t.spawnEnemy();
const enemy = g.enemies[0];
enemy.x = g.monument.x - 90; enemy.y = g.monument.y + 60;
const startX = enemy.x;
let fired = false;
for (let i = 0; i < 120 && !fired; i++) { t.update(1 / 60); fired = g.bullets.length > 0; }
assert.ok(fired, 'Türme feuern auf Stufe niedrig');
assert.notEqual(enemy.x, startX, 'Gegnerbewegung läuft auf Stufe niedrig unverändert');
t.hurtEnemy(enemy, 999999);
assert.ok(enemy.dead, 'Schaden und Tod wirken auf Stufe niedrig unverändert');
// Touch-Steuerung: Joystick-Registrierung bleibt an den Pointer-Modus gekoppelt
assert.equal(harness.sandbox.DenkmalMobileRender, MOBILE, 'Touch-Erkennung bleibt unverändert');

console.log(`graphics-quality: alle Prüfungen bestanden (Stufenwechsel: ${changes.map(c => `${c.from}→${c.to}`).join(', ') || 'keine'})`);
