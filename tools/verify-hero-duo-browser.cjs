/* Real Chromium QA for both hero identities. No gameplay/art mutations. */
'use strict';
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../dist');
const out=process.env.TD2_HERO_DUO_QA_OUT||'/tmp/td2-hero-duo-qa';
const mime={'.js':'text/javascript','.css':'text/css','.html':'text/html','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.json':'application/json','.mp3':'audio/mpeg'};
const server=http.createServer((request,response)=>{
  const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
  let file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root+path.sep)&&file!==root){response.writeHead(403).end();return;}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  fs.readFile(file,(error,bytes)=>{
    response.writeHead(error?404:200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});
    response.end(error?'missing':bytes);
  });
});
const configs=[
  {name:'portrait-390',width:390,height:844,touch:true},
  {name:'landscape-844',width:844,height:390,touch:true},
  {name:'desktop-1280',width:1280,height:800,touch:false}
];
const suffix=actor=>actor==='kim'?'kim-marksman-v6.webp':'marcel-guardian-v6.webp';
const pathPart=(actor,kind)=>actor+'-'+kind;
(async()=>{
  fs.mkdirSync(out,{recursive:true});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch({headless:true,executablePath:process.env.TD2_CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader']});
  const results=[];
  try{
    for(const config of configs){
      for(const actor of ['marcel','kim']){
        const name=config.name+'-'+actor;
        const context=await browser.newContext({viewport:{width:config.width,height:config.height},isMobile:config.touch,hasTouch:config.touch,reducedMotion:'reduce'});
        const page=await context.newPage(),errors=[],failed=[];
        page.on('pageerror',e=>errors.push(e.message));
        page.on('response',response=>{
          if(response.status()>=400 && /\/assets\/(?:hero\/|menu\/v5-avatars\/)/.test(response.url()))
            failed.push({status:response.status(),url:response.url()});
        });
        await page.addInitScript(()=>{
          localStorage.setItem('td2-v4-intro-tutorial','done');
          globalThis.__td2HeroDraws=[];
          const original=CanvasRenderingContext2D.prototype.drawImage;
          CanvasRenderingContext2D.prototype.drawImage=function(image,...args){
            const result=original.call(this,image,...args);
            const src=typeof image?.src==='string'?image.src:'';
            if(/\/assets\/hero\/(?:kim|marcel)-(?:walk|.*actions)-v5b/.test(src)){
              const arr=globalThis.__td2HeroDraws;
              if(arr.length<50)arr.push({src:src.split('?')[0].split('/').pop(),crop:args.slice(0,4)});
            }
            return result;
          };
        });
        const navigation=await page.goto('http://127.0.0.1:'+server.address().port+'/index.html',{waitUntil:'domcontentloaded'});
        assert.equal(navigation?.status(),200,name+' index loads');
        await page.waitForFunction(()=>globalThis.DenkmalTestHooks&&globalThis.HeroSaga&&!document.getElementById('td2Loading'),null,{timeout:45000});
        assert.equal(await page.locator('#startScreen').isVisible(),true,name+' menu visible');

        if(actor==='kim'){
          await page.locator('#menuCharacterBtn').click();
          await page.locator('#chooseKim').click();
          await page.locator('#menuBackBtn').click();
        }
        await page.waitForFunction(actor=>{
          const banner=document.getElementById('menuHeroBanner');
          const companion=document.getElementById('menuHeroCompanion');
          const other=actor==='kim'?'marcel':'kim';
          const expected=id=>id==='kim'?'kim-marksman-v6.webp':'marcel-guardian-v6.webp';
          return banner?.src.includes(expected(actor))&&companion?.src.includes(expected(other))&&banner.naturalWidth>0&&companion.naturalWidth>0;
        },actor,{timeout:20000});
        const menu=await page.evaluate(()=>{
          const details=id=>{
            const el=document.getElementById(id);
            const r=el.getBoundingClientRect(),style=getComputedStyle(el);
            const parent=getComputedStyle(el.parentElement);
            return {src:el.getAttribute('src'),naturalWidth:el.naturalWidth,naturalHeight:el.naturalHeight,
              width:r.width,height:r.height,x:r.x,y:r.y,opacity:style.opacity,
              display:style.display,parentDisplay:parent.display,
              visible:r.width>10&&r.height>10&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth&&
                style.display!=='none'&&style.visibility==='visible'&&Number(style.opacity)>.9&&parent.display!=='none'};
          };
          return {banner:details('menuHeroBanner'),companion:details('menuHeroCompanion'),
            panel:document.getElementById('startScreen').dataset.menuPanel};
        });
        assert.equal(menu.panel,'home',name+' returns to home panel');
        assert.ok(menu.banner.visible&&menu.companion.visible,name+' both original hero portraits rendered '+JSON.stringify(menu));
        assert.ok(menu.banner.naturalWidth>0&&menu.companion.naturalWidth>0,name+' both portrait files decode');
        assert.deepEqual(failed,[],name+' menu hero asset responses');
        await page.screenshot({path:path.join(out,name+'-menu.png'),animations:'disabled'});

        await page.evaluate(()=>{DenkmalTestHooks.startGame(1);HeroSaga.continueStory();});
        await page.waitForFunction(()=>DenkmalTestHooks.getState()==='playing',null,{timeout:15000});
        await page.waitForFunction(actor=>DenkmalTestHooks.getGame()?.hero?.character===actor,actor,{timeout:5000});
        await page.waitForFunction(actor=>globalThis.__td2HeroDraws?.some(x=>x.src===actor+'-walk-v5b.webp'||x.src.startsWith(actor+'-')&&x.src.includes('actions-v5b')),actor,{timeout:20000});
        const gameplay=await page.evaluate(()=>({
          state:DenkmalTestHooks.getState(),actor:DenkmalTestHooks.getGame().hero.character,
          heroDraws:globalThis.__td2HeroDraws,portraitStyle:getComputedStyle(document.getElementById('heroHudPortrait')).backgroundImage
        }));
        assert.ok(gameplay.heroDraws.some(x=>x.src.startsWith(actor+'-')),name+' game Canvas paints chosen hero');
        assert.ok(gameplay.portraitStyle.includes(suffix(actor)),name+' HUD portrait matches hero');
        assert.deepEqual(failed,[],name+' hero HTTP errors');
        assert.deepEqual(errors,[],name+' JavaScript errors');
        await page.screenshot({path:path.join(out,name+'-gameplay.png'),animations:'disabled'});
        results.push({name,menu,gameplay:{state:gameplay.state,actor:gameplay.actor,
          drawn:gameplay.heroDraws.map(x=>x.src),portraitStyle:gameplay.portraitStyle},
          errors,failed,physicalAndroidTested:false});
        console.log('HERO_DUO_BROWSER_PASS '+JSON.stringify({name,drawn:gameplay.heroDraws.map(x=>x.src)}));
        await context.close();
      }
    }
    fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({browser:browser.version(),physicalAndroidTested:false,results},null,2));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1}).finally(()=>server.close());
