/* Conscious re-baseline of the simulation-equivalence contract.
   Usage: node patches/record-baseline.cjs <full-anchor-sha>
   Anchor = the commit whose dist/ sources define the new engine baseline.
   Creates the new baseline bundle + digest fixture, repins helpers and test,
   and deletes the superseded c5d6f21 fixtures. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const [,,anchor]=process.argv;
if(!/^[0-9a-f]{40}$/.test(anchor||''))throw Error('usage: node patches/record-baseline.cjs <full-anchor-sha>');
const short=anchor.slice(0,7);
const bundleName=`simulation-baseline-${short}.json`,digestName=`simulation-${short}.json`;
const files=['dist/game.js','dist/levels.js','ansturm-alpha1-5/model.js','ansturm-alpha1-5/config.js'];
const entries={};
for(const f of files){
  const bytes=fs.readFileSync(path.join(root,f));
  entries[f]={gzipBase64:zlib.gzipSync(bytes,{level:9,mtime:0}).toString('base64'),sha256:crypto.createHash('sha256').update(bytes).digest('hex')};
}
fs.writeFileSync(path.join(root,'tests/fixtures',bundleName),JSON.stringify({commit:anchor,files:entries},null,2)+'\n');
const helperPath=path.join(root,'tests/helpers/simulation.cjs');
const helper=fs.readFileSync(helperPath,'utf8');
const oldRequire="require('../fixtures/simulation-baseline-c5d6f21.json')";
if(!helper.includes(oldRequire))throw Error('helper pin not found');
fs.writeFileSync(helperPath,helper.replace(oldRequire,`require('../fixtures/simulation-baseline-${short}.json')`));
const testPath=path.join(root,'tests/simulation-equivalence.test.cjs');
const test=fs.readFileSync(testPath,'utf8');
const pins=[
  ["const target='tests/fixtures/simulation-c5d6f21.json'",`const target='tests/fixtures/${digestName}'`],
  ["if(record)assert.equal(ref,'c5d6f21','record only from the original baseline commit');",`if(record)assert.equal(ref,'${anchor}','record only from the current baseline commit ${short}');`],
  ["{baseline:'c5d6f21',runtime:process.version",`{baseline:'${short}',runtime:process.version`]
];
let patched=test;
for(const [from,to] of pins){
  if(!patched.includes(from))throw Error('test pin not found: '+from.slice(0,50));
  patched=patched.replace(from,to);
}
fs.writeFileSync(testPath,patched);
delete require.cache[helperPath];
const {ansturm,campaign,snapshot}=require(path.join(root,'tests/helpers/simulation.cjs'));
const results={};
function trace(name,build,count,options,ticks,prepare=()=>{}){
  const actual=build(count,{...options,ref:null,layoutRef:null});
  const expected=build(count,{...options,ref:'baseline',layoutRef:null});
  prepare(actual.state);prepare(expected.state);
  const hash=crypto.createHash('sha256');
  for(let i=0;i<ticks;i++){
    actual.tick();expected.tick();
    const value=JSON.stringify(snapshot(actual.state)),other=JSON.stringify(snapshot(expected.state));
    if(value!==other)throw Error(`${name}: state diverged at update ${i+1}`);
    hash.update(value);
  }
  results[name]=hash.digest('hex');
}
for(const [mode,build] of Object.entries({campaign,ansturm}))for(const count of [25,50,100,200])for(const lethal of [false,true])
  trace(`${mode}-${count}-${lethal?'lethal':'sustained'}`,build,count,{lethal,reducedMotion:true},360);
for(const bossWave of [5,10,15,20])trace(`boss-${bossWave}`,ansturm,25,{lethal:true,bossWave},1200);
for(const level of [1,2,3,4,5,6,7])trace(`campaign-mixed-level-${level}`,campaign,25,{level,mixed:true,lethal:true,reducedMotion:true},360);
for(const kind of ['ties','lost','effect-cap'])trace(`ansturm-${kind}`,ansturm,25,{lethal:true},360,s=>{
  for(let i=0;i<s.enemies.length;i++){const e=s.enemies[i];e.x=i%2?.8:.1;e.y=0;e.speed=0;e.burnUntil=0;e.type='normal';}
  if(kind==='lost'){s.hp=.001;s.shield=0;s.enemies.forEach(e=>e.x=0);}
  if(kind==='effect-cap')s.effects=Array.from({length:150},(_,i)=>({type:'projectile',x:i,life:i%2?.4:.001,total:.4,progress:0}));
  s.fireClock=1;
});
fs.writeFileSync(path.join(root,'tests/fixtures',digestName),JSON.stringify({baseline:short,runtime:process.version,ticks:360,bossTicks:1200,results},null,2)+'\n');
for(const f of ['tests/fixtures/simulation-baseline-c5d6f21.json','tests/fixtures/simulation-c5d6f21.json'])
  fs.rmSync(path.join(root,f));
console.log(`New baseline recorded: anchor ${short}, ${Object.keys(results).length} traces, bundle ${bundleName}`);
