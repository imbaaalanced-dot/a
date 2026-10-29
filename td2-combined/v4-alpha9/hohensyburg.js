/* Level 5: Hohensyburg. Inspired gameplay, not surveyed paths. */
(()=>{'use strict';
 const air=['shadowwing','gargoyle','stormwing'];
 // Only the four campaign waves use the gentler chapter opening.
 const opening={17:{count:32,interval:.75},18:{count:38,interval:.60},19:{count:44,interval:.48},20:{count:48,interval:.40}};
 function campaignWave(wave,mode='campaign'){return mode==='campaign'&&opening[wave]||null;}
 function enemyType(wave,index,mode='campaign'){
  if(campaignWave(wave,mode)){
   if(wave===20&&index===0)return 'boss';
   if(wave>=18&&index%8===7)return air[Math.floor(index/8)%Math.min(3,wave-17)];
   const ground=wave===17?['wraith','wraith','runner']:wave===18?['wraith','runner','guardian']:wave===19?['wraith','runner','guardian','archer']:['wraith','runner','guardian','archer','sapper'];
   return ground[(index+wave)%ground.length];
  }
  if(wave%4===0&&index===0)return 'boss';
  if(index%6===3)return air[(Math.floor(index/6)+Math.max(0,wave-17))%Math.min(3,Math.max(1,wave-16))];
  const ground=wave>=19?['wraith','runner','guardian','archer','sapper']:wave>=18?['wraith','runner','guardian','archer']:['wraith','runner','guardian'];
  return ground[(index+wave)%ground.length];
 }
 const names={17:'NEBEL UEBER DEM SYBERG',18:'SCHATTEN AN DER BRUESTUNG',19:'FLUEGEL UEBER DEM HENGSTEYSEE',20:'DIE LETZTE WACHT'};
 const waveName=wave=>names[wave]||'WACHT UEBER DEM SYBERG';
 const warning=(wave,mode='campaign')=>wave===17&&mode==='campaign'?'BODENANGRIFF: ZWEI WALDWEGE · LUFTANGRIFF AB WELLE 18':'LUFTANGRIFF VOM STEILHANG: BOGEN, EIS ODER RIFTLANZE';
 globalThis.DenkmalHohensyburg={enemyType,waveName,warning,campaignWave};
})();
