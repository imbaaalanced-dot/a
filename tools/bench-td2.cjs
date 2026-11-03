'use strict';
/* Benchmark harness for TD2 performance bottlenecks (CPU sim, targeting, render op counts, heap churn).
 * Uses the existing test sandbox (tests/helpers/game.cjs) so no engine file is modified.
 * Run: node --expose-gc tools/bench-td2.cjs [scenario]
 * Scenarios: l3endless (default), l1campaign, ansturm */
const makeGame = (() => {
  // The sandbox never runs the queued intro tutorial, so tutorialPending would block
  // update() forever. Patch (in-memory only) tutorialSeen() to true while loading game.js.
  const fs = require('fs'), orig = fs.readFileSync;
  fs.readFileSync = (p, ...r) => {
    const s = orig(p, ...r);
    return String(p).endsWith('game.js') ? s
      .replace('function tutorialSeen(){return preferences.tutorialSeen;}', 'function tutorialSeen(){return true;}')
      .replace("const ctx = canvas.getContext('2d', {alpha:false});", "globalThis.__ctxCounts={};const ctx = (()=>{const raw=canvas.getContext('2d',{alpha:false});return new Proxy(raw,{get(t,k){const v=t[k];return typeof v==='function'?(...a)=>{const C=globalThis.__ctxCounts;C[k]=(C[k]||0)+1;if(k==='drawImage'&&t.filter&&t.filter!=='none')C._drawImageFiltered=(C._drawImageFiltered||0)+1;return v.apply(t,a)}:v},set(t,k,v){const C=globalThis.__ctxCounts;if(k==='filter'&&v&&v!=='none')C._filterSet=(C._filterSet||0)+1;if(k==='shadowBlur'&&v>0)C._shadowBlurSet=(C._shadowBlurSet||0)+1;t[k]=v;return true}})})();") : s;
  };
  const make = require('../tests/helpers/game.cjs');
  // NB: the harness reads game.js inside the factory call, so the wrapper must stay installed.
  return make;
})();
const {performance, PerformanceObserver} = require('perf_hooks');

const args = new Set(process.argv.slice(2));
const SCENARIO = [...args].find(a => !a.startsWith('--')) || 'l3endless';
const FRAMES = Number(process.argv.find(a => a.startsWith('--frames='))?.slice(9)) || 2000;

function stats(list) {
  const s = [...list].sort((a, b) => a - b);
  const sum = s.reduce((a, b) => a + b, 0);
  return {mean: sum / s.length, p50: s[Math.floor(s.length * .5)], p95: s[Math.floor(s.length * .95)], max: s[s.length - 1]};
}
const fmt = o => `mean ${o.mean.toFixed(3)} ms | p50 ${o.p50.toFixed(3)} ms | p95 ${o.p95.toFixed(3)} ms | max ${o.max.toFixed(3)} ms`;

const {t, box, element, draws} = makeGame();

// --- counting 2D context: measures JS-side render work and expensive canvas op counts ---
const cfg = SCENARIO === 'l1campaign' ? {level: 1, mode: 'campaign', wave: 6, towers: 6} : {level: 3, mode: 'endless', wave: 25, towers: 8};
function primeLevel(level, mode, wave, towers) {

  // Level 2+ is unlock-gated via localStorage; start on level 1 and switch in place
  // so the full level-N simulation (gates, paths, spawn pool) still runs.
  t.startGame(1, 'campaign');
  // level-1 start opens the story screen; close it so state becomes 'playing'
  for (let i = 0; i < 10 && t.state === 'story'; i++) element('storyContinue').onclick();
  const g = t.game;
  g.level = level; g.mode = mode; g.wave = wave;
  g.waveTotal = 40;
  g.intermission = 0;
  g.spawnTimer = 0.01;
  g.essence = 99999;
  // place towers spread over the map so target scans cover all enemies
  const slots = box.DenkmalLevels.levels[level].slots;
  for (let i = 0; i < towers && i < slots.length; i++) {
    g.towers.push({x: slots[i].x, y: slots[i].y, r: 18, damage: 20, fireRate: .6, fireCd: 0, range: 290, kind: ['bow', 'cannon', 'mage', 'rift', 'boomerang'][i % 5], level: (i % 3) + 1, spent: 40, targetMode: 'first'});
  }
  // hero pressure so enemies chase and movement code stays on its hot path
  g.hero.x = box.DenkmalLevels.center.x + 120;
  g.hero.y = box.DenkmalLevels.center.y;
  return g;
}

const dummyPerk = () => ({name:'bench',icon:'◆',desc:'',apply(){}});
function keepSteady(g) {
  g.monument.hp = g.monument.maxHp; g.hero.hp = g.hero.maxHp;
  if (g.enemies.length < 40) g.spawnTimer = Math.min(g.spawnTimer, .01);
  if (t.state === 'perk') t.selectPerk(dummyPerk());
  if (t.state === 'gameover') throw new Error('gameover');
}
function benchUpdate(label) {
  const perFrame = [];
  const g = t.game;
  g.waveTotal = 1e9; // never-ending wave: continuous combat at the alive cap
  // spawn to the alive cap first
  for (let i = 0; i < 600 && g.enemies.filter(e => !e.dead).length < 40; i++) t.update(1 / 60);
  // warmup
  for (let i = 0; i < 600; i++) t.update(1 / 60);
  let aliveSamples = 0, aliveSum = 0, bulletSum = 0, particleSum = 0;
  for (let i = 0; i < FRAMES; i++) {
    try { keepSteady(g); } catch { primeLevel(cfg.level, cfg.mode, cfg.wave, cfg.towers); }
    const t0 = performance.now();
    t.update(1 / 60);
    perFrame.push(performance.now() - t0);
    if (i % 200 === 0) draws.length = 0;
    aliveSamples++; aliveSum += g.enemies.length; bulletSum += g.bullets.length; particleSum += g.particles.length;
  }
  console.log(`\n[${label}] avg enemies=${(aliveSum/aliveSamples).toFixed(1)} towers=${g.towers.length} wave=${g.wave} avg bullets=${(bulletSum/aliveSamples).toFixed(1)} avg particles=${(particleSum/aliveSamples).toFixed(1)}`);
  console.log(`update(1/60) x${FRAMES}: ${fmt(stats(perFrame))}`);
  console.log(`update cost per rendered frame: 1x = ${stats(perFrame).mean.toFixed(3)} ms · 2x speed = ${(stats(perFrame).mean*2).toFixed(3)} ms (budget 16.7 ms)`);
  return g;
}

function benchTowerTarget(g) {
  const perCall = [];
  const tower = g.towers[0];
  if (!tower) return;
  for (let i = 0; i < 2000; i++) {
    const t0 = performance.now();
    t.towerTarget(tower);
    perCall.push(performance.now() - t0);
  }
  console.log(`towerTarget(first) x2000 with ${g.enemies.length} enemies: ${fmt(stats(perCall))} → ${(stats(perCall).mean * g.towers.length * 60).toFixed(2)} ms per 60fps frame for ${g.towers.length} towers`);
}

function benchDraw(g) {
  const perFrame = [];
  const C = box.__ctxCounts || {};
  for (const k of Object.keys(C)) C[k] = 0;
  for (let i = 0; i < 300; i++) { keepSteady(g); t.update(1 / 60); }
  for (let i = 0; i < 500; i++) {
    try { keepSteady(g); } catch { primeLevel(cfg.level, cfg.mode, cfg.wave, cfg.towers); }
    const t0 = performance.now();
    t.draw();
    perFrame.push(performance.now() - t0);
    if (i % 100 === 0) draws.length = 0;
  }
  console.log(`draw() x500 (JS side, rasterization not included): ${fmt(stats(perFrame))}`);
  const f = n => ((C[n] || 0) / 500).toFixed(1);
  console.log(`per frame: drawImage=${f('drawImage')} path-fills=${f('fill')} stroke=${f('stroke')} save/restore=${f('save')}/${f('restore')} radialGradients=${f('createRadialGradient')} filter-set=${f('_filterSet')} drawImage-WITH-live-filter=${f('_drawImageFiltered')} shadowBlur-set=${f('_shadowBlurSet')} fillText=${f('fillText')}`);
}

function benchHeapChurn(label) {
  // Node v22 does not emit gc entries via PerformanceObserver; sample heapUsed instead:
  // a drop between samples = at least one scavenge; growth between drops = allocation churn.
  const g = t.game;
  g.waveTotal = 1e9;
  const SAMPLE = 100;
  let lastHeap = process.memoryUsage().heapUsed, resets = 0, allocated = 0, prev = lastHeap;
  const spikes = [];
  const N = 20000;
  const t0 = performance.now();
  for (let i = 0; i < N; i++) {
    try { keepSteady(g); } catch { primeLevel(cfg.level, cfg.mode, cfg.wave, cfg.towers); }
    const a = performance.now();
    t.update(1 / 60);
    const d = performance.now() - a;
    if (d > 1) spikes.push(d);
    if (i % SAMPLE === 0) {
      draws.length = 0;
      const heap = process.memoryUsage().heapUsed;
      if (heap < lastHeap - 4096) { resets++; lastHeap = heap; }
      else allocated += Math.max(0, heap - prev);
      prev = heap;
    }
  }
  const elapsed = (performance.now() - t0) / 1000;
  const meanUpdate = (elapsed * 1000 - spikes.reduce((a, b) => a + b, 0)) / N;
  console.log(`\n[${label}] ${N} update frames in ${elapsed.toFixed(1)} s (steady 40 enemies)`);
  console.log(`  heap: ~${(allocated / elapsed / 1048576).toFixed(1)} MiB/s allocation churn · ${resets} GC resets observed in ${N / SAMPLE} samples`);
  console.log(`  frame spikes > 1 ms: ${spikes.length} (worst ${Math.max(0, ...spikes).toFixed(1)} ms) → these are GC/compile pauses; on-device they show up as dropped frames`);
}

function benchAnsturm() {
  const fs = require('fs'), vm = require('vm'), path = require('path');
  const root = path.join(__dirname, '../dist/ansturm');
  const sandbox = {console, performance: {now: () => performance.now()}, Math, localStorage: {data: new Map(), getItem() { return null; }, setItem() {}}};
  sandbox.window = sandbox; sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  for (const f of ['config.js', 'model.js']) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8').replace(/^import .*$/gm, '').replace(/^export /gm, ''), sandbox);
  const s = sandbox.createGame();
  sandbox.startGame(s);
  const step = sandbox.step;
  // push into late game: many enemies alive at once
  for (let i = 0; i < 200; i++) {
    s.wave = i + 1; s.status = 'running'; s.planned = 10 + 3 * s.wave; s.spawned = 0; s.spawnClock = 1e9; s.waveElapsed = 0;
    while (s.enemies.length < Math.min(400, s.planned)) sandbox.spawnEnemy(s);
  }
  s.status = 'running';
  const perStep = [];
  for (let i = 0; i < 2000; i++) {
    const t0 = performance.now();
    step(s, 1 / 30);
    perStep.push(performance.now() - t0);
    if (s.status !== 'running') break;
  }
  console.log(`\n[Ansturm] step(1/30) x2000 with ${s.enemies.length} enemies (wave ${s.wave}): ${fmt(stats(perStep))} → ${(stats(perStep).mean * 30).toFixed(2)} ms sim cost per rendered frame at 30 ticks/s`);
}

// ---- run ----
console.log(`Denkmal TD2 benchmark · scenario=${SCENARIO} frames=${FRAMES} node=${process.version}`);
if (SCENARIO === 'ansturm') { benchAnsturm(); process.exit(0); }
primeLevel(cfg.level, cfg.mode, cfg.wave, cfg.towers);
const g = benchUpdate(SCENARIO);
benchTowerTarget(g);
benchDraw(g);
benchHeapChurn(SCENARIO);
