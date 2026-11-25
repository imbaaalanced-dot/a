import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=readFileSync(new URL('../render.js',import.meta.url),'utf8');
const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');

test('enemies animate a procedural walk cycle from their single-frame sprites',()=>{
  assert.match(src,/const chilled=e\.slowUntil>s\.elapsed/,'frost-slowed enemies must keep animating at reduced tempo');
  assert.match(src,/walkT=\(chilled\?\.35:1\)\*s\.elapsed/,'walk clock slows to 35 % while chilled');
  assert.match(src,/eStep=attacking\?attackPulse:Math\.sin\(walkT\*\(e\.type==='runner'\?10:7\)\+e\.id\*1\.73\)/,'every enemy walks with a per-id phase offset; runner step frequency is distinct');
  assert.match(src,/bob=attacking\?Math\.max\(0,attackPulse\)\*r\*\(chilled\?\.03:\.1\):eStep\*r\*\(chilled\?\.05:\.16\)/,'step bob is scaled by enemy radius and dampened while chilled');
  assert.match(src,/ctx\.translate\(x\+sway\+nx\*lunge,y\+r\*\.8\+bob\+ny\*lunge\)/,'sprite pivot moves with the walk instead of sliding flat');
  assert.match(src,/ctx\.rotate\(attacking\?attackPulse\*\.12:eStep\*\(chilled\?\.01:\.05\)\)/,'subtle torso lean follows the step without full-image mirroring');
  assert.match(src,/ctx\.ellipse\(x,y\+r\*\.6,r\*1\.1\*\(1-eStep\*\.06\),r\*\.55\*\(1-eStep\*\.06\)/,'ground shadow squashes in sync with the step');
  assert.match(src,/sprite\(ctx,e\.spriteKey\|\|`enemy_\$\{e\.type\}`,0,0,r\*2\.7,r\*3\.5\)/,'existing transparent single-frame sprites stay the art source');
});
test('walk animation ships with a fresh cache key in both trees',()=>{
  assert.match(app,/render\.js\?v=atmoglow2/);
  const deployed=readFileSync(new URL('../../dist/ansturm/render.js',import.meta.url),'utf8');
  assert.equal(src,deployed,'source and dist renderers stay byte-identical');
});
