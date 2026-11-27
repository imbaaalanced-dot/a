import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import manifest from '../asset-manifest.js';
import {walkDirection,walkSheetKey} from '../walk-sheet.js';
const src=readFileSync(new URL('../render.js',import.meta.url),'utf8');
const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const sprites=readFileSync(new URL('../sprites.js',import.meta.url),'utf8');

test('direction mapping uses screen coordinates and valid cardinal directions',()=>{
  assert.deepEqual([[1,0],[-1,0],[0,-1],[0,1]].map(([x,y])=>walkDirection(x,y)),['e','w','n','s']);
  for(let n=0;n<360;n++){
    const a=n*Math.PI/180;
    assert.ok(['e','n','w','s'].includes(walkDirection(Math.cos(a),Math.sin(a))));
  }
});
test('all regular enemy families resolve to real manifest entries in four directions',()=>{
  const families=['normal','runner','armored','cultist','shieldbearer','bomber','gargoyle','siege'];
  for(const family of families)for(const direction of ['n','e','s','w']){
    const key=walkSheetKey({type:family},direction);
    assert.ok(Object.hasOwn(manifest,key),'missing manifest key: '+key);
    assert.ok(manifest[key].includes('walk-sheets/'+family+'/walk_'+family+'_'+direction+'.png'));
  }
});
test('boss identities resolve to their own four directional sheets',()=>{
  for(const family of ['stonebreaker','stormlord','shieldwarden','colossus'])for(const direction of ['n','e','s','w']){
    const key=walkSheetKey({type:'boss',spriteKey:'boss_'+family},direction);
    assert.equal(key,'walk_'+family+'_'+direction);
    assert.ok(Object.hasOwn(manifest,key),'missing boss manifest key: '+key);
  }
  assert.equal(walkSheetKey({type:'boss',spriteKey:'boss_unknown'},'n'),null);
});
test('spritesheets use the shared decoded-image cache without a second Image loader',()=>{
  assert.ok(sprites.includes('export function spriteFrame('));
  assert.ok(sprites.includes('img.naturalWidth%frameCount!==0'));
  assert.ok(sprites.includes('ctx.drawImage(img,index*frameWidth,0,frameWidth,img.naturalHeight'));
  assert.ok(!src.includes('new Image('));
  assert.ok(!src.includes('assets/walk-sheets/'));
  assert.ok(src.includes('spriteFrame(ctx,walkKey,frame,WALK_FRAMES'));
});
test('frost pacing and single-frame fallback remain available',()=>{
  assert.ok(src.includes('const chilled=e.slowUntil>s.elapsed'));
  assert.ok(src.includes('walkT=(chilled?.35:1)*s.elapsed'));
  assert.ok(src.includes('sprite(ctx,e.spriteKey||`enemy_${e.type}`'));
});
test('app uses matching cache-busted renderer and sprite module imports',()=>{
  assert.ok(app.includes("render.js?v=walksheet-cache-v3"));
  assert.ok(app.includes("sprites.js?v=walksheet-cache-v3"));
});
test('source and deployed renderer remain byte-identical',()=>{
  const deployed=readFileSync(new URL('../../dist/ansturm/render.js',import.meta.url),'utf8');
  assert.equal(src,deployed);
});
