import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=readFileSync(new URL('../render.js',import.meta.url),'utf8');
const deployed=readFileSync(new URL('../../dist/ansturm/render.js',import.meta.url),'utf8');

test('contact enemies attack with a visible lunge instead of walking in place',()=>{
  assert.match(src,/attacking=d<=\.1002/,'attack state matches the model contact radius');
  assert.match(src,/nx=-\(e\.x\/\(d\|\|1\)\),ny=-\(e\.y\/\(d\|\|1\)\)/,'lunge direction points at the monument');
  assert.match(src,/lunge=attacking\?Math\.max\(0,attackPulse\)\*r\*\(chilled\?\.08:\.22\):0/,'lunge amplitude follows the attack pulse and is dampened while chilled');
  assert.match(src,/ctx\.translate\(x\+sway\+nx\*lunge,y\+r\*\.8\+bob\+ny\*lunge\)/,'the sprite pivot lunges toward the monument');
  assert.match(src,/const dmgAge=s\.elapsed-s\.lastDamage;if\(dmgAge<\.14\)/,'monument flash is driven by real damage events from the model');
  assert.match(src,/ctx\.arc\(0,unit\*\.05,unit\*\.62,0,Math\.PI\*2\)/,'flash rings the monument');
});
test('melee impacts show a directional slash arc at the contact point',()=>{
  assert.match(src,/if\(attacking&&attackPulse>0\)\{ctx\.strokeStyle='#ffd28f'/,'slash arc only renders on the strike beat');
  assert.match(src,/ctx\.arc\(x,y,r\*1\.35,Math\.atan2\(ny,nx\)-\.45,Math\.atan2\(ny,nx\)\+\.45\)/,'arc sector faces the monument');
  assert.match(src,/ctx\.globalAlpha=Math\.min\(\.75,attackPulse\*\.75\)/,'slash opacity follows the pulse, capped at 75 %');
});
test('walk-cycle guarantees survive the attack pass',()=>{
  assert.match(src,/eStep=attacking\?attackPulse:Math\.sin\(walkT\*\(e\.type==='runner'\?10:7\)\+e\.id\*1\.73\)/);
  assert.match(src,/bob=attacking\?Math\.max\(0,attackPulse\)\*r\*\(chilled\?\.03:\.1\):eStep\*r\*\(chilled\?\.05:\.16\)/);
  assert.equal(src,deployed,'source and dist renderers stay byte-identical');
});
