'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'../dist');

for(const name of ['kim-walk-v5b','marcel-walk-v5b','kim-side-actions-v5b','marcel-side-actions-v5b']){
  assert.ok(fs.existsSync(path.join(root,`assets/hero/${name}.webp`)),`${name} exported as a runtime atlas`);
}

const ready=new Map();
const waits=[];
const box={Math,Date,globalThis:null,DenkmalAssets:{
  ready:url=>ready.get(url)||null,
  retain(group,urls){return new Promise(resolve=>waits.push(()=>{
    for(const url of urls)ready.set(url,{naturalWidth:url.includes('side-actions')?768:768,naturalHeight:url.includes('side-actions')?768:2304});
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
  for(const hero of ['marcel','kim']){
    const spec=specs[hero];
    const dir=spec.facing;
    // First render must fall back to the existing directional atlas while decoding.
    assert.equal(box.TD2DirectionalActions.drawHeroSide(ctx(),hero,'attack',dir,.3,0,0,70),false);
    await drain();
    for(const [kind,row] of Object.entries({attack:2,hit:4,death:5})){
      for(let f=0;f<6;f++){
        const c=ctx();
        assert.equal(box.TD2DirectionalActions.drawHeroSide(c,hero,kind,dir,(f+.1)/6,0,0,70),true);
        assert.deepEqual(c.draws[0].slice(1,5),[f*128,row*128,128,128],`${hero} ${kind} frame ${f}`);
        assert.equal(c.depth,0,'Canvas state restored');
        assert.equal(c.flips.length,0,'asymmetric gear is never mirrored');
      }
    }
    assert.equal(box.TD2DirectionalActions.drawHeroSide(ctx(),hero,'attack',dir==='right'?'left':'right',.5,0,0,70),false,'unpainted opposite direction uses old atlas');
    assert.equal(box.TD2DirectionalActions.drawHeroSide(ctx(),hero,'attack','down',.5,0,0,70),false,'front direction uses old atlas');
  }
  const alpha=ctx();
  assert.equal(box.TD2DirectionalActions.drawHeroSide(alpha,'marcel','death','right',.5,0,0,70),true);
  assert.ok(alpha.globalAlpha===1,'death fade cannot leak to next draw');
  const broken=ctx();broken.drawImage=()=>{throw Error('draw context lost');};
  assert.equal(box.TD2DirectionalActions.drawHeroSide(broken,'kim','hit','left',.3,0,0,70),false);
  assert.equal(broken.depth,0,'Canvas restore after exception');
  console.log('Uploaded hero 6x6 side actions: real frames, correct facing, fallbacks and Canvas symmetry passed');
})().catch(e=>{console.error(e);process.exitCode=1;});
