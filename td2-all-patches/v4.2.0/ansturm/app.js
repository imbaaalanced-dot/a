import {TUTORIAL_STEPS,tutorialSeen,rememberTutorial} from './tutorial.js?v=menu4';
import {TECH,UPGRADES} from './config.js';import {createGame,getStats,quotePurchase,purchase,startGame,nextWave,step,bossCue,purchasePreview,wavePreview,runSummary} from './model.js?v=v42a1';import {renderArena} from './render.js?v=v42a1';import {readRecord,saveRecord,saveRun,readRun,clearRun} from './storage.js?v=v42a1';import {sprite} from './sprites.js';
const el=id=>document.getElementById(id),canvas=el('game'),ctx=canvas.getContext('2d');let s=createGame(),tab='tech',manualPause=false,hiddenPause=document.hidden,prev=0,acc=0,shownDefeat=false,speed=1,soundOn=!(globalThis.TD2Audio?.settings.muted??false),lastKills=0;const storage=(()=>{try{return localStorage}catch{return null}})();
let lowFX=window.matchMedia('(prefers-reduced-motion: reduce)').matches;try{const mode=JSON.parse(storage?.getItem('denkmal-preferences-v1')||'null')?.data?.graphics;lowFX=lowFX||mode==='low'||(mode!=='high'&&typeof navigator!=='undefined'&&navigator.deviceMemory<=4);}catch{}
let savedRun=readRun(storage), pendingStart=false, lastSaveTime=0;
const storageWarning='Fortsetzen kann auf diesem Gerät gerade nicht gespeichert werden.';
function notice(message=''){el('saveNotice').textContent=message;el('saveNotice').hidden=!message;}
function resumeOffer(){
  el('resume').hidden=!savedRun.ok;
  el('resume').textContent=savedRun.ok?`Welle ${savedRun.state.wave} fortsetzen`: 'Fortsetzen';
  el('start').textContent=savedRun.reason==='missing'?'⚔ VERTEIDIGUNG STARTEN':'Neuer Durchlauf';
  if(savedRun.reason==='storage')notice(storageWarning);
  else if(!savedRun.ok&&savedRun.reason!=='missing')notice('Der gespeicherte Durchlauf kann nicht geladen werden. Du kannst einen neuen starten.');
}
function checkpoint(){
  if(!['running','intermission'].includes(s.status))return;
  const ok=saveRun(storage,s);lastSaveTime=performance.now();
  notice(ok?'':storageWarning);
}
function discardRun(){if(!clearRun(storage))notice(storageWarning);savedRun={ok:false,reason:'missing'};}
function beginRun(){el('intro').hidden=true;startGame(s);prev=0;acc=0;checkpoint();update();if(!tutorialSeen(storage))openTutorial(el('pause'));}
function requestNewRun(startImmediately){pendingStart=startImmediately;if(s.status!=='ready'||savedRun.reason!=='missing')el('confirm').showModal();else beginRun();}
// Kaufkarten bleiben beim HUD-Refresh im DOM: laufende Touch-Gesten werden nicht unterbrochen.
let renderedTab=null;const cardRefs=new Map();
function buttons(){
  const group=tab==='tech'?TECH:UPGRADES,root=el('cards');
  if(renderedTab!==tab){
    renderedTab=tab;cardRefs.clear();root.replaceChildren();
    for(const [id,cfg] of Object.entries(group)){
      const card=document.createElement('div');card.className='card';
      const info=document.createElement('div'),title=document.createElement('h3'),desc=document.createElement('p'),level=document.createElement('small'),b=document.createElement('button');
      const icon=document.createElement('canvas');icon.className='shop-icon';icon.width=64;icon.height=64;icon.setAttribute('aria-hidden','true');info.prepend(icon);title.textContent=cfg.name;desc.textContent=cfg.desc;
      info.append(title,desc,level);b.className='buy';b.type='button';
      b.addEventListener('click',()=>{if(document.hidden||el('tutorial').open||el('confirm').open||el('leaveConfirm').open)return;if(purchase(s,id)){globalThis.TD2Audio?.play('purchase');checkpoint();update();}});
      card.append(info,b);root.append(card);cardRefs.set(id,{level,b,desc});
    }
  }
  for(const [id,{level,b,desc}] of cardRefs){
    const icon=b.parentElement.querySelector('.shop-icon'),ictx=icon.getContext('2d');ictx.clearRect(0,0,64,64);sprite(ictx,`icon_${id}`,32,61,44,54);
    const q=quotePurchase(s,id),lv=tab==='tech'?s.tech[id]:s.upgrades[id];
    const preview=purchasePreview(s,id),fmt=n=>Number(n.toFixed(2)).toLocaleString('de-DE');
    if(preview)desc.textContent=preview.after===null?'Maximum erreicht':`${fmt(preview.before)} → ${fmt(preview.after)} ${preview.unit} · ${group[id].desc}`;
    b.setAttribute('aria-label',`${group[id].name}: ${q.reason==='Maximum'?'Maximum erreicht':q.price+' Gold'}`);
    level.textContent=`Stufe ${lv}${tab==='upgrades'?'/3':''}`;
    b.textContent=q.reason==='Maximum'?'MAX':`🪙 ${q.price}`;
    b.disabled=!q.available;
  }
}
function update(){el('gold').textContent=Math.floor(s.gold);el('wave').textContent=s.wave;el('best').textContent=readRecord(storage);el('introBest').textContent=readRecord(storage);const st=getStats(s);el('hptext').textContent=`${Math.ceil(s.hp)} / ${st.maxHp} HP`;const hpRatio=Math.max(0,s.hp/st.maxHp);el('hpbar').style.width=hpRatio*100+'%';el('hpbar').classList.toggle('critical',hpRatio<.25);el('hpbar').classList.toggle('low',hpRatio>=.25&&hpRatio<.5);el('shieldtext').textContent=`🛡 ${Math.ceil(s.shield)}`;el('state').classList.toggle('urgent',s.status==='intermission'&&s.intermission<=5);el('state').textContent=s.status==='ready'?'Bereit':s.status==='lost'?'Denkmal gefallen':(manualPause||hiddenPause)?'Pausiert':s.status==='intermission'&&s.wave>=1000?'Wellenlimit 1000 erreicht':s.status==='intermission'?`Baupause · ${Math.ceil(s.intermission)}s`:`Welle ${s.wave} · ${s.enemies.length} Gegner`;el('speed').textContent=speed===2?'2× Tempo':'1× Tempo';el('speed').setAttribute('aria-pressed',String(speed===2));el('sound').textContent=soundOn?'🔊 Ton':'🔇 Ton';el('sound').setAttribute('aria-pressed',String(soundOn));el('pause').disabled=s.status==='ready'||s.status==='lost';el('pause').textContent=manualPause?'▶ Fortsetzen':'⏸ Pause';el('next').hidden=s.status!=='intermission'||s.wave>=1000;el('summary').textContent=tab==='tech'?`Schaden ${st.damage} · Tempo ${st.attacksPerSecond.toFixed(2)}/s · Gold ×${st.goldMultiplier.toFixed(1)}`:'Waffen wirken automatisch und bleiben nur bis zur Niederlage.';const boss=s.enemies.find(e=>e.alive&&e.type==='boss');el('bossCue').hidden=!boss||s.status!=='running';el('bossCue').textContent=boss?bossCue(boss):'';
 el('bossCue').classList.toggle('warning',boss?.bossPhase==='warning');
 el('waveForecast').hidden=s.status==='running'||s.status==='lost';el('waveForecast').textContent=wavePreview(s.wave+1);buttons();}
function tone(){if(soundOn)globalThis.TD2Audio?.play('hit');}
function restart(){discardRun();if(s.wave>0)saveRecord(storage,s.wave);s=createGame();manualPause=false;hiddenPause=document.hidden;shownDefeat=false;lastKills=0;acc=0;prev=0;renderedTab=null;el('defeat').close();el('intro').hidden=false;resumeOffer();update();}
const portraitShop=window.matchMedia('(max-width:650px) and (orientation:portrait)');let shopOpen=false;
function syncShop(){const layout=document.querySelector('.layout'),toggle=el('shopToggle');layout.classList.toggle('portrait-shop-open',portraitShop.matches&&shopOpen);toggle.hidden=!portraitShop.matches;toggle.setAttribute('aria-expanded',String(portraitShop.matches&&shopOpen));toggle.textContent=shopOpen?'Schließen':'Ausbauen';}
el('shopToggle').onclick=()=>{shopOpen=!shopOpen;syncShop();};portraitShop.addEventListener('change',()=>{shopOpen=false;syncShop();});syncShop();
el('speed').onclick=()=>{speed=speed===1?2:1;acc=0;prev=0;update();};el('sound').onclick=()=>{soundOn=!soundOn;globalThis.TD2Audio?.mute(!soundOn);globalThis.TD2Audio?.unlock();tone();update();};el('start').onclick=()=>requestNewRun(true);el('pause').onclick=()=>{manualPause=!manualPause;acc=0;prev=0;update();};el('next').onclick=()=>{if(nextWave(s))checkpoint();update();};el('reset').onclick=()=>requestNewRun(false);el('cancelRestart').onclick=()=>el('confirm').close();el('confirmRestart').onclick=()=>{el('confirm').close();restart();if(pendingStart)beginRun();};el('again').onclick=restart;el('techTab').onclick=()=>{tab='tech';el('techTab').classList.add('selected');el('upgradeTab').classList.remove('selected');update();};el('upgradeTab').onclick=()=>{tab='upgrades';el('upgradeTab').classList.add('selected');el('techTab').classList.remove('selected');update();};document.addEventListener('visibilitychange',()=>{hiddenPause=document.hidden;globalThis.TD2Audio?.pause(hiddenPause);if(hiddenPause)checkpoint();prev=0;acc=0;update();});
const playedEffects=new WeakSet();let lastBossSound='';
function frame(t){const audio=globalThis.TD2Audio;if(audio){audio.setScene(s.status==='running'?'combat':s.status==='lost'?'silent':'menu');audio.pause(manualPause||hiddenPause||el('confirm').open||el('leaveConfirm').open||el('tutorial').open);audio.tick();}const oldWave=s.wave,oldStatus=s.status;const dt=prev?Math.min((t-prev)/1000,.1):0;prev=t;if(!manualPause&&!hiddenPause&&!el('confirm').open&&!el('leaveConfirm').open&&!el('tutorial').open&&s.status!=='ready'&&s.status!=='lost'){acc=Math.min(.30,acc+dt*speed);let count=0;while(acc>=1/30&&count++<10){step(s,1/30);acc-=1/30;}}for(const effect of s.effects){if(effect.type==='projectile'&&!playedEffects.has(effect)){playedEffects.add(effect);audio?.play(({effect_lightning:'tesla',effect_blast:'explosion',effect_ice:'frost',effect_fire:'fire',effect_lance:'pierce'})[effect.spriteKey]||'bow');}}
 const boss=s.enemies.find(e=>e.alive&&e.type==='boss');const bossKey=boss?`${boss.id}:${boss.bossPhase}`:'';if(bossKey!==lastBossSound){if(boss?.bossPhase==='warning')audio?.play('boss');lastBossSound=bossKey;}
 if(s.kills>lastKills){tone();lastKills=s.kills;}if(s.status==='lost'&&!shownDefeat){shownDefeat=true;audio?.play('defeat');discardRun();saveRecord(storage,s.wave);el('result').textContent=runSummary(s);el('defeat').showModal();}if(oldWave!==s.wave||oldStatus!==s.status){if(s.wave!==oldWave)audio?.play('wave');checkpoint();}else if(!manualPause&&!hiddenPause&&performance.now()-lastSaveTime>=5000)checkpoint();if(s.status==='intermission' && s.wave > readRecord(storage))saveRecord(storage,s.wave);const r=canvas.getBoundingClientRect();renderArena(ctx,s,{width:r.width,height:r.height,pixelRatio:window.devicePixelRatio||1,lowFX});if(Math.floor(t/180)!==Math.floor((t-dt*1000)/180))update();requestAnimationFrame(frame);}resumeOffer();update();requestAnimationFrame(frame);

function leaveGame(){checkpoint();if(s.wave>0)saveRecord(storage,s.wave);location.assign(new URL('../index.html',location.href));}
el('leave').onclick=()=>{if(s.status==='ready'||s.status==='lost')leaveGame();else el('leaveConfirm').showModal();};
el('stay').onclick=()=>{el('leaveConfirm').close();prev=0;acc=0;};el('leaveGame').onclick=leaveGame;
el('defeatMenu').onclick=leaveGame;

el('resume').onclick=()=>{
  const loaded=readRun(storage);
  if(!loaded.ok){savedRun=loaded;resumeOffer();return;}
  s=loaded.state;manualPause=true;hiddenPause=document.hidden;prev=0;acc=0;
  lastKills=s.kills;shownDefeat=false;lastSaveTime=performance.now();
  el('intro').hidden=true;notice();update();el('pause').focus();
};
window.addEventListener('pagehide',()=>{hiddenPause=true;checkpoint();prev=0;acc=0;});
window.addEventListener('pageshow',()=>{hiddenPause=document.hidden;prev=0;acc=0;});

// A modal owns its pause: closing it never changes the player's pause choice.
let tutorialStep=0,tutorialFocus=null;
function tutorialContent(){
 const item=TUTORIAL_STEPS[tutorialStep];
 el('tutorialCount').textContent=`KURZANLEITUNG · ${tutorialStep+1} / ${TUTORIAL_STEPS.length}`;
 el('tutorialMark').textContent=item.mark;el('tutorialTitle').textContent=item.title;
 el('tutorialText').textContent=item.text;el('tutorialTip').textContent=item.tip;
 el('tutorialBack').disabled=tutorialStep===0;
 el('tutorialNext').textContent=tutorialStep===TUTORIAL_STEPS.length-1?'Los geht’s':'Weiter';
}
function openTutorial(returnFocus){
 tutorialFocus=returnFocus;tutorialStep=0;tutorialContent();
 el('gameMenu').open=false;prev=0;acc=0;el('tutorial').showModal();el('tutorialNext').focus();
}
function closeTutorial(){
 rememberTutorial(storage);el('tutorial').close();prev=0;acc=0;
 tutorialFocus?.focus();
}
el('tutorialNext').onclick=()=>{if(tutorialStep<TUTORIAL_STEPS.length-1){tutorialStep++;tutorialContent();}else closeTutorial();};
el('tutorialBack').onclick=()=>{if(tutorialStep>0){tutorialStep--;tutorialContent();}};
el('tutorialSkip').onclick=closeTutorial;
el('tutorial').addEventListener('cancel',event=>{event.preventDefault();closeTutorial();});
el('help').onclick=()=>openTutorial(el('gameMenuToggle'));
el('introHelp').onclick=()=>openTutorial(el('introHelp'));
// Menu actions close the flyout before opening a modal or applying a setting.
for(const id of ['leave','speed','sound','reset'])el(id).addEventListener('click',()=>{el('gameMenu').open=false;});

globalThis.DenkmalAudio?.bindControls(document);
for(const gesture of ['pointerdown','keydown'])document.addEventListener(gesture,()=>globalThis.TD2Audio?.unlock());
