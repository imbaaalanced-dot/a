'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'../dist');
const output=process.env.TD2_CDN_QA_OUT||'/tmp/td2-cdn-pilot-browser';
const assets=[
  ['assets/loading/kim-marcel-loading-v5.webp','v1795466831','td2/runtime/loading/kim-marcel-loading-v5'],
  ['assets/loading/gate.webp','v1795466833','td2/runtime/loading/gate'],
  ['assets/menu/memorial-yard-v4.webp','v1795466835','td2/runtime/menu/memorial-yard-v4'],
  ['assets/menu/memorial-yard-mobile-v4.webp','v1795466837','td2/runtime/menu/memorial-yard-mobile-v4'],
  ['assets/menu/crest-v4.webp','v1795466838','td2/runtime/menu/crest-v4']
];
const cloudUrl=([,version,id])=>`https://res.cloudinary.com/xs5rd7mt/image/upload/${version}/${id}.webp`;
const cloudHost=url=>{try{return new URL(url).hostname==='res.cloudinary.com';}catch{return false;}};
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml'};
const html='<!doctype html><html><head><meta charset="utf-8"></head><body><script src="/cdn-asset-map.js"></script><script src="/asset-manager.js"></script></body></html>';
const server=http.createServer((req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(pathname==='/cdn-test.html'){res.writeHead(200,{'Content-Type':'text/html'}).end(html);return;}
  const file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  fs.readFile(file,(error,data)=>{res.writeHead(error?404:200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(error?'not found':data);});
});
async function loadMapped(page){
  return page.evaluate(async urls=>{
    for(const url of urls){
      const image=await DenkmalAssets.load(url);
      if(!image||!image.naturalWidth)throw Error('Image did not decode: '+url);
    }
    return urls.map(url=>({url,status:DenkmalAssets.status(url)}));
  },assets.map(item=>item[0]));
}
(async()=>{
  fs.mkdirSync(output,{recursive:true});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader']});
  const results={chromium:browser.version(),physicalAndroidTested:false};
  try{
    {
      const context=await browser.newContext();
      const page=await context.newPage(),requests=[],failed=[];
      page.on('request',r=>requests.push(r.url()));
      page.on('requestfailed',r=>failed.push({url:r.url(),error:r.failure()?.errorText}));
      await page.goto(`http://127.0.0.1:${server.address().port}/cdn-test.html?td2Cdn=1`);
      const loaded=await loadMapped(page);
      const cloudRequests=requests.filter(cloudHost);
      const expected=assets.map(cloudUrl);
      for(const url of expected)assert.equal(cloudRequests.filter(item=>item===url).length,1,'one real browser request for '+url);
      assert.equal(cloudRequests.length,5,'no unapproved CDN host requests');
      assert.deepEqual(failed,[],'no network failures in CDN-success path');
      results.optIn={loaded,cloudRequests,failedRequests:failed};
      await context.close();
    }
    {
      const context=await browser.newContext();
      const page=await context.newPage(),requests=[];
      page.on('request',r=>requests.push(r.url()));
      await page.goto(`http://127.0.0.1:${server.address().port}/cdn-test.html`);
      const loaded=await loadMapped(page);
      assert.equal(requests.filter(cloudHost).length,0,'CDN is not contacted without the opt-in parameter');
      for(const [logical] of assets)assert.ok(requests.some(url=>new URL(url).pathname.endsWith('/'+logical)),'local request exists for '+logical);
      results.defaultLocal={loaded,cloudRequests:0};
      await context.close();
    }
    {
      const context=await browser.newContext();
      await context.route('https://res.cloudinary.com/**',route=>route.abort('internetdisconnected'));
      const page=await context.newPage(),requests=[],failed=[];
      page.on('request',r=>requests.push(r.url()));
      page.on('requestfailed',r=>failed.push(r.url()));
      await page.goto(`http://127.0.0.1:${server.address().port}/cdn-test.html?td2Cdn=1`);
      const loaded=await loadMapped(page);
      const cloudRequests=requests.filter(cloudHost);
      const localRequests=requests.filter(url=>!cloudHost(url)&&assets.some(([logical])=>new URL(url).pathname.endsWith('/'+logical)));
      assert.equal(cloudRequests.length,5,'exactly one CDN attempt per mapped image');
      assert.equal(localRequests.length,5,'exactly one local fallback per mapped image');
      assert.equal(failed.length,5,'only the five intentionally blocked CDN requests fail');
      assert.deepEqual(loaded.map(item=>item.status),Array(5).fill('ready'),'all local fallbacks decode successfully');
      results.blockedCdnFallback={loaded,cloudRequests,localRequests,failedRequests:failed};
      await context.close();
    }
    fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2));
    console.log(JSON.stringify(results,null,2));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>server.close());
