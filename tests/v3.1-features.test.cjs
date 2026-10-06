/* v3.1 + v3.2 feature regression tests. */
'use strict';
const assert = require('assert');

// --- Minimal DOM / Canvas mocks ---
function makeCtxMock() {
  const grad = { addColorStop() {} };
  const noop = () => {};
  const ctx = {};
  for (const m of ['save','restore','beginPath','moveTo','lineTo','arc','ellipse',
    'fill','stroke','translate','scale','rotate','fillRect','strokeRect','clearRect',
    'drawImage','setTransform','setLineDash','closePath','fillText','strokeText',
    'putImageData','arcTo','quadraticCurveTo','bezierCurveTo','rect','clip']) ctx[m] = noop;
  ctx.createRadialGradient = () => grad;
  ctx.createLinearGradient = () => grad;
  ctx.measureText = () => ({ width: 10 });
  ctx.getImageData = (x, y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h });
  return new Proxy(ctx, { get(t, p) { return p in t ? t[p] : undefined; }, set() { return true; } });
}

function makeCanvasMock(w = 800, h = 600) {
  const ctx = makeCtxMock();
  return {
    width: w, height: h, style: {},
    getContext: () => ctx,
    addEventListener: () => {}, removeEventListener: () => {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: w, height: h }),
    focus: () => {}, setAttribute: () => {},
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
  };
}

function makeElMock(id) {
  return {
    id, style: {}, dataset: {}, textContent: '', innerHTML: '', disabled: false,
    children: [], firstElementChild: { style: {} },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    setAttribute: () => {}, getAttribute: () => null,
    addEventListener: () => {}, appendChild: () => {},
    querySelector: () => null, querySelectorAll: () => [],
    focus: () => {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }),
    hasPointerCapture: () => false,
    setPointerCapture: () => {}, releasePointerCapture: () => {},
    onclick: null,
  };
}

const els = new Map();
global.document = {
  getElementById(id) {
    if (!els.has(id)) els.set(id, id === 'game' ? makeCanvasMock() : makeElMock(id));
    return els.get(id);
  },
  createElement(tag) { return tag === 'canvas' ? makeCanvasMock() : makeElMock(tag); },
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {},
  body: { appendChild: () => {} },
};
global.window = global;
global.addEventListener = () => {};
global.removeEventListener = () => {};
global.matchMedia = () => ({ matches: false, addEventListener: () => {} });
global.devicePixelRatio = 1;
global.innerWidth = 800;
global.innerHeight = 600;
global.performance = { now: () => Date.now() };
global.requestAnimationFrame = () => 0;
global.cancelAnimationFrame = () => {};
global.Image = class { constructor() { this.src = ''; this.complete = false; this.naturalWidth = 0; } };
global.AudioContext = class {
  constructor() { this.state = 'running'; this.currentTime = 0; this.destination = {}; }
  createGain() { return { gain: { value: 1, setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() { return this; }, disconnect() {} }; }
  createOscillator() { return { type: 'triangle', frequency: { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() { return this; }, disconnect() {}, start() {}, stop() {}, onended: null }; }
  resume() { return Promise.resolve(); }
};
global.localStorage = {
  _d: {},
  getItem(k) { return this._d[k] ?? null; },
  setItem(k, v) { this._d[k] = String(v); },
  removeItem(k) { delete this._d[k]; },
};
global.HTMLElement = class {};

// --- Load modules under test ---
require('../dist/levels.js');
require('../dist/hero-saga.js');
require('../dist/combat-fx.js');
require('../dist/game.js');

const fx = global.DenkmalCombatFX;
const hooks = global.DenkmalTestHooks;
const L = global.DenkmalLevels;

// --- Sanity ---
assert.ok(fx, 'CombatFX loaded');
assert.ok(hooks, 'TestHooks loaded');
assert.ok(L, 'Levels loaded');

// --- Levels ---
assert.strictEqual(L.levels[1].gates.length, 4);
assert.strictEqual(L.levels[2].gates.length, 1);
assert.ok(L.levels[1].slots.length > 0);
assert.ok(L.levels[2].slots.length > 0);
assert.strictEqual(L.pathDistance({ x: 50, y: 10 }, [{ x: 0, y: 0 }, { x: 100, y: 0 }]), 10);

// --- Damage Numbers ---
const g = { particles: [], damageTexts: [] };
fx.damage(g, 100, 200, 42, {});
assert.strictEqual(g.damageTexts.length, 1);
assert.strictEqual(g.damageTexts[0].amount, 42);
fx.damage(g, 100, 200, 84, { crit: true });
assert.strictEqual(g.damageTexts[1].crit, true);

// Density cap
for (let i = 0; i < 30; i++) fx.damage(g, 100 + i * 5, 200, 7, { reduced: true });
assert.ok(g.damageTexts.length <= 8, 'reduced density cap enforced');

// Merge on cap
const g2 = { damageTexts: [] };
for (let i = 0; i < 30; i++) fx.damage(g2, 100, 100, 1, {});
assert.ok(g2.damageTexts.length <= 24, 'non-reduced cap enforced');
const mergedTotal = g2.damageTexts.reduce((s, d) => s + d.amount, 0);
assert.strictEqual(mergedTotal, 30, 'all damage accounted for via merge');

// Expiry
for (let i = 0; i < 20; i++) fx.updateDamage(g2, 0.2);
assert.strictEqual(g2.damageTexts.length, 0, 'damage texts expire');

// --- Audio Context Sharing ---
fx.unlock();
const ctxA = fx.getContext();
const ctxB = fx.getContext();
assert.strictEqual(ctxA, ctxB, 'shared audio context');
assert.ok(fx.getMaster(), 'master gain available');

// --- Synergies ---
const slow = { slow: 1, slowFactor: 0.58 };
const fresh = { slow: 0 };
const cannonBullet = { kind: 'cannon', splash: 64, damage: 34, chain: 0 };
const synCannon = hooks.projectileSynergy(cannonBullet, slow);
assert.ok(Math.abs(synCannon.impact - 1.25) < 1e-9, 'cannon + slow = +25% impact');
const synCannonFresh = hooks.projectileSynergy(cannonBullet, fresh);
assert.strictEqual(synCannonFresh.impact, 1, 'cannon vs unslowed = 1.0');

const riftBullet = { kind: 'rift', chain: 2, damage: 21 };
const synRift = hooks.projectileSynergy(riftBullet, slow);
assert.strictEqual(synRift.chain, 3, 'rift + slow = +1 chain');
const synRiftFresh = hooks.projectileSynergy(riftBullet, fresh);
assert.strictEqual(synRiftFresh.chain, 2, 'rift vs unslowed = base chain');

// --- Wave Plan ---
assert.strictEqual(hooks.wavePlan(5).name, 'DER BELAGERER');
assert.strictEqual(hooks.wavePlan(8).name, 'RISSSTURM');
assert.ok(hooks.wavePlan(9).name);
const mini = hooks.wavePlan(12);
assert.ok(mini.miniBoss, 'wave 12 = mini-boss');
assert.ok(mini.name.startsWith('MINI-BOSS'));
const mod16 = hooks.wavePlan(16);
assert.ok(mod16.miniBoss);
assert.notStrictEqual(mini.name, mod16.name, 'mini-boss modifiers rotate');

// --- applyWavePlan ---
const base = { hp: 100, speed: 50, damage: 10, armor: 0, attackCooldown: 1 };
const plan12 = hooks.applyWavePlan('brute', base, 12);
assert.ok(plan12.hp >= 1, 'plan hp multiplier is numeric');
const planArmor = hooks.applyWavePlan('guardian', base, 12);
if (mini.name.includes('PANZER')) assert.ok(planArmor.armor > 0);

// --- Enemy Composition ---
assert.strictEqual(hooks.enemyTypeForSpawn(5, 0), 'boss', 'wave 5 index 0 is boss');
assert.ok(['wraith', 'runner', 'brute', 'archer', 'guardian', 'sapper'].includes(hooks.enemyTypeForSpawn(7, 5)));

// --- Wave Preview ---
const preview = hooks.wavePreview(3);
assert.ok(preview.includes('×'), 'wave preview has composition');

// --- Placement Error ---
hooks.resetGame(1);
const level1Slots = L.levels[1].slots;
const validSlot = level1Slots.find(s => {
  const err = hooks.placementError(s);
  return err === '';
});
if (validSlot) {
  assert.strictEqual(hooks.placementError(validSlot), '', 'slot accepts placement');
} else {
  assert.fail('no valid placement slot found in level 1');
}
// Off-slot should fail
const offSlot = hooks.placementError({ x: 0, y: 0 });
assert.ok(offSlot.length > 0, 'off-slot rejected');
assert.ok(offSlot.includes('MARKIERTEN') || offSlot.includes('WEG') || offSlot.includes('TOR'), 'off-slot has readable error');

// --- Tower Targeting ---
hooks.resetGame(1);
const g3 = hooks.getGame();
const tower = { x: 100, y: 100, range: 500, targetMode: 'strongest', damage: 10, fireRate: 1, fireCd: 0, level: 1, kind: 'bow' };
g3.enemies = [
  { x: 110, y: 100, hp: 50, maxHp: 50, type: 'wraith', r: 10, dead: false, gateIndex: 0, waypoint: 1 },
  { x: 120, y: 100, hp: 200, maxHp: 200, type: 'brute', r: 15, dead: false, gateIndex: 0, waypoint: 1 },
  { x: 130, y: 100, hp: 30, maxHp: 30, type: 'boss', r: 25, dead: false, gateIndex: 0, waypoint: 1 },
];
assert.strictEqual(hooks.towerTarget(tower).type, 'brute', 'strongest picks brute');
tower.targetMode = 'boss';
assert.strictEqual(hooks.towerTarget(tower).type, 'boss', 'boss picks boss');
tower.targetMode = 'nearest';
assert.strictEqual(hooks.towerTarget(tower).type, 'wraith', 'nearest picks wraith');
tower.targetMode = 'first';
const first = hooks.towerTarget(tower);
assert.ok(first, 'first mode returns an enemy');

// Out of range
tower.range = 5;
assert.strictEqual(hooks.towerTarget(tower), null, 'out of range = null');

// --- v3.6 Build Paths ---
hooks.resetGame(1);
const g36 = hooks.getGame();
assert.deepStrictEqual({control:g36.build.control,precision:g36.build.precision,rift:g36.build.rift},{control:0,precision:0,rift:0});
assert.strictEqual(typeof hooks.getPerks,'function','v3.6 getPerks hook exposed');
const tagged = hooks.getPerks().filter(p=>p.path);
assert.ok(tagged.length >= 3, 'v3.6 exposes tagged build perks');
for (const p of tagged) {
  assert.ok(p.id, 'build perk has stable id');
  assert.ok(['control','precision','rift'].includes(p.path), 'known build path');
  assert.ok(/^(KONTROLLE|PRÄZISION|RISS) ·/.test(p.desc), 'build path is readable in perk copy');
}

// --- v3.6 Control + Rift ---
hooks.resetGame(1);
const g36b=hooks.getGame();
g36b.build.perks.add('icebreak');g36b.build.perks.add('coldrift');
const v36c=hooks.projectileSynergy({kind:'cannon',splash:64},{slow:1});
assert.ok(Math.abs(v36c.splashFactor-(.58*1.25*1.15))<1e-9,'icebreak adds bounded cannon splash bonus');
assert.strictEqual(hooks.projectileSynergy({kind:'rift',chain:2},{slow:1}).chain,4,'coldrift adds exactly one extra slowed chain');
g36b.build.perks.add('soulSpark');g36b.soulSparkUntil=g36b.elapsed+5;
assert.strictEqual(hooks.projectileSynergy({kind:'rift',chain:2},{slow:1}).chain,5,'soulSpark adds one temporary chain');

// --- Burst cap ---
const gb = { particles: [] };
const bullet = { kind: 'cannon', x: 0, y: 0, color: '#fff', level: 1, life: 1.1, vy: 0, vx: 1 };
fx.burst(gb, bullet, false, false, false);
assert.ok(gb.particles.length > 0);
assert.ok(gb.particles.length <= fx.MAX_PARTICLES);

console.log('v3.1-features: all tests passed');
