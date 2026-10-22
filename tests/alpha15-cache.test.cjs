'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
let active=0,maxActive=0,requests=0;
global.Image=class FakeImage{
  constructor(){this.naturalWidth=0;this.naturalHeight=0;}
  set src(value){this._src=value;active++;requests++;maxActive=Math.max(maxActive,active);setImmediate(()=>{this.naturalWidth=256;this.naturalHeight=256;this.onload?.();active--;});}
  get src(){return this._src;}
  decode(){return Promise.resolve();}
};
(async()=>{
  const root=path.resolve(__dirname,'../dist/alpha1-5');
  const {sprite,effectSprite,spriteStats}=await import(path.join(root,'sprites.js'));
  const deadline=Date.now()+3000;
  while(spriteStats().decoded<spriteStats().total&&Date.now()<deadline)await new Promise(resolve=>setTimeout(resolve,5));
  const stats=spriteStats();
  assert.equal(stats.total,59);
  assert.equal(stats.decoded,59);
  assert.equal(stats.failed,0);
  assert.equal(stats.queued,0);
  assert.equal(stats.loading,0);
  assert.equal(requests,59);
  assert.ok(maxActive<=4,`cache exceeded its four-image concurrency limit: ${maxActive}`);
  const calls=[];
  const ctx={globalAlpha:1,save(){},restore(){},translate(){},rotate(){},drawImage(...args){calls.push(args);}};
  assert.equal(sprite(ctx,'monument',10,20,40,50),true);
  assert.equal(effectSprite(ctx,'effect_bolt',5,5,20,10),true);
  assert.equal(calls.length,2);
  console.log('Alpha 1.5 asset cache decoded all 59 images with a maximum of four concurrent loads.');
})().catch(error=>{console.error(error);process.exitCode=1;});
