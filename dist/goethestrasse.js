/* Three ground lanes, one direct airborne approach. Independent of chapter numbering. */
(()=>{'use strict';
const air=['shadowwing','gargoyle','stormwing'];
function enemyType(wave,index){
 if(wave%4===0&&index===0)return 'boss';
 if(index%4===2)return air[(Math.floor(index/4)+Math.max(0,wave-21))%Math.min(3,Math.max(1,wave-20))];
 const ground=wave>=23?['wraith','runner','guardian','archer','sapper']:['wraith','runner','guardian'];
 return ground[index%ground.length];
}
const waveName=wave=>({21:'SCHWINGEN ÜBER DER GOETHESTRASSE',22:'DIE STEINERNEN ERWACHEN',23:'STURM ÜBER DEM EHRENMAL',24:'DIE LETZTE WACHT'}[wave]||'WACHT ÜBER DER GOETHESTRASSE');
const warning=wave=>'LUFTANGRIFF VON DER STRASSE · BOGEN, EIS ODER RIFTLANZE BEREITHALTEN';
globalThis.DenkmalGoethe={enemyType,waveName,warning};})();
