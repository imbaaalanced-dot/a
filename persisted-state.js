/* Versioned localStorage envelopes for small, non-inventory browser saves. */
(function(root){
  'use strict';
  const copy=value=>JSON.parse(JSON.stringify(value));
  function create(storage){
    const snapshots=new Map();
    function load(key,version,defaults,validate,migrate){
      let raw;
      try{if(!storage)throw Error('storage unavailable');raw=storage.getItem(key)??null;}catch{return {status:'unavailable',value:copy(defaults),writable:false};}
      snapshots.set(key,raw);
      if(raw!==null){
        let envelope;
        try{envelope=JSON.parse(raw);}catch{return {status:'corrupt',value:copy(defaults),writable:false};}
        if(!envelope||typeof envelope!=='object'||envelope.schemaVersion!==version)return {status:'incompatible',value:copy(defaults),writable:false};
        if(!Number.isFinite(envelope.lastUpdated)||!validate(envelope.data))return {status:'corrupt',value:copy(defaults),writable:false};
        return {status:'ok',value:copy(envelope.data),writable:true};
      }
      try{
        const old=migrate?.(storage);
        if(old!==undefined){if(!validate(old))return {status:'corrupt',value:copy(defaults),writable:false};return {status:'legacy',value:copy(old),writable:true};}
      }catch{return {status:'unavailable',value:copy(defaults),writable:false};}
      return {status:'missing',value:copy(defaults),writable:true};
    }
    function save(key,version,value,validate){
      if(!validate(value)||!snapshots.has(key))return false;
      try{
        const raw=storage.getItem(key)??null;
        if(raw!==snapshots.get(key))return false;
        if(raw!==null){
          const envelope=JSON.parse(raw);
          if(!envelope||envelope.schemaVersion!==version||!Number.isFinite(envelope.lastUpdated)||!validate(envelope.data))return false;
        }
        const next=JSON.stringify({schemaVersion:version,lastUpdated:Date.now(),data:copy(value)});
        storage.setItem(key,next);snapshots.set(key,next);return true;
      }catch{return false;}
    }
    return {load,save};
  }
  const api={create};root.DenkmalPersistence=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
