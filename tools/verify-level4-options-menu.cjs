/* Level 4 in-game options menu: real DOM/CSS bounds and click QA.
 * The five-tower shop and its CSS are intentionally not modified. */
'use strict';
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../dist');
const output=process.env.TD2_LEVEL4_MENU_OUT||'/tmp/td2-level4-menu';
const mime={'.js':'text/javascript','.css':'text/css','.html':'text/html','.webp':'image/webp','.png':'image/png','.woff2':'font/woff2','.json':'application/json','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 let file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
 if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return;}
 if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
 fs.readFile(file,(error,bytes)=>{res.writeHead(error?404:200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(error?'missing':bytes);});
});
(async()=>{
 fs.mkdirSync(output,{recursive:true});
 await new Promise(done=>server.listen(0,'127.0.0.1',done));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader']});
 const results=[];
 try{
  for(const t of [
    {name:'desktop-1649',width:1649,height:890,touch:false,maxPanelWidth:252,maxPanelHeight:290},
    {name:'desktop-1280',width:1280,height:800,touch:false,maxPanelWidth:252,maxPanelHeight:290},
    {name:'portrait-412',width:412,height:915,touch:true,maxPanelWidth:284,maxPanelHeight:325},
    {name:'portrait-360',width:360,height:800,touch:true,maxPanelWidth:284,maxPanelHeight:325}
  ]){
    const context=await browser.newContext({viewport:{width:t.width,height:t.height},isMobile:t.touch,hasTouch:t.touch,reducedMotion:'reduce'});
    const page=await context.newPage(),errors=[],failed=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{if(r.status()>=400&&/level4-options-menu-compact\.css|game\.js/.test(r.url()))failed.push(r.url());});
    await page.addInitScript(()=>localStorage.setItem('td2-v4-intro-tutorial','done'));
    await page.goto('http://127.0.0.1:'+server.address().port+'/index.html',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>!document.getElementById('td2Loading'),null,{timeout:45000});
    await page.evaluate(()=>{DenkmalTestHooks.startGame(4);HeroSaga.continueStory();});
    await page.waitForFunction(()=>DenkmalTestHooks.getState()==='playing',null,{timeout:15000});
    await page.locator('#hudMenu summary').click();
    await page.waitForTimeout(120);
    const layout=await page.evaluate(()=>{
      const menu=document.querySelector('#hudMenu'),panel=menu.querySelector('.hud-menu-panel'),computed=getComputedStyle(panel);
      const rect=panel.getBoundingClientRect();
      const btns=[...panel.querySelectorAll('button')];
      const tower=[...document.querySelectorAll('#arsenal button')].map(x=>x.dataset.tower);
      return {
        open:menu.open,
        panel:{x:rect.x,y:rect.y,width:rect.width,height:rect.height,right:rect.right,bottom:rect.bottom,scrollHeight:panel.scrollHeight,clientHeight:panel.clientHeight},
        gridColumns:computed.gridTemplateColumns.split(' ').filter(Boolean).length,
        buttonIds:btns.map(x=>x.id),
        minBtnHeight:Math.min(...btns.map(x=>x.getBoundingClientRect().height)),
        visibleBtnCount:btns.filter(x=>x.getBoundingClientRect().width>0).length,
        tower,
        touchingToolbar:rect.bottom>=window.innerHeight-90
      };
    });
    assert.ok(layout.open,t.name+' menu opens via summary click');
    assert.equal(layout.buttonIds.length,9,t.name+' all options preserved');
    assert.equal(layout.gridColumns,2,t.name+' options use two columns');
    assert.ok(layout.panel.width<=t.maxPanelWidth,t.name+' menu width '+layout.panel.width);
    assert.ok(layout.panel.height<=t.maxPanelHeight,t.name+' menu height '+layout.panel.height);
    assert.ok(layout.panel.x>=-1&&layout.panel.y>=-1&&layout.panel.right<=t.width+1&&layout.panel.bottom<=t.height+1,t.name+' menu inside viewport '+JSON.stringify(layout.panel));
    assert.ok(layout.minBtnHeight>=(t.touch?47:37),t.name+' minimum settings button size');
    assert.equal(layout.visibleBtnCount,9,t.name+' every settings button rendered');
    assert.ok(!layout.touchingToolbar,t.name+' menu clears bottom gameplay controls');
    assert.deepEqual(layout.tower,['bow','cannon','mage','rift','barracks'],t.name+' tower roster preserved');
    const oldLabel=await page.locator('#soundBtn').textContent();
    await page.locator('#soundBtn').click();
    assert.notEqual(await page.locator('#soundBtn').textContent(),oldLabel,t.name+' setting still interactive');
    try{
      await page.screenshot({path:path.join(output,t.name+'-options-open.png'),animations:'allow',timeout:15000});
    }catch(e){console.warn('OPTIONAL_MENU_SCREENSHOT_UNAVAILABLE '+t.name+' '+e.message.split('\n')[0]);}
    assert.deepEqual(errors,[],t.name+' JS errors');
    assert.deepEqual(failed,[],t.name+' changed resource failures');
    results.push({name:t.name,...layout,errors,failed});
    console.log('LEVEL4_MENU_PASS '+JSON.stringify({name:t.name,panel:layout.panel,buttonIds:layout.buttonIds}));
    await context.close();
  }
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({chromium:browser.version(),physicalAndroidTested:false,results},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>server.close());
