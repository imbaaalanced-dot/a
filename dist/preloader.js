/* TD2 initial asset preloader. No runtime dependencies. */
(() => {
  'use strict';
  const prefix = 'assets/loading/';
  const portraits = ['storm.webp','gate.webp','journey.webp'];
  const essential = [
    'assets/elemental/enemies-v1.webp?v=enemies1',
    'assets/elemental/enemies-walk-alpha8.webp?v=alpha8a2',
    ...['boomerang','bow','cannon','mage','rift'].map(kind=>'assets/elemental/'+kind+'-towers-v1.webp?v=elemental1'),
    ...['mage','rift','cannon'].flatMap(kind=>['projectiles','impacts'].map(type=>'assets/elemental/'+kind+'-'+type+'-v1.webp?v=elemental1')),
    'assets/monument-level1-v2.webp',
    'assets/hero/marcel-walk-alpha8.webp?v=alpha8a2','assets/hero/kim-walk-alpha8.webp?v=alpha8a2',
    'assets/hero/marcel-lantern-sprite-v1.webp','assets/scenery-alpha8.webp?v=alpha8a2',
    window.matchMedia('(max-width:700px)').matches?'assets/menu/warden-mobile-v2.webp':'assets/menu/warden-desktop-v2.webp',
    'assets/menu/crest-v2.webp','assets/hero/marcel-lantern-portrait-v1.webp'
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
    status.textContent=failed ? 'Grafiken laden · Ersatzdarstellung für '+failed+' Bilder' : pending?'Bilder laden weiter …':'Grafiken werden vorbereitet …';
  }
  function load(src){
    return new Promise(resolve=>{
      const item=new Image();
      let settled=false;
      function settle(ok){if(settled)return;settled=true;finished++;results.set(src,ok);if(!ok)failed++;progress();resolve(ok);}
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
    const available=portraits.map(n=>prefix+n).filter(url=>results.get(url)===true);
    if(available.length){
      image.src=available[0];
      if(available.length>1&&!reduced){
        let i=0;
        const timer=setInterval(()=>{
          if(!document.getElementById('td2Loading')){clearInterval(timer);return;}
          i=(i+1)%available.length;image.src=available[i];
        },2200);
      }
    }
    await new Promise(resolve=>setTimeout(resolve,180));
    status.textContent=failed?'Startbereit · Ersatzgrafiken aktiv':pending?'Startbereit · weitere Bilder laden im Hintergrund':'Alle Startgrafiken bereit';
    screen.classList.add('td2-loaded');
    start?.removeAttribute('inert');
    setTimeout(()=>{screen.remove();},reduced?0:330);
  }
  run().catch(()=>{start?.removeAttribute('inert');screen.remove();});
})();