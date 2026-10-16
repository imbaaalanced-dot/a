/* Style 2 layered map renderer contract: node tests/map-renderer.test.cjs */
'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const sourcePath=path.join(__dirname,'../dist/map-art.js');
assert.ok(fs.existsSync(sourcePath),'dist/map-art.js must exist');
const source=fs.readFileSync(sourcePath,'utf8');

function manifest(level=1){
  return {
    id:`level-${level}`,version:'v4-style2-1',classification:'kuenstlerisch',
    world:{width:3072,height:3072},
    gameplay:{level,paths:`DenkmalLevels.levels[${level}].paths`,slots:`DenkmalLevels.levels[${level}].slots`,objective:'game.monument'},
    layers:[
      {id:'ground',pass:'ground',desktop:'ground-desktop.webp',mobile:'ground-mobile.webp',alpha:false,order:0},
      {id:'paths',pass:'paths',desktop:'paths-desktop.webp',mobile:'paths-mobile.webp',alpha:true,order:1},
      {id:'decor-back',pass:'decor-back',desktop:'decor-back-desktop.webp',mobile:'decor-back-mobile.webp',alpha:true,order:2},
      {id:'decor-front',pass:'decor-front',desktop:'decor-front-desktop.webp',mobile:'decor-front-mobile.webp',alpha:true,order:3,actorNearOpacity:.18}
    ],structures:[{id:'bounds',status:'kuenstlerisch',bounds:{left:10,right:30,top:20,bottom:40}}],sources:[]
  };
}

function harness(options={}){
  const requested=[],images=[];
  const responseManifest=options.manifest||manifest(options.level||1);
  class MockImage{
    constructor(){this.complete=false;this.naturalWidth=0;this.naturalHeight=0;images.push(this);}
    set src(value){
      this._src=value;requested.push(value);
      if(options.imageFailure)return queueMicrotask(()=>this.onerror?.(new Error('decode failed')));
      if(options.imageHang)return;
      const mobile=value.includes('-mobile.webp');
      this.naturalWidth=mobile?(options.mobileWidth||2048):3072;
      this.naturalHeight=mobile?(options.mobileHeight||2048):3072;
      this.complete=true;queueMicrotask(()=>this.onload?.());
    }
    get src(){return this._src;}
  }
  const fetch=async url=>{
    requested.push(String(url));
    if(options.fetchFailure)throw new Error('offline');
    return {ok:!options.badStatus,status:options.badStatus?500:200,json:async()=>structuredClone(responseManifest)};
  };
  const sandbox={fetch,Image:MockImage,setTimeout,clearTimeout,queueMicrotask,structuredClone,Promise,console};
  sandbox.globalThis=sandbox;vm.createContext(sandbox);vm.runInContext(source,sandbox,{filename:'map-art.js'});
  return {api:sandbox.DenkmalMapArt,requested,images};
}

function context(){
  const calls=[];
  return new Proxy({calls,globalAlpha:1,drawImage(...args){calls.push(['image',this.globalAlpha,...args]);},save(){calls.push(['save']);},restore(){calls.push(['restore']);}},
    {get:(target,key)=>key in target?target[key]:(...args)=>calls.push([String(key),...args]),set:(target,key,value)=>(target[key]=value,true)});
}

async function run(){
  {
    const {api,requested}=harness();
    assert.equal(await api.load(1,{mobile:false,timeoutMs:50}),true);
    assert.equal(api.ready(1),true);
    assert.ok(requested.includes('assets/maps/level-1/map.json?v=v4style2-1'));
    assert.equal(requested.filter(value=>value.includes('-desktop.webp')).length,4,'desktop selects only desktop layers');
    assert.equal(requested.some(value=>value.includes('-mobile.webp')),false);
    assert.equal(requested.some(value=>value.includes('/level-2/')),false,'only selected level is requested');
    const frozen=api.manifest(1);assert.ok(Object.isFrozen(frozen)&&Object.isFrozen(frozen.layers)&&Object.isFrozen(frozen.layers[0]));
    const ctx=context();
    assert.equal(api.draw(ctx,1,'ground',{}),true);
    assert.equal(api.draw(ctx,1,'paths',{}),true);
    assert.equal(api.draw(ctx,1,'decor-back',{}),true);
    assert.equal(api.draw(ctx,1,'decor-front',{actorNear:true}),true);
    assert.deepEqual(ctx.calls.filter(call=>call[0]==='image').map(call=>call[2]._src.split('/').at(-1)),['ground-desktop.webp','paths-desktop.webp','decor-back-desktop.webp','decor-front-desktop.webp'],'passes follow manifest order');
    assert.equal(ctx.calls.filter(call=>call[0]==='image').at(-1)[1],.22,'front decor never becomes more opaque-blocking than the 0.22 actor-near floor');
  }
  {
    const {api,requested}=harness();
    assert.equal(await api.load(1,{mobile:true,timeoutMs:50}),true);
    assert.equal(requested.filter(value=>value.includes('-mobile.webp')).length,4,'mobile selects only mobile layers');
    assert.equal(requested.some(value=>value.includes('-desktop.webp')),false);
  }
  {
    const {api}=harness({mobileWidth:3072,mobileHeight:3072});
    assert.equal(await api.load(1,{mobile:true,timeoutMs:50}),false,'oversized Android textures fail safely');
    assert.equal(api.ready(1),false);assert.equal(api.draw(context(),1,'ground',{}),false);
  }
  for(const failure of [{fetchFailure:true},{badStatus:true},{imageFailure:true},{imageHang:true}]){
    const {api}=harness(failure);
    assert.equal(await api.load(1,{mobile:false,timeoutMs:12}),false,'fetch, decode, status, and timeout failures resolve false');
  }
  {
    const broken=manifest();broken.layers=broken.layers.slice(0,3);
    const {api}=harness({manifest:broken});
    assert.equal(await api.load(1,{timeoutMs:50}),false,'malformed manifest fails safely');
  }
  {
    const one=harness({level:1}),twoManifest=manifest(2);
    await one.api.load(1,{timeoutMs:50});
    one.api.unloadExcept(2);
    assert.equal(one.api.ready(1),false);assert.equal(one.api.manifest(1),null,'unload releases non-selected records');
    one.api.unloadExcept(1);
    assert.equal(one.api.manifest(2),null);
    assert.equal(twoManifest.gameplay.level,2);
  }
  {
    const {api}=harness();await api.load(1,{timeoutMs:50});
    const definition={paths:[[{x:0,y:0},{x:30,y:40}]],slots:[{x:50,y:60}],gates:[{x:70,y:80}]};
    const before=JSON.stringify(definition),ctx=context();api.drawDebug(ctx,1,definition);
    assert.equal(JSON.stringify(definition),before,'debug drawing never writes level geometry');
    assert.ok(ctx.calls.some(call=>call[0]==='lineTo'),'debug reads path geometry');
    assert.ok(ctx.calls.some(call=>call[0]==='arc'),'debug reads gates and slots');
    assert.ok(ctx.calls.some(call=>call[0]==='strokeRect'),'debug reads structure bounds');
  }
  {
    const index=fs.readFileSync(path.join(__dirname,'../dist/index.html'),'utf8');
    const game=fs.readFileSync(path.join(__dirname,'../dist/game.js'),'utf8');
    const preloader=fs.readFileSync(path.join(__dirname,'../dist/preloader.js'),'utf8');
    assert.ok(index.indexOf('map-art.js?v=v4style2-1')<index.indexOf('game.js?'),'map renderer loads before game code');
    assert.match(preloader,/DenkmalPreloadSelectedMap/,'preloader exposes selected-level loading only');
    for(const pass of ['ground','paths','decor-back','decor-front'])assert.ok(game.includes(`'${pass}'`),`game connects ${pass} pass`);
    assert.match(game,/debug=maps/,'debug overlay is query-gated');
    assert.match(game,/DenkmalPreloadSelectedMap\?\./,'game starts map loading only after level selection');
  }
  console.log('Style 2 map renderer: variants, failures, order, unloading, and immutable debug geometry passed.');
}

run().catch(error=>{console.error(error);process.exitCode=1;});
