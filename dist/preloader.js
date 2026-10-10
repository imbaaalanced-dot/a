/* TD2 initial asset preloader. No runtime dependencies. */
(() => {
  'use strict';
  const prefix = 'assets/loading/';
  const portraits = ['storm.webp','gate.webp','journey.webp'];
  const essential = [
    'assets/asset-atlas.png','assets/stone-terrain-v27.png','assets/guardian-atlas-v27.png',
    'assets/tower-bow-infernal-v1.png','assets/tower-cannon-ash-v1.png',
    'assets/tower-mage-hellfire-v1.png','assets/tower-rift-lance-v1.png',
    'assets/tower-bow-l1-v2.png','assets/tower-bow-l2-v2.png','assets/tower-bow-l3-v2.png',
    'assets/tower-cannon-l1-v2.png','assets/tower-cannon-l2-v2.png','assets/tower-cannon-l3-v2.png',
    'assets/tower-rift-lance-l1.png','assets/tower-rift-lance-l2.png','assets/tower-rift-lance-l3.png',
    'assets/menu/warden-mobile-v2.webp','assets/menu/warden-desktop-v2.webp',
    'assets/menu/crest-v2.webp','assets/hero/marcel-lantern-portrait-v1.webp'
  ];
  const screen=document.getElementById('td2Loading');
  if(!screen)return;
  const bar=document.getElementById('td2LoadBar'),status=document.getElementById('td2LoadStatus');
  const label=document.getElementById('td2LoadPercent');
  const start=document.getElementById('startScreen');
  const image=document.getElementById('td2LoadArt');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let finished=0,failed=0,shown=false;
  const unique=[...new Set([...portraits.map(n=>prefix+n),...essential])];
  start?.setAttribute('inert','');
  function progress(){
    const pct=Math.round(100*finished/unique.length);
    bar.style.width=pct+'%';
    label.textContent=pct+'%';
    status.textContent=failed ? 'Grafiken laden · '+failed+' nicht verfügbar' : 'Grafiken werden vorbereitet …';
  }
  function load(src){
    return new Promise(resolve=>{
      const item=new Image();
      let settled=false;
      const timeout=setTimeout(()=>settle(false),8500);
      function settle(ok){if(settled)return;settled=true;clearTimeout(timeout);finished++;if(!ok)failed++;progress();resolve(ok);}
      item.onload=()=>settle(true); item.onerror=()=>settle(false);
      item.decoding='async';item.src=src;
      if(item.complete&&item.naturalWidth)settle(true);
    });
  }
  async function run(){
    const loaded=await Promise.all(portraits.map(async name=>({name,ok:await load(prefix+name)})));
    const available=loaded.filter(x=>x.ok).map(x=>prefix+x.name);
    if(available.length){
      image.src=available[0];
      if(available.length>1&&!reduced){
        let i=0;
        const timer=setInterval(()=>{
          if(!document.getElementById('td2Loading')){clearInterval(timer);return;}
          i=(i+1)%available.length;image.src=available[i];
        },2200);
      }
    }else{
      image.src='assets/menu/warden-mobile-v2.webp';
    }
    await Promise.all(essential.map(load));
    const minTime=new Promise(resolve=>setTimeout(resolve,450));
    await minTime;
    status.textContent=failed?'Startbereit · fehlende Bilder nutzen Spielfallbacks':'Alle Startgrafiken bereit';
    screen.classList.add('td2-loaded');
    start?.removeAttribute('inert');
    setTimeout(()=>{screen.remove();},reduced?0:330);
  }
  run().catch(()=>{start?.removeAttribute('inert');screen.remove();});
})();