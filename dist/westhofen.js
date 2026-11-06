/* Level 7: Kriegerdenkmal Westhofen (Schwerte, Reichshofstraße).
   Inspired gameplay, not surveyed paths. Independent of chapter numbering. */
(()=>{'use strict';
 const air=['shadowwing','gargoyle','stormwing'];
 // Only the four campaign waves use the gentler chapter opening.
 // Tuned for the merged street approach: junction towers cover both lanes,
 // so the counts/intervals run slightly above the Hohensyburg template.
 const opening={121:{count:38,interval:.62},122:{count:42,interval:.54},123:{count:46,interval:.46},124:{count:52,interval:.40},125:{count:56,interval:.38},126:{count:60,interval:.36},127:{count:64,interval:.34},128:{count:68,interval:.32},129:{count:72,interval:.30},130:{count:76,interval:.28},131:{count:80,interval:.26},132:{count:84,interval:.24},133:{count:88,interval:.22},134:{count:92,interval:.20},135:{count:96,interval:.18},136:{count:100,interval:.16},137:{count:104,interval:.14},138:{count:108,interval:.12},139:{count:112,interval:.10},140:{count:116,interval:.08}};
 function campaignWave(wave,mode='campaign'){return mode==='campaign'&&opening[wave]||null;}
 function enemyType(wave,index,mode='campaign'){
  if(campaignWave(wave,mode)){
   if(wave===140&&index===0)return 'boss';
   if(wave>=135&&index%8===7)return air[Math.floor(index/8)%Math.min(3,wave-121)];
   const ground=wave===121?['wraith','wraith','runner']:wave===122?['wraith','runner','guardian']:wave===123?['wraith','runner','guardian','archer']:['wraith','runner','guardian','archer','sapper'];
   return ground[(index+wave)%ground.length];
  }
  if((wave===130||wave===140)&&index===0)return 'boss';
  if(index%6===3)return air[(Math.floor(index/6)+Math.max(0,wave-121))%Math.min(3,Math.max(1,wave-120))];
  const ground=wave>=124?['wraith','runner','guardian','archer','sapper']:wave>=135?['wraith','runner','guardian','archer']:['wraith','runner','guardian'];
  return ground[(index+wave)%ground.length];
 }
 const names={121:'NEBEL AN DER REICHSHOFSTRASSE',125:'MITTELSTURM',130:'ERSTER BOSS',135:'STURM AUF DAS EHRENMAL',140:'ZWEITER BOSS'};
 const waveName=wave=>names[wave]||'WACHT AN DER REICHSHOFSTRASSE';
 const warning=(wave,mode='campaign')=>wave===121&&mode==='campaign'?'BODENANGRIFF: ZWEI STRASSENZULÄUFE · LUFTANGRIFF AB WELLE 122':'LUFTANGRIFF VON DER STRASSE · BOGEN, EIS ODER RIFTLANZE BEREITHALTEN';
 globalThis.DenkmalWesthofen={enemyType,waveName,warning,campaignWave};})();
