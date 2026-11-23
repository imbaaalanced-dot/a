/* TD2 initial asset preloader. No runtime dependencies. */
(() => {
  'use strict';
  const prefix = 'assets/loading/';
  const portraits = ['kim-marcel-loading-v5.webp','gate.webp','journey.webp'];
  /* Command Hub V5: preload viewport scenery and only the selected approved hero.
     The other character's art loads on demand when switching in the menu. */
  const mobile = window.matchMedia('(max-width:700px)').matches;
  let character = 'marcel';
  try{
    const envelope = JSON.parse(localStorage.getItem('denkmal-preferences-v1') ?? 'null');
    if (envelope && envelope.data && (envelope.data.character === 'marcel' || envelope.data.character === 'kim')) character = envelope.data.character;
    else if (localStorage.getItem('denkmal-character') === 'kim') character = 'kim';
  }catch{}
  const essential = [
    mobile ? 'assets/menu/memorial-yard-mobile-v4.webp?v=menu-v4a1' : 'assets/menu/memorial-yard-v4.webp?v=menu-v4a1',
    'assets/menu/crest-v4.webp?v=menu-v4a1',
    globalThis.TD2CanonicalHeroArt?.[character]?.portrait ||
      'assets/menu/v5-avatars/' + (character === 'kim' ? 'kim-marksman-v6.webp' : 'marcel-guardian-v7.webp')
  ];
  const screen=document.getElementById('td2Loading');
  if(!screen)return;
  const bar=document.getElementById('td2LoadBar'),status=document.getElementById('td2LoadStatus');
  const label=document.getElementById('td2LoadPercent');
  const start=document.getElementById('startScreen');
  const image=document.getElementById('td2LoadArt');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let finished=0,failed=0,pending=0;
  const results=new Map();
  const unique=[...new Set([...portraits.map(n=>prefix+n),...essential])];
  start?.setAttribute('inert','');
  function progress(){
    const pct=Math.round(100*finished/unique.length);
    bar.style.width=pct+'%';
    label.textContent=pct+'%';
    status.textContent=failed ? 'Grafiken werden geladen · '+failed+' Ersatzdarstellungen nötig' : pending?'Weitere Bilder werden geladen …':'Spielgrafiken werden vorbereitet …';
  }
  function load(src){
    if(globalThis.DenkmalAssets){
      return globalThis.DenkmalAssets.load(src).then(img=>{
        finished++;results.set(src,img||null);if(!img)failed++;progress();return img;
      });
    }
    return new Promise(resolve=>{
      const item=new Image();
      let settled=false;
      function settle(ok){if(settled)return;settled=true;finished++;results.set(src,ok?item:null);if(!ok)failed++;progress();resolve(ok?item:null);}
      item.onload=()=>settle(true); item.onerror=()=>settle(false);
      item.decoding='async';item.src=src;
      if(item.complete&&item.naturalWidth)settle(true);
    });
  }
  async function loadQueue(urls){
    let next=0;
    await Promise.all(Array.from({length:Math.min(4,urls.length)},async()=>{
      while(next<urls.length){const url=urls[next++];await load(url);}
    }));
  }
  async function run(){
    let deadline;
    const complete=loadQueue(unique).then(()=>true);
    const ready=await Promise.race([complete,new Promise(resolve=>{deadline=setTimeout(()=>resolve(false),15000);})]);
    clearTimeout(deadline);pending=ready?0:unique.length-finished;
    const available=portraits.map(n=>prefix+n).filter(url=>!!results.get(url));
    if(available.length){
      image.src=results.get(available[0]).src||available[0];
      if(available.length>1&&!reduced){
        let i=0;
        const timer=setInterval(()=>{
          if(!document.getElementById('td2Loading')){clearInterval(timer);return;}
          i=(i+1)%available.length;
          const asset=results.get(available[i]);image.src=asset?.src||available[i];
        },2200);
      }
    }
    const desktopSceneUrl='assets/menu/memorial-yard-v4.webp?v=menu-v4a1';
    const mobileSceneUrl='assets/menu/memorial-yard-mobile-v4.webp?v=menu-v4a1';
    const desktopScene=document.querySelector?.('.menu-scene img:not(.menu-scene-mobile)');
    const mobileScene=document.querySelector?.('.menu-scene-mobile');
    const menuCrest=document.querySelector?.('.menu-crest');
    const crestUrl='assets/menu/crest-v4.webp?v=menu-v4a1';
    const crestAsset=results.get(crestUrl);
    if(menuCrest&&crestAsset)menuCrest.src=crestAsset.src||crestUrl;
    function applyScene(){
      const isMobile=window.matchMedia('(max-width:700px)').matches;
      const url=isMobile?mobileSceneUrl:desktopSceneUrl;
      const node=isMobile?mobileScene:desktopScene;
      if(!node)return;
      const apply=asset=>{if(asset&&window.matchMedia('(max-width:700px)').matches===isMobile)node.src=asset.src||url;};
      const cached=results.get(url);
      if(cached){apply(cached);return;}
      if(globalThis.DenkmalAssets?.load){globalThis.DenkmalAssets.load(url).then(apply);return;}
      const fallback=new Image();fallback.onload=()=>apply(fallback);fallback.src=url;
    }
    applyScene();
    window.addEventListener?.('resize',applyScene);
    await new Promise(resolve=>setTimeout(resolve,180));
    status.textContent=failed?'Spielbereit · Ersatzgrafiken aktiv':pending?'Spielbereit · weitere Bilder laden im Hintergrund':'Alle Startgrafiken geladen';
    screen.classList.add('td2-loaded');
    start?.removeAttribute('inert');
    setTimeout(()=>{screen.remove();},reduced?0:330);
  }
  run().catch(()=>{start?.removeAttribute('inert');screen.remove();});
})();
