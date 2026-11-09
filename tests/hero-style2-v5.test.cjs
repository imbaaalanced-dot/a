'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const dist=path.join(__dirname,'../dist');
const heroSource=fs.readFileSync(path.join(dist,'hero-saga.js'),'utf8');
const directionalSource=fs.readFileSync(path.join(dist,'directional-assets-v410.js'),'utf8');
const heroPatchSource=fs.readFileSync(path.join(dist,'directional-hero-assets-v5.js'),'utf8');
const portraitSource=fs.readFileSync(path.join(dist,'portrait-avatars-v5.js'),'utf8');

const atlasContext={};atlasContext.globalThis=atlasContext;
vm.runInNewContext(directionalSource,atlasContext);
vm.runInNewContext(heroPatchSource,atlasContext);
for(const name of ['kim','marcel']){
 const atlas=atlasContext.TD2DirectionalAssets[name];
 const asset=path.join(dist,atlas.file.split('?')[0]);
 assert.ok(fs.existsSync(asset),`${name} action image must exist`);
 // Both extended VP8X and lossless VP8L WebP dimension encodings are supported.
 const pixels=fs.readFileSync(asset);
 const format=pixels.toString('ascii',12,16);
 const header=pixels.readUInt32LE(21);
 const dims=format==='VP8L' ? [(header&0x3fff)+1,((header>>>14)&0x3fff)+1] :
   [pixels.readUIntLE(24,3)+1,pixels.readUIntLE(27,3)+1];
 assert.deepEqual(dims,[atlas.cell*4,atlas.cell*12],`${name} runtime action atlas dimensions`);
}
assert.match(portraitSource,/marcel-guardian-v6\.webp/);
assert.match(portraitSource,/kim-marksman-v6\.webp/);
assert.match(portraitSource,/DIE BEWAHRERIN/);

const loaded=[];
class FakeImage{
 constructor(){this.complete=true;this.naturalWidth=0;this.naturalHeight=0;}
 set src(v){this._src=v;loaded.push(v);if(v.includes('walk-v5b')){this.naturalWidth=768;this.naturalHeight=1024;}}
 get src(){return this._src;}
}
const ctx={save(){},restore(){},translate(){},ellipse(){},arc(){},fill(){},stroke(){},beginPath(){},rotate(){},drawImage(...args){this.drawn.push(args);},drawn:[]};
const environment={Image:FakeImage,matchMedia:()=>({matches:false}),URLSearchParams,location:{search:''},document:{getElementById:()=>({})},Math};
environment.globalThis=environment;
let actionCalls=0;
const sidePreloads=[];
environment.TD2DirectionalActions={hero(){actionCalls++;return true;},preloadHeroSide(name){sidePreloads.push(name);}};
vm.runInNewContext(heroSource,environment);
assert.equal(loaded.length,0,'hero art must be lazy on menu entry to protect Android RAM');
const base={hp:100,maxHp:100,x:0,y:0,moving:true,faceX:0,faceY:1,direction:'down',dodge:0,hitFlash:0,equipment:{armor:'none',weapon:'none',relic:'none'}};
for(const character of ['marcel','kim']){
 ctx.drawn=[];
 environment.HeroSaga.draw(ctx,{...base,character});
 assert.ok(ctx.drawn.length,`${character} should use a valid walk image`);
 const crop=ctx.drawn[0].slice(1,5);
 assert.deepEqual(crop,[256,0,256,256],`${character} 3x4 walk atlas cell`);
}
assert.ok(loaded.some(s=>s.includes('marcel-walk-v5b.webp')));
assert.ok(loaded.some(s=>s.includes('kim-walk-v5b.webp')));
assert.deepEqual(sidePreloads,['marcel','kim'],'active hero combat atlas prefetches once before first attack');
assert.match(heroSource,/storyPortrait/, 'narrative portrait must follow current character');
assert.match(fs.readFileSync(path.join(dist,'index.html'),'utf8'),/id="storyPortrait"/);
ctx.drawn=[];
environment.HeroSaga.draw(ctx,{...base,character:'kim',hitFlash:.1});
assert.equal(actionCalls,1,'hit animation should reach action system before idle/walk fallback');
assert.equal(ctx.drawn.length,0,'hit animation should not be obscured by idle walking');
console.log('Hero runtime atlas sizes, action priority and canonical portrait paths passed');
