/* Procedural combat assets: no downloads, no runtime dependencies. */
(() => {
  'use strict';
  const MAX_PARTICLES = 240;
  const SPRITE_W=176,SPRITE_H=146;
  const spriteRows={cannon:0,rift:1,mage:2,bow:3};
  const projectileAtlas=typeof Image!=='undefined'?new Image():null;
  if(projectileAtlas)projectileAtlas.src='assets/projectile-fx-v3.svg';
  let audio, master, voices = 0;
  const lastSound = new Map();
  function unlock() {
    try {
      const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!AC) return;
      if (!audio) { audio = new AC(); master = audio.createGain(); master.gain.value = .65; master.connect(audio.destination); }
      if (audio.state === 'suspended') audio.resume().catch(() => {});
    } catch {}
  }
  function mute(muted) { if (master) master.gain.value = muted ? 0 : .65; }
  function sound(kind, impact, enabled) {
    if (!enabled || !audio || audio.state !== 'running' || voices >= 8) return;
    const key = kind + (impact ? ':hit' : ':shot'), now = audio.currentTime;
    if (now - (lastSound.get(key) ?? -1) < .055) return;
    lastSound.set(key, now);
    const heavy = kind === 'cannon' || kind === 'mortar', arrow = kind === 'bow' || kind === 'ballista';
    const duration = heavy ? .23 : impact ? .065 : .11;
    const osc = audio.createOscillator(), gain = audio.createGain();
    const frequency = (heavy ? 100 : arrow ? 650 : 460) * (.94 + Math.random() * .12);
    osc.type = heavy ? 'triangle' : arrow ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(frequency * (impact ? .65 : 1), now);
    osc.frequency.exponentialRampToValueAtTime(heavy ? 28 : arrow ? 170 : 800, now + duration);
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.exponentialRampToValueAtTime(heavy ? .16 : .045, now + .005);
    gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
    osc.connect(gain).connect(master); voices++;
    osc.onended = () => { voices--; osc.disconnect(); gain.disconnect(); };
    osc.start(now); osc.stop(now + duration);
  }
  function emit(game, x, y, color, count, smoke = false, reduced = false) {
    const n = Math.min(reduced ? Math.ceil(count / 3) : count, Math.max(0, MAX_PARTICLES - game.particles.length));
    for (let i = 0; i < n; i++) {
      const angle = Math.random() * Math.PI * 2, speed = smoke ? 18 + Math.random() * 30 : 40 + Math.random() * 100;
      const life = smoke ? .35 + Math.random() * .25 : .12 + Math.random() * .18;
      game.particles.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life,max:life,r:smoke?4+Math.random()*5:1+Math.random()*2,color,smoke});
    }
  }
  function burst(game, bullet, impact, enabled, reduced) {
    const heavy = bullet.kind === 'cannon' || bullet.kind === 'mortar';
    emit(game,bullet.x,bullet.y,bullet.color,heavy?10:4,false,reduced);
    if (heavy) emit(game,bullet.x,bullet.y,'#81776b',impact?9:5,true,reduced);
    if(impact&&spriteRows[bullet.kind]!==undefined&&game.particles.length<MAX_PARTICLES){
      const life=reduced?.16:.28;
      game.particles.push({x:bullet.x,y:bullet.y,vx:0,vy:0,life,max:life,r:22,color:bullet.color,spriteFx:true,kind:bullet.kind});
    }
    sound(bullet.kind,impact,enabled);
  }
  function drawSprite(ctx,kind,frame,x,y,angle=0,scale=1,alpha=1){
    const row=spriteRows[kind];
    if(row===undefined||!projectileAtlas?.complete||!projectileAtlas.naturalWidth)return false;
    const f=Math.max(0,Math.min(6,frame|0));
    ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.globalAlpha*=alpha;
    const w=70*scale,h=58*scale;
    ctx.drawImage(projectileAtlas,f*SPRITE_W,row*SPRITE_H,SPRITE_W,SPRITE_H,-w/2,-h/2,w,h);
    ctx.restore();return true;
  }
  function draw(ctx,b,reduced) {
    const kind=b.kind||'magic', level=b.level||1, arrow=kind==='bow'||kind==='ballista',heavy=kind==='cannon'||kind==='mortar';
    const travelFrame=1+(Math.floor(Math.max(0,1.1-(b.life??1.1))*12)%3);
    if(drawSprite(ctx,kind,travelFrame,b.x,b.y,Math.atan2(b.vy,b.vx),.8+level*.08,1))return;
    ctx.save();ctx.translate(b.x,b.y);ctx.rotate(Math.atan2(b.vy,b.vx));
    ctx.strokeStyle=b.color;ctx.fillStyle=b.color;ctx.lineWidth=1+level*.45;
    if (!reduced) { ctx.globalAlpha=.45;ctx.beginPath();ctx.moveTo(-5,0);ctx.lineTo(-12-level*5,0);ctx.stroke();ctx.globalAlpha=1; }
    if (arrow) {
      ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(7,0);ctx.stroke();
      ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(3,-3);ctx.lineTo(3,3);ctx.closePath();ctx.fill();
    } else {
      if (!heavy) {ctx.shadowBlur=reduced?0:8+level*2;ctx.shadowColor=b.color;}
      ctx.fillStyle=heavy?'#48443e':b.color;ctx.beginPath();ctx.arc(0,0,heavy?4+level*.5:b.r,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=heavy?'#b4a18a':'#eaffff';ctx.beginPath();ctx.arc(-1,-1,1.5,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }
  function drawParticle(ctx,p){
    if(!p?.spriteFx)return false;
    const progress=1-Math.max(0,p.life)/Math.max(.001,p.max);
    const frame=4+Math.min(2,Math.floor(progress*3));
    return drawSprite(ctx,p.kind,frame,p.x,p.y,0,1.05,Math.max(0,p.life/p.max));
  }
  globalThis.DenkmalCombatFX = {MAX_PARTICLES,unlock,mute,burst,draw,drawParticle};
})();
