'use strict';
/* Assert the active V5b hero actions retain a stable ground pivot and Canvas
 * transform for every frame in the base facing and all painted directions.
 * This does not grant artistic approval. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'../dist');
const source=name=>fs.readFileSync(path.join(root,name),'utf8');
const ready=new Map();
const assets={
  ready:url=>{if(!ready.has(url))ready.set(url,{naturalWidth:768,naturalHeight:768});return ready.get(url);},
  retain:()=>Promise.resolve(),
  release:()=>{}
};
const scope={Math,Date,Promise,DenkmalAssets:assets};
scope.globalThis=scope;
for(const file of ['canonical-hero-art-v5.js','directional-assets-v410.js',
  'directional-hero-assets-v5.js','directional-actions-v410.js']){
  vm.runInNewContext(source(file),scope,{filename:file});
}
function context(){
  return {
    depth:0,globalAlpha:1,calls:[],translations:[],flips:[],
    save(){this.depth++;},restore(){this.depth--;},
    translate(...args){this.translations.push(args);},
    scale(...args){this.flips.push(args);},
    drawImage(...args){this.calls.push(args);}
  };
}
const tick=()=>new Promise(r=>setImmediate(r));
(async()=>{
  // Warm the lazy atlas loader for every painted facing, then let the two
  // in-flight retain promises settle before asserting on the frames.
  for(const actor of ['marcel','kim']){
    const spec=scope.TD2HeroSideAssets[actor];
    for(const facing_ of [spec.facing,...Object.keys(spec.sheets)]){
      scope.TD2DirectionalActions.drawHeroSide(context(),actor,'attack',facing_,.5,0,0,70);
    }
  }
  await tick();
  for(const [actor,facing,anchorY] of [['marcel','right',116],['kim','left',117]]){
    const spec=scope.TD2HeroSideAssets[actor];
    assert.equal(spec.file,scope.TD2CanonicalHeroArt[actor].actions);
    assert.equal(spec.facing,facing);
    assert.equal(spec.cell,128);
    assert.equal(spec.frames,6);
    assert.deepEqual(Array.from(spec.anchor),[64,anchorY],
      actor+': approved ground pivot changed');
    assert.equal(spec.height,actor==='marcel'?95:100);
    const scale=70/spec.height;
    const painted=[facing,...Object.keys(spec.sheets)];
    for(const facing_ of painted){
      for(const [kind,row] of Object.entries({attack:2,hit:4,death:5})){
        assert.equal(spec.rows[kind],row);
        for(let frame=0;frame<6;frame++){
          const ctx=context(),x=37,y=-19;
          assert.equal(scope.TD2DirectionalActions.drawHeroSide(
            ctx,actor,kind,facing_,(frame+.25)/6,x,y,70),true,
            actor+'/'+facing_+'/'+kind+'/'+frame+' not rendered');
          assert.deepEqual(ctx.translations,[[x,y]]);
          assert.equal(ctx.calls.length,1);
          const [image,sx,sy,sw,sh,dx,dy,dw,dh]=ctx.calls[0];
          assert.equal(image.naturalWidth,768);
          assert.deepEqual([sx,sy,sw,sh],[frame*128,row*128,128,128]);
          for(const [actual,expected,label] of [
            [dx,-64*scale,'pivot x'],[dy,-anchorY*scale,'pivot y'],
            [dw,128*scale,'width'],[dh,128*scale,'height']
          ])assert.ok(Math.abs(actual-expected)<1e-8,
            actor+'/'+kind+'/'+frame+': '+label+' drifted');
          assert.equal(ctx.flips.length,0,'Never mirror asymmetric equipment');
          assert.equal(ctx.depth,0,'Canvas state leaked');
        }
      }
    }
    // Directions that are not painted must still fall back to the walk atlas.
    for(const unsupported of ['down','left','right','up']){
      if(painted.includes(unsupported))continue;
      const ctx=context();
      assert.equal(scope.TD2DirectionalActions.drawHeroSide(
        ctx,actor,'attack',unsupported,.5,0,0,70),false,
        'Unpainted directions must fall back to the walk atlas');
      assert.equal(ctx.calls.length,0);
    }
    // Missing, aliased and blank sheet entries fail closed.
    const key=Object.keys(spec.sheets)[0],original=spec.sheets[key];
    delete spec.sheets[key];
    assert.equal(scope.TD2DirectionalActions.drawHeroSide(context(),actor,'attack',key,.5,0,0,70),false);
    spec.sheets[key]=spec.file;
    assert.equal(scope.TD2DirectionalActions.drawHeroSide(context(),actor,'attack',key,.5,0,0,70),false);
    spec.sheets[key]='';
    assert.equal(scope.TD2DirectionalActions.drawHeroSide(context(),actor,'attack',key,.5,0,0,70),false);
    spec.sheets[key]=original;
  }
  const thrown=context();
  thrown.drawImage=()=>{throw Error('mock context lost');};
  assert.equal(scope.TD2DirectionalActions.drawHeroSide(
    thrown,'marcel','hit','right',.4,0,0,70),false);
  assert.equal(thrown.depth,0);
  console.log('V5b hero action pivots: 36 frames per painted direction, stable anchors, no flips, safe Canvas restore');
})().catch(e=>{console.error(e);process.exitCode=1;});