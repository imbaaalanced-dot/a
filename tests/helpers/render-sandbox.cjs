// Gemeinsame VM-Sandbox für Rendering-Benchmark und Grafikstufen-Regressionstests.
// Lädt dist/*.js in index.html-Reihenfolge in einer instrumentierten Canvas-Stub-Umgebung.
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const root = path.resolve(__dirname, '../../dist');

function createRenderSandbox({ mobile = false, countOps = true, sourceOverrides = {}, math = Math, initialStorage = {} } = {}) {
  const elements = new Map(), listeners = {};
  const counts = Object.create(null);
  const gradients = { radial: 0, linear: 0 };
  const count = (name) => { counts[name] = (counts[name] || 0) + 1; };
  const gradientStub = () => ({ addColorStop() {} });
  const context = new Proxy({}, {
    get(obj, key) {
      if (key === 'createLinearGradient') { gradients.linear++; return gradientStub; }
      if (key === 'createRadialGradient') { gradients.radial++; return gradientStub; }
      if (key === 'createPattern') { count('createPattern'); return () => {}; }
      if (key === 'canvas') return { width: 1280, height: 800 };
      if (typeof key !== 'string') return undefined;
      if (countOps) count(key);
      return () => {};
    },
    set() { if (countOps) count('stateSet'); return true; }
  });

  function element(id) {
    if (elements.has(id)) return elements.get(id);
    const classes = new Set();
    const e = {
      id, style: {}, dataset: {}, children: [], inert: false, disabled: false, textContent: '', value: '',
      firstElementChild: { style: {} }, open: false,
      classList: {
        add(...cs) { cs.forEach(c => classes.add(c)); }, remove(...cs) { cs.forEach(c => classes.delete(c)); },
        toggle(c, b) { if (b === undefined) b = !classes.has(c); b ? classes.add(c) : classes.delete(c); },
        contains: c => classes.has(c)
      },
      focus() {}, setAttribute() {}, querySelector() { return element(id + 'Button'); },
      addEventListener(name, fn) { this[name] = fn; }, appendChild(b) { this.children.push(b); },
      getBoundingClientRect: () => ({ left: 0, top: 0, width: sandbox.innerWidth, height: sandbox.innerHeight }),
      getContext: () => context
    };
    Object.defineProperty(e, 'innerHTML', { set(v) { this._html = v; this.children = []; }, get() { return this._html || ''; } });
    elements.set(id, e);
    return e;
  }
  element('heroVoice').play = function () { this.paused = false; return Promise.resolve(); };
  element('heroVoice').pause = function () { this.paused = true; };
  let serial = 0;
  const document = {
    getElementById: element, querySelectorAll: () => [], querySelector: () => null,
    createElement: () => element('new' + serial++),
    addEventListener(name, fn) { listeners[name] = fn; }, hidden: false, body: element('body')
  };
  const sandbox = {
    document, Image: class {
      constructor() { this.complete = true; this.naturalWidth = 1280; this.naturalHeight = 1280; }
      set src(v) { this._src = v; } get src() { return this._src; }
    },
    Audio: class { play() { return Promise.resolve(); } pause() {} },
    innerWidth: mobile ? 720 : 1280, innerHeight: mobile ? 1600 : 800,
    devicePixelRatio: mobile ? 2 : 1,
    performance: { now: () => 0 },
    requestAnimationFrame() {}, matchMedia: q => ({ matches: mobile && q === '(pointer:coarse)' }),
    setTimeout: () => 1, clearTimeout() {}, setInterval: () => 1, clearInterval() {},
    addEventListener(name, fn) { listeners[name] = fn; },
    localStorage: { data: new Map(Object.entries(initialStorage)), getItem(k) { return this.data.get(k) || null; }, setItem(k, v) { this.data.set(k, v); } },
    Math: math, console
  };
  sandbox.window = sandbox; sandbox.globalThis = sandbox;
  vm.createContext(sandbox);

  const scripts = [
    'persisted-state.js', 'levels.js', 'visuals.js', 'equipment-catalog.js', 'loot.js',
    'v2-expansion-data.js', 'directional-assets-v410.js', 'directional-actions-v410.js', 'v2-expansion.js',
    'loot-ui.js', 'hero-saga.js', 'combat-fx.js', 'style2-cannon.js', 'elemental-sprites.js',
    'style2-impact-atlas.js', 'style2-user-towers.js', 'enemy-animations.js', 'style2-towers.js',
    'style2-maps.js', 'kirchende-combat.js', 'terrain-polish.js', 'forest-crowns.js', 'kirchende-art.js',
    'church-art.js', 'style2-level4-reference.js', 'style2-phase6.js', 'style2-markers.js',
    'style2-ambience.js', 'flight-enemies.js', 'goethestrasse.js', 'goethestrasse-art.js',
    'westhofen.js', 'westhofen-art.js', 'hohensyburg.js', 'hohensyburg-art.js',
    'campaign-balance.js', 'portal-run.js', 'portal-perks.js', 'map-polish-v410.js'
  ];
  for (const s of scripts) vm.runInContext(sourceOverrides[s] ?? fs.readFileSync(path.join(root, s), 'utf8'), sandbox);

  let source = sourceOverrides['game.js'] ?? fs.readFileSync(path.join(root, 'game.js'), 'utf8');
  source = source.replace(/\}\)\(\);\s*$/,
    `globalThis.test={draw,update,startGame,spawnEnemy,buildTower,selectTower,sellTower,launchWave,resize,getGame:()=>game,hurtEnemy,get zoom(){return zoom},get graphicsMode(){return typeof graphicsMode==='undefined'?null:graphicsMode},get qualityTier(){return typeof qualityTier==='undefined'?null:qualityTier},get lowFX(){return typeof lowFX==='function'?lowFX():null},get medFX(){return typeof medFX==='function'?medFX():null},advanceQualityMonitor:typeof advanceQualityMonitor==='function'?advanceQualityMonitor:null,cycleGraphics:typeof cycleGraphics==='function'?cycleGraphics:null,setGraphicsPreference:typeof setGraphicsPreference==='function'?setGraphicsPreference:null,qualityMonitor:()=>QUALITY_MONITOR};})();`);
  vm.runInContext(source, sandbox);

  return { sandbox, test: sandbox.test, element, counts, gradients,
    dispatch(type, event) { if (!listeners[type]) throw new Error('No listener for ' + type); listeners[type](event); },
    resetCounts() { for (const k of Object.keys(counts)) delete counts[k]; gradients.radial = gradients.linear = 0; } };
}

// Aufwendiges, deterministisches Szenario: Türme auf allen Slots, 40 Gegner, Projektile,
// Partikel und Schadenszahlen im Dauerbetrieb.
function buildStressScene(harness, level = 1) {
  const t = harness.test;
  t.startGame(level);
  harness.sandbox.HeroSaga?.continueStory?.();
  t.resize(false);
  const g = t.getGame();
  g.wave = 3; g.intermission = 0; g.waveSpawned = g.waveTotal = 0;
  t.launchWave && t.launchWave();
  if (t.buildTower && harness.sandbox.DenkmalLevels?.levels?.[level]?.slots) {
    g.essence = 99999;
    const kinds = ['bow', 'cannon', 'mage', 'rift', 'ballista'];
    let ki = 0;
    for (const slot of harness.sandbox.DenkmalLevels.levels[level].slots) {
      t.selectTower && t.selectTower(kinds[ki % kinds.length]); ki++;
      const hx = g.hero.x, hy = g.hero.y;
      g.hero.x = slot.x - 58; g.hero.y = slot.y; t.facing = { x: 1, y: 0 };
      t.buildTower();
      g.hero.x = hx; g.hero.y = hy;
    }
  }
  for (let i = 0; i < 60; i++) t.spawnEnemy && t.spawnEnemy();
  // Dauerbelastung ohne Game Over: Denkmal, Gegner und Held überleben den Messzeitraum.
  g.monument.hp = g.monument.maxHp = 1e9;
  g.enemies.forEach(e => { e.hp = e.maxHp = 1e9; e.dead = false; });
  for (let i = 0; i < 90; i++) {
    const cx = g.monument.x, cy = g.monument.y;
    g.enemies.forEach((e, j) => { e.x = cx - 120 + (j % 8) * 30; e.y = cy - 80 + (j % 5) * 30; e.hp = 1e9; e.dead = false; });
    if (g.hero) g.hero.invuln = 1e9;
    if (i % 3 === 0) g.enemies.forEach(e => t.hurtEnemy(e, 2, { fixedDamage: true }));
    t.update && t.update(1 / 60);
  }
  return g;
}

module.exports = { createRenderSandbox, buildStressScene };
