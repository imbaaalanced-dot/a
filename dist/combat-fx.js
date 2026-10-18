/* Procedural combat assets: no downloads, no runtime dependencies. */
(() => {
  'use strict';
  // V4 alpha.4 FX pass: impact rings, directional debris, muzzle flashes and visible chain bolts.
  // Contracts kept from alpha.3: particle cap 240, damage text caps, 55 ms sound throttle,
  // 8-voice cap, no audio before the first user gesture, life===max on every particle.
  const MAX_PARTICLES = 240;
  const MAX_DAMAGE_TEXTS = 24, MAX_DAMAGE_TEXTS_REDUCED = 8;
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
    const heavy = bullet.kind === 'cannon' || bullet.kind === 'mortar';
    if (impact) {
      // Expanding shock ring marks the exact hit spot.
      const ringLife = reduced ? .22 : .34;
      push(game, {x:bullet.x,y:bullet.y,vx:0,vy:0,life:ringLife,max:ringLife,r:heavy?12:9,color:bullet.color,ring:true});
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
      if(bullet.kind==='cannon'&&globalThis.Style2Cannon?.drawImpact){
        const life=reduced?.17:.3;
        push(game,{x:bullet.x,y:bullet.y,vx:0,vy:0,life,max:life,r:0,color:bullet.color,cannonImpact:true,level:bullet.level||1});
      }
      if(['bow','mage','rift'].includes(bullet.kind)&&globalThis.Style2Towers?.drawImpact){
        const life=reduced?.15:.25;
        push(game,{x:bullet.x,y:bullet.y,vx:0,vy:0,life,max:life,r:0,color:bullet.color,style2Impact:true,kind:bullet.kind,level:bullet.level||1});
      }
      if (spriteRows[bullet.kind] !== undefined && (bullet.kind!=='cannon'||!globalThis.Style2Cannon?.drawImpact) && (!['bow','mage','rift'].includes(bullet.kind)||!globalThis.Style2Towers?.drawImpact) && game.particles.length < MAX_PARTICLES) {
        const life = reduced ? .16 : .28;
        game.particles.push({x:bullet.x,y:bullet.y,vx:0,vy:0,life,max:life,r:22,color:bullet.color,spriteFx:true,kind:bullet.kind});
      }
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
    game.damageTexts=list.filter(d=>d.life>0);
  }
  function drawDamage(ctx,game){
    for(const d of game?.damageTexts||[]){const t=Math.max(0,d.life/d.maxLife);const pop=Math.min(1,(d.maxLife-d.life)*12);const scale=.6+.4*pop;
    ctx.save();ctx.globalAlpha=Math.min(1,t*1.4);ctx.textAlign='center';ctx.font=d.crit?'800 18px sans-serif':'700 13px sans-serif';ctx.lineWidth=3;ctx.strokeStyle='#111a1dcc';ctx.fillStyle=d.crit?'#fff1a6':'#f3dfb1';
    ctx.translate(d.x,d.y);ctx.scale(scale,scale);ctx.strokeText(String(d.amount),0,0);ctx.fillText(String(d.amount),0,0);ctx.restore();}
  }
  const getContext=()=>audio,getMaster=()=>master;
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
    if(b.kind==='cannon'&&globalThis.Style2Cannon?.drawProjectile?.(ctx,b,reduced))return;
    if(globalThis.Style2Towers?.drawProjectile?.(ctx,b,reduced))return;
    const kind=b.kind||'magic', level=b.level||1, arrow=kind==='bow'||kind==='ballista',heavy=kind==='cannon'||kind==='mortar';
    const travelFrame=1+(Math.floor(Math.max(0,1.1-(b.life??1.1))*12)%3);
    if(drawSprite(ctx,kind,travelFrame,b.x,b.y,Math.atan2(b.vy,b.vx),.8+level*.08,1))return;
    ctx.save();ctx.translate(b.x,b.y);ctx.rotate(Math.atan2(b.vy,b.vx));
    ctx.strokeStyle=b.color;ctx.fillStyle=b.color;ctx.lineWidth=1+level*.45;
    // Motion streak grows with speed so fast shells read as fast.
    const streak=Math.min(26,8+Math.hypot(b.vx||0,b.vy||0)*.03);
    if (!reduced) { ctx.globalAlpha=.45;ctx.beginPath();ctx.moveTo(-5,0);ctx.lineTo(-streak-level*5,0);ctx.stroke();ctx.globalAlpha=1; }
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
    if(!p)return false;
    if(p.cannonImpact&&globalThis.Style2Cannon?.drawImpact?.(ctx,p))return true;
    if(p.style2Impact&&globalThis.Style2Towers?.drawImpact?.(ctx,p))return true;
    if(p.spriteFx){
      const progress=1-Math.max(0,p.life)/Math.max(.001,p.max);
      const frame=4+Math.min(2,Math.floor(progress*3));
      return drawSprite(ctx,p.kind,frame,p.x,p.y,0,1.05,Math.max(0,p.life/p.max));
    }
    const t=Math.max(0,Math.min(1,p.life/p.max));
    if(p.ring){
      const progress=1-t;
      ctx.save();ctx.globalAlpha=t*.75;ctx.strokeStyle=p.color;ctx.lineWidth=Math.max(1,3.2*t);
      ctx.beginPath();ctx.arc(p.x,p.y,p.r+progress*(p.max>.25?52:34),0,Math.PI*2);ctx.stroke();ctx.restore();
      return true;
    }
    if(p.flash){
      ctx.save();ctx.globalAlpha=t;ctx.fillStyle=p.color;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r*(.5+.5*t),0,Math.PI*2);ctx.fill();ctx.restore();
      return true;
    }
    if(p.bolt){
      ctx.save();ctx.globalAlpha=t;ctx.strokeStyle=p.color;ctx.lineWidth=p.r;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(p.x-p.vx*.05,p.y-p.vy*.05);ctx.lineTo(p.x+p.vx*.05,p.y+p.vy*.05);ctx.stroke();ctx.restore();
      return true;
    }
    if(p.muzzle){
      ctx.save();ctx.globalAlpha=t;ctx.strokeStyle=p.color;ctx.lineWidth=p.r;
      ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-p.vx*.05,p.y-p.vy*.05);ctx.stroke();ctx.restore();
      return true;
    }
    return false;
  }
  globalThis.DenkmalCombatFX = {MAX_PARTICLES,MAX_DAMAGE_TEXTS,unlock,mute,burst,bolt,damage,updateDamage,drawDamage,draw,drawParticle,getContext,getMaster};
})();
