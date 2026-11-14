'use strict';
/* Integration contract for independently painted 6x6 hero views.
 * The six approved direction sheets (v5b-20261114) are active in the runtime;
 * this test locks them in and keeps fail-closed behaviour for anything else. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const assetReady=new Map(),pending=[],requested=[];
const sandbox={Math,Date,Promise,DenkmalAssets:{
  ready:key=>assetReady.get(key)||null,
  retain(group,urls){
    requested.push(...urls);
    return new Promise(resolve=>pending.push(()=>{
      for(const url of urls)assetReady.set(url,{naturalWidth:768,naturalHeight:768});
      resolve();
    }));
  },
  release(){}
}};
sandbox.globalThis=sandbox;
for(const file of ['dist/canonical-hero-art-v5.js','dist/directional-assets-v410.js',
  'dist/directional-hero-assets-v5.js','dist/directional-actions-v410.js']){
  vm.runInNewContext(fs.readFileSync(file,'utf8'),sandbox,{filename:file});
}
const api=sandbox.TD2DirectionalActions;
const context=()=>({draws:[],translations:[],flips:[],depth:0,globalAlpha:1,
  save(){this.depth++;},restore(){this.depth--;},
  translate(...p){this.translations.push(p);},
  scale(...p){this.flips.push(p);},
  drawImage(...p){this.draws.push(p);}
});
const drain=async()=>{for(let i=0;i<8;i++){await new Promise(r=>setImmediate(r));while(pending.length)pending.shift()();}};
(async()=>{
  const specs=sandbox.TD2HeroSideAssets;
  // The approved, independently painted direction sheets must be active and
  // their atlas files must exist on disk. Nothing else may be declared.
  const approved={
    marcel:{down:'marcel-down-actions-v5b.webp',left:'marcel-left-actions-v5b.webp',up:'marcel-up-actions-v5b.webp'},
    kim:{down:'kim-down-actions-v5b.webp',right:'kim-right-actions-v5b.webp',up:'kim-up-actions-v5b.webp'}
  };
  for(const actor of ['marcel','kim']){
    assert.deepEqual(Object.keys(specs[actor].sheets).sort(),Object.keys(approved[actor]).sort(),
      'exactly the approved painted directions are active');
    for(const [dir,file] of Object.entries(approved[actor])){
      assert.ok(specs[actor].sheets[dir].includes(file),actor+' '+dir+' points at its own atlas');
      assert.ok(fs.existsSync('dist/'+specs[actor].sheets[dir].split('?')[0]),file+' must exist');
    }
  }
  const marcel=specs.marcel,kim=specs.kim;
  const down='assets/hero/marcel-down-actions-approved.webp?v=test';
  const up='assets/hero/kim-up-actions-approved.webp?v=test';
  marcel.sheets.down=down;
  kim.sheets.up=up;
  // No request should be made for a missing or non-authored direction.
  const removed=marcel.sheets.left;delete marcel.sheets.left;
  const missing=context();
  assert.equal(api.drawHeroSide(missing,'marcel','attack','left',.3,10,20,70),false);
  assert.equal(missing.draws.length,0);
  assert.equal(requested.length,0);
  marcel.sheets.left=removed;
  for(const [actor,dir,filename,row,anchorY,height] of [
    ['marcel','down',down,2,116,95],
    ['kim','up',up,2,117,100]
  ]){
    const cold=context();
    assert.equal(api.drawHeroSide(cold,actor,'attack',dir,.45,12,22,70),false);
    assert.equal(cold.draws.length,0,'Cold atlas falls back to walking art');
    await drain();
    assert.ok(requested.includes(filename),'Correct independent atlas requested');
    for(const [kind,actionRow] of Object.entries({attack:2,hit:4,death:5})){
      for(let frame=0;frame<6;frame++){
        const c=context(),progress=(frame+.2)/6;
        assert.equal(api.drawHeroSide(c,actor,kind,dir,progress,12,22,70),true);
        assert.equal(c.draws.length,1);
        assert.deepEqual(c.draws[0].slice(1,5),[frame*128,actionRow*128,128,128]);
        const scale=70/height;
        assert.ok(Math.abs(c.draws[0][5]+64*scale)<1e-7);
        assert.ok(Math.abs(c.draws[0][6]+anchorY*scale)<1e-7,
          actor+' foot anchor drift on '+dir);
        assert.deepEqual(c.translations,[[12,22]]);
        assert.equal(c.flips.length,0,'Painted direction must not flip');
        assert.equal(c.depth,0,'Canvas restored');
      }
    }
  }
  // Never let an accidental same-file alias masquerade as a painted direction.
  marcel.sheets.left=marcel.file;
  assert.equal(api.drawHeroSide(context(),'marcel','attack','left',.4,0,0,70),false);
  marcel.sheets.left='';
  assert.equal(api.drawHeroSide(context(),'marcel','attack','left',.4,0,0,70),false);
  // Wrong dimensions fail closed even when the asset manager returned an image.
  assetReady.set(up,{naturalWidth:768,naturalHeight:512});
  assert.equal(api.drawHeroSide(context(),'kim','attack','up',.4,0,0,70),false);
  // The original facing remains untouched when additional directions exist.
  const base=context();
  assert.equal(api.drawHeroSide(base,'marcel','attack','right',.4,0,0,70),false);
  await drain();
  const active=context();
  assert.equal(api.drawHeroSide(active,'marcel','attack','right',.4,0,0,70),true);
  assert.ok(requested.includes(marcel.file));
  console.log('Hero directional V5b extension: six approved sheets active, 36 independent frames, stable pivots, missing/alias/cold/malformed fallback passed');
})().catch(error=>{console.error(error);process.exitCode=1;});