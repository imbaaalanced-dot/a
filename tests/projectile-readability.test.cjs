'use strict';
/* Beta #330 P1: projectile and impact readability on zoomed-out mobile portrait. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'../dist');
const fx=fs.readFileSync(path.join(root,'combat-fx.js'),'utf8');
const game=fs.readFileSync(path.join(root,'game.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.ok(fx.includes('function setViewZoom(zoom){ viewZoom=zoom>0?zoom:.56; }'),
  'combat-fx must accept the live camera zoom');
assert.ok(fx.includes('function uiScale(){ return Math.min(1.6,Math.max(1,.56/viewZoom)); }'),
  'ui compensation stays between 1x (desktop) and 1.6x (wide mobile)');
assert.ok(fx.includes('ctx.lineWidth=(1+level*.45)*ui;'),
  'projectile stroke must scale with the ui compensation');
assert.ok(fx.includes('ctx.arc(0,0,heavy?4+level*.5:b.r*ui,0,Math.PI*2);ctx.fill();'),
  'non-heavy projectile cores must keep their on-screen size when zoomed out');
assert.ok(fx.includes('ctx.lineWidth=Math.max(uiScale(),3.2*t);'),
  'impact rings must stay visible at mobile portrait zoom');
assert.ok(fx.includes('setViewZoom,uiScale'), 'zoom API must be exported');
assert.ok(game.includes('fx.setViewZoom?.(zoom);'),
  'the draw loop must feed the current zoom into combat-fx each frame');
assert.ok(game.includes("if(zoomMode==='wide')return portraitLayout()?.46:(mobileRender?.50:.52);"),
  'baseline zoom levels are unchanged (readability fix must not alter camera behavior)');
assert.ok(html.includes('combat-fx.js?v=particle-priority-20261122')
  && html.includes('game.js?v=witten-heven-level8-20261127'),
  'index.html must reference the new cache keys');
console.log('Projectile readability: zoom-compensated strokes, cores and impact rings pinned');
