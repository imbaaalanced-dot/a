/* Level 3 monument orientation variant: ?td2KirchendeMemorialFace=-1 mirrors the
   monument toward the player corner; default rendering and other sprites stay unchanged. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
(async()=>{
 const source=fs.readFileSync(path.join(__dirname,'../dist/kirchende-art.js'),'utf8');
 function load(search){
  const loaded=[];
  class FakeImage{
   constructor(){this.complete=false;this.naturalWidth=0;this.naturalHeight=0;loaded.push(this);}
   ok(){this.complete=true;const mon=this.src.includes('monument');this.naturalWidth=mon?261:128;this.naturalHeight=mon?425:128;this.onload();}
  }
  const scales=[],drawRects=[];
  const ctx={fillRect(){},strokeRect(){},globalAlpha:1,drawImage(...a){drawRects.push(a.slice(4));},save(){},restore(){},translate(){},scale(f){scales.push(f);}};
  const context={Image:FakeImage,location:{search},Math,setTimeout(){return 1;},clearTimeout(){},
   document:{createElement(){return {width:0,height:0,getContext(){
     const gradient={addColorStop(){}};
     return new Proxy({createRadialGradient(){return gradient;},createLinearGradient(){return gradient;},fillRect(){}},{get(t,k){return k in t?t[k]:()=>{};}});
   }}}}};
  vm.createContext(context);vm.runInContext(source,context);
  return {art:context.KirchendeArt,loaded,ctx,scales,drawRects};
 }
 let env=load('');
 assert.equal(env.art.monumentFace,1,'default orientation stays face=1');
 let p=env.art.load();env.loaded.forEach(i=>i.ok());await p;
 assert.equal(env.art.draw(env.ctx,'monument',100,200,235),true);
 assert.deepEqual(env.scales,[1],'default monument draw unchanged');
 const rectDefault=env.drawRects[0].slice();
 env=load('?td2KirchendeMemorialFace=-1');
 assert.equal(env.art.monumentFace,-1,'variant exposes face=-1');
 p=env.art.load();env.loaded.forEach(i=>i.ok());await p;
 assert.equal(env.art.draw(env.ctx,'monument',100,200,235),true);
 assert.deepEqual(env.scales,[-1],'variant mirrors only the monument');
 assert.deepEqual(env.drawRects[0],rectDefault,'mirror keeps the identical draw rectangle');
 env.art.draw(env.ctx,'rootrunner',100,200,65);
 assert.deepEqual(env.scales,[-1,1],'other sprites keep face=1 without explicit option');
 env.art.draw(env.ctx,'rootrunner',100,200,65,{face:-1});
 assert.deepEqual(env.scales,[-1,1,-1],'explicit face option still wins');
 env=load('?td2KirchendeMemorialLegacy=1&td2KirchendeMemorialFace=-1');
 p=env.art.load();env.loaded.forEach(i=>i.ok());await p;
 assert.ok(env.loaded.some(i=>i.src.includes('monument-photo-v2.webp')),'legacy photo still selected');
 assert.ok(!env.loaded.some(i=>i.src.includes('monument-style2-pilot.webp')),'pilot art not requested in legacy mode');
 env.art.draw(env.ctx,'monument',100,200,235);
 assert.deepEqual(env.scales,[-1],'photo monument composes with the variant');
 env=load('?td2KirchendeMemorialFace=0');
 assert.equal(env.art.monumentFace,1,'invalid face value falls back to 1');
 console.log('Kirchende monument orientation variant passed');
})().catch(e=>{console.error(e);process.exitCode=1;});
