'use strict';
/* Style-2 enemy manifest contract. Does not load/decode WebP or change runtime. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const dist=path.resolve(__dirname,'../dist');
const sandbox={};sandbox.globalThis=sandbox;
vm.runInNewContext(fs.readFileSync(path.join(dist,'directional-assets-v410.js'),'utf8'),sandbox);
vm.runInNewContext(fs.readFileSync(path.join(dist,'enemy-animations.js'),'utf8'),sandbox);
const manifest=sandbox.TD2DirectionalAssets;
const keys=Object.keys(manifest).sort();
assert.equal(keys.length,21,'21 individually authored enemy action atlases');
assert.deepEqual(keys,Array.from({length:21},(_,i)=>'enemy-'+String(i).padStart(2,'0')));
const files=new Set();
const directions=['down','left','right','up'],actions=['attack','hit','death'];
for(const [id,spec] of Object.entries(manifest)){
 assert.equal(spec.cell,128,id+' cell');
 assert.equal(spec.frames,4,id+' frame count');
 assert.ok(spec.height>0,id+' authored height');
 assert.ok(spec.anchor.length===2&&spec.anchor.every(v=>Number.isFinite(v)&&v>=0&&v<=128),id+' anchor');
 assert.match(spec.file,/^assets\/directional-v410\/enemy-\d\d\.webp\?v=v410a1$/);
 assert.equal(spec.file.match(/enemy-\d\d/)[0],id,id+' filename identity');
 assert.ok(!files.has(spec.file),id+' duplicate atlas URL');
 files.add(spec.file);
 const rows=[];
 for(const facing of directions)for(const action of actions){
  const row=spec.rows?.[facing]?.[action];
  assert.ok(Number.isInteger(row)&&row>=0&&row<12,id+' '+facing+'/'+action);
  rows.push(row);
 }
 assert.equal(new Set(rows).size,12,id+' row uniqueness');
}
for(const [type,variants] of Object.entries({runner:[0,13,11],brute:[1,7,9],archer:[2],guardian:[14,3],sapper:[5],rootrunner:[11,13],stoneguard:[7,14],mistcaller:[6,16,4],uprooted:[18],shadowwing:[8],gargoyle:[17],stormwing:[8,17],wraith:[12,15,3]})){
 for(let i=0;i<variants.length;i++){
  const actual=sandbox.DenkmalEnemyAnimations.select({type,visualVariant:i},1);
  assert.equal(actual,variants[i],type+' variant '+i);
  assert.ok(manifest['enemy-'+String(actual).padStart(2,'0')],type+' action atlas exists');
 }
}
console.log('Style-2 enemy manifest: 21 atlases, 12 unique action rows each, identities and walk mappings verified');
