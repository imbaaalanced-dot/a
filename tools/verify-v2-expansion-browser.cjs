'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'../dist'),out=path.resolve(__dirname,'../docs/qa/v2-expansion-20261022');
const server=http.createServer((req,res)=>{const rel=new URL(req.url,'http://localhost').pathname.replace(/^\/v4-alpha9\//,''),file=path.resolve(root,rel||'index.html');if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}fs.readFile(file,(err,data)=>{res.writeHead(err?404:200,{'Content-Type':{'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml'}[path.extname(file)]||'application/octet-stream'});res.end(err?'missing':data);});});
(async()=>{
 fs.mkdirSync(out,{recursive:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,headless:true,args:['--no-sandbox','--single-process','--no-zygote','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const report={browser:browser.version(),physicalAndroid:false,scenarios:[]};
 try{for(const mobile of [false,true]){
  const context=await browser.newContext({viewport:mobile?{width:412,height:915}:{width:1280,height:900},isMobile:mobile,hasTouch:mobile});const page=await context.newPage(),errors=[],missing=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)missing.push(r.url());});
  await page.goto('http://127.0.0.1:'+server.address().port+'/v4-alpha9/',{waitUntil:'networkidle'});await page.locator('#td2Loading').waitFor({state:'detached'});
  const buttons=await page.locator('#portalNewBtn').evaluate(n=>getComputedStyle(n).backgroundImage);assert(buttons.includes('portal-new-normal.webp'));
  await page.locator('#menuCharacterBtn').click();await page.locator('#collectionBtn').click();
  const inventory=await page.evaluate(()=>{
   const model=DenkmalLoot.create({storage:{getItem:()=>null,setItem(){}},canManage:()=>true,getHero:()=>'marcel'}),raw=JSON.parse(model.exportJSON());
   for(let i=0;i<21;i++){const values=[.99,(i+.1)/21,.6,.5,.5];raw.profile.owned.push({id:'visual-'+i,...DenkmalEquipmentCatalog.rollBoss({mapId:1,wave:5,bossType:'boss'},()=>values.shift())});}
   if(!model.importJSON(JSON.stringify(raw)))throw Error('catalog fixture import');
   DenkmalLootUI.create(model,{editable:()=>true,onClose(){},onImport(){},getHero:()=>'marcel'}).render();
   return [...document.querySelectorAll('.loot-icon[data-template]')].map(n=>n.dataset.template);
  });assert.equal(new Set(inventory).size,21);await page.screenshot({path:path.join(out,(mobile?'touch':'desktop')+'-items.png')});
  await page.reload({waitUntil:'networkidle'});await page.locator('#td2Loading').waitFor({state:'detached'});
  for(const level of [1,2,3,4,5,6]){
   await page.evaluate(n=>DenkmalTestHooks.startGame(n),level);await page.waitForFunction(n=>DenkmalTestHooks.getGame()?.level===n,level);
   await page.evaluate(()=>HeroSaga.continueStory());
   await page.waitForFunction(n=>!!V2Expansion.image('environment-'+n+'.webp'),level);
   await page.evaluate(()=>document.getElementById('pauseBtn').click());
   await page.waitForTimeout(150);const mapPixels=await page.locator('#game').evaluate(n=>n.toDataURL('image/png'));fs.writeFileSync(path.join(out,(mobile?'touch':'desktop')+'-level-'+level+'.png'),Buffer.from(mapPixels.split(',')[1],'base64'));
  }
  await page.evaluate(()=>{for(const name of Object.values(V2ExpansionData.actors).map(a=>a.file))V2Expansion.image(name);V2Expansion.image('impacts.webp');});
  await page.waitForFunction(()=>Object.values(V2ExpansionData.actors).every(a=>!!V2Expansion.image(a.file))&&!!V2Expansion.image('impacts.webp'));
  const fixture=await page.evaluate(()=>{
   const c=document.createElement('canvas');c.width=960;c.height=820;c.id='v2-actions';c.style='position:fixed;inset:0;z-index:999999;width:min(100vw,960px);height:auto';document.body.append(c);const g=c.getContext('2d');g.fillStyle='#25292c';g.fillRect(0,0,c.width,c.height);
   let draws=0;const names=Object.keys(V2ExpansionData.actors);
   for(const name of names)for(const kind of ['attack','hit','death'])for(let f=0;f<4;f++)if(V2Expansion.action(g,name,kind,(f+.1)/4,-500,-500,60))draws++;
   names.forEach((name,i)=>{V2Expansion.action(g,name,'attack',.6,80+i%6*160,130+Math.floor(i/6)*180,70);g.fillStyle='#e6d9b9';g.fillText(name,30+i%6*160,155+Math.floor(i/6)*180);});
   let impacts=0;for(const kind of ['cannon','boomerang'])for(const level of [1,2])for(let f=0;f<6;f++)if(Style2ImpactsV2.draw(g,{kind,level,x:-200,y:-200,max:1,life:1-(f+.1)/6}))impacts++;
   return {draws,impacts,identities:names.length};
  });assert.equal(fixture.draws,276);assert.equal(fixture.impacts,24);const actionPixels=await page.locator('#v2-actions').evaluate(n=>n.toDataURL('image/png'));fs.writeFileSync(path.join(out,(mobile?'touch':'desktop')+'-actions.png'),Buffer.from(actionPixels.split(',')[1],'base64'));await page.locator('#v2-actions').evaluate(n=>n.remove());
  const runtime=await page.evaluate(()=>{
   const hits={enemy:0,hero:0,death:0};const enemy=V2Expansion.enemy,hero=V2Expansion.hero;
   V2Expansion.enemy=function(...args){const ok=enemy(...args);if(ok){hits.enemy++;if(args[3]?.deathProgress!=null)hits.death++;}return ok;};V2Expansion.hero=function(...args){const ok=hero(...args);if(ok)hits.hero++;return ok;};
   globalThis.v2RuntimeCounts=hits;document.getElementById('resumeBtn').click();const game=DenkmalTestHooks.getGame();game.hero.hp=game.hero.maxHp;game.intermission=999;HeroSaga.continueStory();
   game.hero.hitFlash=.16;DenkmalTestHooks.spawnEnemy('guardian');const e=game.enemies.at(-1);e.x=game.hero.x+45;e.y=game.hero.y;e.attackCd=0;e.hp=e.maxHp=10000;game.deathFx.push({...e,life:.65,maxLife:.65});return hits;
  });
  await page.waitForFunction(()=>v2RuntimeCounts.enemy>0&&v2RuntimeCounts.hero>0&&v2RuntimeCounts.death>0);
  const actual=await page.evaluate(()=>v2RuntimeCounts);assert(actual.hero&&actual.enemy&&actual.death);assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
  report.scenarios.push({mobile,buttons,templates:21,levels:[1,2,3,4,5,6],fixture,actualRuntimeDraws:actual,errors,missing});console.log((mobile?'Touch':'Desktop')+' expansion integration passed');
 }
 fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(report,null,2));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
