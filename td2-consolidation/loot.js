/* Persistent inventory model. No DOM; all management commands enforce menu origin. */
(() => {
  'use strict';
  const KEY='denkmal-loot-v1',BACKUP=KEY+'-backup',CAPACITY=30;
  const slots={weapon:'Waffe',head:'Kopf',armor:'Rüstung',gloves:'Handschuhe',boots:'Stiefel',amulet:'Amulett',ring1:'Ring I',ring2:'Ring II'};
  const rarities={common:{label:'Gewöhnlich',color:'#b9c1bd',rank:0},magic:{label:'Magisch',color:'#75baff',rank:1},rare:{label:'Selten',color:'#efd16f',rank:2},epic:{label:'Episch',color:'#c999ff',rank:3},legendary:{label:'Legendär',color:'#ffab61',rank:4}};
  const statInfo={damage:{label:'Stabschaden',max:40},health:{label:'Lebenspunkte',max:100},haste:{label:'Angriffstempo',max:.25,percent:true},speed:{label:'Lauftempo',max:.2,percent:true},defense:{label:'Schadensreduktion',max:.18,percent:true},crit:{label:'Kritische Treffer',max:.12,percent:true},leech:{label:'Lebensraub',max:.04,percent:true},tower:{label:'Turmschaden',max:.15,percent:true}};
  const powers={bark:{name:'Rindenmantel',desc:'8 % weniger erlittener Schaden.'},roots:{name:'Wurzelstiefel',desc:'+8 % Lauftempo.'},splinter:{name:'Splitterstab',desc:'Stab ignoriert 10 Prozentpunkte Rüstung.'},wardlight:{name:'Laternenamulett',desc:'+25 % Stabschaden gegen Schilde.'},grove:{name:'Hainkern',desc:'Jeder fünfte Stabtreffer erzeugt einen kleinen Flächenimpuls.'},ember:{name:'Abendrot',desc:'+25 % Stabschaden.'},echo:{name:'Nachhall',desc:'30 % kürzere Angriffspausen und zwei zusätzliche Seelenechos.'},oath:{name:'Steinwacht',desc:'25 % weniger erlittener Schaden.'},ash:{name:'Aschenläufer',desc:'+20 % Tempo und 30 % kürzere Ausweich-Abklingzeit.'},lantern:{name:'Erinnerungslicht',desc:'Seelenruf heilt 25 LP.'},bell:{name:'Letzte Glocke',desc:'+40 % Seelenruf-Schaden und +1 Seele pro besiegtem Feind.'},chain:{name:'Rissfunke',desc:'Stabgeschosse springen auf ein weiteres Ziel über.'},sustain:{name:'Lebenslicht',desc:'+3 % Lebensraub durch Stabgeschosse.'},bastion:{name:'Bollwerk',desc:'+15 % Turmschaden.'}};
  const bases={weapon:'Runenstab',head:'Wächterkapuze',armor:'Steinmantel',gloves:'Runenhandschuhe',boots:'Aschenstiefel',amulet:'Seelenamulett',ring1:'Siegelring',ring2:'Siegelring'};
  const copy=x=>JSON.parse(JSON.stringify(x));
  function totals(items){
    const s={damage:0,health:0,haste:0,speed:0,defense:0,crit:0,leech:0,tower:0,powers:{}};
    for(const item of items){for(const [k,v] of Object.entries(item.stats))s[k]+=v;if(item.power)s.powers[item.power]=true;}
    if(s.powers.bark)s.defense+=.08;if(s.powers.roots)s.speed+=.08;
    if(s.powers.sustain)s.leech+=.03;if(s.powers.bastion)s.tower+=.15;
    for(const [k,max] of Object.entries({damage:160,health:400,haste:.6,speed:.5,defense:.6,crit:.35,leech:.12,tower:.6}))s[k]=Math.min(max,s[k]);
    return s;
  }
  function starter(id,slot,power){return {id,slot,power,name:powers[power].name,rarity:'magic',level:1,stats:{},favorite:true};}
  function fresh(){const items=[starter('starter-ember','weapon','ember'),starter('starter-oath','armor','oath'),starter('starter-lantern','amulet','lantern')];return {version:2,level3:false,kirchendeCompleted:false,nextId:1,essence:0,items,bag:[],overflow:[],equipped:{weapon:'starter-ember',head:null,armor:'starter-oath',gloves:null,boots:null,amulet:'starter-lantern',ring1:null,ring2:null},milestones:[],level2:false};}
  function validateLegacy(p){
    const fail=()=>{throw Error('Ungültiger Spielstand');};
    if(!p||p.version!==2||typeof p.level3!=='boolean'||typeof p.kirchendeCompleted!=='boolean'||!Number.isSafeInteger(p.nextId)||p.nextId<1||p.nextId>1e9||!Number.isSafeInteger(p.essence)||p.essence<0||p.essence>1e9||typeof p.level2!=='boolean')fail();
    if(!Array.isArray(p.items)||p.items.length>8||!Array.isArray(p.bag)||p.bag.length>30||!Array.isArray(p.overflow)||p.overflow.length>100000||!p.equipped||Object.keys(p.equipped).length!==8||!Array.isArray(p.milestones)||p.milestones.some(x=>![3,4,8,12].includes(x))||new Set(p.milestones).size!==p.milestones.length)fail();
    const ids=new Set();
    for(const i of [...p.items,...p.bag,...p.overflow]){
      if(!i||typeof i.id!=='string'||!i.id||i.id.length>100||ids.has(i.id)||!Object.hasOwn(slots,i.slot)||!Object.hasOwn(rarities,i.rarity)||typeof i.name!=='string'||!i.name.trim()||i.name.length>100||!Number.isInteger(i.level)||i.level<1||i.level>30||typeof i.favorite!=='boolean'||!i.stats||Array.isArray(i.stats)||Object.keys(i.stats).length>8)fail();
      if(i.power!==null&&i.power!==undefined&&!Object.hasOwn(powers,i.power))fail();
      for(const [k,v] of Object.entries(i.stats))if(!Object.hasOwn(statInfo,k)||typeof v!=='number'||!Number.isFinite(v)||v<0||v>statInfo[k].max)fail();
      ids.add(i.id);
    }
    const equipped=new Set();
    for(const slot of Object.keys(slots)){const id=p.equipped[slot];if(id===null)continue;const i=p.items.find(x=>x.id===id);if(!i||equipped.has(id)||!fits(i,slot))fail();equipped.add(id);}
    if(equipped.size!==p.items.length)fail();
    return copy(p);
  }
  function fits(item,slot){return item.slot===slot||(item.slot.startsWith('ring')&&slot.startsWith('ring'));}
  const C=globalThis.DenkmalEquipmentCatalog;
  const PRE_MIGRATION=KEY+'-pre-v3',MAX_OWNED=100046,heroes=['marcel','kim'];
  const fail=()=>{throw Error('Ungültiger Spielstand');};
  const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
  function safeData(x,depth=0){
    if(depth>64)fail();
    if(x===null||typeof x==='string'||typeof x==='boolean')return;
    if(typeof x==='number'){if(!Number.isFinite(x))fail();return;}
    if(!object(x)&&!Array.isArray(x))fail();
    // JSON metadata keys remain data. Never merge them through prototype setters;
    // schema-owned fields below are checked with own-key validation.
    for(const v of Object.values(x))safeData(v,depth+1);
  }
  function checkStats(stats){
    if(!object(stats)||Object.keys(stats).length>8)fail();
    for(const [k,v]of Object.entries(stats))if(!Object.hasOwn(statInfo,k)||typeof v!=='number'||!Number.isFinite(v)||v<0||v>statInfo[k].max)fail();
  }
  function checkItem(i){
    if(!object(i)||typeof i.id!=='string'||!i.id||i.id.length>100||!Object.hasOwn(slots,i.slot)||!Object.hasOwn(rarities,i.rarity)||typeof i.name!=='string'||!i.name.trim()||i.name.length>100||!Number.isInteger(i.level)||i.level<1||i.level>30||typeof i.favorite!=='boolean')fail();
    if(i.power!==null&&i.power!==undefined&&!Object.hasOwn(powers,i.power))fail();
    checkStats(i.stats);checkStats(i.baseStats);
    if(!Number.isInteger(i.upgradeRank)||i.upgradeRank<0||i.upgradeRank>3)fail();
    const keys=Object.keys(i.stats).sort();if(keys.join()!==Object.keys(i.baseStats).sort().join())fail();
    const expected=i.upgradeRank===0?i.baseStats:C.previewUpgrade({...i,stats:i.baseStats,upgradeRank:i.upgradeRank-1}).stats;
    for(const k of keys)if(i.stats[k]!==expected[k])fail();
    if(i.legacy!==true){
      const t=C.templates[i.templateId];
      if(!t||i.name!==t.name||i.slot!==t.slot||i.power!==t.power||keys.join()!==[...t.keys].sort().join()||!['epic','legendary'].includes(i.rarity))fail();
      const source=i.source;
      if(!object(source)||!Object.hasOwn(C.bossPools,source.mapId)||!Number.isInteger(source.mapId)||source.bossType!==(source.mapId===3?'uprooted':'boss')||!Number.isFinite(source.wave)||source.wave<1||i.level!==Math.min(30,Math.floor(source.wave)))fail();
    }
  }
  function validateProfile(p){
    safeData(p);
    if(!object(p)||p.version!==3||!Number.isSafeInteger(p.nextId)||p.nextId<1||p.nextId>1e9||!Number.isSafeInteger(p.essence)||p.essence<0||p.essence>1e9||!['level2','level3','kirchendeCompleted'].every(k=>typeof p[k]==='boolean'))fail();
    if(!Array.isArray(p.owned)||p.owned.length>MAX_OWNED||!object(p.loadouts)||Object.keys(p.loadouts).sort().join()!=='kim,marcel'||!Array.isArray(p.milestones)||p.milestones.some(x=>![3,4,8,12].includes(x))||new Set(p.milestones).size!==p.milestones.length)fail();
    const index=new Map();for(const i of p.owned){checkItem(i);if(index.has(i.id))fail();index.set(i.id,i);}
    for(const hero of heroes){
      const worn=p.loadouts[hero],used=new Set();if(!object(worn)||Object.keys(worn).sort().join()!==Object.keys(slots).sort().join())fail();
      for(const [slot,id]of Object.entries(worn)){if(id===null)continue;const item=index.get(id);if(!item||used.has(id)||!fits(item,slot))fail();used.add(id);}
    }
    return copy(p);
  }
  function migrate(p){
    if(p.version===1){p={...p,version:2,level3:false,kirchendeCompleted:false};}
    const old=validateLegacy(p);
    return validateProfile({version:3,nextId:old.nextId,essence:old.essence,level2:old.level2,level3:old.level3,kirchendeCompleted:old.kirchendeCompleted,milestones:old.milestones,
      owned:[...old.items,...old.bag,...old.overflow].map(i=>({...i,legacy:true,baseStats:copy(i.stats),upgradeRank:0})),loadouts:{marcel:copy(old.equipped),kim:copy(old.equipped)}});
  }
  function decode(text){
    const e=JSON.parse(text);safeData(e);
    if(e.format!=='denkmal-loot'||![1,2,3].includes(e.version)||e.profile?.version!==e.version)fail();
    const profile=e.version===3?validateProfile(e.profile):migrate(e.profile),pending=e.pendingRewards||[],ids=new Set(profile.owned.map(i=>i.id)),tokens=new Set();
    if(!Array.isArray(pending))fail();
    for(const reward of pending){
      if(!object(reward)||!rewardIdentity(reward)||reward.item?.id!==rewardIdentity(reward)||ids.has(reward.item.id)||tokens.has(reward.item.id))fail();
      checkItem(reward.item);tokens.add(reward.item.id);
    }
    return {profile,pending:copy(pending),old:e.version<3?text:null};
  }
  function rewardIdentity(r){
    if(!r||!['runId','spawnId'].every(k=>typeof r[k]==='string'&&/^[a-zA-Z0-9_-]+$/.test(r[k])))return null;
    const id='boss-'+r.runId+'-'+r.spawnId;return id.length<=100?id:null;
  }
  function create({storage,rng=Math.random,canManage=()=>true,getHero=()=>'marcel'}={}){
    if(storage===undefined){try{storage=globalThis.localStorage;}catch{}}
    let profile=migrate(fresh()),status='',readOnly=false,recoveryRequired=false,lastRaw=null,preSource=null,pending=[];
    const claimed=new Set();
    try{
      lastRaw=storage?.getItem(KEY)||null;
      if(lastRaw){
        try{const d=decode(lastRaw);profile=d.profile;preSource=d.old;pending=d.pending;}
        catch{
          let e;try{e=JSON.parse(lastRaw);}catch{}
          if(e?.version!==undefined&&![1,2,3].includes(e.version)){readOnly=true;status='Neuere Speicherversion erkannt. Export sichern und passende Spielversion öffnen.';}
          else try{const d=decode(storage?.getItem(BACKUP));profile=d.profile;preSource=d.old;pending=d.pending;status='Spielstand aus Sicherung wiederhergestellt.';}catch{readOnly=true;status='Spielstand beschädigt. Rohsicherung exportieren oder gültige Sicherung importieren.';}
        }
      }
    }catch{status='Speichern blockiert: Fortschritt gilt nur für diese Sitzung. Bitte exportieren.';}
    const raw=()=>JSON.stringify({format:'denkmal-loot',version:3,profile,...(pending.length?{pendingRewards:pending}:{})});
    const find=id=>profile.owned.find(i=>i.id===id);
    const wornIds=()=>new Set(heroes.flatMap(h=>Object.values(profile.loadouts[h])).filter(Boolean));
    function writable(){
      if(readOnly)return false;
      try{if((storage?.getItem(KEY)||null)!==lastRaw){readOnly=true;status='Spielstand in einem anderen Tab geändert. Bitte exportieren und neu laden.';return false;}}catch{}
      return true;
    }
    function save(){
      if(!writable())return false;
      try{
        if(!storage)throw Error('storage');
        if(preSource){
          const backup=storage.getItem(PRE_MIGRATION);
          if(backup){try{const parsed=JSON.parse(backup);if(![1,2].includes(parsed.version))throw Error('pre-v3');decode(backup);}catch{recoveryRequired=true;status='Vorherige Versionssicherung ungültig. Bitte beide Rohsicherungen exportieren. Fortschritt gilt nur für diese Sitzung.';return false;}}
          else storage.setItem(PRE_MIGRATION,preSource);
        }
        if(lastRaw){let valid=false;try{decode(lastRaw);valid=true;}catch{}if(valid)storage.setItem(BACKUP,lastRaw);}
        const next=raw();storage.setItem(KEY,next);lastRaw=next;preSource=null;
        recoveryRequired=false;status='';return true;
      }catch{status='Speichern nicht möglich: Fortschritt gilt nur für diese Sitzung. Bitte exportieren.';return false;}
    }
    function view(hero=getHero()){
      if(!heroes.includes(hero))return null;
      const ids=wornIds(),free=profile.owned.filter(i=>!ids.has(i.id));
      return copy({items:profile.owned.filter(i=>Object.values(profile.loadouts[hero]).includes(i.id)),bag:free.slice(0,CAPACITY),overflow:free.slice(CAPACITY),equipped:profile.loadouts[hero],all:profile.owned});
    }
    function validateImport(text){if(typeof text!=='string'||text.length>15000000)throw Error('Datei zu groß');return decode(text).profile;}
    function importJSON(text){
      if(!canManage())return false;
      // An explicitly imported recovery may replace corrupt/future data, never a newer tab.
      try{if((storage?.getItem(KEY)||null)!==lastRaw){readOnly=true;status='Spielstand in einem anderen Tab geändert. Bitte exportieren und neu laden.';return false;}}catch{}
      if(readOnly&&status.includes('anderen Tab'))return false;
      let d;try{validateImport(text);d=decode(text);}catch{return false;}
      profile=d.profile;pending=d.pending;preSource=preSource||d.old;readOnly=false;retryPending();save();return true;
    }
    function setFlag(key){if(!writable())return false;profile[key]=true;save();return true;}
    function commit(next){try{next=validateProfile(next);}catch{return false;}profile=next;save();return true;}
    const manage=()=>canManage()&&writable();
    function equip(id,slot,hero=getHero()){
      if(!manage()||!heroes.includes(hero))return false;
      const item=find(id);slot=slot||item?.slot;
      if(!item||!Object.hasOwn(slots,slot)||!fits(item,slot)||Object.values(profile.loadouts[hero]).includes(id))return false;
      const next=copy(profile);next.loadouts[hero][slot]=id;return commit(next);
    }
    function unequip(slot,hero=getHero()){
      if(!manage()||!heroes.includes(hero)||!Object.hasOwn(slots,slot)||!profile.loadouts[hero][slot])return false;
      const next=copy(profile);next.loadouts[hero][slot]=null;return commit(next);
    }
    function favorite(id){if(!manage()||!find(id))return false;const next=copy(profile),item=next.owned.find(i=>i.id===id);item.favorite=!item.favorite;return commit(next);}
    const salvageValue=i=>5+rarities[i.rarity].rank*8+i.level;
    const removable=i=>!i.favorite&&!wornIds().has(i.id);
    function salvagePreview(){const items=profile.owned.filter(removable);return {count:items.length,essence:items.reduce((n,i)=>n+salvageValue(i),0)};}
    function salvage(id){
      if(!manage())return false;const item=find(id);if(!item||!removable(item))return false;
      const next=copy(profile);next.owned=next.owned.filter(i=>i.id!==id);next.essence=Math.min(1e9,next.essence+salvageValue(item));const ok=commit(next);if(ok)retryPending();return ok;
    }
    function salvageAll(){
      if(!manage())return false;const preview=salvagePreview();if(!preview.count)return false;
      const next=copy(profile);next.owned=next.owned.filter(i=>!removable(i));next.essence=Math.min(1e9,next.essence+preview.essence);const ok=commit(next);if(ok)retryPending();return ok;
    }
    function upgradePreview(id){
      const item=find(id);if(!item)return {allowed:false,reason:'Gegenstand fehlt',cost:0,nextRank:0,stats:{}};
      const p=C.previewUpgrade(item);
      if(!removable(item))return {...p,allowed:false,reason:'Favorisiert oder bei einem Helden angelegt'};
      if(profile.essence<p.cost)return {...p,allowed:false,reason:'Nicht genug Schmiedessenz'};
      return p;
    }
    function upgrade(id){
      if(!manage())return false;const p=upgradePreview(id);if(!p.allowed)return false;
      const next=copy(profile),item=next.owned.find(i=>i.id===id);item.stats=p.stats;item.upgradeRank=p.nextRank;next.essence-=p.cost;return commit(next);
    }
    function retryPending(){
      let granted=0,persisted=false;
      if(!writable())return {granted,pending:pending.length,persisted};
      while(pending.length&&profile.owned.length<MAX_OWNED){
        const reward=pending[0];
        if(find(reward.item.id)){claimed.add(reward.item.id);pending.shift();continue;}
        const next=copy(profile);next.owned.push(copy(reward.item));
        try{profile=validateProfile(next);}catch{break;}
        pending.shift();claimed.add(reward.item.id);granted++;
      }
      if(granted)persisted=save();
      return {granted,pending:pending.length,persisted};
    }
    function claimBoss(request){
      const id=rewardIdentity(request);
      if(!id||!Object.hasOwn(C.bossPools,request.mapId)||!Number.isInteger(request.mapId)||request.bossType!==(request.mapId===3?'uprooted':'boss')||!Number.isFinite(request.wave)||request.wave<1)return {state:'rejected',item:null,persisted:false};
      if(claimed.has(id)||find(id))return {state:'duplicate',item:null,persisted:false};
      let candidate=pending.find(r=>r.item.id===id);
      if(!candidate){
        const descriptor=C.rollBoss(request,rng);if(!descriptor)return {state:'rejected',item:null,persisted:false};
        candidate={runId:request.runId,spawnId:request.spawnId,item:{...descriptor,id}};pending.push(candidate);
      }
      const result=retryPending(),granted=!!find(id);
      if(!granted&&!status)status='Sammlung voll: Bossfund ausstehend. Im Menü Platz schaffen oder exportieren.';
      return {state:granted?'granted':'pending',item:copy(candidate.item),persisted:granted&&result.persisted};
    }
    return {storage,getHero,view,equip,unequip,favorite,salvage,salvageAll,salvagePreview,salvageValue,upgrade,upgradePreview,claimBoss,retryPending,snapshot:(hero=getHero())=>view(hero)?.items??null,get profile(){return copy(profile);},get count(){return view()?.bag.length||0;},get overflowCount(){return view()?.overflow.length||0;},get readOnly(){return readOnly;},get recoveryAvailable(){return readOnly||recoveryRequired;},get status(){return status;},find:id=>{const i=find(id);return i?copy(i):null;},save,exportJSON:raw,exportRecovery:()=>lastRaw||raw(),exportPreMigration:()=>{try{return storage?.getItem(PRE_MIGRATION)||null;}catch{return null;}},validateImport,importJSON,unlockLevel:()=>setFlag('level2'),unlockLevel3:()=>setFlag('level3'),claimKirchendeCompletion:()=>setFlag('kirchendeCompleted')};
  }
  globalThis.DenkmalLoot={create,totals,slots,rarities,statInfo,powers,fits,KEY,BACKUP,CAPACITY};
})();
