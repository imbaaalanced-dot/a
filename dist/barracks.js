/* Denkmal TD2: bounded lane defenders. Style-2 atlas pending final visual QA. */
(() => {
  'use strict';
  const LEVELS=Object.freeze({
    1:Object.freeze({name:'Schwertmiliz',hp:65,damage:8,cooldown:1.2,reach:35,speed:73,recruit:13,max:1,body:'#795b3d'}),
    2:Object.freeze({name:'Speerträger',hp:105,damage:13,cooldown:1.35,reach:57,speed:69,recruit:12,max:2,body:'#777b80'}),
    3:Object.freeze({name:'Elite-Hellebardier',hp:150,damage:21,cooldown:1.7,reach:65,speed:64,recruit:14,max:2,body:'#4d535c'})
  });
  const MAX_ALLIES=10,LEASH=140,ALERT=165;
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
    return {owner:tower,level,x:tower.x,y:tower.y,r:12,hp:spec.hp,maxHp:spec.hp,rally,reach:spec.reach,attackCd:0,attackAnim:0,walkClock:0,aliveTime:0,mode:'walk'};
  }
  function update(game,dt,opts={}){
    if(!game||!Array.isArray(game.towers)||!Array.isArray(game.enemies)||!(dt>0))return;
    if(!Array.isArray(game.militia))game.militia=[];
    const paths=opts.paths||[];
    for(let i=game.militia.length-1;i>=0;i--){
      const u=game.militia[i];if(u.hp<=0||!game.towers.includes(u.owner)||u.owner.kind!=='barracks'||u.level!==u.owner.level)game.militia.splice(i,1);
    }
    for(const tower of game.towers){
      if(tower.kind!=='barracks')continue;
      const spec=LEVELS[tower.level]||LEVELS[1];
      tower.recruitCd=(tower.recruitCd??0)-dt;
      if(tower.recruitCd>0||game.militia.length>=MAX_ALLIES)continue;
      let owned=0;for(const u of game.militia)if(u.owner===tower)owned++;
      if(owned>=spec.max)continue;
      game.militia.push(makeUnit(tower,paths));tower.recruitCd=spec.recruit;
    }
    for(const u of game.militia){
      const spec=LEVELS[u.level];u.aliveTime+=dt;u.attackCd=Math.max(0,u.attackCd-dt);u.attackAnim=Math.max(0,u.attackAnim-dt);
      let target=null,nearest=Infinity;
      for(const e of game.enemies){
        if(e.dead||e.flying||distance(e,u.rally)>ALERT)continue;
        const d=distance(e,u);if(d<nearest){nearest=d;target=e;}
      }
      const desired=target&&distance(target,u.rally)<=LEASH?target:u.rally,d=distance(desired,u);
      if(target&&desired===target&&d<=spec.reach+(target.r||10)){
        u.mode='attack';if(u.attackCd<=0){u.attackCd=spec.cooldown;u.attackAnim=.52;opts.hurtEnemy?.(target,spec.damage,u);}
      }else if(d>2){
        u.mode='walk';const step=Math.min(spec.speed*dt,d);u.x+=(desired.x-u.x)/d*step;u.y+=(desired.y-u.y)/d*step;u.walkClock+=dt;
      }else u.mode='idle';
    }
  }
  function aggroTarget(game,enemy){
    if(!game||!game.militia||enemy.flying||enemy.focusMonument||enemy.type==='uprooted'||enemy.type==='sapper')return null;
    let best=null,bd=90;
    for(const ally of game.militia){if(ally.hp<=0)continue;const d=distance(enemy,ally);if(d<bd){bd=d;best=ally;}}
    return best;
  }
  function damageAlly(ally,amount){if(ally&&ally.hp>0&&Number.isFinite(amount)){ally.hp=Math.max(0,ally.hp-Math.max(0,amount));return ally.hp<=0;}return false;}
  function drawUnit(ctx,u){
    if(!ctx||!u)return false;
    const spec=LEVELS[u.level]||LEVELS[1],walk=u.mode==='walk'?Math.sin(u.walkClock*14)*3:0;
    ctx.save();ctx.translate(u.x,u.y);ctx.lineWidth=2;ctx.lineJoin='round';
    ctx.fillStyle='#07110f77';ctx.beginPath();ctx.ellipse(0,3,13,5,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#252221';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-5,-4);ctx.lineTo(-7+walk,1);ctx.moveTo(5,-4);ctx.lineTo(7-walk,1);ctx.stroke();
    ctx.fillStyle=spec.body;ctx.strokeStyle='#1b2224';ctx.lineWidth=2;ctx.fillRect(-9,-29,18,25);ctx.strokeRect(-9,-29,18,25);
    ctx.fillStyle=u.level===1?'#795c43':'#abb5ba';ctx.beginPath();ctx.arc(0,-35,7,0,7);ctx.fill();ctx.stroke();
    ctx.strokeStyle=u.level===3?'#b9a36b':'#c3c2bb';ctx.lineWidth=4;ctx.beginPath();
    if(u.level===1){ctx.moveTo(10,-23);ctx.lineTo(21+(u.attackAnim>0?7:0),-37+(u.attackAnim>0?9:0));}
    else if(u.level===2){ctx.moveTo(10,-17);ctx.lineTo(22+(u.attackAnim>0?14:0),-47+(u.attackAnim>0?10:0));}
    else{ctx.moveTo(10,-10);ctx.lineTo(26+(u.attackAnim>0?18:0),-49+(u.attackAnim>0?16:0));}
    ctx.stroke();ctx.fillStyle='#622c29';ctx.beginPath();ctx.arc(-10,-20,u.level===1?10:12,0,7);ctx.fill();ctx.strokeStyle='#a99370';ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle='#7acaae';ctx.fillRect(-15,-49,30*(u.hp/u.maxHp),3);
    ctx.restore();return true;
  }
  function drawTower(ctx,tower){
    if(!ctx||!tower||tower.kind!=='barracks')return false;
    const l=Math.max(1,Math.min(3,tower.level||1));
    ctx.save();ctx.translate(tower.x,tower.y);
    ctx.fillStyle='#07120f88';ctx.beginPath();ctx.ellipse(0,9,38,12,0,0,Math.PI*2);ctx.fill();
    ctx.lineWidth=2;ctx.strokeStyle='#252526';ctx.fillStyle=l===1?'#785237':'#5b5c5c';
    ctx.fillRect(-28,-35,56,42);ctx.strokeRect(-28,-35,56,42);
    ctx.beginPath();ctx.moveTo(-34,-35);ctx.lineTo(0,-64-(l===3?9:0));ctx.lineTo(34,-35);ctx.closePath();ctx.fillStyle=l===1?'#603d29':'#373f48';ctx.fill();ctx.stroke();
    ctx.fillStyle='#332a23';ctx.fillRect(-9,-25,18,32);ctx.strokeRect(-9,-25,18,32);
    if(l>=2){ctx.fillStyle='#777578';ctx.fillRect(16,-75,20,60);ctx.strokeRect(16,-75,20,60);for(let i=0;i<3;i++)ctx.fillRect(15+i*8,-83,6,10);}
    if(l>=3){ctx.fillStyle='#777578';ctx.fillRect(-39,-84,20,68);ctx.strokeRect(-39,-84,20,68);for(let i=0;i<3;i++)ctx.fillRect(-40+i*8,-91,6,10);ctx.strokeStyle='#be9553';ctx.strokeRect(-37,-82,17,67);}
    ctx.fillStyle='#953b2f';ctx.fillRect(-3,-51,7,19);ctx.restore();return true;
  }
  globalThis.DenkmalBarracks={LEVELS,MAX_ALLIES,nearestLanePoint,makeUnit,update,aggroTarget,damageAlly,drawUnit,drawTower};
})();
