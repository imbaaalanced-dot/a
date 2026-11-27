/* Level 8: Kriegerdenkmal Witten-Heven (Witten). Campaign waves 29-32 plus
   endless. Layout: two forest lanes merge in front of the memorial, the
   southern stair entrance joins from wave 30; air corridor from the north.
   Design: docs/WITTEN_HEVEN_LEVEL.md. Inspired gameplay, not surveyed paths. */
(()=>{'use strict';
 const air=['shadowwing','gargoyle','stormwing'];
 // Only the four campaign waves use the tuned chapter opening (counts may
 // exceed the legacy 48-cap, as on level 7). Wave 29 starts gently after L7.
 const opening={29:{count:40,interval:.58},30:{count:50,interval:.48},31:{count:56,interval:.42},32:{count:60,interval:.38}};
 // Per-wave stat modifiers, applied by game.js wavePlan dispatch.
 const mods={30:{armorAll:.05},31:{speedAll:1.06},32:{damageAll:1.08}};
 function campaignWave(wave,mode='campaign'){return mode==='campaign'&&opening[wave]||null;}
 function waveMods(wave,mode='campaign'){return mode==='campaign'&&mods[wave]||null;}
 function enemyType(wave,index,mode='campaign'){
  if(campaignWave(wave,mode)){
   if(wave===32&&index===0)return 'boss';
   if(wave>=30&&index%8===7)return air[Math.floor(index/8)%Math.min(3,wave-29)];
   const ground=wave===29?['wraith','wraith','runner']
    :wave===30?['wraith','runner','guardian']
    :wave===31?['wraith','runner','guardian','archer','brute']
    :['wraith','runner','guardian','archer','brute','sapper'];
   return ground[(index+wave)%ground.length];
  }
  if(wave%4===0&&index===0)return 'boss';
  if(index%6===3)return air[(Math.floor(index/6)+Math.max(0,wave-29))%Math.min(3,Math.max(1,wave-28))];
  const ground=wave>=31?['wraith','runner','guardian','archer','brute','sapper']
   :wave>=30?['wraith','runner','guardian','archer','brute']
   :['wraith','runner','guardian'];
  return ground[(index+wave)%ground.length];
 }
 const names={29:'NEBEL ÜBER HEVEN',30:'DIE VIER PFEILER',31:'STURM AUS DEM WALD',32:'DIE LETZTE WACHT'};
 const waveName=wave=>names[wave]||'WACHT AM DENKMAL VON HEVEN';
 const warning=(wave,mode='campaign')=>wave===29&&mode==='campaign'
  ?'BODENANGRIFF: WEST- UND OSTWEG · LUFT AB WELLE 30'
  :'LUFTANGRIFF AUS DEM NORDEN · BOGEN, MAGIE ODER RIFTLANZE BEREITHALTEN';
 globalThis.DenkmalWittenHeven={enemyType,waveName,warning,campaignWave,waveMods};
})();
