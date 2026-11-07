/* Dedicated experimental test build. Never read or write production localStorage. */
(() => {
  'use strict';
  const memory=new Map();
  const isolated={
    get length(){return memory.size;},
    key(index){return Array.from(memory.keys())[index]??null;},
    getItem(key){key=String(key);return memory.has(key)?memory.get(key):null;},
    setItem(key,value){memory.set(String(key),String(value));},
    removeItem(key){memory.delete(String(key));},
    clear(){memory.clear();}
  };
  try {
    Object.defineProperty(window,'localStorage',{configurable:true,get:()=>isolated});
    if(window.localStorage!==isolated)throw Error('Preview storage not isolated');
  } catch (error) {
    window.stop();
    document.body.textContent='20-Wellen-Vorschau aus Sicherheitsgruenden gestoppt: Browser-Speicher konnte nicht isoliert werden.';
    throw error;
  }
  window.DenkmalCampaign20Preview=true;
  document.addEventListener('DOMContentLoaded',()=>{
    const menu=document.getElementById('startScreen');
    if(!menu)return;
    const notice=document.createElement('p');
    notice.id='twentyWavePreviewNotice';
    notice.setAttribute('role','status');
    notice.textContent='TESTVORSCHAU · 20 WELLEN JE LEVEL · BOSS IN WELLE 10 UND 20 · SEPARATER TESTSPIELSTAND (WIRD BEIM NEULADEN ZURUECKGESETZT)';
    notice.style.cssText='margin:8px auto;padding:9px 12px;max-width:570px;box-sizing:border-box;background:#1b2325;color:#eed69d;border:1px solid #b08b48;border-radius:8px;font:600 12px/1.5 system-ui,sans-serif;text-align:center;';
    menu.prepend(notice);
  });
})();
