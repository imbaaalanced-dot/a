/* Level-scoped combat rules, independent of DOM and rendering. */
(() => {
  'use strict';
  function thornDamage(base,index){return index>=0&&index<3?base*.7**index:0;}
  function applyShieldDamage(enemy,damage){const shieldDamage=Math.min(Math.max(0,enemy.shield||0),damage);enemy.shield=Math.max(0,(enemy.shield||0)-shieldDamage);return {shieldDamage,hpDamage:Math.max(0,damage-shieldDamage)};}
  function tickSupport(enemies,dt){
    for(const e of enemies){if(e.dead)continue;e.shieldTime=Math.max(0,(e.shieldTime||0)-dt);if(e.shieldTime===0)e.shield=0;e.supportCd=Math.max(0,(e.supportCd||0)-dt);}
    for(const e of enemies){if(e.dead||e.type!=='mistcaller'||e.supportCd>0)continue;const targets=enemies.filter(o=>o!==e&&!o.dead&&o.hp>0&&!(o.shield>0)&&Math.hypot(o.x-e.x,o.y-e.y)<=180).sort((a,b)=>Math.hypot(a.x-e.x,a.y-e.y)-Math.hypot(b.x-e.x,b.y-e.y));if(targets.length){targets[0].shield=targets[0].maxHp*.25;targets[0].shieldTime=4;e.supportCd=8;}}
  }
  function tickBoss(e,dt){
    const phase=e.hp/e.maxHp<=.33?3:e.hp/e.maxHp<=.66?2:1,phaseChanged=phase>(e.phase||1);e.phase=Math.max(e.phase||1,phase);
    if(e.charge>0){e.charge=Math.max(0,e.charge-dt);if(e.charge===0){e.bossCd=6;return {attackDamage:e.damage,phaseChanged};}}
    else {e.bossCd=Math.max(0,(e.bossCd||0)-dt);if(e.bossCd===0){e.charge=2;e.chargeDamage=0;}}
    return {attackDamage:0,phaseChanged};
  }
  function registerBossHit(e,damage){if(e.charge>0){e.chargeDamage=(e.chargeDamage||0)+damage;if(e.chargeDamage>=e.maxHp*.08){e.charge=0;e.bossCd=6;e.interrupted=true;}}}
  globalThis.KirchendeCombat={thornDamage,applyShieldDamage,tickSupport,tickBoss,registerBossHit};
})();
