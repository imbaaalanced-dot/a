/* Fixed equipment identities. Pure rolls/previews; no DOM or storage access. */
(() => {
  'use strict';
  const caps={damage:40,health:100,haste:.25,speed:.2,defense:.18,crit:.12,leech:.04,tower:.15};
  const rows=[
    ['ember-staff','Abendrot','weapon','damage','health','ember'],
    ['echo-staff','Nachhall','weapon','damage','haste','echo'],
    ['splinter-staff','Splitterstab','weapon','damage','crit','splinter'],
    ['watch-hood','Wächterkapuze','head','health','defense'],
    ['soul-hood','Seherkapuze','head','health','crit'],
    ['architect-hood','Baumeisterkapuze','head','health','tower'],
    ['oath-coat','Steinwacht','armor','defense','health','oath'],
    ['bark-coat','Rindenmantel','armor','defense','speed','bark'],
    ['light-coat','Leichte Wächterrüstung','armor','health','haste'],
    ['rune-gloves','Runenhandschuhe','gloves','haste','crit'],
    ['rift-gloves','Rissfunke','gloves','haste','damage','chain'],
    ['grove-gloves','Hainhände','gloves','haste','health','grove'],
    ['ash-boots','Aschenläufer','boots','speed','crit','ash'],
    ['root-boots','Wurzelstiefel','boots','speed','health','roots'],
    ['guard-boots','Wachtstiefel','boots','speed','defense'],
    ['memory-amulet','Erinnerungslicht','amulet','health','defense','lantern'],
    ['bell-amulet','Letzte Glocke','amulet','damage','health','bell'],
    ['ward-amulet','Laternenamulett','amulet','damage','defense','wardlight'],
    ['sustain-ring','Lebenslicht','ring1','leech','health','sustain'],
    ['bastion-ring','Bollwerk','ring1','tower','defense','bastion'],
    ['sight-ring','Siegel des Scharfblicks','ring1','crit','damage']
  ];
  const templates=Object.fromEntries(rows.map(([id,name,slot,a,b,power=null])=>[id,Object.freeze({name,slot,keys:Object.freeze([a,b]),power})]));
  const bossPools={1:['ember-staff','oath-coat','memory-amulet','watch-hood'],3:['bark-coat','root-boots','splinter-staff','grove-gloves'],4:['bell-amulet','ward-amulet','guard-boots','soul-hood'],5:['bastion-ring','architect-hood','light-coat','rift-gloves'],6:['echo-staff','sustain-ring','ash-boots','rune-gloves']};
  Object.values(bossPools).forEach(Object.freeze);
  const round=(key,value)=>Math.round(Math.min(caps[key],value)*(key==='damage'||key==='health'?1:1000))/(key==='damage'||key==='health'?1:1000);
  function rollBoss(context,rng=Math.random){
    if(!context||!Object.hasOwn(bossPools,context.mapId)||!Number.isInteger(context.mapId)||!Number.isFinite(context.wave)||context.wave<1||context.bossType!==(context.mapId===3?'uprooted':'boss'))return null;
    let values;try{values=Array.from({length:5},()=>rng());}catch{return null;}
    if(values.some(v=>typeof v!=='number'||!Number.isFinite(v)||v<0||v>=1))return null;
    const [poolRoll,typeRoll,rarityRoll,q1,q2]=values,pool=poolRoll<.6?bossPools[context.mapId]:Object.keys(templates),templateId=pool[Math.floor(typeRoll*pool.length)],t=templates[templateId];
    const level=Math.min(30,Math.floor(context.wave)),rarity=rarityRoll<.8?'epic':'legendary',rank=rarity==='epic'?3:4,stats={};
    t.keys.forEach((k,n)=>stats[k]=round(k,caps[k]*(.18+.018*level)*(1+.12*rank)*(.7+.3*[q1,q2][n])));
    return {templateId,slot:t.slot,name:t.name,rarity,level,power:t.power,stats,baseStats:{...stats},upgradeRank:0,source:{mapId:context.mapId,wave:context.wave,bossType:context.bossType},favorite:false};
  }
  function previewUpgrade(item){
    const rank=item?.upgradeRank,stats={...item?.stats},nextRank=rank+1;
    if(!Number.isInteger(rank)||rank<0||rank>=3)return {allowed:false,reason:'Höchste Schmiedestufe',cost:0,nextRank:rank,stats};
    for(const [k,v]of Object.entries(item.baseStats||{}))stats[k]=Math.max(item.stats[k],round(k,v*(1+.05*nextRank)));
    const allowed=Object.keys(stats).some(k=>stats[k]>item.stats[k]);
    return {allowed,reason:allowed?'':'Keine weitere Werteverbesserung',cost:allowed?[50,100,150][rank]:0,nextRank,stats};
  }
  globalThis.DenkmalEquipmentCatalog=Object.freeze({templates:Object.freeze(templates),bossPools:Object.freeze(bossPools),caps:Object.freeze(caps),rollBoss,previewUpgrade});
})();
