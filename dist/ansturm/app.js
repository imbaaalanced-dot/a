import {TECH,UPGRADES} from './config.js';import {createGame,getStats,quotePurchase,purchase,startGame,nextWave,step} from './model.js';import {renderArena} from './render.js?v=alpha15-3';import {readRecord,saveRecord} from './storage.js';import {sprite} from './sprites.js';
const el=id=>document.getElementById(id),canvas=el('game'),ctx=canvas.getContext('2d');let s=createGame(),tab='tech',manualPause=false,hiddenPause=false,prev=0,acc=0,shownDefeat=false,speed=1,soundOn=false,audioCtx=null,lastKills=0;const storage=(()=>{try{return localStorage}catch{return {getItem:()=>null,setItem:()=>{}}}})();
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
      b.addEventListener('click',()=>{if(purchase(s,id))update();});
      card.append(info,b);root.append(card);cardRefs.set(id,{level,b});
    }
  }
  for(const [id,{level,b}] of cardRefs){
    const icon=b.parentElement.querySelector('.shop-icon'),ictx=icon.getContext('2d');ictx.clearRect(0,0,64,64);sprite(ictx,`icon_${id}`,32,61,44,54);
    const q=quotePurchase(s,id),lv=tab==='tech'?s.tech[id]:s.upgrades[id];
    level.textContent=`Stufe ${lv}${tab==='upgrades'?'/3':''}`;
    b.textContent=q.reason==='Maximum'?'MAX':`🪙 ${q.price}`;
    b.disabled=!q.available;
  }
}
function update(){el('gold').textContent=Math.floor(s.gold);el('wave').textContent=s.wave;el('best').textContent=readRecord(storage);const st=getStats(s);el('hptext').textContent=`${Math.ceil(s.hp)} / ${st.maxHp} HP`;el('hpbar').style.width=`${Math.max(0,s.hp/st.maxHp*100)}%`;el('shieldtext').textContent=`🛡 ${Math.ceil(s.shield)}`;el('state').textContent=s.status==='ready'?'Bereit':s.status==='intermission'?`Baupause · ${Math.ceil(s.intermission)}s`:s.status==='lost'?'Denkmal gefallen':(manualPause||hiddenPause)?'Pausiert':`Welle ${s.wave} · ${s.enemies.length} Gegner`;el('speed').textContent=speed===2?'2× Tempo':'1× Tempo';el('speed').setAttribute('aria-pressed',String(speed===2));el('sound').textContent=soundOn?'🔊 Ton':'🔇 Ton';el('sound').setAttribute('aria-pressed',String(soundOn));el('pause').disabled=s.status==='ready'||s.status==='lost';el('pause').textContent=manualPause?'▶ Fortsetzen':'⏸ Pause';el('next').hidden=s.status!=='intermission';el('summary').textContent=tab==='tech'?`Schaden ${st.damage} · Tempo ${st.attacksPerSecond.toFixed(2)}/s · Gold ×${st.goldMultiplier.toFixed(1)}`:'Waffen wirken automatisch und bleiben nur bis zur Niederlage.';buttons();}
function tone(frequency=440){if(!soundOn)return;try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;if(!audioCtx)audioCtx=new Audio();if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});const o=audioCtx.createOscillator(),g=audioCtx.createGain(),now=audioCtx.currentTime;o.type='sine';o.frequency.value=frequency;g.gain.setValueAtTime(.035,now);g.gain.exponentialRampToValueAtTime(.001,now+.09);o.connect(g);g.connect(audioCtx.destination);o.start(now);o.stop(now+.1);}catch{soundOn=false;}}
function restart(){if(s.wave>0)saveRecord(storage,s.wave);s=createGame();manualPause=false;hiddenPause=document.hidden;shownDefeat=false;lastKills=0;acc=0;prev=0;renderedTab=null;el('defeat').close();el('intro').hidden=false;update();}
const portraitShop=window.matchMedia('(max-width:650px) and (orientation:portrait)');let shopOpen=false;
function syncShop(){const layout=document.querySelector('.layout'),toggle=el('shopToggle');layout.classList.toggle('portrait-shop-open',portraitShop.matches&&shopOpen);toggle.hidden=!portraitShop.matches;toggle.setAttribute('aria-expanded',String(portraitShop.matches&&shopOpen));toggle.textContent=shopOpen?'✕ Schließen':'⚙ Upgrades';}
el('shopToggle').onclick=()=>{shopOpen=!shopOpen;syncShop();};portraitShop.addEventListener('change',()=>{shopOpen=false;syncShop();});syncShop();
el('speed').onclick=()=>{speed=speed===1?2:1;acc=0;prev=0;update();};el('sound').onclick=()=>{soundOn=!soundOn;tone(650);update();};el('start').onclick=()=>{el('intro').hidden=true;startGame(s);prev=0;update();};el('pause').onclick=()=>{manualPause=!manualPause;acc=0;prev=0;update();};el('next').onclick=()=>{nextWave(s);update();};el('reset').onclick=()=>{if(s.status==='ready')restart();else el('confirm').showModal();};el('cancelRestart').onclick=()=>el('confirm').close();el('confirmRestart').onclick=()=>{el('confirm').close();restart();};el('again').onclick=restart;el('techTab').onclick=()=>{tab='tech';el('techTab').classList.add('selected');el('upgradeTab').classList.remove('selected');update();};el('upgradeTab').onclick=()=>{tab='upgrades';el('upgradeTab').classList.add('selected');el('techTab').classList.remove('selected');update();};document.addEventListener('visibilitychange',()=>{hiddenPause=document.hidden;prev=0;acc=0;update();});
function frame(t){const dt=prev?Math.min((t-prev)/1000,.1):0;prev=t;if(!manualPause&&!hiddenPause&&!el('confirm').open&&!el('leaveConfirm').open&&s.status!=='ready'&&s.status!=='lost'){acc=Math.min(.30,acc+dt*speed);let count=0;while(acc>=1/30&&count++<10){step(s,1/30);acc-=1/30;}}if(s.kills>lastKills){tone(580);lastKills=s.kills;}if(s.status==='lost'&&!shownDefeat){shownDefeat=true;saveRecord(storage,s.wave);el('result').textContent=`Welle ${s.wave} · ${s.kills} besiegte Gegner`;el('defeat').showModal();}if(s.status==='intermission' && s.wave > readRecord(storage))saveRecord(storage,s.wave);const r=canvas.getBoundingClientRect();renderArena(ctx,s,{width:r.width,height:r.height,pixelRatio:window.devicePixelRatio||1});if(Math.floor(t/180)!==Math.floor((t-dt*1000)/180))update();requestAnimationFrame(frame);}update();requestAnimationFrame(frame);

function leaveGame(){if(s.wave>0)saveRecord(storage,s.wave);location.assign(new URL('../index.html',location.href));}
el('leave').onclick=()=>{if(s.status==='ready'||s.status==='lost')leaveGame();else el('leaveConfirm').showModal();};
el('stay').onclick=()=>{el('leaveConfirm').close();prev=0;acc=0;};el('leaveGame').onclick=leaveGame;
el('defeatMenu').onclick=leaveGame;
