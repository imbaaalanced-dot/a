/* Actual Chromium canvas renderers with V3 responses held until a fallback is cached. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=process.env.TD2_ENVIRONMENT_ROOT||path.resolve(__dirname,'../dist');
const output=process.env.TD2_LATE_GROUND_OUT||'/tmp/td2-late-ground';
const scripts=['persisted-state.js','levels.js','ground-v3.js','terrain-polish.js','style2-maps.js','hohensyburg-art.js','goethestrasse-art.js','westhofen-art.js'];
const server=http.createServer((req,res)=>{
 const pathname=new URL(req.url,'http://localhost').pathname;
 if(pathname==='/late-ground.html'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><html><head><link rel="icon" href="data:,"></head><body><canvas id="ground" width="768" height="768"></canvas>'+scripts.map(s=>'<script src="/'+s+'"></script>').join('')+'</body></html>');return;}
 const file=path.resolve(root,'.'+pathname);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(file,(err,data)=>{res.writeHead(err?404:200,{'Content-Type':file.endsWith('.js')?'text/javascript':'image/webp'});res.end(err?'missing':data);});
});
(async()=>{
 fs.mkdirSync(output,{recursive:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,executablePath:process.env.TD2_CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader']});
 const results=[];
 try{
 for(const mobile of [false,true])for(let level=1;level<=7;level++){
  const context=await browser.newContext({viewport:{width:800,height:820},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1});
  const page=await context.newPage(),errors=[],failed=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push(r.url());});
  let release;const held=new Promise(r=>{release=r;});let requested=0;
  await page.route('**/assets/reference-ground-v3/*.webp*',async route=>{requested++;await held;await route.continue();});
  await page.goto(`http://127.0.0.1:${server.address().port}/late-ground.html`);
  const before=await page.evaluate(level=>{
   let allocations=0;const create=document.createElement.bind(document);
   document.createElement=(...args)=>{if(args[0]==='canvas')allocations++;return create(...args);};
   const ctx=document.querySelector('#ground').getContext('2d');ctx.scale(.25,.25);
   const layout={...DenkmalLevels.levels[level],center:DenkmalLevels.center};
   const draw=()=>{ctx.clearRect(0,0,3072,3072);if(level<=2)Style2Maps.draw(ctx,level,{x:0,y:0},3072,3072,layout);else if(level<=4)DenkmalTerrain.drawGround(ctx,0,0,3072,3072,level);else globalThis[{5:'DenkmalHohensyburgArt',6:'DenkmalGoetheArt',7:'DenkmalWesthofenArt'}[level]].drawGround(ctx,layout);};
   const snapshot=()=>{let hash=2166136261;for(const value of ctx.getImageData(0,0,768,768).data)hash=Math.imul(hash^value,16777619)>>>0;return {allocations,hash,loaded:TD2GroundV3.loadedCount,revision:TD2GroundV3.revision||0};};
   globalThis.lateGround={draw,snapshot,pending:TD2GroundV3.load()};draw();const first=snapshot();for(let i=0;i<15;i++)draw();return {first,warm:snapshot()};
  },level);
  assert.equal(before.first.loaded,0);assert.deepEqual(before.first,before.warm,'pending textures must not rebuild fallback');
  await page.screenshot({path:path.join(output,`${mobile?'touch':'desktop'}-${level}-before.png`)});
  release();
  const after=await page.evaluate(async()=>{await lateGround.pending;lateGround.draw();const first=lateGround.snapshot();for(let i=0;i<20;i++)lateGround.draw();return {first,warm:lateGround.snapshot()};});
  assert.equal(requested,9,'exactly nine shared material downloads');assert.equal(after.first.loaded,9);
  assert.notEqual(after.first.hash,before.first.hash,`level ${level} must replace its fallback pixels after decode`);
  assert.equal(after.first.allocations,before.first.allocations+1,'exactly one world canvas replacement');
  assert.deepEqual(after.first,after.warm,'settled material pixels and canvas count remain stable');
  assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
  await page.screenshot({path:path.join(output,`${mobile?'touch':'desktop'}-${level}-after.png`)});
  results.push({level,touchEmulation:mobile,before,after,requests:requested,errors,failed});await context.close();
 }
 fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({chromium:browser.version(),physicalAndroidTested:false,results},null,2));
 console.log(JSON.stringify({chromium:browser.version(),scenarios:results.length,physicalAndroidTested:false}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
