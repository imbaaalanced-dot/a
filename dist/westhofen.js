/* Level 7: Kriegerdenkmal Westhofen (Schwerte, Reichshofstraße).
   Inspired gameplay, not surveyed paths. Independent of chapter numbering. */
(()=>{'use strict';
 const air=['shadowwing','gargoyle','stormwing'];
 // Only the four campaign waves use the gentler chapter opening.
 const opening={25:{count:34,interval:.70},26:{count:40,interval:.58},27:{count:46,interval:.48},28:{count:50,interval:.42}};
 function campaignWave(wave,mode='campaign'){return mode==='campaign'&&opening[wave]||null;}
 function enemyType(wave,index,mode='campaign'){
  if(campaignWave(wave,mode)){
   if(wave===28&&index===0)return 'boss';
   if(wave>=26&&index%8===7)return air[Math.floor(index/8)%Math.min(3,wave-25)];
   const ground=wave===25?['wraith','wraith','runner']:wave===26?['wraith','runner','guardian']:wave===27?['wraith','runner','guardian','archer']:['wraith','runner','guardian','archer','sapper'];
   return ground[(index+wave)%ground.length];
  }
  if(wave%4===0&&index===0)return 'boss';
  if(index%6===3)return air[(Math.floor(index/6)+Math.max(0,wave-25))%Math.min(3,Math.max(1,wave-24))];
  const ground=wave>=27?['wraith','runner','guardian','archer','sapper']:wave>=26?['wraith','runner','guardian','archer']:['wraith','runner','guardian'];
  return ground[(index+wave)%ground.length];
 }
 const names={25:'NEBEL AN DER REICHSHOFSTRASSE',26:'SCHATTEN DES GEFLÜGELTEN HELMS',27:'STURM AUF DAS EHRENMAL',28:'DIE LETZTE WACHT'};
 const waveName=wave=>names[wave]||'WACHT AN DER REICHSHOFSTRASSE';
 const warning=(wave,mode='campaign')=>wave===25&&mode==='campaign'?'BODENANGRIFF: ZWEI STRASSENZULÄUFE · LUFTANGRIFF AB WELLE 26':'LUFTANGRIFF VON DER STRASSE · BOGEN, EIS ODER RIFTLANZE BEREITHALTEN';
 globalThis.DenkmalWesthofen={enemyType,waveName,warning,campaignWave};})();
