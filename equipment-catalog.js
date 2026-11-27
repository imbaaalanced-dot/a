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
  /* Loot-Stufe 4 Set-Boni: thematische Familien über feste Vorlagen.
     Stufen-Boni sind absolute Zuschläge auf der totals-Skala; totals-Obergrenzen greifen weiterhin. */
  const families={
    wacht:{name:'Wacht',desc:'Die alte Mauer hält zusammen.',members:['watch-hood','oath-coat','guard-boots'],tiers:{2:{defense:.05},3:{health:10}}},
    hainwald:{name:'Hainwald',desc:'Was wächst, hält zusammen.',members:['bark-coat','grove-gloves','root-boots'],tiers:{2:{speed:.05},3:{health:8}}},
    lichterwache:{name:'Lichterwache',desc:'Jedes Licht kennt das andere.',members:['memory-amulet','ward-amulet','sustain-ring'],tiers:{2:{health:8},3:{leech:.02}}},
    seelenecho:{name:'Seelenecho',desc:'Seelen rufen einander nach.',members:['echo-staff','soul-hood','bell-amulet'],tiers:{2:{crit:.05},3:{damage:8}}},
    glutpfad:{name:'Glutpfad',desc:'Wo Glut hingeht, bleibt Asche nicht zurück.',members:['ember-staff','ash-boots'],tiers:{2:{damage:6}}},
    steinwerk:{name:'Steinwerk',desc:'Baumeister und Bollwerk, ein Fundament.',members:['architect-hood','bastion-ring'],tiers:{2:{tower:.08}}},
    splitterkreis:{name:'Splitterkreis',desc:'Scharf bleibt scharf.',members:['splinter-staff','sight-ring'],tiers:{2:{crit:.04}}}
  };
  const familyIndex={};for(const [fam,def] of Object.entries(families))for(const id of def.members)familyIndex[id]=fam;
  for(const def of Object.values(families)){Object.freeze(def.members);Object.freeze(def.tiers);Object.freeze(def);}
  /* Level 2 (Labyrinth) and Level 7 (Westhofen) were playable without boss loot;
     pools keep every campaign map covered. Labyrinth leans defensive for early runs,
     Westhofen as the finale carries the only previously unpooled template. */
  const bossPools={1:['ember-staff','oath-coat','memory-amulet','watch-hood'],2:['watch-hood','light-coat','sustain-ring','guard-boots'],3:['bark-coat','root-boots','splinter-staff','grove-gloves'],4:['bell-amulet','ward-amulet','guard-boots','soul-hood'],5:['bastion-ring','architect-hood','light-coat','rift-gloves'],6:['echo-staff','sustain-ring','ash-boots','rune-gloves'],7:['sight-ring','bastion-ring','ward-amulet','ash-boots'],8:['bell-amulet','memory-amulet','oath-coat','soul-hood']};
  Object.values(bossPools).forEach(Object.freeze);
  const round=(key,value)=>Math.round(Math.min(caps[key],value)*(key==='damage'||key==='health'?1:1000))/(key==='damage'||key==='health'?1:1000);
  function choosePool(pool,owned){
    const counts=new Map();for(const item of owned)if(item.templateId)counts.set(item.templateId,(counts.get(item.templateId)||0)+1);
    const missing=Object.keys(templates).filter(id=>!counts.has(id));
    if(missing.length){const preferred=pool.filter(id=>!counts.has(id));return preferred.length?preferred:missing;}
    const min=Math.min(...pool.map(id=>counts.get(id)||0));return pool.filter(id=>(counts.get(id)||0)===min);
  }
  const enemyTypes=Object.freeze(['wraith','runner','brute','archer','guardian','sapper','rootrunner','stoneguard','mistcaller','shadowwing','gargoyle','stormwing']);
  function validEnemy(c){return !!c&&Number.isInteger(c.mapId)&&c.mapId>=1&&c.mapId<=8&&Number.isFinite(c.wave)&&c.wave>=1&&enemyTypes.includes(c.enemyType);}
  function rollEnemy(context,rng=Math.random,owned=[]){
    if(!validEnemy(context))return null;
    let values;try{values=Array.from({length:4},()=>rng());}catch{return null;}
    if(values.some(v=>typeof v!=='number'||!Number.isFinite(v)||v<0||v>=1))return null;
    const [typeRoll,rarityRoll,q1,q2]=values,pool=choosePool(Object.keys(templates),owned),templateId=pool[Math.floor(typeRoll*pool.length)],t=templates[templateId];
    const level=Math.min(30,Math.floor(context.wave)),rarity=rarityRoll<.75?'magic':'rare',rank=rarity==='magic'?1:2,stats={};
    t.keys.forEach((k,n)=>stats[k]=round(k,caps[k]*(.18+.018*level)*(1+.12*rank)*(.7+.3*[q1,q2][n])));
    return {templateId,slot:t.slot,name:t.name,rarity,level,power:rarity==='rare'?t.power:null,stats,baseStats:{...stats},upgradeRank:0,source:{kind:'enemy',mapId:context.mapId,wave:context.wave,enemyType:context.enemyType},favorite:false};
  }
  function rollBoss(context,rng=Math.random,owned=null){
    if(!context||!Object.hasOwn(bossPools,context.mapId)||!Number.isInteger(context.mapId)||!Number.isFinite(context.wave)||context.wave<1||context.bossType!==(context.mapId===3?'uprooted':'boss'))return null;
    let values;try{values=Array.from({length:5},()=>rng());}catch{return null;}
    if(values.some(v=>typeof v!=='number'||!Number.isFinite(v)||v<0||v>=1))return null;
    const [poolRoll,typeRoll,rarityRoll,q1,q2]=values,originalPool=poolRoll<.6?bossPools[context.mapId]:Object.keys(templates),pool=owned?choosePool(originalPool,owned):originalPool,templateId=pool[Math.floor(typeRoll*pool.length)],t=templates[templateId];
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
  globalThis.DenkmalEquipmentCatalog=Object.freeze({templates:Object.freeze(templates),bossPools:Object.freeze(bossPools),caps:Object.freeze(caps),families:Object.freeze(families),familyOf:id=>familyIndex[id]||null,rollBoss,rollEnemy,validEnemy,previewUpgrade});
})();
