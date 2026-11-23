'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('dist/preloader.js','utf8');
async function run(){
 let mobile=true,resize;
 const ids=new Map(),selectors=new Map();
 const make=()=>({style:{},classList:{add(){}},attrs:new Set(),setAttribute(k){this.attrs.add(k);},removeAttribute(k){this.attrs.delete(k);},remove(){this.removed=true;},src:''});
 const byId=id=>{if(!ids.has(id))ids.set(id,make());return ids.get(id);};
 selectors.set('.menu-scene img:not(.menu-scene-mobile)',make());
 selectors.set('.menu-scene-mobile',make());
 selectors.set('.menu-crest',make());
 const requested=[];
 const box={
  document:{getElementById:byId,querySelector:q=>selectors.get(q)},
  window:{
   matchMedia:q=>({matches:q.includes('prefers-reduced-motion')?true:mobile}),
   addEventListener:(name,fn)=>{if(name==='resize')resize=fn;}
  },
  Promise,console,setTimeout,clearTimeout,setInterval,clearInterval,
  DenkmalAssets:{load:async url=>{requested.push(url);return {src:'https://res.cloudinary.com/xs5rd7mt/image/upload/test/'+url.replace(/^assets\//,'td2/runtime/')}}}
 };
 box.globalThis=box;vm.runInNewContext(source,box);
 await new Promise(resolve=>setTimeout(resolve,420));
 const loading=byId('td2LoadArt');
 const mobileScene=selectors.get('.menu-scene-mobile');
 const crest=selectors.get('.menu-crest');
 assert.match(loading.src,/^https:\/\/res\.cloudinary\.com\//,'loading art uses the decoded CDN image');
 assert.match(mobileScene.src,/^https:\/\/res\.cloudinary\.com\//,'mobile menu scenery uses the decoded CDN image');
 assert.match(crest.src,/^https:\/\/res\.cloudinary\.com\//,'menu crest uses the decoded CDN image');
 assert.ok(requested.includes('assets/menu/memorial-yard-mobile-v4.webp?v=menu-v4a1'));
 mobile=false;resize?.();
 await Promise.resolve();await Promise.resolve();
 assert.match(selectors.get('.menu-scene img:not(.menu-scene-mobile)').src,/^https:\/\/res\.cloudinary\.com\//,'desktop scenery is fetched from CDN on orientation change');
 assert.ok(requested.includes('assets/menu/memorial-yard-v4.webp?v=menu-v4a1'));
 console.log('CDN preloader: visible loading art, menu scenery, crest and orientation switch use decoded CDN URLs');
}
run().catch(error=>{console.error(error);process.exitCode=1;});
