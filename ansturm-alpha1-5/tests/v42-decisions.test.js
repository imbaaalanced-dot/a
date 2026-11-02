import test from 'node:test';import assert from 'node:assert/strict';import * as M from '../model.js';
test('purchase preview shows actual gain without changing the run',()=>{
 assert.equal(typeof M.purchasePreview,'function');const s=M.createGame(),before=JSON.stringify(s);const p=M.purchasePreview(s,'attack');assert.equal(p.before,12);assert.equal(p.after,15);assert.equal(JSON.stringify(s),before);
 const tempo=M.purchasePreview(s,'tempo');assert.equal(tempo.before,1.4);assert.ok(Math.abs(tempo.after-1.55)<1e-10);
 s.upgrades.tesla=3;assert.equal(M.purchasePreview(s,'tesla').after,null);assert.equal(M.purchasePreview(s,'absent'),null);
});
test('wave preview announces bosses, future enemies and wave limit',()=>{
 assert.equal(typeof M.wavePreview,'function');assert.match(M.wavePreview(5),/Steinbrecher/);assert.match(M.wavePreview(10),/Sturmherr/);assert.match(M.wavePreview(3),/Schild/);assert.match(M.wavePreview(1001),/erreicht/);
});
test('summary includes elapsed time, kills and chosen weapon levels',()=>{
 assert.equal(typeof M.runSummary,'function');const s=M.createGame();s.wave=12;s.elapsed=185;s.kills=97;s.upgrades.frost=2;assert.match(M.runSummary(s),/3:05/);assert.match(M.runSummary(s),/97/);assert.match(M.runSummary(s),/Frostfeld 2/);
});
test('range stops charging once the arena limit is reached',()=>{const s=M.createGame();s.gold=1e8;s.tech.range=15;assert.equal(M.quotePurchase(s,'range').reason,'Maximum');assert.equal(M.purchase(s,'range'),false);});
