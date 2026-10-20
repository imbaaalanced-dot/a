/* TD2 initial asset preloader. No runtime dependencies. */
(() => {
  'use strict';
  const prefix = 'assets/loading/';
  const portraits = ['storm.webp','gate.webp','journey.webp'];
  const essential = [
    'assets/menu/churchyard-quiet-v1.webp',
    'assets/menu/crest-v2.webp','assets/menu/marcel-banner-alpha9.webp',
    'assets/menu/kim-menu-banner-v1.webp'
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
    if(globalThis.DenkmalAssets){
      return globalThis.DenkmalAssets.load(src).then(img=>{
        finished++;results.set(src,!!img);if(!img)failed++;progress();return !!img;
      });
    }
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
