/* TD2 startup cover: one artwork, bounded asset wait, DOM-ready handoff. */
(() => {
  'use strict';
  const screen=document.getElementById('td2Loading');
  if(!screen)return;
  const image=document.getElementById('td2LoadArt');
  const bar=document.getElementById('td2LoadBar');
  const label=document.getElementById('td2LoadPercent');
  const status=document.getElementById('td2LoadStatus');
  const track=document.getElementById('td2LoadTrack');
  const mobileQuery='(max-width:700px)';
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const art=image?.getAttribute('data-td2-asset') || 'assets/loading/kim-marcel-loading-v5.webp';
  const desktop='assets/menu/memorial-yard-v4.webp?v=menu-v4a1';
  const mobile='assets/menu/memorial-yard-mobile-v4.webp?v=menu-v4a1';
  const crest='assets/menu/crest-v4.webp?v=menu-v4a1';
  const sceneUrl=()=>window.matchMedia(mobileQuery).matches?mobile:desktop;
  let character='marcel';
  try {
    const saved=JSON.parse(localStorage.getItem('denkmal-preferences-v1')??'null');
    if(saved?.data?.character==='marcel'||saved?.data?.character==='kim')character=saved.data.character;
    else if(localStorage.getItem('denkmal-character')==='kim')character='kim';
  }catch{}
  const portrait=globalThis.TD2CanonicalHeroArt?.[character]?.portrait ||
    'assets/menu/v5-avatars/'+(character==='kim'?'kim-marksman-v6.webp':'marcel-guardian-v7.webp');
  const urls=[...new Set([art,sceneUrl(),crest,portrait])];
  const requests=new Map();
  let finished=0,failed=0,domReady=false,closed=false,locked=null,ownedInert=false;
  const total=urls.length+1;
  function paint(){
    if(closed)return;
    const pct=Math.floor(100*(finished+Number(domReady))/total);
    if(bar)bar.style.width=pct+'%';
    if(label)label.textContent=pct+'%';
    track?.setAttribute('aria-valuenow',String(pct));
    if(status)status.textContent=finished===urls.length&&!domReady?'Menü wird vorbereitet …':
      failed?'Startgrafiken werden geladen · Ersatzdarstellung verfügbar':'Startgrafiken werden geladen …';
  }
  function load(url){
    if(requests.has(url))return requests.get(url);
    const promise=Promise.resolve().then(()=>{
      if(globalThis.DenkmalAssets?.load)return globalThis.DenkmalAssets.load(url);
      return new Promise(resolve=>{
        const item=new Image();let done=false;
        const settle=ok=>{if(done)return;done=true;resolve(ok?item:null);};
        item.onload=()=>settle(item.naturalWidth>0);
        item.onerror=()=>settle(false);
        item.decoding='async';item.src=url;
        if(item.complete&&item.naturalWidth)settle(true);
      });
    }).catch(()=>null);
    requests.set(url,promise);return promise;
  }
  function applyScene(){
    const url=sceneUrl();
    const node=document.querySelector?.(url===mobile?'.menu-scene-mobile':'.menu-scene img:not(.menu-scene-mobile)');
    if(node)load(url).then(asset=>{if(asset&&sceneUrl()===url)node.src=asset.src||url;});
    const menuCrest=document.querySelector?.('.menu-crest');
    if(menuCrest)load(crest).then(asset=>{if(asset)menuCrest.src=asset.src||crest;});
  }
  const dom=new Promise(resolve=>{
    function ready(){
      domReady=true;
      locked=document.getElementById('app')||document.getElementById('startScreen');
      if(locked&&!locked.hasAttribute('inert')){locked.setAttribute('inert','');ownedInert=true;}
      const version=document.getElementById('td2LoadVersion');
      const value=document.querySelector?.('meta[name="application-version"]')?.content;
      if(version&&value)version.textContent=value;
      applyScene();window.addEventListener?.('resize',applyScene);
      paint();resolve();
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});
    else ready();
  });
  const assets=Promise.all(urls.map(url=>load(url).then(asset=>{
    finished++;if(!asset)failed++;
    if(!closed&&url===art&&asset&&image){
      image.src=asset.src||url;screen.classList.add('td2-art-ready');
    }
    paint();return asset;
  })));
  function close(immediate=false){
    if(closed)return;closed=true;
    if(ownedInert)locked?.removeAttribute('inert');
    screen.classList.add('td2-loaded');
    if(immediate||reduced)screen.remove();
    else setTimeout(()=>screen.remove(),330);
  }
  async function run(){
    let timer;
    const ready=await Promise.race([assets.then(()=>true),new Promise(resolve=>{timer=setTimeout(()=>resolve(false),15000);})]);
    clearTimeout(timer);
    await dom;
    if(status)status.textContent=!ready?'Menü öffnen · weitere Grafiken laden':failed?'Menü öffnen · Ersatzgrafiken aktiv':'Startgrafiken geladen';
    close();
  }
  run().catch(()=>close(true));
})();
