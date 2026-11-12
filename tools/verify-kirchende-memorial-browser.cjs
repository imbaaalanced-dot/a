/* Chromium integration check for the actual Level 3 opt-in memorial renderer. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'../dist');
const output=process.env.TD2_KIRCHENDE_PILOT_QA_OUT||'/tmp/td2-kirchende-pilot';
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.json':'application/json','.mp3':'audio/mpeg'};
const server=http.createServer((req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname.replace(/^\/v4-style2\//,'/');
  const file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  fs.readFile(file,(error,data)=>{
    res.writeHead(error?404:200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});
    res.end(error?'missing asset':data);
  });
});
(async()=>{
 fs.mkdirSync(output,{recursive:true});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,executablePath:process.env.TD2_CHROMIUM_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader']});
 const profiles=[
  {name:'desktop-pilot',width:1280,height:800,touch:false,pilot:true},
  {name:'portrait-pilot',width:390,height:844,touch:true,pilot:true},
  {name:'desktop-default',width:1280,height:800,touch:false,pilot:false}
 ];
 const results=[];
 try{
  for(const profile of profiles){
   const context=await browser.newContext({viewport:{width:profile.width,height:profile.height},hasTouch:profile.touch,isMobile:profile.touch,deviceScaleFactor:1});
   const page=await context.newPage(),errors=[],failed=[],requests=[];
   page.on('pageerror',error=>errors.push(error.message));
   page.on('response',response=>{if(response.status()>=400)failed.push(response.url());});
   page.on('request',request=>{if(request.url().includes('/assets/kirchende/'))requests.push(request.url());});
   await page.addInitScript(()=>localStorage.setItem('td2-v4-intro-tutorial','done'));
   const suffix=profile.pilot?'?td2KirchendeMemorialPilot=1':'';
   await page.goto('http://127.0.0.1:'+server.address().port+'/v4-style2/index.html'+suffix,{waitUntil:'networkidle'});
   await page.locator('#td2Loading').waitFor({state:'detached',timeout:45000});
   const state=await page.evaluate(async pilot=>{
     if(!globalThis.KirchendeArt||!globalThis.DenkmalTestHooks)throw Error('Kirchende/game runtime missing');
     const art=globalThis.KirchendeArt;
     await art.load();
     if(!art.ready('monument'))throw Error('Kirchende monument sprite failed to decode');
     if(pilot&&!art.ready('plaque'))throw Error('separate pilot plaque not decoded');
     const c=document.createElement('canvas');c.id='kirchendePilotQACanvas';c.width=512;c.height=512;
     const q=c.getContext('2d');q.fillStyle='#32352f';q.fillRect(0,0,c.width,c.height);
     const site={x:256,y:220};art.drawSite(q,site);
     if(!art.draw(q,'monument',site.x,site.y,235))throw Error('monument draw failed');
     c.style.cssText='position:fixed;z-index:2147483647;left:0;top:0;width:256px;height:256px;pointer-events:none';
     document.body.appendChild(c);
     const pixels=q.getImageData(0,0,c.width,c.height).data;
     let changed=0;for(let i=0;i<pixels.length;i+=4)if(pixels[i]!==50||pixels[i+1]!==53||pixels[i+2]!==47)changed++;
     if(changed<18000)throw Error('monument test render suspiciously blank: '+changed);
     DenkmalTestHooks.startGame(3);
     return {monumentUrl:art.image('monument').src,plaqueUrl:art.image('plaque')?.src||null,changedPixels:changed,gameLevel:DenkmalTestHooks.getGame()?.level??null};
   },profile.pilot);
   assert.equal(state.gameLevel,3,'actual Level 3 did not start: '+JSON.stringify(state));
   assert.ok(state.monumentUrl.includes(profile.pilot?'monument-style2-pilot.webp':'monument-photo-v2.webp'));
   assert.equal(requests.filter(u=>u.includes('monument-style2-pilot.webp')).length,profile.pilot?1:0);
   assert.equal(requests.filter(u=>u.includes('opferplatte-style2-pilot.webp')).length,profile.pilot?1:0);
   await page.locator('#kirchendePilotQACanvas').screenshot({path:path.join(output,profile.name+'-assets.png')});
   await page.locator('#kirchendePilotQACanvas').evaluate(el=>el.remove());
   await page.waitForTimeout(300);
   // The default profile verifies the original image and actual gameplay,
   // but its third full-scene capture can starve SwiftShader on CI. Only
   // the two opt-in targets need an additional encoded gameplay frame.
   if(profile.pilot){
     const gameCanvasData=await page.evaluate(()=>{
       const canvas=document.querySelector('canvas#game');
       if(!canvas||!canvas.width||!canvas.height)throw Error('Level 3 gameplay canvas missing');
       return canvas.toDataURL('image/png').split(',')[1];
     });
     fs.writeFileSync(path.join(output,profile.name+'-level3-canvas.png'),Buffer.from(gameCanvasData,'base64'));
   }
   assert.deepEqual(errors,[],'JavaScript runtime errors in '+profile.name);
   assert.deepEqual(failed,[],'HTTP 4xx/5xx in '+profile.name);
   results.push({...profile,...state,errors,failedRequests:failed});
   await context.close();
  }
  const result={chromium:browser.version(),physicalAndroidTested:false,results};
  fs.writeFileSync(path.join(output,'result.json'),JSON.stringify(result,null,2));
  console.log(JSON.stringify(result,null,2));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>server.close());
