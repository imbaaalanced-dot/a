/* Pure Portalreise perk rules. Live combat, selection UI and storage bind in later tasks. */
(function(root){
  'use strict';
  const entries=[
    ['kraft','Kraft','hero',[.08,.16,.24]],
    ['ausdauer','Ausdauer','hero',[.10,.20,.30]],
    ['schritt','Schneller Schritt','hero',[.05,.10,.15]],
    ['erholung','Erholung','hero',[.03,.06,.09]],
    ['praezision','Präzision','tower',[.08,.16,.24]],
    ['reichweite','Reichweite','tower',[.05,.10,.15]],
    ['taktung','Taktung','tower',[.05,.10,.15]],
    ['engpass','Engpass','tower',[.08,.12,.16]],
    ['zielmarkierung','Zielmarkierung','shared',[.15,.25,.35]],
    ['deckung','Deckung','shared',[.05,.08,.11]],
    ['gegenstoss','Gegenstoß','shared',[.10,.18,.26]],
    ['waechterkreis','Wächterkreis','shared',[.05,.08,.11]]
  ];
  const catalog=Object.freeze(entries.map(([id,name,category,values])=>Object.freeze({id,name,category,values:Object.freeze(values)})));
  const byId=new Map(catalog.map(p=>[p.id,p]));
  function valid(ok){if(!ok)throw new TypeError('Invalid PortalPerks value');}
  const finite=n=>typeof n==='number'&&Number.isFinite(n)&&n>=0;
  function validateRanks(ranks){
    valid(ranks!==null&&typeof ranks==='object'&&!Array.isArray(ranks));
    for(const [id,rank] of Object.entries(ranks))valid(byId.has(id)&&Number.isInteger(rank)&&rank>=0&&rank<=3);
  }
  const rank=(r,id)=>Object.hasOwn(r,id)?r[id]:0;
  const value=(r,id)=>rank(r,id)?byId.get(id).values[rank(r,id)-1]:0;
  function offer(ranks,rngState,context){
    validateRanks(ranks);
    valid(Number.isInteger(rngState)&&rngState>=0&&rngState<=0xffffffff);
    valid(context&&['marcel','kim'].includes(context.heroId)&&Array.isArray(context.turretKinds));
    let state=rngState;
    // Full-period uint32 LCG, including a non-absorbing zero seed.
    function pick(pool){state=(Math.imul(state,1664525)+1013904223)>>>0;return pool[Math.floor(state/4294967296*pool.length)];}
    let pool=catalog.filter(p=>rank(ranks,p.id)<3);
    const useful=pool.filter(p=>p.category==='hero'||context.turretKinds.length>0);
    const ids=[];
    if(useful.length){const p=pick(useful);ids.push(p.id);pool=pool.filter(x=>x!==p);}
    while(ids.length<3&&pool.length){const p=pick(pool);ids.push(p.id);pool=pool.filter(x=>x!==p);}
    return {ids,rngState:state};
  }
  function choose(ranks,id){
    validateRanks(ranks);valid(byId.has(id)&&rank(ranks,id)<3);
    return {...ranks,[id]:rank(ranks,id)+1};
  }
  function derive(base,ranks){
    validateRanks(ranks);valid(base&&typeof base==='object');
    const rates={heroDamage:['kraft',8],maxHp:['ausdauer',10],moveSpeed:['schritt',5],towerDamage:['praezision',8],towerRange:['reichweite',5],towerAttackSpeed:['taktung',5]};
    const result={...base};
    for(const [stat,[id,percent]] of Object.entries(rates)){
      valid(finite(base[stat]));result[stat]=base[stat]*(100+rank(ranks,id)*percent)/100;valid(finite(result[stat]));
    }
    return {...result,extraHealFraction:value(ranks,'erholung'),slowFraction:value(ranks,'engpass'),slowSeconds:rank(ranks,'engpass')?1:0};
  }
  function areaModifiers(ranks,{withinTowerRange=false,towerWithinGuardianRadius=false}={}){
    validateRanks(ranks);
    return {incomingDamageMultiplier:1-(withinTowerRange?value(ranks,'deckung'):0),towerAttackSpeedMultiplier:1+(towerWithinGuardianRadius?value(ranks,'waechterkreis'):0)};
  }
  /** One shared state per hero/run; marks are keyed per target, cooldown is not per tower.
   * Caller applies slow with max(existingSlow,newSlow), never multiplying slows.
   * time is monotonic simulation time in seconds. Damage originating in a perk
   * neither triggers nor consumes another perk. All input objects are immutable.
   */
  function hitEffects(state,hit,ranks){
    validateRanks(ranks);
    valid(state&&typeof state==='object'&&hit&&['base','perk'].includes(hit.origin));
    valid(['hero','tower'].includes(hit.source)&&typeof hit.targetId==='string'&&hit.targetId.length>0&&finite(hit.time));
    const result={state,damageMultiplier:1,slowFraction:0,slowSeconds:0};
    if(hit.origin==='perk')return result;
    const marks=Object.create(null);
    for(const [id,expires] of Object.entries(state.marks||{}))if(finite(expires)&&expires>hit.time)marks[id]=expires;
    const next={marks,counterCharge:state.counterCharge===true,counterReadyAt:finite(state.counterReadyAt)?state.counterReadyAt:0};
    if(hit.source==='hero'){
      if(next.counterCharge){result.damageMultiplier+=value(ranks,'gegenstoss');next.counterCharge=false;}
      if(rank(ranks,'zielmarkierung'))marks[hit.targetId]=hit.time+2;
    }else{
      if(marks[hit.targetId]){result.damageMultiplier+=value(ranks,'zielmarkierung');delete marks[hit.targetId];}
      result.slowFraction=value(ranks,'engpass');result.slowSeconds=result.slowFraction?1:0;
      if(rank(ranks,'gegenstoss')&&!next.counterCharge&&hit.time>=next.counterReadyAt){next.counterCharge=true;next.counterReadyAt=hit.time+2;}
    }
    return {...result,state:next};
  }
  const api=Object.freeze({catalog,offer,choose,derive,areaModifiers,hitEffects});
  if(typeof module==='object'&&module.exports)module.exports=api;else root.PortalPerks=api;
})(globalThis);
