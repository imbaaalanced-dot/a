/* Level 5: Hohensyburg. Inspired gameplay, not surveyed paths. */
(()=>{'use strict';
 const air=['shadowwing','gargoyle','stormwing'];
 function enemyType(wave,index){
  if(wave%4===0&&index===0)return 'boss';
  if(index%6===3)return air[(Math.floor(index/6)+Math.max(0,wave-17))%Math.min(3,Math.max(1,wave-16))];
  const ground=wave>=19?['wraith','runner','guardian','archer','sapper']:wave>=18?['wraith','runner','guardian','archer']:['wraith','runner','guardian'];
  return ground[(index+wave)%ground.length];
 }
 const names={17:'NEBEL UEBER DEM SYBERG',18:'SCHATTEN AN DER BRUESTUNG',19:'FLUEGEL UEBER DEM HENGSTEYSEE',20:'DIE LETZTE WACHT'};
 const waveName=wave=>names[wave]||'WACHT UEBER DEM SYBERG';
 const warning=()=>'LUFTANGRIFF VOM STEILHANG: BOGEN, EIS ODER RIFTLANZE';
 globalThis.DenkmalHohensyburg={enemyType,waveName,warning};
})();