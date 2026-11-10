/* Denkmal TD2: bounded lane defenders, one shared Style-2 atlas. */
(() => {
  'use strict';
  const LEVELS=Object.freeze({
    1:Object.freeze({name:'Schwertmiliz',hp:65,damage:8,cooldown:1.2,reach:35,speed:73,recruit:13,max:1,body:'#795b3d'}),
    2:Object.freeze({name:'Speerträger',hp:105,damage:13,cooldown:1.35,reach:57,speed:69,recruit:12,max:2,body:'#777b80'}),
    3:Object.freeze({name:'Elite-Hellebardier',hp:150,damage:21,cooldown:1.7,reach:65,speed:64,recruit:14,max:2,body:'#4d535c'})
  });
  const MAX_ALLIES=10,LEASH=140,ALERT=165;
  const ATLAS='assets/barracks/kasernen-atlas-96px.webp?v=barracks2';
  const STATES='assets/barracks/states-v1.webp?v=barracks1';
  // The existing image registry owns one decoded atlas across all towers/units.
  function atlas(){return globalThis.DenkmalAssets?.ready(ATLAS)||null;}
  function preload(){return globalThis.DenkmalAssets?.retain('barracks',[ATLAS,STATES]);}
  const distanceSq=(a,b)=>(a.x-b.x)**2+(a.y-b.y)**2;
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  function nearestLanePoint(tower,paths=[]){
    let best={x:tower.x,y:tower.y},bestD=Infinity;
    for(const path of paths)for(let i=1;i<path.length;i++){
      const a=path[i-1],b=path[i],dx=b.x-a.x,dy=b.y-a.y;
      const projection=Math.max(0,Math.min(1,((tower.x-a.x)*dx+(tower.y-a.y)*dy)/(dx*dx+dy*dy||1)));
      const p={x:a.x+dx*projection,y:a.y+dy*projection},d=(p.x-tower.x)**2+(p.y-tower.y)**2;
      if(d<bestD){bestD=d;best=p;}
    }
    return best;
  }
  function makeUnit(tower,paths){
    const level=Math.max(1,Math.min(3,Math.trunc(tower.level)||1)),spec=LEVELS[level],rally=nearestLanePoint(tower,paths);
    return {owner:tower,level,x:tower.x,y:tower.y,r:12,hp:spec.hp,maxHp:spec.hp,rally,reach:spec.reach,attackCd:0,attackAnim:0,walkClock:0,aliveTime:0,hitTime:0,deathTime:0,face:1,mode:'recruit'};
  }
  function update(game,dt,opts={}){
    if(!game||!Array.isArray(game.towers)||!Array.isArray(game.enemies)||!(dt>0))return;
    if(!Array.isArray(game.militia))game.militia=[];
    const paths=opts.paths||[];
    for(let i=game.militia.length-1;i>=0;i--){
      const u=game.militia[i];if(!game.towers.includes(u.owner)||u.owner.kind!=='barracks'){game.militia.splice(i,1);continue;}
      if(u.hp<=0){u.mode='death';u.deathTime+=dt;if(u.deathTime>=.65)game.militia.splice(i,1);continue;}
      if(u.level!==u.owner.level){const spec=LEVELS[u.owner.level]||LEVELS[1];u.hp=Math.max(1,u.hp/u.maxHp*spec.hp);u.maxHp=spec.hp;u.level=u.owner.level;u.reach=spec.reach;}
    }
    let active=0;for(const u of game.militia)if(u.hp>0)active++;
    for(const tower of game.towers){
      if(tower.kind!=='barracks')continue;
      const spec=LEVELS[tower.level]||LEVELS[1];
      tower.recruitCd=(tower.recruitCd??0)-dt;
      if(tower.recruitCd>0||active>=MAX_ALLIES)continue;
      let owned=0;for(const u of game.militia)if(u.owner===tower&&u.hp>0)owned++;
      if(owned>=spec.max)continue;
      game.militia.push(makeUnit(tower,paths));active++;tower.recruitCd=spec.recruit;
    }
    for(const u of game.militia){
      const spec=LEVELS[u.level];if(u.hp<=0)continue;u.aliveTime+=dt;u.hitTime=Math.max(0,u.hitTime-dt);if(u.aliveTime<.4){u.mode='recruit';continue;}u.attackCd=Math.max(0,u.attackCd-dt);u.attackAnim=Math.max(0,u.attackAnim-dt);
      let target=null,nearest=Infinity;
      for(const e of game.enemies){
        if(e.dead||e.flying||distanceSq(e,u.rally)>ALERT*ALERT)continue;
        const d=distanceSq(e,u);if(d<nearest){nearest=d;target=e;}
      }
      const desired=target&&distanceSq(target,u.rally)<=LEASH*LEASH?target:u.rally,d=distance(desired,u);
      if(Math.abs(desired.x-u.x)>1)u.face=desired.x<u.x?-1:1;
      if(target&&desired===target&&d<=spec.reach+(target.r||10)){
        u.mode='attack';if(u.attackCd<=0){u.attackCd=spec.cooldown;u.attackAnim=.52;opts.hurtEnemy?.(target,spec.damage,u);}
      }else if(d>2){
        u.mode='walk';const step=Math.min(spec.speed*dt,d);u.x+=(desired.x-u.x)/d*step;u.y+=(desired.y-u.y)/d*step;u.walkClock+=dt;
      }else u.mode='idle';
    }
  }
  function aggroTarget(game,enemy){
    if(!game||!game.militia||enemy.flying||enemy.focusMonument||enemy.type==='uprooted'||enemy.type==='sapper')return null;
    let best=null,bd=90*90;
    for(const ally of game.militia){if(ally.hp<=0)continue;const d=distanceSq(enemy,ally);if(d<bd){bd=d;best=ally;}}
    return best;
  }
  function damageAlly(ally,amount){if(ally&&ally.hp>0&&Number.isFinite(amount)){ally.hp=Math.max(0,ally.hp-Math.max(0,amount));if(amount>0)ally.hitTime=.18;return ally.hp<=0;}return false;}
  function animation(u){
    if(u.hp<=0)return 'death';if(u.aliveTime<.4)return 'recruit';if(u.hitTime>0)return 'hit';
    return u.mode==='attack'?'attack':u.mode==='walk'?'walk':'idle';
  }
  function drawUnit(ctx,u){
    if(!ctx||!u)return false;
    let img=atlas();if(!img)return true; // Never stack a canvas placeholder over art.
    const state=animation(u),attack=state==='attack';let row=(u.level-1)*2+(attack?1:0);
    const count=attack?(u.level===3?8:6):8;
    const clock=attack?Math.max(0,.52-u.attackAnim):u.walkClock;
    let frame=state==='walk'?Math.floor(clock*10)%count:attack?Math.min(count-1,Math.floor(clock/.52*count)):0;
    let cell=96,top=-51;
    const states=globalThis.DenkmalAssets?.ready(STATES);
    const authored=states&&['idle','hit','death','recruit'].includes(state);
    if(authored){
      img=states;cell=128;row=u.level-1;top=-48;
      frame=state==='idle'?Math.floor(u.aliveTime*2)%2:state==='hit'?(u.hitTime>.09?2:3):state==='death'?(u.deathTime<.25?4:5):(u.aliveTime<.2?6:7);
    }
    ctx.save();ctx.translate(u.x,u.y);ctx.scale(u.face||1,1);
    // Only one sprite blit per unit; base atlas transitions cover pending loads.
    if(state==='death'){const t=Math.min(1,u.deathTime/.65);ctx.globalAlpha*=1-t;if(!authored)ctx.rotate(t*1.3);}
    if(state==='recruit')ctx.globalAlpha*=Math.min(1,u.aliveTime/.4);
    if(state==='hit'&&!authored)ctx.translate(-3*(u.hitTime/.18),0);
    if(state==='idle'&&!authored)ctx.translate(0,Math.sin(u.aliveTime*2)*.4);
    ctx.drawImage(img,frame*cell,row*cell,cell,cell,-28,top,56,56);ctx.restore();
    if(u.hp>0){ctx.save();ctx.fillStyle='#211b1b';ctx.fillRect(u.x-15,u.y-54,30,3);ctx.fillStyle='#7acaae';ctx.fillRect(u.x-15,u.y-54,30*(u.hp/u.maxHp),3);ctx.restore();}
    return true;
  }
  function drawTower(ctx,tower){
    if(!ctx||!tower||tower.kind!=='barracks')return false;
    const img=atlas();if(!img)return true;
    const l=Math.max(1,Math.min(3,tower.level||1));
    ctx.drawImage(img,(l-1)*192,576,192,192,tower.x-48,tower.y-87,96,96);return true;
  }
  globalThis.DenkmalBarracks={LEVELS,MAX_ALLIES,ATLAS,STATES,preload,animation,nearestLanePoint,makeUnit,update,aggroTarget,damageAlly,drawUnit,drawTower};
})();
