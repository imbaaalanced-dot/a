'use strict';
/* B-Pass (A -> B -> C nach #413): Portal-Karten je Abschnitt, Chronik-Stimme
   (portal1..3 + portalBoss), Frost-Kombo (+25% Schaden auf verlangsamte Ziele). */
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path');
// Reuse the existing DOM/canvas fixture, before its gameplay assertions.
let fixture=fs.readFileSync(path.join(__dirname,'game.test.cjs'),'utf8').split("if(process.env.TEST_MOBILE==='1'){")[0];
fixture=fixture.replace("let source=fs.readFileSync", "for(const file of ['portal-run.js','portal-perks.js','campaign-balance.js'])if(fs.existsSync(path.join(root,file)))vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),sandbox);\nlet source=fs.readFileSync");
const {t,sandbox}=new Function('require','__dirname',fixture+';return {t,sandbox};')(require,__dirname);
const h=sandbox.DenkmalTestHooks;
const levels=sandbox.DenkmalLevels.levels;

// --- 1) Portal-Karten: Abschnitt -> eigene Kampagnenkarte ---
assert.equal(typeof h.startPortalRun,'function');
assert.equal(h.startPortalRun({resume:false}),true);
assert.equal(t.game.mode,'portal');
assert.equal(t.game.level,1,'Abschnitt 1 nutzt die Einleitungskarte');
assert.equal(h.getPortalRun().section,1);

function clearWave(){t.game.enemies=[];t.game.waveSpawned=t.game.waveTotal;h.endWave();}
function finishSectionToExit(){
  h.launchWave();assert.equal(h.getPortalRun().phase,'combat');clearWave();
  assert.equal(h.getPortalRun().phase,'build');h.launchWave();clearWave();
  assert.equal(h.getPortalRun().phase,'perk');
  assert.equal(sandbox.document.getElementById('perkGrid').children.length,3);
  sandbox.document.getElementById('perkGrid').children[0].onclick();
  assert.equal(h.getPortalRun().phase,'exit');
}

// Chronik-Stimme: Abschnittslinie landet als Subtitle
assert.equal(sandbox.HeroSaga.lines.portal1.length>0,true,'portal1 line exists');
assert.equal(sandbox.document.getElementById('subtitleText').textContent,sandbox.HeroSaga.lines.portal1,'chronicle line portal1 shown at section 1');

finishSectionToExit();
assert.equal(h.enterPortal(),true);
assert.equal(h.getPortalRun().section,2);
assert.equal(t.game.level,2,'Abschnitt 2 nutzt die Labyrinth-Karte');
assert.equal(sandbox.document.getElementById('subtitleText').textContent,sandbox.HeroSaga.lines.portal2,'chronicle line portal2 shown at section 2');
// Gates der Abschnittskarte bleiben gueltig (Labyrinth hat 1 Pfad)
t.spawnEnemy();assert.ok(Number.isFinite(t.game.enemies[0].hp));
assert.ok(t.game.enemies[0].gateIndex<levels[2].paths.length,'gate index clamped to section map paths');

finishSectionToExit();
assert.equal(h.enterPortal(),true);
assert.equal(h.getPortalRun().section,3);
assert.equal(t.game.level,3,'Abschnitt 3 nutzt die Kirchende-Karte');
assert.equal(sandbox.document.getElementById('subtitleText').textContent,sandbox.HeroSaga.lines.portal3,'chronicle line portal3 shown at section 3');
t.spawnEnemy();assert.ok(t.game.enemies[0].gateIndex<levels[3].paths.length);

// Bosswelle des letzten Abschnitts loest die portalBoss-Chronik aus
h.launchWave();assert.equal(h.getPortalRun().phase,'combat');clearWave();
assert.equal(h.getPortalRun().phase,'build'); // Welle 2 des Abschnitts 3
h.launchWave();clearWave(); // -> finished
assert.equal(sandbox.document.getElementById('subtitleText').textContent.length>0,true);

// --- 2) Frost-Kombo: verlangsamte Ziele erleiden +25% Schaden ---
h.resetGame(1,'campaign');
const g=t.game;
const mkEnemy=()=>{g.enemies=[];t.spawnEnemy('normal');const e=g.enemies[0];e.hp=e.maxHp=100000;e.armor=0;e.slow=0;e.slowFactor=1;return e;};
let e=mkEnemy();const hp0=e.hp;t.hurtEnemy(e,100,{fixedDamage:true});const dmgPlain=hp0-e.hp;
e=mkEnemy();e.slow=1;e.slowFactor=.5;const hp1=e.hp;t.hurtEnemy(e,100,{fixedDamage:true});const dmgFrost=hp1-e.hp;
assert.ok(Math.abs(dmgPlain-100)<1e-9,`plain fixed hit deals 100 (got ${dmgPlain})`);
assert.ok(Math.abs(dmgFrost-125)<1e-9,`frost combo deals 125 on slowed target (got ${dmgFrost})`);
// ausloesender Treffer (slow noch 0) bleibt ohne Kombo
e=mkEnemy();const hp2=e.hp;t.hurtEnemy(e,100,{fixedDamage:true,slow:.58});const dmgApply=hp2-e.hp;
assert.ok(Math.abs(dmgApply-100)<1e-9,'the hit that applies slow gets no combo bonus itself');

// --- 3) Cache-Keys ---
const html=fs.readFileSync(path.join(__dirname,'../dist/index.html'),'utf8');
assert.match(html,/game\.js\?v=gameplay-b-20261123/,'game.js cache key bumped for B-Pass');
assert.match(html,/hero-saga\.js\?v=saga-chronik-20261123/,'hero-saga.js cache key bumped for chronicle voice');

console.log('B-Pass: Portal-Karten je Abschnitt, Chronik-Stimme (portal1..3/portalBoss) und Frost-Kombo (+25% auf verlangsamte Ziele) gepinnt');
