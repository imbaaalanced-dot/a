'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'../dist');

// Base 6x6 combat sheets plus the six additionally painted direction sheets.
const baseSheets=['kim-walk-v5b','marcel-walk-v5b','kim-side-actions-v5b','marcel-side-actions-v5b'];
const directionSheets=['marcel-down-actions-v5b','marcel-left-actions-v5b','marcel-up-actions-v5b',
  'kim-right-actions-v5b','kim-up-actions-v5b','kim-down-actions-v5b'];
for(const name of [...baseSheets,...directionSheets]){
  assert.ok(fs.existsSync(path.join(root,`assets/hero/${name}.webp`)),`${name} exported as a runtime atlas`);
}

const ready=new Map();
const waits=[];
const box={Math,Date,globalThis:null,DenkmalAssets:{
  ready:url=>ready.get(url)||null,
  retain(group,urls){return new Promise(resolve=>waits.push(()=>{
    for(const url of urls)ready.set(url,{naturalWidth:768,naturalHeight:url.includes('walk')?2304:768});
    resolve();
  }));},release(){}
}};
box.globalThis=box;
for(const script of ['directional-assets-v410.js','directional-hero-assets-v5.js','directional-actions-v410.js']){
  vm.runInNewContext(fs.readFileSync(path.join(root,script),'utf8'),box);
}
const ctx=()=>({globalAlpha:1,depth:0,draws:[],flips:[],stack:[],save(){this.stack.push(this.globalAlpha);this.depth++;},restore(){this.globalAlpha=this.stack.pop();this.depth--;},translate(){},scale(...v){this.flips.push(v);},drawImage(...v){this.draws.push(v);}});
async function drain(){for(let n=0;n<10;n++){await new Promise(r=>setImmediate(r));while(waits.length)waits.shift()();}}
(async()=>{
  const specs=box.TD2HeroSideAssets;
  assert.equal(specs.marcel.facing,'right');
  assert.equal(specs.kim.facing,'left');
  // Every painted direction must be registered with its own sheet file.
  assert.deepEqual(Object.keys(specs.marcel.sheets).sort(),['down','left','up']);
  assert.deepEqual(Object.keys(specs.kim.sheets).sort(),['down','right','up']);
  const painted={marcel:['right','down','left','up'],kim:['left','down','right','up']};
  for(const hero of ['marcel','kim']){
    // A cold action sheet must defer to the same V5b walking identity.
    for(const dir of painted[hero]){
      assert.equal(box.TD2DirectionalActions.drawHeroSide(ctx(),hero,'attack',dir,.3,0,0,70),false,`${hero} ${dir} cold load defers to walk`);
    }
    await drain();
    for(const dir of painted[hero]){
      for(const [kind,row] of Object.entries({attack:2,hit:4,death:5})){
        for(let f=0;f<6;f++){
          const c=ctx();
          assert.equal(box.TD2DirectionalActions.drawHeroSide(c,hero,kind,dir,(f+.1)/6,0,0,70),true,`${hero} ${dir} ${kind} frame ${f}`);
          assert.deepEqual(c.draws[0].slice(1,5),[f*128,row*128,128,128],`${hero} ${dir} ${kind} frame ${f}`);
          assert.equal(c.depth,0,'Canvas state restored');
          assert.equal(c.flips.length,0,'asymmetric gear is never mirrored');
        }
      }
    }
  }
  const alpha=ctx();
  assert.equal(box.TD2DirectionalActions.drawHeroSide(alpha,'marcel','death','right',.5,0,0,70),true);
  assert.ok(alpha.globalAlpha===1,'death fade cannot leak to next draw');
  const broken=ctx();broken.drawImage=()=>{throw Error('draw context lost');};
  assert.equal(box.TD2DirectionalActions.drawHeroSide(broken,'kim','hit','left',.3,0,0,70),false);
  assert.equal(broken.depth,0,'Canvas restore after exception');
  console.log('Canonical hero 6x6 side actions: all four painted directions per hero, real frames, walk fallback and Canvas symmetry passed');
})().catch(e=>{console.error(e);process.exitCode=1;});