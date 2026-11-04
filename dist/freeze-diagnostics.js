/* Temporary, opt-in-by-build crash/freeze reporter for the Westhofen preview.
   No network requests, storage writes, personal data or automatic reloads. */
(()=>{'use strict';
 let lastAt=Date.now(),last={state:'start',level:0,wave:0,enemies:0},reported=false;
 function report(reason,detail=''){
  if(reported||document.hidden)return;
  reported=true;
  const summary=`TD2 DIAGNOSE\n${reason}\nLevel ${last.level} · Welle ${last.wave} · Gegner ${last.enemies} · Status ${last.state}\n${String(detail).slice(0,320)}`;
  const panel=document.createElement('aside');panel.id='td2-freeze-report';
  panel.style.cssText='position:fixed;left:10px;right:10px;top:12%;z-index:99999;background:#171e1c;color:#f8e5b9;border:2px solid #e2b66a;border-radius:12px;padding:14px;box-shadow:0 6px 28px #000b;font:14px/1.5 system-ui,sans-serif;white-space:pre-wrap;max-height:75vh;overflow:auto';
  const message=document.createElement('div');message.textContent=summary;panel.appendChild(message);
  const copy=document.createElement('button');copy.textContent='FEHLERBERICHT KOPIEREN';copy.style.cssText='margin:12px 8px 0 0;padding:10px;background:#d4b278;color:#161b19;border:0;border-radius:6px';
  copy.onclick=()=>{if(navigator.clipboard?.writeText)navigator.clipboard.writeText(summary).catch(()=>{});};panel.appendChild(copy);
  const close=document.createElement('button');close.textContent='SCHLIESSEN';close.style.cssText='padding:10px;background:#394743;color:#fff;border:0;border-radius:6px';close.onclick=()=>panel.remove();panel.appendChild(close);
  (document.body||document.documentElement).appendChild(panel);
 }
 addEventListener('error',event=>report('JavaScript-Fehler',`${event.message||'Unbekannt'} · ${event.filename||''}:${event.lineno||0}`));
 addEventListener('unhandledrejection',event=>report('Unbehandeltes Promise',event.reason?.message||String(event.reason)));
 setInterval(()=>{if(!document.hidden&&last.state==='playing'&&Date.now()-lastAt>4500)report('Spielschleife reagiert länger als 4,5 Sekunden nicht');},2000);
 globalThis.TD2FreezeDiagnostics={beat(state,game){lastAt=Date.now();last={state,level:game?.level||0,wave:game?.wave||0,enemies:game?.enemies?.length||0};}};
})();
