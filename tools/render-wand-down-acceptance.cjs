/* TD2 wand-down acceptance: render reference and 18 candidate frames in actual Chromium.
 * Produces screenshots (not canvas dumps) so the acceptance evidence comes from a real
 * browser render at 512px full and 128px game size on light and dark backgrounds.
 * Review only - no runtime files are touched. */
'use strict';
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../');
const out=process.env.TD2_WAND_ACCEPT_OUT||'/tmp/td2-wand-acceptance';
const port=0;
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.json':'application/json'};
const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return;}
  fs.readFile(file,(err,data)=>{res.writeHead(err?404:200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(err?'missing':data);});
});
(async()=>{
  fs.mkdirSync(out,{recursive:true});
  await new Promise(ok=>server.listen(port,'127.0.0.1',ok));
  const base='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader']});
  const context=await browser.newContext({viewport:{width:760,height:760},deviceScaleFactor:1,reducedMotion:'reduce'});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto(base+'/dist/index.html',{waitUntil:'domcontentloaded'}); // warm-up only
  const shots=[];
  async function shot(file,url,size,bg,label){
    const html='<!doctype html><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:'+bg+'}</style>'
      +'<canvas id="c" width="'+size+'" height="'+size+'" style="display:block"></canvas>'
      +'<script>const img=new Image();img.src="'+url+'";img.onload=()=>{'
      +'const c=document.getElementById("c").getContext("2d");c.imageSmoothingEnabled=true;c.imageSmoothingQuality="high";'
      +'c.fillStyle="'+bg+'";c.fillRect(0,0,'+size+','+size+');'
      +'const s=Math.min(size/img.width,size/img.height)*0.92;'
      +'c.drawImage(img,(size-img.width*s)/2,(size-img.height*s)/2,img.width*s,img.height*s);'
      +'document.title="ready";};img.onerror=()=>{document.title="error:"+img.src};</script>';
    await page.setContent(html,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.title.startsWith('ready')||document.title.startsWith('error'),null,{timeout:20000});
    if(!(await page.title()).startsWith('ready')) throw new Error('image failed to load: '+url);
    await page.locator('#c').screenshot({path:path.join(out,file)});
    shots.push(file);
  }
  const ref='/originals/marcel-der-beschuetzer-reference-20261115.png';
  await shot('reference-512-light.png',base+ref,512,'#d8d6cc');
  await shot('reference-512-dark.png',base+ref,512,'#202a27');
  await shot('reference-128-dark.png',base+ref,128,'#202a27');
  for(const action of ['attack','hit','death']){
    for(let i=0;i<6;i++){
      const name=action+'/0'+i+'.png';
      const url=base+'/source-art/hero/actions-v5/marcel/down/'+name;
      await shot(action+'-0'+i+'-512-light.png',url,512,'#d8d6cc');
      await shot(action+'-0'+i+'-128-dark.png',url,128,'#202a27');
    }
    // sequence strip: six frames side by side at game size, rendered in the same page
    const strip='<!doctype html><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:#202a27}</style>'
      +'<canvas id="c" width="812" height="144" style="display:block"></canvas><script>'
      +'const frames=["'+Array.from({length:6},(_,i)=>'/source-art/hero/actions-v5/marcel/down/'+action+'/0'+i+'.png').join('","')+'"];'
      +'const c=document.getElementById("c").getContext("2d");c.imageSmoothingEnabled=true;c.imageSmoothingQuality="high";'
      +'c.fillStyle="#202a27";c.fillRect(0,0,812,144);'
      +'let done=0;frames.forEach((f,i)=>{const img=new Image();img.onload=()=>{c.drawImage(img,10+i*134,8,128,128);if(++done===frames.length)document.title="ready";};img.src=f;});'
      +'</script>';
    await page.setContent(strip,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.title==='ready',null,{timeout:20000});
    await page.locator('#c').screenshot({path:path.join(out,action+'-sequence-128-strip.png')});
    shots.push(action+'-sequence-128-strip.png');
  }
  if(errors.length) throw new Error('page errors: '+errors.join(' | '));
  await browser.close();server.close();
  console.log(JSON.stringify({shots:shots.length,note:'actual Chromium renders, review only'}));
})().catch(e=>{console.error(e);process.exit(1);}).finally(()=>server.close());
