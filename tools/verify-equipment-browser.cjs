/* Real browser QA for local or published equipment builds. Tooling only. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'../dist'),out=path.resolve(process.env.TD2_QA_OUT||'/tmp/td2-equipment-qa'),key='denkmal-loot-v1';
const seed=JSON.parse(fs.readFileSync(path.join(__dirname,'../tests/fixtures/loot-v2.json'),'utf8'));
seed.profile.bag=[];seed.profile.overflow=[];
for(const [id,slot,stats]of [['qa-shared','weapon',{damage:20,haste:.1}],['qa-forge','armor',{health:40,defense:.1}]])seed.profile.overflow.push({id,slot,name:id,stats,power:null,level:5,rarity:'epic',favorite:false});
const rawSeed=JSON.stringify(seed),types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.json':'application/json','.svg':'image/svg+xml','.mp3':'audio/mpeg'};
const server=http.createServer((req,res)=>{const relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/v4-alpha9\//,''),file=path.resolve(root,relative||'index.html');if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}fs.readFile(file,(err,data)=>{res.writeHead(err?404:200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(err?'missing':data);});});
async function waitReady(page){
 try{await page.locator('#td2Loading').waitFor({state:'detached',timeout:60000});}
 catch(error){
  const state=await Promise.race([page.evaluate(()=>({url:location.href,status:document.getElementById('td2LoadStatus')?.textContent,percent:document.getElementById('td2LoadPercent')?.textContent,loadingClass:document.getElementById('td2Loading')?.className,hasHooks:!!globalThis.DenkmalTestHooks})),new Promise(resolve=>setTimeout(()=>resolve({unresponsive:true}),3000))]);
  console.error('STARTUP FAILURE',JSON.stringify(state));fs.writeFileSync(path.join(out,'startup-failure.json'),JSON.stringify(state,null,2));throw error;
 }
}
async function seedContext(context,quota=false){await context.addInitScript(({key,rawSeed,quota,marker})=>{if(!['http:','https:'].includes(location.protocol))return;if(sessionStorage.getItem('td2-equipment-qa-context')!==marker){localStorage.setItem(key,rawSeed);sessionStorage.setItem('td2-equipment-qa-context',marker);}localStorage.setItem('denkmal-graphics','low');if(quota){const set=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k.startsWith('denkmal-loot'))throw new DOMException('quota','QuotaExceededError');return set.call(this,k,v);};}},{key,rawSeed,quota,marker:crypto.randomUUID()});}
async function click(locator){console.log('Click',locator.toString());return locator.evaluate(el=>{el.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'});const r=el.getBoundingClientRect(),style=getComputedStyle(el);if(el.disabled||el.closest('[inert]')||r.width<24||r.height<24||style.visibility==='hidden'||style.display==='none')throw Error('UI target unavailable: '+el.id);const target=document.elementFromPoint(Math.max(0,Math.min(innerWidth-1,r.x+r.width/2)),Math.max(0,Math.min(innerHeight-1,r.y+r.height/2)));if(!el.contains(target))throw Error('UI target covered: '+el.id);el.click();});}
async function closeSheet(page){if(await page.locator('#lootDetailClose').isVisible())await click(page.locator('#lootDetailClose'));}
async function closeInventory(page){await closeSheet(page);await click(page.locator('#inventoryClose'));}
async function inventory(page,hero){if(!await page.locator('#chooseKim').isVisible())await click(page.locator('#menuCharacterBtn'));await click(page.locator(hero==='kim'?'#chooseKim':'#chooseMarcel'));await click(page.locator('#collectionBtn'));}
const saved=page=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
async function killBoss(page){
 await page.evaluate(()=>DenkmalTestHooks.startGame(5));await page.waitForFunction(()=>DenkmalTestHooks.getGame()?.level===5);
 return page.evaluate(()=>{const hooks=DenkmalTestHooks,g=hooks.getGame();g.wave=20;g.intermission=999;g.hero.fireCd=0;g.hero.hp=g.hero.maxHp;hooks.spawnEnemy('boss');const e=g.enemies.at(-1);e.x=g.hero.x+30;e.y=g.hero.y;e.hp=1;e.speed=0;e.damage=0;hooks.update(.1);return {dead:e.dead,runId:g.runId};});
}
(async()=>{
 fs.mkdirSync(out,{recursive:true});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url=new URL(process.env.TD2_TEST_URL||`http://127.0.0.1:${server.address().port}/v4-alpha9/`);url.searchParams.set('td2UserTowers','1');
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,...(process.env.TD2_TEST_URL&&process.env.HTTPS_PROXY?{proxy:{server:process.env.HTTPS_PROXY}}:{}),args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader']});
 const report={browser:browser.version(),sourceCommit:execFileSync('git',['rev-parse','HEAD'],{cwd:path.join(__dirname,'..'),encoding:'utf8'}).trim(),url:url.href,productHashes:Object.fromEntries(['equipment-catalog.js','loot.js','loot-ui.js','game.js'].map(name=>[name,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,name))).digest('hex')])),androidDeviceTested:false,graphicsMode:'low',reducedMotion:true,interaction:'DOM click after visibility, size and hit-target checks; native pointer timing not asserted',scenarios:[]};
 try{
  for(const mobile of [false,true]){
   const context=await browser.newContext({viewport:mobile?{width:412,height:915}:{width:1280,height:900},isMobile:mobile,hasTouch:mobile,acceptDownloads:true,ignoreHTTPSErrors:true,reducedMotion:'reduce'});await seedContext(context);
   const page=await context.newPage(),errors=[],missing=[];page.setDefaultTimeout(60000);page.setDefaultNavigationTimeout(120000);page.on('pageerror',e=>{errors.push(e.message);console.error('PAGE ERROR',mobile,e.stack||e.message);});page.on('response',r=>{if(r.status()>=400)missing.push(r.url());});
   await page.goto(url.href,{waitUntil:'networkidle'});await waitReady(page);console.log('Loaded',mobile,'stored version',(await saved(page)).version);if(errors.length)throw Error(errors.join('\n'));await page.waitForFunction(()=>!!globalThis.DenkmalTestHooks);
   await inventory(page,'kim');console.log('Inventory open',mobile);await click(page.locator('#inventoryGrid [data-item-id="qa-shared"]'));await click(page.locator('#lootEquipAction'));
   console.log('Kim equipped',mobile);let state=await saved(page);assert.equal(state.version,4);assert.equal(state.profile.loadouts.kim.weapon,'qa-shared');assert.equal(state.profile.loadouts.marcel.weapon,'fixture-0');assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('denkmal-loot-v1-pre-v3')).version),2);
   await closeInventory(page);await inventory(page,'marcel');await click(page.locator('#inventoryGrid [data-item-id="qa-shared"]'));assert.equal(await page.locator('#lootRecycleAction').isDisabled(),true);await click(page.locator('#lootEquipAction'));
   state=await saved(page);assert.equal(state.profile.loadouts.marcel.weapon,'qa-shared');assert.equal(state.profile.owned.length,10);
   await closeSheet(page);await click(page.locator('#inventoryGrid [data-item-id="qa-forge"]'));await click(page.locator('.loot-forge summary'));
   await page.screenshot({path:path.join(out,mobile?'touch-forge.png':'desktop-forge.png')});
   await click(page.locator('#lootUpgradeAction'));await click(page.locator('#lootConfirm button').filter({hasText:'BESTÄTIGEN'}));
   state=await saved(page);assert.equal(state.profile.owned.find(i=>i.id==='qa-forge').stats.health,42);assert.equal(state.profile.essence,727);
   await closeInventory(page);const before=state.profile.owned.length,killed=await killBoss(page);assert.equal(killed.dead,true);state=await saved(page);assert.equal(state.profile.owned.length,before+1);const bossId=state.profile.owned.at(-1).id;
   await page.reload({waitUntil:'networkidle'});await waitReady(page);state=await saved(page);assert.ok(state.profile.owned.some(i=>i.id===bossId));assert.equal(state.profile.loadouts.kim.weapon,'qa-shared');
   await inventory(page,'kim');if(mobile)await click(page.locator('#lootEquipmentTab'));await page.screenshot({path:path.join(out,mobile?'touch-equipment.png':'desktop-equipment.png')});await closeInventory(page);
   for(const level of [1,2,3,4,5,6]){await page.evaluate(n=>DenkmalTestHooks.startGame(n),level);await page.waitForFunction(n=>DenkmalTestHooks.getGame()?.level===n,level);}
   const decoded=await page.evaluate(async()=>{const manifests=await Promise.all([1,2,3].map(v=>fetch(`assets/style2-user-towers-v${v}/manifest.json`).then(r=>r.json()))),map=new Map();for(let v=1;v<=3;v++)for(const a of manifests[v-1].assets)map.set(a.id,`assets/style2-user-towers-v${v}/${a.webp_path}`);return (await DenkmalAssets.retain('qa-equipment',Array.from(map.values()))).filter(Boolean).length;});assert.equal(decoded,30);
   assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);report.scenarios.push({mobile,viewport:page.viewportSize(),migration:true,sharedOwnership:true,forge:true,bossPersisted:true,reload:true,levels:[1,2,3,4,5,6],decoded,errors,missing});
   console.log((mobile?'Touch':'Desktop')+' equipment scenario passed');await context.close();
  }
  const context=await browser.newContext({acceptDownloads:true,ignoreHTTPSErrors:true,reducedMotion:'reduce'});await seedContext(context,true);const page=await context.newPage();await page.goto(url.href,{waitUntil:'networkidle'});await waitReady(page);assert.equal((await killBoss(page)).dead,true);assert.equal((await saved(page)).version,2);assert.match(await page.locator('#toast').textContent(),/SITZUNG/);
  await page.evaluate(()=>document.getElementById('pauseMenuBtn').click());await inventory(page,'marcel');assert.match(await page.locator('#lootSaveState').textContent(),/Sitzung/);const [download]=await Promise.all([page.waitForEvent('download'),click(page.locator('#lootExportBtn'))]);const exported=JSON.parse(fs.readFileSync(await download.path(),'utf8'));assert.equal(exported.version,4);assert.ok(exported.profile.owned.some(i=>i.id.startsWith('boss-')));report.quota={sessionWarning:true,exportContainsBoss:true,oldPrimaryPreserved:true};
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log('Quota/export scenario passed');
 }catch(e){console.error(e);throw e;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
