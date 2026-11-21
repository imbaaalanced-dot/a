/* Procedural fallbacks for the one canonical Style-2 projectile family. */
(() => {
  'use strict';
  // V4 alpha.4 FX pass: impact rings, directional debris, muzzle flashes and visible chain bolts.
  // Contracts kept from alpha.3: particle cap 240, damage text caps, 55 ms sound throttle,
  // 8-voice cap, no audio before the first user gesture, life===max on every particle.
  const MAX_PARTICLES = 240;
  const MAX_DAMAGE_TEXTS = 24, MAX_DAMAGE_TEXTS_REDUCED = 8;
  let audio, master, voices = 0, noiseBuffer = null;
  const lastSound = new Map();
  // Compact, opt-in Marcel-only V2 FX atlas: 6 frames × 3 rows, 40 px per cell.
  // Loaded only when Marcel fires. Keep procedural effects for decode/HTTP failures.
  const STAFF_FX_FILE = 'assets/hero/marcel-staff-fx-v2-40.png?v=stafffx2';
  let staffImage = null, staffState = 'cold';
  const staffImpacts = new WeakSet(); // visual-only; never changes serializable simulation state
  function staffTexture() {
    if(staffState === 'cold'){
      staffState = 'loading';
      try {
        const image = new Image();
        image.onload = () => {
          if(image.naturalWidth === 240 && image.naturalHeight === 120){
            staffImage = image; staffState = 'ready';
          } else staffState = 'failed';
        };
        image.onerror = () => { staffState = 'failed'; };
        image.src = STAFF_FX_FILE;
      } catch { staffState = 'failed'; }
    }
    return staffState === 'ready' ? staffImage : null;
  }
  function drawStaffFrame(ctx,x,y,row,progress,angle=0,size=30){
    const atlas = staffTexture();
    if(!atlas || row<0 || row>2)return false;
    const frame = Math.max(0,Math.min(5,Math.floor(Math.max(0,Math.min(.999,progress))*6)));
    ctx.save();ctx.translate(x,y);ctx.rotate(angle);
    ctx.drawImage(atlas,frame*40,row*40,40,40,-size/2,-size/2,size,size);
    ctx.restore();return true;
  }
  function unlock() {
    try {
      const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!AC) return;
      if (!audio) { audio = new AC(); master = audio.createGain(); master.gain.value = .65*volumeScale; master.connect(audio.destination); }
      if (audio.state === 'suspended') audio.resume().catch(() => {});
    } catch {}
  }
  let volumeScale=1,mutedState=false;
  function mute(muted) { mutedState=!!muted; if (master) master.gain.value = mutedState ? 0 : .65*volumeScale; }
  function setVolume(volume) { volumeScale=Math.max(0,Math.min(1,volume)); if (master&&!mutedState) master.gain.value=.65*volumeScale; }
  function sound(kind, impact, enabled) {
    if (!enabled || !audio || audio.state !== 'running' || voices >= 8) return;
    const key = kind + (impact ? ':hit' : ':shot'), now = audio.currentTime;
    if (now - (lastSound.get(key) ?? -1) < .055) return;
    lastSound.set(key, now);
    const heavy = kind === 'cannon' || kind === 'mortar', arrow = kind === 'bow' || kind === 'ballista', magic = kind === 'magic' || kind === 'wand';
    const duration = heavy ? .23 : magic ? .14 : impact ? .065 : .11;
    const osc = audio.createOscillator(), gain = audio.createGain();
    const frequency = (heavy ? 100 : arrow ? 650 : magic ? 240 : 460) * (.94 + Math.random() * .12);
    osc.type = heavy ? 'triangle' : arrow ? 'sine' : magic ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(frequency * (impact ? .65 : 1), now);
    osc.frequency.exponentialRampToValueAtTime(heavy ? 28 : arrow ? 170 : magic ? 900 : 800, now + duration);
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.exponentialRampToValueAtTime(heavy ? .16 : .045, now + .005);
    gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
    osc.connect(gain).connect(master); voices++;
    osc.onended = () => { voices--; osc.disconnect(); gain.disconnect(); };
    osc.start(now); osc.stop(now + duration);
  }
  // #371: named procedural event sounds (UI, towers, waves, bosses, loot, outcome).
  // Same contracts as sound(): no audio before the unlock, shared voice cap,
  // per-name throttle, no throw on exotic/mocked AudioContexts.
  const noiseBufferReady = () => {
    if (typeof audio.createBuffer !== 'function' || typeof audio.createBiquadFilter !== 'function') return false;
    if (!noiseBuffer) {
      const length = Math.floor(audio.sampleRate * .5);
      noiseBuffer = audio.createBuffer(1, length, audio.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    }
    return true;
  };
  function sfxOsc(layer, now) {
    const osc = audio.createOscillator(), gain = audio.createGain();
    const detune = layer.rand ? .92 + Math.random() * .16 : 1;
    osc.type = layer.type || 'sine';
    osc.frequency.setValueAtTime(layer.f0 * detune, now + layer.at);
    if (layer.f1) osc.frequency.exponentialRampToValueAtTime(layer.f1 * detune, now + layer.at + layer.dur);
    gain.gain.setValueAtTime(.0001, now + layer.at);
    gain.gain.exponentialRampToValueAtTime(layer.vol, now + layer.at + (layer.hit || .006));
    gain.gain.exponentialRampToValueAtTime(.0001, now + layer.at + layer.dur);
    osc.connect(gain).connect(master); voices++;
    osc.onended = () => { voices--; osc.disconnect(); gain.disconnect(); };
    osc.start(now + layer.at); osc.stop(now + layer.at + layer.dur + .02);
  }
  function sfxNoise(layer, now) {
    if (!noiseBufferReady()) return;
    const src = audio.createBufferSource(), gain = audio.createGain(), filter = audio.createBiquadFilter();
    src.buffer = noiseBuffer; src.loop = true;
    filter.type = layer.filter || 'lowpass';
    filter.frequency.setValueAtTime(layer.f0, now + layer.at);
    if (layer.f1) filter.frequency.exponentialRampToValueAtTime(layer.f1, now + layer.at + layer.dur);
    filter.Q.value = layer.q || .8;
    gain.gain.setValueAtTime(.0001, now + layer.at);
    gain.gain.exponentialRampToValueAtTime(layer.vol, now + layer.at + (layer.hit || .004));
    gain.gain.exponentialRampToValueAtTime(.0001, now + layer.at + layer.dur);
    src.connect(filter); filter.connect(gain); gain.connect(master); voices++;
    src.onended = () => { voices--; src.disconnect(); filter.disconnect(); gain.disconnect(); };
    src.start(now + layer.at); src.stop(now + layer.at + layer.dur + .02);
  }
  const SFX = {
    gameStart: [{osc:1,type:'sine',f0:196,f1:392,dur:.5,vol:.05,hit:.09},{osc:1,type:'sine',f0:294,f1:588,at:.06,dur:.5,vol:.035,hit:.12},{noise:1,filter:'bandpass',f0:900,f1:2500,dur:.4,vol:.02,hit:.15}],
    waveLaunch: [{osc:1,type:'sine',f0:110,f1:55,dur:.22,vol:.14},{noise:1,f0:400,f1:120,dur:.16,vol:.12},{osc:1,type:'sine',f0:90,f1:45,at:.14,dur:.22,vol:.12}],
    bossSpawn: [{osc:1,type:'sawtooth',f0:58,f1:44,dur:1.1,vol:.06,hit:.3},{osc:1,type:'sawtooth',f0:63.5,f1:47,at:.05,dur:1.1,vol:.05,hit:.35},{noise:1,f0:220,f1:60,dur:1,vol:.04}],
    bossLoot: [{osc:1,type:'triangle',f0:392,dur:.14,vol:.07},{osc:1,type:'triangle',f0:523,at:.1,dur:.14,vol:.07},{osc:1,type:'triangle',f0:659,at:.2,dur:.16,vol:.07},{osc:1,type:'sine',f0:1047,at:.3,dur:.3,vol:.045,hit:.05}],
    enemyDie: [{osc:1,type:'triangle',f0:240,f1:70,dur:.18,vol:.05,rand:1},{noise:1,f0:800,f1:200,dur:.14,vol:.04}],
    towerBuild: [{osc:1,type:'triangle',f0:96,f1:52,dur:.16,vol:.11},{noise:1,f0:500,f1:150,dur:.12,vol:.09}],
    towerUpgrade: [{osc:1,type:'triangle',f0:262,dur:.09,vol:.06},{osc:1,type:'triangle',f0:330,at:.07,dur:.09,vol:.06},{osc:1,type:'triangle',f0:392,at:.14,dur:.12,vol:.065}],
    towerSell: [{osc:1,type:'triangle',f0:392,dur:.08,vol:.05},{osc:1,type:'triangle',f0:262,at:.07,dur:.1,vol:.05},{noise:1,filter:'highpass',f0:900,f1:300,dur:.1,vol:.03}],
    waveCleared: [{osc:1,type:'sine',f0:523,dur:.13,vol:.05},{osc:1,type:'sine',f0:659,at:.09,dur:.13,vol:.05},{osc:1,type:'sine',f0:784,at:.18,dur:.2,vol:.055}],
    victory: [{osc:1,type:'triangle',f0:392,dur:.14,vol:.06},{osc:1,type:'triangle',f0:523,at:.12,dur:.14,vol:.06},{osc:1,type:'triangle',f0:659,at:.24,dur:.14,vol:.06},{osc:1,type:'triangle',f0:784,at:.36,dur:.34,vol:.065},{noise:1,filter:'bandpass',f0:1200,f1:3200,at:.36,dur:.3,vol:.02,hit:.1}],
    defeat: [{osc:1,type:'sine',f0:220,f1:110,dur:.5,vol:.06,hit:.05},{osc:1,type:'sine',f0:165,f1:82,at:.4,dur:.6,vol:.06,hit:.05},{noise:1,f0:300,f1:80,dur:.9,vol:.035,hit:.25}],
    monumentHit: [{osc:1,type:'sine',f0:70,f1:40,dur:.25,vol:.1},{noise:1,f0:350,f1:100,dur:.18,vol:.07}],
    heroHurt: [{osc:1,type:'triangle',f0:190,f1:120,dur:.12,vol:.055,rand:1},{noise:1,f0:700,f1:250,dur:.1,vol:.035}],
    lootPickup: [{osc:1,type:'sine',f0:640,f1:960,dur:.07,vol:.04,rand:1}],
    lootItem: [{osc:1,type:'sine',f0:784,dur:.08,vol:.045},{osc:1,type:'sine',f0:1046,at:.06,dur:.1,vol:.04}],
    dodge: [{noise:1,filter:'bandpass',q:1.6,f0:300,f1:1800,dur:.16,vol:.05,hit:.02}],
    uiClick: [{osc:1,type:'square',f0:520,f1:430,dur:.05,vol:.03,rand:1}],
    uiToggle: [{osc:1,type:'square',f0:440,f1:560,dur:.07,vol:.035}]
  };
  const SFX_COOLDOWN = { monumentHit:.09, enemyDie:.05, heroHurt:.06, lootPickup:.03 };
  function sfx(name) {
    try {
      if (!audio || mutedState || voices >= 10 || audio.state !== 'running') return;
      const recipe = SFX[name];
      if (!recipe) return;
      const now = audio.currentTime;
      if (now - (lastSound.get(name) ?? -1) < (SFX_COOLDOWN[name] ?? .028)) return;
      lastSound.set(name, now);
      for (const layer of recipe) { if (layer.osc) sfxOsc(layer, now); else sfxNoise(layer, now); }
    } catch {}
  }
  function push(game, p) { if (game.particles.length >= MAX_PARTICLES) return false; game.particles.push(p); return true; }
  function emit(game, x, y, color, count, smoke = false, reduced = false) {
    const n = Math.min(reduced ? Math.max(1, Math.ceil(count / 3)) : count, Math.max(0, MAX_PARTICLES - game.particles.length));
    for (let i = 0; i < n; i++) {
      const angle = Math.random() * Math.PI * 2, speed = smoke ? 18 + Math.random() * 30 : 40 + Math.random() * 100;
      const life = smoke ? .35 + Math.random() * .25 : .12 + Math.random() * .18;
      game.particles.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life,max:life,r:smoke?4+Math.random()*5:1+Math.random()*2,color,smoke});
    }
  }
  function burst(game, bullet, impact, enabled, reduced) {
    sound(bullet.kind, impact, enabled);
    const heavy = bullet.kind === 'cannon' || bullet.kind === 'mortar';
    if (impact) {
      // Expanding shock ring marks the exact hit spot.
      const ringLife = reduced ? .22 : .34;
      const ring={x:bullet.x,y:bullet.y,vx:0,vy:0,life:ringLife,max:ringLife,r:heavy?12:9,color:bullet.color,ring:true};
      if(bullet.heroShot&&bullet.heroCharacter==='marcel'&&bullet.kind==='wand')staffImpacts.add(ring);
      push(game,ring);
      // Debris kicks back against the projectile direction, so hits read as directional.
      const dirX = Math.sign(bullet.vx || 0), dirY = Math.sign(bullet.vy || 0);
      const debris = reduced ? 6 : heavy ? 14 : 9;
      for (let i = 0; i < debris && game.particles.length < MAX_PARTICLES; i++) {
        const angle = Math.random() * Math.PI * 2, speed = 40 + Math.random() * 100;
        const life = .14 + Math.random() * .2;
        game.particles.push({x:bullet.x,y:bullet.y,vx:Math.cos(angle)*speed - dirX*(60+Math.random()*90),vy:Math.sin(angle)*speed - dirY*(60+Math.random()*90),life,max:life,r:1+Math.random()*2,color:bullet.color});
      }
      // White-hot core flash.
      const flashLife = reduced ? .07 : .12;
      push(game, {x:bullet.x,y:bullet.y,vx:0,vy:0,life:flashLife,max:flashLife,r:heavy?16:11,color:'#fff6df',flash:true});
      const userImpact=!!(globalThis.UserStyle2Towers?.enabled&&
        globalThis.UserStyle2Towers?.drawImpact&&
        ['bow','cannon','mage','rift','boomerang'].includes(bullet.kind));
      if(userImpact){
        const life=reduced?.16:.3;
        push(game,{x:bullet.x,y:bullet.y,vx:0,vy:0,life,max:life,r:0,
          color:bullet.color,kind:bullet.kind,level:bullet.level||1,
          reduced:!!reduced,userStyle2Impact:true});
      }
      // The existing ring, debris and core flash are the loading fallback.
      // Never add another tower theme's impact atlas as a second layer.
      if (heavy) emit(game, bullet.x, bullet.y, '#81776b', reduced ? 3 : 9, true, reduced);
      else emit(game, bullet.x, bullet.y, bullet.color, reduced ? 2 : 4, false, reduced);
    } else {
      // Muzzle flash travels along the firing direction.
      const len = Math.hypot(bullet.vx || 0, bullet.vy || 0) || 1, dirX = (bullet.vx || 1) / len, dirY = (bullet.vy || 0) / len;
      const n = reduced ? 2 : heavy ? 5 : 3;
      for (let i = 0; i < n && game.particles.length < MAX_PARTICLES; i++) {
        const spread = (Math.random() - .5) * .9, speed = 90 + Math.random() * 140, life = .08 + Math.random() * .1;
        game.particles.push({x:bullet.x,y:bullet.y,vx:(dirX*Math.cos(spread)-dirY*Math.sin(spread))*speed,vy:(dirX*Math.sin(spread)+dirY*Math.cos(spread))*speed,life,max:life,r:1.5+Math.random()*1.5,color:bullet.color,muzzle:true});
      }
      const flashLife = reduced ? .05 : .1;
      push(game, {x:bullet.x,y:bullet.y,vx:0,vy:0,life:flashLife,max:flashLife,r:heavy?12:8,color:'#fff6df',flash:true});
    }
    sound(bullet.kind, impact, enabled);
  }
  // Visible arc between chain-lightning targets so rift hits read as connected.
  function bolt(game, from, to, color, reduced) {
    if (!from || !to) return;
    const steps = reduced ? 4 : 8;
    const dirX = to.x - from.x, dirY = to.y - from.y, len = Math.hypot(dirX, dirY) || 1;
    for (let i = 0; i < steps; i++) {
      if (game.particles.length >= MAX_PARTICLES) return;
      const t = (i + Math.random() * .7) / steps;
      const life = .1 + Math.random() * .12;
      game.particles.push({x:from.x+dirX*t+(Math.random()-.5)*14,y:from.y+dirY*t+(Math.random()-.5)*14,vx:dirX/len*30,vy:dirY/len*30,life,max:life,r:1.5+Math.random()*1.5,color,bolt:true});
    }
  }
  function damage(game,x,y,amount,{crit=false,reduced=false}={}) {
    if(!game)return null;
    const list=game.damageTexts||(game.damageTexts=[]),cap=reduced?MAX_DAMAGE_TEXTS_REDUCED:MAX_DAMAGE_TEXTS;
    const value=Math.max(0,Math.round(Number(amount)||0));if(!value)return null;
    if(list.length>=cap){const target=list[list.length-1];target.amount+=value;target.crit=target.crit||crit;target.life=Math.max(target.life,.55);return target;}
    const item={x,y,amount:value,crit:!!crit,life:.72,maxLife:.72,vy:crit?-34:-25};list.push(item);return item;
  }
  function updateDamage(game,dt){
    const list=game?.damageTexts;if(!list)return;
    for(const d of list){d.y+=d.vy*dt;d.vy*=Math.pow(.9,dt*60);d.life-=dt;}
    {let w=0;for(let i=0;i<list.length;i++){if(list[i].life>0)list[w++]=list[i];}list.length=w;game.damageTexts=list;}
  }
  function drawDamage(ctx,game){
    // Hot path: once per damage text per frame. Avoid save()/restore()
    // state-stack churn; restore only the fields this function sets.
    const prevAlpha=ctx.globalAlpha,prevAlign=ctx.textAlign,prevFont=ctx.font,prevWidth=ctx.lineWidth,prevStroke=ctx.strokeStyle,prevFill=ctx.fillStyle;
    for(const d of game?.damageTexts||[]){const t=Math.max(0,d.life/d.maxLife);const pop=Math.min(1,(d.maxLife-d.life)*12);const scale=.6+.4*pop;
    ctx.globalAlpha=Math.min(1,t*1.4);ctx.textAlign='center';ctx.font=d.crit?'800 18px sans-serif':'700 13px sans-serif';ctx.lineWidth=3;ctx.strokeStyle='#111a1dcc';ctx.fillStyle=d.crit?'#fff1a6':'#f3dfb1';
    ctx.translate(d.x,d.y);ctx.scale(scale,scale);ctx.strokeText(String(d.amount),0,0);ctx.fillText(String(d.amount),0,0);
    ctx.scale(1/scale,1/scale);ctx.translate(-d.x,-d.y);}
    ctx.globalAlpha=prevAlpha;ctx.textAlign=prevAlign;ctx.font=prevFont;ctx.lineWidth=prevWidth;ctx.strokeStyle=prevStroke;ctx.fillStyle=prevFill;
  }
  const getContext=()=>audio,getMaster=()=>master;
  let viewZoom=.56;
  function setViewZoom(zoom){ viewZoom=zoom>0?zoom:.56; }
  function uiScale(){ return Math.min(1.6,Math.max(1,.56/viewZoom)); }

  function draw(ctx,b,reduced,heroCharacter=null) {
    const kind=b.kind||'magic', level=b.level||1, arrow=kind==='bow'||kind==='ballista',heavy=kind==='cannon'||kind==='mortar';
    const ui=uiScale();
    if(b.heroShot&&heroCharacter==='marcel'&&kind==='wand'&&
       drawStaffFrame(ctx,b.x,b.y,0,(Math.max(0,1.1-b.life)*4)%1,Math.atan2(b.vy,b.vx),30))return;
    ctx.save();ctx.translate(b.x,b.y);ctx.rotate(Math.atan2(b.vy,b.vx));
    ctx.strokeStyle=b.color;ctx.fillStyle=b.color;ctx.lineWidth=(1+level*.45)*ui;
    // Motion streak grows with speed so fast shells read as fast.
    const streak=Math.min(26,8+Math.hypot(b.vx||0,b.vy||0)*.03);
    if (!reduced) { ctx.globalAlpha=.45;ctx.beginPath();ctx.moveTo(-5,0);ctx.lineTo(-streak-level*5,0);ctx.stroke();ctx.globalAlpha=1; }
    if (arrow) {
      ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(7,0);ctx.stroke();
      ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(3,-3);ctx.lineTo(3,3);ctx.closePath();ctx.fill();
    } else {
      if (!heavy) {ctx.shadowBlur=reduced?0:(8+level*2)*ui;ctx.shadowColor=b.color;}
      ctx.fillStyle=heavy?'#48443e':b.color;ctx.beginPath();ctx.arc(0,0,heavy?4+level*.5:b.r*ui,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=heavy?'#b4a18a':'#eaffff';ctx.beginPath();ctx.arc(-1,-1,1.5,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }
  function drawParticle(ctx,p){
    // Hot path: called per particle per frame. Avoid save()/restore()
    // state-stack churn; restore only the fields each branch sets.
    if(!p)return false;
    if(staffImpacts.has(p)&&drawStaffFrame(ctx,p.x,p.y,2,1-Math.max(0,p.life/p.max),0,36))return true;
    if(p.userStyle2Impact&&globalThis.UserStyle2Towers?.drawImpact?.(ctx,p))return true;
    const t=Math.max(0,Math.min(1,p.life/p.max));
    if(p.ring){
      const progress=1-t;
      const prevAlpha=ctx.globalAlpha,prevStroke=ctx.strokeStyle,prevWidth=ctx.lineWidth;
      ctx.globalAlpha=t*.75;ctx.strokeStyle=p.color;ctx.lineWidth=Math.max(uiScale(),3.2*t);
      ctx.beginPath();ctx.arc(p.x,p.y,p.r+progress*(p.max>.25?52:34),0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha=prevAlpha;ctx.strokeStyle=prevStroke;ctx.lineWidth=prevWidth;
      return true;
    }
    if(p.flash){
      const prevAlpha=ctx.globalAlpha,prevFill=ctx.fillStyle;
      ctx.globalAlpha=t;ctx.fillStyle=p.color;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r*(.5+.5*t),0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=prevAlpha;ctx.fillStyle=prevFill;
      return true;
    }
    if(p.bolt){
      const prevAlpha=ctx.globalAlpha,prevStroke=ctx.strokeStyle,prevWidth=ctx.lineWidth,prevCap=ctx.lineCap;
      ctx.globalAlpha=t;ctx.strokeStyle=p.color;ctx.lineWidth=p.r;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(p.x-p.vx*.05,p.y-p.vy*.05);ctx.lineTo(p.x+p.vx*.05,p.y+p.vy*.05);ctx.stroke();
      ctx.globalAlpha=prevAlpha;ctx.strokeStyle=prevStroke;ctx.lineWidth=prevWidth;ctx.lineCap=prevCap;
      return true;
    }
    if(p.muzzle){
      const prevAlpha=ctx.globalAlpha,prevStroke=ctx.strokeStyle,prevWidth=ctx.lineWidth;
      ctx.globalAlpha=t;ctx.strokeStyle=p.color;ctx.lineWidth=p.r;
      ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-p.vx*.05,p.y-p.vy*.05);ctx.stroke();
      ctx.globalAlpha=prevAlpha;ctx.strokeStyle=prevStroke;ctx.lineWidth=prevWidth;
      return true;
    }
    return false;
  }
  globalThis.DenkmalCombatFX = {MAX_PARTICLES,MAX_DAMAGE_TEXTS,unlock,mute,burst,bolt,damage,updateDamage,drawDamage,draw,drawParticle,drawStaffFrame,getContext,getMaster,setViewZoom,uiScale,setVolume,sfx};
})();
