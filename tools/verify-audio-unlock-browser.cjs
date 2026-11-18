/* Browser QA: audio unlock after first user gesture, plus mute toggle via the menu sound button. */
'use strict';
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const http=require('node:http');
const {chromium}=require('playwright');
const root=process.env.TD2_ENVIRONMENT_ROOT||path.resolve(__dirname,'../dist');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(err,data)=>{res.writeHead(err?404:200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(err?'missing':data);});});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,executablePath:process.env.TD2_CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader']});
 const results=[];
 try{
  for(const mobile of [false,true]){
   const context=await browser.newContext({viewport:mobile?{width:412,height:915}:{width:1280,height:800},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1});
   const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
   const url='http://127.0.0.1:'+server.address().port+'/index.html';
   await page.goto(url,{waitUntil:'networkidle',timeout:60000});
   await page.locator('#td2Loading').waitFor({state:'detached',timeout:45000});
   const before=await page.evaluate(()=>{const fx=globalThis.DenkmalCombatFX;return {exposed:!!fx,context:fx?.getContext?.()??null};});
   assert.ok(before.exposed,'DenkmalCombatFX must be exposed in dist');
   assert.ok(!before.context,'AudioContext must not be created before the first user gesture');
   await page.mouse.move(200,200);await page.mouse.down();await page.mouse.up();
   const unlocked=await page.waitForFunction(()=>{const fx=globalThis.DenkmalCombatFX;const ctx=fx?.getContext?.();return ctx?ctx.state:'none';},{timeout:8000}).then(h=>h.jsonValue());
   assert.strictEqual(unlocked,'running','AudioContext must reach state running after first pointer gesture');
   const sound={label:await page.locator('#menuSoundBtn').innerText(),aria:await page.locator('#menuSoundBtn').getAttribute('aria-pressed')};
   assert.match(sound.label,/TON: AN/,'sound must default to on');assert.strictEqual(sound.aria,'true','sound button must default to pressed');
   const gainOn=await page.evaluate(()=>globalThis.DenkmalCombatFX.getMaster().gain.value);
   await page.locator('#menuSoundBtn').click();
   const muted=await page.evaluate(()=>({gain:globalThis.DenkmalCombatFX.getMaster().gain.value,label:document.querySelector('#menuSoundBtn').textContent}));
   assert.strictEqual(muted.gain,0,'muted master gain must be 0');assert.match(muted.label,/TON: AUS/);
   await page.locator('#menuSoundBtn').click();
   const restored=await page.evaluate(()=>({gain:globalThis.DenkmalCombatFX.getMaster().gain.value,label:document.querySelector('#menuSoundBtn').textContent}));
   assert.strictEqual(restored.gain,.65,'restored master gain must be 0.65');assert.match(restored.label,/TON: AN/);
   assert.deepStrictEqual(errors,[],'no page errors during audio unlock flow');
   results.push({mobile,gainOn,unlocked});
   await context.close();
  }
  console.log(JSON.stringify({chromium:browser.version(),campaign:results,physicalAndroidTested:false}));
  await browser.close();
 }finally{await browser.close().catch(()=>{});server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
