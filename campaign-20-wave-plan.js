/* Denkmal TD2: isolated, deterministic twenty-wave campaign progression.
 * Deliberately not wired into production until legacy unlock and save tests migrate.
 */
(() => {
  'use strict';
  const chapterStarts=Object.freeze([1,21,41,61,81,101,121]);
  const bossTypes=Object.freeze(['boss','boss','uprooted','boss','boss','boss','boss']);
  const pools=Object.freeze([
    Object.freeze(['wraith','runner','brute','archer','guardian','sapper']),
    Object.freeze(['wraith','runner','brute','archer','guardian','sapper']),
    Object.freeze(['wraith','rootrunner','stoneguard','mistcaller','guardian','archer']),
    Object.freeze(['wraith','runner','guardian','archer','sapper','brute']),
    Object.freeze(['wraith','runner','guardian','archer','sapper','shadowwing','gargoyle','stormwing']),
    Object.freeze(['wraith','runner','guardian','archer','sapper','shadowwing','gargoyle','stormwing']),
    Object.freeze(['wraith','runner','guardian','archer','sapper','shadowwing','gargoyle','stormwing'])
  ]);
  const air=Object.freeze(['shadowwing','gargoyle','stormwing']);
  function chapter(level){
    if(!Number.isInteger(level)||level<1||level>7)return null;
    const firstWave=chapterStarts[level-1];
    return Object.freeze({level,firstWave,lastWave:firstWave+19,bossWaves:Object.freeze([firstWave+9,firstWave+19])});
  }
  function describe(level,wave,mode='campaign'){
    const c=chapter(level);
    if(!c||mode!=='campaign'||!Number.isInteger(wave)||wave<c.firstWave||wave>c.lastWave)return null;
    const localWave=wave-c.firstWave+1;
    const boss=localWave===10||localWave===20;
    // Keep the 4GB Android target bounded even for chapter seven.
    const count=Math.min(60,9+Math.floor((localWave-1)*1.35)+Math.floor((level-1)*1.2));
    const interval=Math.max(.38,.88-(localWave-1)*.022-(level-1)*.013);
    return Object.freeze({level,wave,localWave,boss,bossType:boss?bossTypes[level-1]:null,
      count,interval,firstWave:c.firstWave,lastWave:c.lastWave});
  }
  function enemyType(level,wave,index,mode='campaign'){
    const p=describe(level,wave,mode);
    if(!p||!Number.isInteger(index)||index<0||index>=p.count)return null;
    if(p.boss&&index===0)return p.bossType;
    const pool=pools[level-1];
    const unlocked=Math.min(pool.length,2+Math.floor((p.localWave-1)/3));
    let type=pool[(index+Math.floor(p.localWave/2))%unlocked];
    if(air.includes(type)&&p.localWave<4)type='wraith';
    return type;
  }
  globalThis.DenkmalCampaign20=Object.freeze({
    chapter,describe,enemyType,chapterStarts,bossTypes
  });
})();
