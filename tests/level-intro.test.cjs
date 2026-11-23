/* Level-3 Intro-Video (Kirchender Denkmal): Modulvertrag, game.js-Verdrahtung
   und 404-Gate-Kompatibilität des optionalen Video-Assets.
   Run: node tests/level-intro.test.cjs */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../dist');

function makeSandbox() {
  const elements = new Map();
  function element(id) {
    if (elements.has(id)) return elements.get(id);
    const classes = new Set(['hidden']);
    const e = {
      id, style: {}, textContent: '', paused: false, playing: false, muted: false, ended: false, src: '',
      classList: {
        add(...cs) { cs.forEach(c => classes.add(c)); },
        remove(...cs) { cs.forEach(c => classes.delete(c)); },
        contains: c => classes.has(c),
        toggle(c, b) { if (b === undefined) b = !classes.has(c); b ? classes.add(c) : classes.delete(c); }
      },
      focus() {}, setAttribute() {}, removeAttribute() { e.src = ''; },
      addEventListener(name, fn) { e['on' + name] = fn; }
    };
    e.play = () => { e.playing = true; e.paused = false; if (e.onplay) e.onplay(); return Promise.resolve(); };
    e.pause = () => { e.paused = true; e.playing = false; if (e.onpause) e.onpause(); };
    e.load = () => {};
    elements.set(id, e);
    return e;
  }
  const listeners = {};
  const document = {
    getElementById: element,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener(name, fn) { listeners[name] = fn; }
  };
  const sandbox = { document, listeners, console, Math, Set, Promise };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  // Vertragstest prueft das Modul im AUSGELIEFERTEN Zustand (Clip vorhanden).
  // Der Ship-Schalter wird dafuer nur im Sandbox-Source geflippt; die echte
  // Produktions-Konstante pint tests/level-intro-clip-availability.test.cjs
  // gegen den tatsaechlichen Dateibestand.
  const shippedSource = fs.readFileSync(path.join(root, 'level-intro.js'), 'utf8')
    .replace('const CLIP_SHIPPED = false;', 'const CLIP_SHIPPED = true;')
    .replace('const CLIP_SHIPPED = true;', 'const CLIP_SHIPPED = true;');
  assert.ok(shippedSource.includes('const CLIP_SHIPPED = true;'), 'sandbox must exercise the shipped mode');
  vm.runInContext(shippedSource, sandbox);
  const apiState = { value: 'playing', sound: true, toasts: [] };
  const api = {
    getState: () => apiState.value,
    setState: s => { apiState.value = s; },
    focusModal() {}, focusGame() {}, clearInput() {}, updateUI() {},
    showToast: m => apiState.toasts.push(m),
    soundOn: () => apiState.sound
  };
  sandbox.DenkmalLevelIntro.init(api);
  return { sandbox, apiState, element, listeners };
}

(async () => {
  // 1) Vertrag: unbekannte Level und falscher Zustand zeigen kein Intro.
  {
    const { sandbox, apiState } = makeSandbox();
    assert.equal(sandbox.DenkmalLevelIntro.show(2), false, 'no intro configured for level 2');
    apiState.value = 'paused';
    assert.equal(sandbox.DenkmalLevelIntro.show(3), false, 'intro only starts from playing state');
  }
  // 2) Show: Zustandswechsel, zusammengesetzter Asset-Pfad, Ton folgt dem Schalter.
  {
    const { sandbox, element, apiState } = makeSandbox();
    assert.equal(sandbox.DenkmalLevelIntro.show(3), true, 'level 3 campaign shows the intro');
    assert.equal(apiState.value, 'levelintro', 'simulation freezes while the intro plays');
    assert.equal(element('levelIntroVideo').src, 'assets/intro/kirchende-intro-v1.mp4', 'composed asset path is correct');
    assert.equal(element('levelIntroVideo').muted, false, 'sound on keeps the video audible');
    assert.equal(element('levelIntroScreen').classList.contains('hidden'), false, 'overlay is visible');
    assert.equal(element('levelIntroKicker').textContent, 'KAPITEL III');
    assert.equal(element('levelIntroTitle').textContent, 'KRIEGERDENKMAL KIRCHENDE');
    // Ende des Videos -> WEITER ZUR WACHT, Klick schließt und gibt das Video frei.
    element('levelIntroVideo').onended();
    assert.equal(element('levelIntroContinue').classList.contains('hidden'), false);
    assert.match(element('levelIntroContinue').textContent, /WEITER ZUR WACHT/);
    element('levelIntroContinue').onclick();
    assert.equal(apiState.value, 'playing', 'continue returns to the watch');
    assert.equal(element('levelIntroVideo').src, '', 'video source is released after closing');
    // Nur einmal pro Sitzung: Neustart des Levels zeigt kein zweites Intro.
    assert.equal(sandbox.DenkmalLevelIntro.show(3), false, 'intro replays are skipped within one session');
  }
  // 3) Blockierter Autoplay-Start (WebView ohne Geste): Start-Button, Skip und Fluchtaste.
  {
    const { sandbox, element, apiState } = makeSandbox();
    element('levelIntroVideo').play = () => Promise.reject(new Error('NotAllowedError'));
    assert.equal(sandbox.DenkmalLevelIntro.show(3), true);
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(element('levelIntroContinue').classList.contains('hidden'), false, 'blocked autoplay surfaces the start button');
    assert.match(element('levelIntroContinue').textContent, /INTRO STARTEN/);
    element('levelIntroSkip').onclick();
    assert.equal(apiState.value, 'playing', 'skip immediately returns to the watch');
    assert.equal(element('levelIntroScreen').classList.contains('hidden'), true, 'skip hides the overlay');
  }
  {
    const { sandbox, apiState } = makeSandbox();
    sandbox.DenkmalLevelIntro.show(3);
    sandbox.DenkmalLevelIntro.close();
    assert.equal(apiState.value, 'playing', 'close is idempotent and restores play');
    assert.equal(sandbox.DenkmalLevelIntro.close(), false, 'close without open intro does nothing');
  }
  // 4) Video-Fehler (Asset fehlt): Overlay schließt sich, die Wacht startet trotzdem.
  {
    const { sandbox, element, apiState } = makeSandbox();
    element('levelIntroVideo').play = () => Promise.reject(new Error('NotSupportedError'));
    sandbox.DenkmalLevelIntro.show(3);
    element('levelIntroVideo').onerror();
    assert.equal(apiState.value, 'playing', 'missing asset cannot freeze the level start');
  }
  // 5) Verdrahtung: game.js-Hook, closeScreens, Escape, Cache-Keys, HTML-Gerüst.
  {
    const gameSource = fs.readFileSync(path.join(root, 'game.js'), 'utf8');
    assert.match(gameSource, /level===3&&mode==='campaign'&&globalThis\.DenkmalLevelIntro\?\.show\(level\)/, 'level 3 campaign start routes through the intro module');
    assert.match(gameSource, /DenkmalLevelIntro\?\.init\(\{getState:\(\)=>state/, 'game.js wires the module the same way as the saga');
    assert.match(gameSource, /'levelIntroScreen'/, 'closeScreens also closes the intro overlay');
    assert.match(gameSource, /state==='levelintro'\)\{e\.preventDefault\(\);globalThis\.DenkmalLevelIntro\?\.close\(\);return;\}/, 'Escape closes the intro');
    assert.match(gameSource, /state!=='levelintro'&&\(state==='playing'\?gameplayDrawDue/, 'the canvas rests while the video plays');
    const introSource = fs.readFileSync(path.join(root, 'level-intro.js'), 'utf8');
    assert.doesNotMatch(introSource, /['"]assets\/intro\/[A-Za-z0-9_.-]+\.mp4['"]/, 'asset path stays composed so the static 404 gate treats the video as optional');
    const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    assert.match(html, /id="levelIntroScreen"/, 'index.html contains the intro overlay');
    assert.match(html, /<script src="level-intro\.js\?v=levelintro2"><\/script>/, 'module loads before game.js with a cache key');
    assert.match(html, /level-intro\.css\?v=levelintro1/, 'overlay styles load with a cache key');
    assert.match(html, /game\.js\?v=gameplay-voice-20261123/, 'changed game.js bumps its cache key');
    assert.match(html, /id="levelIntroVideo"[^>]*preload="none"[^>]*playsinline/, 'no preload and inline playback for WebView');
  }
  console.log('Level-3 intro video: module contract, wiring and 404-gate compatibility verified.');
})().catch(error => { console.error(error); process.exit(1); });
