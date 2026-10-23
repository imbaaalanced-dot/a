/* Local browser QA. Requires Playwright and CHROMIUM_EXECUTABLE. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'../dist'),out=process.env.TD2_QA_OUT||'/tmp/td2-v2-qa';
const server=http.createServer((req,res)=>{
 const name=new URL(req.url,'http://localhost').pathname.replace(/^\/v4-alpha9\//,'');
 const file=path.resolve(root,name||'index.html');
 if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 fs.readFile(file,(error,data)=>{res.writeHead(error?404:200,{'Content-Type':{'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.json':'application/json'}[path.extname(file)]||'application/octet-stream'});res.end(error?'missing':data);});
});
(async()=>{
 fs.mkdirSync(out,{recursive:true});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox','--disable-dev-shm-usage','--single-process','--no-zygote','--use-angle=swiftshader']});
 const report={browser:browser.version(),physicalAndroid:false,fixture:'Real runtime VFX draw calls on a contact sheet; normal game and inventory also opened',scenarios:[]};
 try{for(const mobile of [false,true]){
  const context=await browser.newContext({viewport:mobile?{width:412,height:915}:{width:1280,height:900},isMobile:mobile,hasTouch:mobile});
  const page=await context.newPage(),errors=[],missing=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)missing.push(r.url());});
  await page.goto('http://127.0.0.1:'+server.address().port+'/v4-alpha9/',{waitUntil:'networkidle'});
  await page.locator('#td2Loading').waitFor({state:'detached'});
  await page.locator('#menuCharacterBtn').click();await page.locator('#collectionBtn').click();
  const background=await page.locator('.loot-icon').first().evaluate(e=>getComputedStyle(e).backgroundImage);assert(background.includes('expansion-v2/items.webp'));
  await page.screenshot({path:path.join(out,(mobile?'touch':'desktop')+'-inventory.png')});
  await page.locator('#inventoryClose').click();
  for(const level of [1,2,3,4,5,6]){await page.evaluate(n=>DenkmalTestHooks.startGame(n),level);await page.waitForFunction(n=>DenkmalTestHooks.getGame()?.level===n,level);}
  await page.evaluate(()=>Style2ImpactsV2.warm());
  await page.waitForFunction(()=>DenkmalAssets.status('assets/impacts-v2/runtime.webp?v=impact2')==='ready');
  const fixture=await page.evaluate(async()=>{
   const canvas=document.createElement('canvas');canvas.width=768;canvas.height=640;canvas.id='v2-qa';canvas.style='position:fixed;inset:0;z-index:999999;width:min(100vw,768px);height:auto;';document.body.append(canvas);
   const ctx=canvas.getContext('2d');ctx.fillStyle='#222c29';ctx.fillRect(0,0,768,640);
   let drawn=0,changed=0;
   for(const [row,kind]of ['bow','cannon','mage','rift','boomerang'].entries())for(let frame=0;frame<6;frame++){
    const p={kind,level:3,x:64+128*frame,y:88+128*row,max:.3,life:.3*(1-(frame+.1)/6),userStyle2Impact:true};
    if(DenkmalCombatFX.drawParticle(ctx,p))drawn++;
   }
   const pixels=ctx.getImageData(0,0,768,640).data;for(let i=0;i<pixels.length;i+=4)if(pixels[i]!==34||pixels[i+1]!==44||pixels[i+2]!==41)changed++;
   const image=new Image();image.src='assets/items/equipment-v2.webp?v=icons2';await image.decode();
   return {drawn,changed,iconSize:[image.naturalWidth,image.naturalHeight],atlas:Style2ImpactsV2.getDiagnostics()};
  });
  assert.equal(fixture.drawn,30);assert(fixture.changed>1000);assert.deepEqual(fixture.iconSize,[512,256]);
  await page.locator('#v2-qa').screenshot({path:path.join(out,(mobile?'touch':'desktop')+'-impacts.png')});
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);report.scenarios.push({mobile,levels:[1,2,3,4,5,6],background,fixture,errors,missing});
  console.log((mobile?'Touch':'Desktop')+' V2 graphics passed');
 }
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
 }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;server.close();});
