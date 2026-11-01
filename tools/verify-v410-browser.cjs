'use strict';
const {chromium}=require('playwright'),http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../dist'),out=process.env.TD2_QA_OUT||path.resolve(__dirname,'../docs/qa/v410/browser');
const mime={'.js':'application/javascript','.css':'text/css','.html':'text/html','.webp':'image/webp','.png':'image/png','.json':'application/json','.svg':'image/svg+xml'};
async function capture(page,file){
 const data=await page.locator('canvas').first().evaluate(canvas=>canvas.toDataURL('image/webp',.94));
 fs.writeFileSync(file,Buffer.from(data.split(',')[1],'base64'));
}
const server=http.createServer((req,res)=>{let file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname.replace(/^\/v4\.1\.0(?=\/)/,''));if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return;}if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');fs.readFile(file,(err,data)=>{res.writeHead(err?404:200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(err?'missing':data);});});
(async()=>{fs.mkdirSync(out,{recursive:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}/v4.1.0/`;const launch=()=>chromium.launch({headless:true,...(process.env.TD2_CHROMIUM_PATH?{executablePath:process.env.TD2_CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-zygote','--single-process','--in-process-gpu']});let browser=await launch();const browserVersion=await browser.version(),results=[];
try{
 for(const [name,width,height,low]of[['desktop',1280,900,false],['portrait',412,915,true],['landscape',915,412,true]]){
 const context=await browser.newContext({viewport:{width,height},hasTouch:name!=='desktop',isMobile:name!=='desktop',reducedMotion:low?'reduce':'no-preference'});const page=await context.newPage(),errors=[],missing=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico'))missing.push(r.url());});
 await page.addInitScript(low=>localStorage.setItem('denkmal-graphics',low?'low':'auto'),low);await page.goto(base,{waitUntil:'networkidle'});await page.locator('#td2Loading').waitFor({state:'detached',timeout:60000});
 const version=await page.locator('meta[name="application-version"]').getAttribute('content');assert.equal(version,'v4.1.0-alpha.1');
 for(let level=1;level<=6;level++){
 console.log('V4.1 browser map',name,level);
 await page.evaluate(level=>DenkmalTestHooks.startGame(level),level);await page.waitForFunction(level=>DenkmalTestHooks.getGame()?.level===level,level);await page.waitForFunction(level=>DenkmalMapPolish.stats().activeLevel===level,level);
 const stats=await page.evaluate(()=>DenkmalMapPolish.stats());assert.equal(stats.activeLevel,level);assert.equal(stats.retainedCanvases,2);
 if([3,4,5,6].includes(level))await capture(page,path.join(out,`${name}-map${level}.webp`));
 }
 const art=await page.evaluate(async()=>{
 const ids=Object.keys(TD2DirectionalAssets);await Promise.all(ids.map(id=>DenkmalAssets.retain('v410-contact-'+id,[TD2DirectionalAssets[id].file])));
 for(const id of ids)TD2DirectionalActions.draw(document.createElement('canvas').getContext('2d'),id,'attack','down',.45,0,0,52);
 await new Promise(resolve=>setTimeout(resolve,200));
 const canvas=document.createElement('canvas');canvas.id='v410-contact';canvas.width=1024;canvas.height=Math.ceil(ids.length/4)*230;canvas.style='position:fixed;z-index:99999;inset:0;width:100%;height:100%;object-fit:contain;background:#101919';document.body.append(canvas);const q=canvas.getContext('2d');let calls=0;
 for(let i=0;i<ids.length;i++){const id=ids[i],x=i%4*256,y=Math.floor(i/4)*230;q.fillStyle='#e4d7bb';q.font='12px sans-serif';q.fillText(id,x+8,y+18);for(let d=0;d<4;d++){const direction=['down','left','right','up'][d];for(let a=0;a<3;a++)if(TD2DirectionalActions.draw(q,id,['attack','hit','death'][a],direction,.45,x+32+d*62,y+88+a*66,52,{alphaApplied:true}))calls++;}}
 return{actors:ids.length,calls};});assert.equal(art.actors,Number(process.env.TD2_EXPECTED_ACTORS||23));assert.equal(art.calls,art.actors*4*3);fs.writeFileSync(path.join(out,`${name}-directions.webp`),Buffer.from((await page.locator('#v410-contact').evaluate(c=>c.toDataURL('image/webp',.94))).split(',')[1],'base64'));await page.locator('#v410-contact').evaluate(e=>e.remove());
 await page.goto(base+'ansturm/',{waitUntil:'networkidle'});await page.locator('#start').click();for(let i=0;i<4;i++)await page.locator('#tutorialNext').click();await page.locator('#pause').click();if(name==='portrait')await page.locator('#shopToggle').click();await page.locator('#cards .buy').first().click();await page.reload({waitUntil:'networkidle'});await page.locator('#resume').click();assert.match(await page.locator('#state').textContent(),/Pausiert/);assert.equal(await page.locator('#gold').textContent(),'80');assert.match(await page.locator('#summary').textContent(),/Schaden 15/);await capture(page,path.join(out,`${name}-ansturm.webp`));
 assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);results.push({name,version,maps:6,art,saveReload:true,errors,missing});console.log('V4.1 browser passed',name);await browser.close();browser=await launch();
 }
 const {createGame,spawnEnemy}=await import('../ansturm-alpha1-5/model.js');const {serializeRun}=await import('../ansturm-alpha1-5/run-state.js');
 for(const wave of[5,10,15,20]){
 const s=createGame({random:()=>.5});s.wave=wave;s.status='running';s.planned=10+3*wave+1;s.spawned=s.planned-1;s.gold=100000;s.elapsed=40;s.waveElapsed=20;const e=spawnEnemy(s);e.x=.28;e.y=0;const context=await browser.newContext({viewport:{width:1280,height:800}});const page=await context.newPage();await page.addInitScript(raw=>localStorage.setItem('td2.denkmalAnsturm.run.v1',raw),serializeRun(s));await page.goto(base+'ansturm/',{waitUntil:'networkidle'});await page.locator('#resume').click();await page.locator('#pause').click();await page.waitForTimeout(800);await page.locator('#pause').click();await capture(page,path.join(out,`boss-${wave}.webp`));const state=await page.locator('#state').textContent();assert.match(state,/Steinbrecher|Sturmherr|Schildwächter|Koloss/);await page.locator('#gameMenuToggle').click();await page.locator('#help').click();await page.locator('#tutorialSkip').click();assert.match(await page.locator('#pause').textContent(),/Fortsetzen/);results.push({bossWave:wave,state});await browser.close();browser=await launch();
 }
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({browser:browserVersion,kind:'Desktop Chromium and touch emulation; canvas snapshots and DOM assertions, not full-page screenshots or physical Android',results},null,2)+'\n');
}finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
