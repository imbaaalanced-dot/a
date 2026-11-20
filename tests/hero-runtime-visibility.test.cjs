'use strict';
/* Visibility and failure-recovery regression for both approved heroes.
 * Text/DOM checks run without a browser; Chromium/Android visual QA is separate.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'../dist');
const source=name=>fs.readFileSync(path.join(root,name),'utf8');
const html=source('index.html'),css=source('menu.css');
const nativeDuo=html.match(/<figure class="menu-hero-figure"[\s\S]*?<\/figure>/)?.[0];
assert.ok(nativeDuo,'home menu must include a native two-hero figure');
assert.match(nativeDuo,/id="menuHeroBanner"[^>]*marcel-wand-menu-portrait-20261117-refined\.webp/);
assert.match(nativeDuo,/id="menuHeroCompanion"[^>]*kim-marksman-v6\.webp/);
assert.match(html,/menu\.css\?v=hero-caption-right-20261117/);
assert.match(html,/hero-saga\.js\?v=volume-audio-20261120/);

const visibilityPatch=css.split('/* Hero visibility:')[1];
assert.ok(visibilityPatch,'native duo visibility override is present');
assert.match(visibilityPatch,/#startScreen\[data-menu-panel="home"\] \.menu-hero-figure\s*\{[^}]*display:block/);
assert.match(visibilityPatch,/\.hero-menu-companion\s*\{[^}]*opacity:1/);
assert.match(visibilityPatch,/memorial-yard-mobile-v3\.webp/);
assert.match(css,/#startScreen\[data-menu-panel\]:not\(\[data-menu-panel="home"\]\)/,
  'submenus continue to hide decorative hero banner');

const mapping={};mapping.globalThis=mapping;
for(const file of ['canonical-hero-art-v5.js','directional-hero-assets-v5.js'])
  vm.runInNewContext(source(file),mapping,{filename:file});
for(const actor of ['marcel','kim']){
  const canonical=mapping.TD2CanonicalHeroArt[actor];
  // Prior *-style2.webp were opaque VP8 images: the black rectangle was
  // encoded in the file, not a bad CSS path. V6 must retain an alpha-capable
  // VP8X header so the menu background remains visible behind both figures.
  const portrait=fs.readFileSync(path.join(root,canonical.portrait.split('?')[0]));
  assert.equal(portrait.toString('ascii',0,4),'RIFF',actor+' portrait has RIFF container');
  assert.equal(portrait.toString('ascii',8,12),'WEBP',actor+' portrait is WebP');
  assert.equal(portrait.toString('ascii',12,16),'VP8X',actor+' portrait supports alpha extension');
  assert.ok((portrait[20]&0x10)!==0,actor+' portrait has alpha flag');
  assert.ok(portrait.length<180000,actor+' portrait stays mobile-lightweight');
  for(const key of ['portrait','walk','actions'])
    assert.ok(fs.existsSync(path.join(root,canonical[key].split('?')[0])),actor+' missing '+key);
  const sides=mapping.TD2HeroSideAssets[actor];
  assert.equal(sides.file,canonical.actions,actor+' action path must use canonical identity');
  for(const [dir,url] of Object.entries(sides.sheets))
    assert.ok(fs.existsSync(path.join(root,url.split('?')[0])),actor+' missing '+dir+' atlas');
}

// First network failure -> neutral marker, no permanent blank hero; retry is
// cooldown-gated. A faulty drawImage must always restore the canvas stack.
let now=0,images=0;
class FakeImage{
  constructor(){images++;this.complete=false;this.naturalWidth=0;this.naturalHeight=0;}
  set src(value){
    this.url=value;
    if(images===1)this.onerror?.();
    else {this.complete=true;this.naturalWidth=768;this.naturalHeight=1024;}
  }
}
const env={Math,Date:{now:()=>now},Image:FakeImage,matchMedia:()=>({matches:false})};
env.globalThis=env;
vm.runInNewContext(source('canonical-hero-art-v5.js'),env);
vm.runInNewContext(source('hero-saga.js'),env);
const context=()=>({
  depth:0,draws:[],
  save(){this.depth++;},restore(){this.depth--;},
  translate(){},ellipse(){},beginPath(){},fill(){},stroke(){},
  arc(){},rotate(){},drawImage(...args){this.draws.push(args);}
});
const hero={character:'marcel',hp:100,maxHp:100,x:0,y:0,
  moving:false,dodge:0,hitFlash:0,faceX:0,faceY:1,
  direction:'down',equipment:{armor:'none',weapon:'none',relic:'none'}};
const first=context();env.HeroSaga.draw(first,hero);
assert.equal(images,1);
assert.equal(first.draws.length,0,'first failed download uses safe marker');
assert.equal(first.depth,0);
env.HeroSaga.draw(context(),hero);
assert.equal(images,1,'never request atlas on every frame after error');
now=5000;
const recovered=context();env.HeroSaga.draw(recovered,hero);
assert.equal(images,2,'retry atlas after cooldown');
assert.equal(recovered.draws.length,1,'hero is visible after network recovery');
assert.equal(recovered.depth,0);
const broken=context();
broken.drawImage=()=>{throw Error('drawImage failed');};
assert.doesNotThrow(()=>env.HeroSaga.draw(broken,hero),'bad texture must not crash render loop');
assert.equal(broken.depth,0,'Canvas state is restored even after texture failure');
env.HeroSaga.draw(context(),hero);
assert.equal(images,2,'undrawable texture uses cooldown too');
now=10000;
const resumed=context();env.HeroSaga.draw(resumed,hero);
assert.equal(images,3);
assert.equal(resumed.draws.length,1);

console.log('Hero visibility: native Kim/Marcel portraits, approved paths, retry and Canvas restore passed');
