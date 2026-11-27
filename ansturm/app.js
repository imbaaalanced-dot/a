import {TUTORIAL_STEPS,tutorialSeen,rememberTutorial} from './tutorial.js?v=copy-20261110a';
import {TECH,UPGRADES,nextSpeed} from './config.js?v=ansturm-devspeed-20261117';import {createGame,getStats,quotePurchase,purchase,startGame,nextWave,step,bossCue} from './model.js?v=v410a1sim1';import {renderArena} from './render.js?v=walksheet-cache-v3';import {readRecord,saveRecord,saveRun,readRun,clearRun} from './storage.js?v=v410a1sim1';import {sprite} from './sprites.js?v=walksheet-cache-v3';import {playIntroCutscene} from './cutscene.js?v=v410a1cut2';
const el=id=>document.getElementById(id),canvas=el('game'),ctx=canvas.getContext('2d');let s=createGame(),tab='tech',manualPause=false,hiddenPause=document.hidden,prev=0,acc=0,shownDefeat=false,speed=1,soundOn=false,audioCtx=null,lastKills=0;const storage=(()=>{try{return localStorage}catch{return null}})();
const developerSpeedMode=(()=>{try{return String(location.search||'').includes('dev=')||storage.getItem('ansturm-developer-speed')==='enabled'}catch{return false}})();
let savedRun=readRun(storage), pendingStart=false, lastSaveTime=0;
function updateFullscreenControls(){
  const active=!!document.fullscreenElement;
  for(const id of ['fullscreen','introFullscreen']){
    const button=el(id);
    button.textContent=active?'VOLLBILD: AN':'VOLLBILD: AUS';
    button.setAttribute('aria-pressed',String(active));
    button.setAttribute('aria-label',active?'Vollbild beenden':'Vollbild aktivieren');
  }
}
async function toggleFullscreen(){
  try{
    if(document.fullscreenElement){
      if(!document.exitFullscreen)throw new Error('Fullscreen exit unavailable');
      await document.exitFullscreen();
    }else{
      if(!document.documentElement.requestFullscreen)throw new Error('Fullscreen unavailable');
      await document.documentElement.requestFullscreen();
    }
    el('gameMenu').open=false;
  }catch{
    notice('Vollbild nicht verfügbar · Browser-Menü: Zum Startbildschirm hinzufügen');
  }
  updateFullscreenControls();
}
el('fullscreen').onclick=toggleFullscreen;
el('introFullscreen').onclick=toggleFullscreen;
document.addEventListener('fullscreenchange',()=>{
  updateFullscreenControls();
  // The arena renderer reads its bounding box on every frame; no fixed-size canvas rebuild is needed.
  prev=0;
});
updateFullscreenControls();
const storageWarning='Fortsetzen kann auf diesem Gerät gerade nicht gespeichert werden.';
function notice(message=''){el('saveNotice').textContent=message;el('saveNotice').hidden=!message;}
function resumeOffer(){
  el('resume').hidden=!savedRun.ok;
  el('resume').textContent=savedRun.ok?`Welle ${savedRun.state.wave} fortsetzen`: 'Fortsetzen';
  el('start').textContent=savedRun.reason==='missing'?'⚔ VERTEIDIGUNG STARTEN':'NEUEN DURCHLAUF STARTEN';
  if(savedRun.reason==='storage')notice(storageWarning);
  else if(!savedRun.ok&&savedRun.reason!=='missing')notice('Der gespeicherte Durchlauf kann nicht geladen werden. Du kannst einen neuen starten.');
}
function checkpoint(){
  if(!['running','intermission'].includes(s.status))return;
  const ok=saveRun(storage,s);lastSaveTime=performance.now();
  notice(ok?'':storageWarning);
}
function discardRun(){if(!clearRun(storage))notice(storageWarning);savedRun={ok:false,reason:'missing'};}
async function beginRun(){await playIntroCutscene(storage);el('intro').hidden=true;startGame(s);prev=0;acc=0;checkpoint();update();if(!tutorialSeen(storage))openTutorial(el('pause'));}
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
      b.addEventListener('click',()=>{if(purchase(s,id)){checkpoint();update();sfx('towerUpgrade');}});
      card.append(info,b);root.append(card);cardRefs.set(id,{level,b});
    }
  }
  for(const [id,{level,b}] of cardRefs){
    const icon=b.parentElement.querySelector('.shop-icon'),ictx=icon.getContext('2d');ictx.clearRect(0,0,64,64);sprite(ictx,`icon_${id}`,32,61,44,54);
    const q=quotePurchase(s,id),lv=tab==='tech'?s.tech[id]:s.upgrades[id];
    level.textContent=`Stufe ${lv}${tab==='upgrades'?' / 3':''}`;
    b.textContent=q.reason==='Maximum'?'MAXIMALE STUFE':`🪙 ${q.price}`;
    b.disabled=!q.available;
  }
}
function update(){
  el('gold').textContent=Math.floor(s.gold);
  el('wave').textContent=s.wave;el('best').textContent=readRecord(storage);el('introBest').textContent=readRecord(storage);
  const st=getStats(s),hpRatio=Math.max(0,s.hp/st.maxHp);
  el('hptext').textContent=`${Math.ceil(s.hp)} / ${st.maxHp} LP`;
  el('hpbar').style.width=hpRatio*100+'%';el('hpbar').classList.toggle('critical',hpRatio<.25);el('hpbar').classList.toggle('low',hpRatio>=.25&&hpRatio<.5);
  el('shieldtext').textContent=`🛡 ${Math.ceil(s.shield)}`;
  el('state').classList.toggle('urgent',s.status==='intermission'&&s.intermission<=5);
  el('state').textContent=s.status==='ready'?'Bereit zur Verteidigung':s.status==='lost'?'Denkmal gefallen':(manualPause||hiddenPause)?'Pausiert':s.status==='intermission'&&s.wave>=1000?'Wellenlimit von 1000 erreicht':s.status==='intermission'?`Baupause · ${Math.ceil(s.intermission)} s`:`Welle ${s.wave} · ${s.enemies.length} Gegner`;
  el('speed').textContent=`Tempo: ${speed}×${developerSpeedMode?' · DEV':''}`;el('speed').setAttribute('aria-pressed',String(speed>1));
  el('sound').textContent=soundOn?'🔊 Ton: An':'🔇 Ton: Aus';el('sound').setAttribute('aria-pressed',String(soundOn));
  el('pause').disabled=s.status==='ready'||s.status==='lost';el('pause').textContent=manualPause?'▶ Fortsetzen':'⏸ Pause';el('next').hidden=s.status!=='intermission'||s.wave>=1000;
  el('summary').textContent=tab==='tech'?`Schaden ${st.damage} · Angriffe ${st.attacksPerSecond.toFixed(2)}/s · Goldbonus ×${st.goldMultiplier.toFixed(1)}`:'Waffen wirken automatisch. Ihre Ausbauten gelten für den aktuellen Durchlauf.';
  const boss=s.enemies.find(e=>e.alive&&e.type==='boss');if(boss&&s.status==='running')el('state').textContent+=' · '+bossCue(boss);
  buttons();
}
function tone(frequency=440){if(!soundOn)return;try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;if(!audioCtx)audioCtx=new Audio();if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});const o=audioCtx.createOscillator(),g=audioCtx.createGain(),now=audioCtx.currentTime;o.type='sine';o.frequency.value=frequency;g.gain.setValueAtTime(.035,now);g.gain.exponentialRampToValueAtTime(.001,now+.09);o.connect(g);g.connect(audioCtx.destination);o.start(now);o.stop(now+.1);}catch{soundOn=false;}}
// #395-Folge: benannte prozedurale Ereignis-Sounds wie im Hauptspiel (combat-fx.js).
// Gleiche Vertraege wie tone(): kein Audio vor der ersten Geste, lazy AudioContext,
// Resume bei suspended, Drossel pro Name, gemeinsames Voice-Cap, kein Wurf bei Mocks.
const SFX_A={
  waveLaunch:[{osc:1,type:'sine',f0:110,f1:55,dur:.22,vol:.14},{noise:1,f0:400,f1:120,dur:.16,vol:.12},{osc:1,type:'sine',f0:90,f1:45,at:.14,dur:.22,vol:.12}],
  waveCleared:[{osc:1,type:'sine',f0:523,dur:.13,vol:.05},{osc:1,type:'sine',f0:659,at:.09,dur:.13,vol:.05},{osc:1,type:'sine',f0:784,at:.18,dur:.2,vol:.055}],
  bossSpawn:[{osc:1,type:'sawtooth',f0:58,f1:44,dur:1.1,vol:.06,hit:.3},{osc:1,type:'sawtooth',f0:63.5,f1:47,at:.05,dur:1.1,vol:.05,hit:.35},{noise:1,f0:220,f1:60,dur:1,vol:.04}],
  enemyDie:[{osc:1,type:'triangle',f0:240,f1:70,dur:.18,vol:.05,rand:1},{noise:1,f0:800,f1:200,dur:.14,vol:.04}],
  monumentHit:[{osc:1,type:'sine',f0:70,f1:40,dur:.25,vol:.1},{noise:1,f0:350,f1:100,dur:.18,vol:.07}],
  defeat:[{osc:1,type:'sine',f0:220,f1:110,dur:.5,vol:.06,hit:.05},{osc:1,type:'sine',f0:165,f1:82,at:.4,dur:.6,vol:.06,hit:.05},{noise:1,f0:300,f1:80,dur:.9,vol:.035,hit:.25}],
  towerUpgrade:[{osc:1,type:'triangle',f0:262,dur:.09,vol:.06},{osc:1,type:'triangle',f0:330,at:.07,dur:.09,vol:.06},{osc:1,type:'triangle',f0:392,at:.14,dur:.12,vol:.065}],
  uiClick:[{osc:1,type:'square',f0:520,f1:430,dur:.05,vol:.03,rand:1}],
  uiToggle:[{osc:1,type:'square',f0:440,f1:560,dur:.07,vol:.035}]
};
const SFX_A_COOLDOWN={monumentHit:.09,enemyDie:.05,uiClick:.028};
let sfxVoices=0,sfxOut=null,sfxNoiseBuffer=null,bossSeen=new WeakSet(),lastMonumentHp=0;
const sfxLastT=new Map();
function sfxOutReady(){if(!sfxOut){sfxOut=audioCtx.createGain();sfxOut.gain.value=.65;sfxOut.connect(audioCtx.destination);}}
function sfxNoiseBufferReady(){if(typeof audioCtx.createBuffer!=='function'||typeof audioCtx.createBiquadFilter!=='function')return false;if(!sfxNoiseBuffer){const length=Math.floor(audioCtx.sampleRate*.5);sfxNoiseBuffer=audioCtx.createBuffer(1,length,audioCtx.sampleRate);const data=sfxNoiseBuffer.getChannelData(0);for(let i=0;i<length;i++)data[i]=Math.random()*2-1;}return true;}
function sfxLayer(l,now){
  if(l.osc){const o=audioCtx.createOscillator(),g=audioCtx.createGain(),detune=l.rand?.92+Math.random()*.16:1;
    o.type=l.type||'sine';o.frequency.setValueAtTime(l.f0*detune,now+l.at);
    if(l.f1)o.frequency.exponentialRampToValueAtTime(l.f1*detune,now+l.at+l.dur);
    g.gain.setValueAtTime(.0001,now+l.at);g.gain.exponentialRampToValueAtTime(l.vol,now+l.at+(l.hit||.006));g.gain.exponentialRampToValueAtTime(.0001,now+l.at+l.dur);
    o.connect(g).connect(sfxOut);sfxVoices++;o.onended=()=>{sfxVoices--;o.disconnect();g.disconnect();};o.start(now+l.at);o.stop(now+l.at+l.dur+.02);return;}
  if(!sfxNoiseBufferReady())return;
  const src=audioCtx.createBufferSource(),g=audioCtx.createGain(),filter=audioCtx.createBiquadFilter();
  src.buffer=sfxNoiseBuffer;src.loop=true;filter.type=l.filter||'lowpass';
  filter.frequency.setValueAtTime(l.f0,now+l.at);
  if(l.f1)filter.frequency.exponentialRampToValueAtTime(l.f1,now+l.at+l.dur);
  filter.Q.value=l.q||.8;
  g.gain.setValueAtTime(.0001,now+l.at);g.gain.exponentialRampToValueAtTime(l.vol,now+l.at+(l.hit||.004));g.gain.exponentialRampToValueAtTime(.0001,now+l.at+l.dur);
  src.connect(filter);filter.connect(g);g.connect(sfxOut);sfxVoices++;src.onended=()=>{sfxVoices--;src.disconnect();filter.disconnect();g.disconnect();};src.start(now+l.at);src.stop(now+l.at+l.dur+.02);
}
function sfx(name){if(!soundOn)return;try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;if(!audioCtx)audioCtx=new Audio();if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});if(audioCtx.state!=='running'||sfxVoices>=8)return;const r=SFX_A[name];if(!r)return;const now=audioCtx.currentTime;if(now-(sfxLastT.get(name)??-1)<(SFX_A_COOLDOWN[name] ?? .028))return;sfxLastT.set(name,now);sfxOutReady();for(const l of r)try{sfxLayer(l,now)}catch{}}catch{}}
lastMonumentHp=s.hp+s.shield;
function restart(){discardRun();if(s.wave>0)saveRecord(storage,s.wave);s=createGame();manualPause=false;hiddenPause=document.hidden;shownDefeat=false;lastKills=0;acc=0;prev=0;renderedTab=null;bossSeen=new WeakSet();lastMonumentHp=s.hp+s.shield;el('defeat').close();el('intro').hidden=false;resumeOffer();update();}
const portraitShop=window.matchMedia('(max-width:650px) and (orientation:portrait)');let shopOpen=false;
function syncShop(){const layout=document.querySelector('.layout'),toggle=el('shopToggle');layout.classList.toggle('portrait-shop-open',portraitShop.matches&&shopOpen);toggle.hidden=!portraitShop.matches;toggle.setAttribute('aria-expanded',String(portraitShop.matches&&shopOpen));toggle.textContent=shopOpen?'Schließen':'Ausbauen';}
el('shopToggle').onclick=()=>{shopOpen=!shopOpen;sfx('uiClick');syncShop();};portraitShop.addEventListener('change',()=>{shopOpen=false;syncShop();});syncShop();
// #330: Tempo wirkt nur auf den Fixschritt-Akkumulator; normal max. 2x, Entwicklermodus max. 5x.
el('speed').onclick=()=>{speed=nextSpeed(speed,developerSpeedMode);acc=0;prev=0;sfx('uiClick');update();};el('sound').onclick=()=>{soundOn=!soundOn;sfx('uiToggle');update();};el('start').onclick=()=>requestNewRun(true);el('pause').onclick=()=>{manualPause=!manualPause;acc=0;prev=0;sfx('uiClick');update();};el('next').onclick=()=>{if(nextWave(s))checkpoint();update();};el('reset').onclick=()=>requestNewRun(false);el('cancelRestart').onclick=()=>el('confirm').close();el('confirmRestart').onclick=()=>{el('confirm').close();restart();if(pendingStart)beginRun();};el('again').onclick=restart;el('techTab').onclick=()=>{tab='tech';el('techTab').classList.add('selected');el('upgradeTab').classList.remove('selected');sfx('uiClick');update();};el('upgradeTab').onclick=()=>{tab='upgrades';el('upgradeTab').classList.add('selected');el('techTab').classList.remove('selected');sfx('uiClick');update();};document.addEventListener('visibilitychange',()=>{hiddenPause=document.hidden;if(hiddenPause)checkpoint();prev=0;acc=0;update();});
function frame(t){const oldWave=s.wave,oldStatus=s.status;const dt=prev?Math.min((t-prev)/1000,.1):0;prev=t;if(!manualPause&&!hiddenPause&&!el('confirm').open&&!el('leaveConfirm').open&&!el('tutorial').open&&s.status!=='ready'&&s.status!=='lost'){acc=Math.min(.30,acc+dt*speed);let count=0;while(acc>=1/30&&count++<10){step(s,1/30);acc-=1/30;}}if(s.kills>lastKills){sfx('enemyDie');lastKills=s.kills;}if(s.status==='lost'&&!shownDefeat){shownDefeat=true;sfx('defeat');discardRun();saveRecord(storage,s.wave);el('result').textContent=`Welle ${s.wave} · ${s.kills} besiegte Gegner`;el('defeat').showModal();}if(s.wave>oldWave&&s.status==='running')sfx('waveLaunch');else if(s.status==='intermission'&&oldStatus==='running')sfx('waveCleared');const bossNow=s.enemies.find(e=>e.alive&&e.type==='boss');if(bossNow&&!bossSeen.has(bossNow)){bossSeen.add(bossNow);sfx('bossSpawn');}const hpNow=s.hp+s.shield;if(hpNow<lastMonumentHp&&s.status==='running')sfx('monumentHit');lastMonumentHp=hpNow;if(oldWave!==s.wave||oldStatus!==s.status)checkpoint();else if(!manualPause&&!hiddenPause&&performance.now()-lastSaveTime>=5000)checkpoint();if(s.status==='intermission' && s.wave > readRecord(storage))saveRecord(storage,s.wave);const r=canvas.getBoundingClientRect();renderArena(ctx,s,{width:r.width,height:r.height,pixelRatio:window.devicePixelRatio||1});if(Math.floor(t/180)!==Math.floor((t-dt*1000)/180))update();requestAnimationFrame(frame);}resumeOffer();update();requestAnimationFrame(frame);

function leaveGame(){checkpoint();if(s.wave>0)saveRecord(storage,s.wave);location.assign(new URL('../index.html',location.href));}
el('leave').onclick=()=>{if(s.status==='ready'||s.status==='lost')leaveGame();else el('leaveConfirm').showModal();};
el('stay').onclick=()=>{el('leaveConfirm').close();prev=0;acc=0;};el('leaveGame').onclick=leaveGame;
el('defeatMenu').onclick=leaveGame;

el('resume').onclick=()=>{
  const loaded=readRun(storage);
  if(!loaded.ok){savedRun=loaded;resumeOffer();return;}
  s=loaded.state;manualPause=true;hiddenPause=document.hidden;prev=0;acc=0;
  lastKills=s.kills;shownDefeat=false;lastSaveTime=performance.now();
  bossSeen=new WeakSet();lastMonumentHp=s.hp+s.shield;
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