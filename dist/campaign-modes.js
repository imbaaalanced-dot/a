/* TD2 campaign progress and endless map access; local, versioned and fail-safe. */
(() => {
  'use strict';
  const KEY='denkmal-campaign-maps-v1';
  const maps=[{id:1,name:'VIER TORE',endWave:5},{id:2,name:'DAS LABYRINTH',endWave:8}];
  let completed=new Set(),records={};
  let available=true;
  try{
    const saved=JSON.parse(localStorage.getItem(KEY)||'{}');
    for(const id of saved.completed||[])if(maps.some(m=>m.id===id))completed.add(id);
    if(saved.records&&typeof saved.records==='object')for(const m of maps){
      const n=saved.records[m.id];
      if(Number.isSafeInteger(n)&&n>=0)records[m.id]=n;
    }
  }catch{available=false;}
  function persist(){try{localStorage.setItem(KEY,JSON.stringify({completed:[...completed],records}));available=true;return true;}catch{available=false;return false;}}
  function finish(id){if(!maps.some(m=>m.id===id))return false;completed.add(id);persist();return true;}
  function record(id,wave){if(!completed.has(id)||!Number.isSafeInteger(wave)||wave<0)return false;records[id]=Math.max(records[id]||0,wave);persist();return true;}
  function canPlayEndless(id){return completed.has(id);}
  function adoptLegacyLevel2(legacy){if(legacy&&!completed.has(1))finish(1);}
  globalThis.DenkmalCampaignModes={maps,finish,record,canPlayEndless,adoptLegacyLevel2,get completed(){return [...completed]},get records(){return {...records}},get storageAvailable(){return available}};
})();
