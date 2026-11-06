/* Level 5: Hohensyburg. Inspired gameplay, not surveyed paths. */
(()=>{'use strict';
 const air=['shadowwing','gargoyle','stormwing'];
 // Only the four campaign waves use the gentler chapter opening.
 const opening={81:{count:32,interval:.75},82:{count:38,interval:.60},83:{count:44,interval:.48},84:{count:48,interval:.40},85:{count:52,interval:.38},86:{count:56,interval:.36},87:{count:60,interval:.34},88:{count:64,interval:.32},89:{count:68,interval:.30},90:{count:72,interval:.28},91:{count:76,interval:.26},92:{count:80,interval:.24},93:{count:84,interval:.22},94:{count:88,interval:.20},95:{count:92,interval:.18},96:{count:96,interval:.16},97:{count:100,interval:.14},98:{count:104,interval:.12},99:{count:108,interval:.10},100:{count:112,interval:.08}};
 function campaignWave(wave,mode='campaign'){return mode==='campaign'&&opening[wave]||null;}
 function enemyType(wave,index,mode='campaign'){
  if(campaignWave(wave,mode)){
   if(wave===100&&index===0)return 'boss';
   if(wave>=95&&index%8===7)return air[Math.floor(index/8)%Math.min(3,wave-81)];
   const ground=wave===81?['wraith','wraith','runner']:wave===82?['wraith','runner','guardian']:wave===83?['wraith','runner','guardian','archer']:['wraith','runner','guardian','archer','sapper'];
   return ground[(index+wave)%ground.length];
  }
  if((wave===90||wave===100)&&index===0)return 'boss';
  if(index%6===3)return air[(Math.floor(index/6)+Math.max(0,wave-81))%Math.min(3,Math.max(1,wave-80))];
  const ground=wave>=84?['wraith','runner','guardian','archer','sapper']:wave>=95?['wraith','runner','guardian','archer']:['wraith','runner','guardian'];
  return ground[(index+wave)%ground.length];
 }
 const names={81:'NEBEL UEBER DEM SYBERG',85:'MITTELSTURM',90:'ERSTER BOSS',95:'FLUEGEL UEBER DEM HENGSTEYSEE',100:'ZWEITER BOSS'};
 const waveName=wave=>names[wave]||'WACHT UEBER DEM SYBERG';
 const warning=(wave,mode='campaign')=>wave===81&&mode==='campaign'?'BODENANGRIFF: ZWEI WALDWEGE · LUFTANGRIFF AB WELLE 82':'LUFTANGRIFF VOM STEILHANG: BOGEN, EIS ODER RIFTLANZE';
 globalThis.DenkmalHohensyburg={enemyType,waveName,warning,campaignWave};
})();
