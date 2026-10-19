/* Persistent inventory model. No DOM; all management commands enforce menu origin. */
(() => {
  'use strict';
  const KEY='denkmal-loot-v1',BACKUP=KEY+'-backup',CAPACITY=30;
  const slots={weapon:'Waffe',head:'Kopf',armor:'Rüstung',gloves:'Handschuhe',boots:'Stiefel',amulet:'Amulett',ring1:'Ring I',ring2:'Ring II'};
  const rarities={common:{label:'Gewöhnlich',color:'#b9c1bd',rank:0},magic:{label:'Magisch',color:'#75baff',rank:1},rare:{label:'Selten',color:'#efd16f',rank:2},epic:{label:'Episch',color:'#c999ff',rank:3},legendary:{label:'Legendär',color:'#ffab61',rank:4}};
  const statInfo={damage:{label:'Stabschaden',max:40},health:{label:'Lebenspunkte',max:100},haste:{label:'Angriffstempo',max:.25,percent:true},speed:{label:'Lauftempo',max:.2,percent:true},defense:{label:'Schadensreduktion',max:.18,percent:true},crit:{label:'Kritische Treffer',max:.12,percent:true},leech:{label:'Lebensraub',max:.04,percent:true},tower:{label:'Turmschaden',max:.15,percent:true}};
  const powers={bark:{name:'Rindenmantel',desc:'8 % weniger erlittener Schaden.'},roots:{name:'Wurzelstiefel',desc:'+8 % Lauftempo.'},splinter:{name:'Splitterstab',desc:'Stab ignoriert 10 Prozentpunkte Rüstung.'},wardlight:{name:'Laternenamulett',desc:'+25 % Stabschaden gegen Schilde.'},grove:{name:'Hainkern',desc:'Jeder fünfte Stabtreffer erzeugt einen kleinen Flächenimpuls.'},ember:{name:'Abendrot',desc:'+25 % Stabschaden.'},echo:{name:'Nachhall',desc:'30 % kürzere Angriffspausen und zwei zusätzliche Seelenechos.'},oath:{name:'Steinwacht',desc:'25 % weniger erlittener Schaden.'},ash:{name:'Aschenläufer',desc:'+20 % Tempo und 30 % kürzere Ausweich-Abklingzeit.'},lantern:{name:'Erinnerungslicht',desc:'Seelenruf heilt 25 LP.'},bell:{name:'Letzte Glocke',desc:'+40 % Seelenruf-Schaden und +1 Seele pro besiegtem Feind.'},chain:{name:'Rissfunke',desc:'Stabgeschosse springen auf ein weiteres Ziel über.'},sustain:{name:'Lebenslicht',desc:'+3 % Lebensraub durch Stabgeschosse.'},bastion:{name:'Bollwerk',desc:'+15 % Turmschaden.'}};
  // Five distinct stat priorities per equipment slot; six regional finds.
  const catalogue=Object.freeze([
    {"id":"runenstab","name":"Runenstab","slot":"weapon","stats":["damage","haste"],"power":"echo","region":0},
    {"id":"jaegerstab","name":"Jägerstab","slot":"weapon","stats":["damage","crit"],"power":null,"region":0},
    {"id":"blutdorn","name":"Blutdornstab","slot":"weapon","stats":["damage","leech"],"power":"sustain","region":0},
    {"id":"baumeister","name":"Baumeisterstab","slot":"weapon","stats":["damage","tower"],"power":"bastion","region":0},
    {"id":"splitterstab","name":"Splitterstab","slot":"weapon","stats":["damage","health"],"power":"splinter","region":0},
    {"id":"waechterkapuze","name":"Wächterkapuze","slot":"head","stats":["health","defense"],"power":"oath","region":0},
    {"id":"syburger-helm","name":"Syburger Wachthelm","slot":"head","stats":["health","tower"],"power":"bastion","region":5},
    {"id":"spaehervisier","name":"Spähervisier","slot":"head","stats":["health","crit"],"power":null,"region":0},
    {"id":"runenreif","name":"Runenreif","slot":"head","stats":["health","haste"],"power":"echo","region":0},
    {"id":"waldlaeuferhut","name":"Waldläuferhut","slot":"head","stats":["health","speed"],"power":"roots","region":0},
    {"id":"steinmantel","name":"Steinmantel","slot":"armor","stats":["defense","health"],"power":"oath","region":0},
    {"id":"reiseweste","name":"Reiseweste","slot":"armor","stats":["defense","speed"],"power":"ash","region":0},
    {"id":"rindenmantel","name":"Rindenmantel","slot":"armor","stats":["defense","leech"],"power":"bark","region":3},
    {"id":"werkmeisterkittel","name":"Werkmeisterkittel","slot":"armor","stats":["defense","tower"],"power":"bastion","region":0},
    {"id":"duellantenjacke","name":"Duellantenjacke","slot":"armor","stats":["defense","haste"],"power":null,"region":0},
    {"id":"schuetzenhandschuhe","name":"Schützenhandschuhe","slot":"gloves","stats":["haste","crit"],"power":null,"region":0},
    {"id":"bauhandschuhe","name":"Bauhandschuhe","slot":"gloves","stats":["haste","tower"],"power":"bastion","region":0},
    {"id":"runenhandschuhe","name":"Runenhandschuhe","slot":"gloves","stats":["haste","damage"],"power":"ember","region":0},
    {"id":"pfadfindergriffe","name":"Pfadfindergriffe","slot":"gloves","stats":["haste","speed"],"power":null,"region":0},
    {"id":"chronistenhandschuhe","name":"Chronistenhandschuhe","slot":"gloves","stats":["haste","health"],"power":"echo","region":6},
    {"id":"wachtstiefel","name":"Wachtstiefel","slot":"boots","stats":["speed","defense"],"power":null,"region":0},
    {"id":"labyrinthschritte","name":"Labyrinthschritte","slot":"boots","stats":["speed","haste"],"power":"ash","region":2},
    {"id":"wurzelstiefel","name":"Wurzelstiefel","slot":"boots","stats":["speed","health"],"power":"roots","region":0},
    {"id":"jaegerstiefel","name":"Jägerstiefel","slot":"boots","stats":["speed","crit"],"power":null,"region":0},
    {"id":"baumeisterstiefel","name":"Baumeisterstiefel","slot":"boots","stats":["speed","tower"],"power":null,"region":0},
    {"id":"seelenamulett","name":"Seelenamulett","slot":"amulet","stats":["tower","damage"],"power":"wardlight","region":0},
    {"id":"torschluessel","name":"Amulett der vier Tore","slot":"amulet","stats":["tower","health"],"power":"lantern","region":1},
    {"id":"loewensiegel","name":"Löwensiegel","slot":"amulet","stats":["tower","defense"],"power":"oath","region":4},
    {"id":"glockenamulett","name":"Glockenamulett","slot":"amulet","stats":["tower","haste"],"power":"bell","region":0},
    {"id":"erinnerungslicht","name":"Erinnerungslicht","slot":"amulet","stats":["tower","leech"],"power":"lantern","region":0},
    {"id":"scharfblick","name":"Ring des Scharfblicks","slot":"ring1","stats":["crit","damage"],"power":null,"region":0},
    {"id":"nachhallring","name":"Nachhallring","slot":"ring1","stats":["crit","haste"],"power":"chain","region":0},
    {"id":"hainkernring","name":"Hainkernring","slot":"ring1","stats":["crit","health"],"power":"grove","region":0},
    {"id":"turmsiegel","name":"Turmsiegel","slot":"ring1","stats":["crit","tower"],"power":"bastion","region":0},
    {"id":"nachtjaegerring","name":"Nachtjägerring","slot":"ring1","stats":["crit","leech"],"power":null,"region":0},
    {"id":"blutlicht","name":"Blutlichtreif","slot":"ring2","stats":["leech","damage"],"power":"sustain","region":0},
    {"id":"eisenwurzel","name":"Eisenwurzelring","slot":"ring2","stats":["leech","defense"],"power":"bark","region":0},
    {"id":"lebensring","name":"Lebensring","slot":"ring2","stats":["leech","health"],"power":"lantern","region":0},
    {"id":"wanderreif","name":"Wanderreif","slot":"ring2","stats":["leech","speed"],"power":"ash","region":0},
    {"id":"steinbund","name":"Ring des Steinbunds","slot":"ring2","stats":["leech","tower"],"power":"bastion","region":0}
  ].map(t=>Object.freeze({...t,stats:Object.freeze(t.stats)})));
  const regions={1:'Vier Tore',2:'Labyrinth',3:'Kirchende',4:'Ender Dorfkirche',5:'Hohensyburg',6:'Goethestraße'};
  const baseById=new Map(catalogue.map(t=>[t.id,t]));
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
  function validate(p){
    const fail=()=>{throw Error('Ungültiger Spielstand');};
    if(!p||p.version!==2||typeof p.level3!=='boolean'||typeof p.kirchendeCompleted!=='boolean'||!Number.isSafeInteger(p.nextId)||p.nextId<1||p.nextId>1e9||!Number.isSafeInteger(p.essence)||p.essence<0||p.essence>1e9||typeof p.level2!=='boolean')fail();
    if(!Array.isArray(p.items)||p.items.length>8||!Array.isArray(p.bag)||p.bag.length>30||!Array.isArray(p.overflow)||p.overflow.length>100000||!p.equipped||Object.keys(p.equipped).length!==8||!Array.isArray(p.milestones)||p.milestones.some(x=>![3,4,8,12].includes(x))||new Set(p.milestones).size!==p.milestones.length)fail();
    const ids=new Set();
    for(const i of [...p.items,...p.bag,...p.overflow]){
      if(!i||typeof i.id!=='string'||!i.id||i.id.length>100||ids.has(i.id)||!Object.hasOwn(slots,i.slot)||!Object.hasOwn(rarities,i.rarity)||typeof i.name!=='string'||!i.name.trim()||i.name.length>100||!Number.isInteger(i.level)||i.level<1||i.level>30||typeof i.favorite!=='boolean'||!i.stats||Array.isArray(i.stats)||Object.keys(i.stats).length>8)fail();
      if(i.baseId!==undefined&&(!baseById.has(i.baseId)||baseById.get(i.baseId).slot!==i.slot))fail();
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
  function create({storage,rng=Math.random,canManage=()=>true}={}){
    if(storage===undefined){try{storage=globalThis.localStorage;}catch{}}
    let profile=fresh(),status='',readOnly=false,lastRaw=null;
    function decode(env){if(![1,2].includes(env.version)||env.profile?.version!==env.version)throw Error('version');const p=copy(env.profile);if(env.version===1){p.version=2;p.level3=false;p.kirchendeCompleted=false;}return validate(p);}
    function parse(raw){return decode(JSON.parse(raw));}
    try{
      lastRaw=storage?.getItem(KEY)||null;
      if(lastRaw){try{profile=parse(lastRaw);}catch(e){
        let parsed;try{parsed=JSON.parse(lastRaw);}catch{}
        if(parsed?.version!==undefined&&![1,2].includes(parsed.version)){readOnly=true;status='Neuere Speicherversion erkannt. Export sichern und passende Spielversion öffnen.';}
        else {try{profile=parse(storage?.getItem(BACKUP));status='Spielstand aus Sicherung wiederhergestellt.';}catch{readOnly=true;status='Spielstand beschädigt. Export sichern oder eine gültige Sicherung importieren.';}}
      }}
    }catch{status='Speichern blockiert: Fortschritt gilt nur für diese Sitzung. Bitte exportieren.';}
    const all=()=>[...profile.items,...profile.bag,...profile.overflow];
    const find=id=>all().find(i=>i.id===id);
    const raw=()=>JSON.stringify({format:'denkmal-loot',version:2,profile});
    function save(){
      if(readOnly)return false;
      try{
        const current=storage?.getItem(KEY)||null;
        if(current!==lastRaw){readOnly=true;status='Spielstand in einem anderen Tab geändert. Bitte exportieren und neu laden.';return false;}
        // Backup only a known valid previous state. Corrupt primary must not replace recovery.
        if(lastRaw){try{parse(lastRaw);storage.setItem(BACKUP,lastRaw);}catch{}}
        const next=raw();if(!storage)throw Error('storage');storage.setItem(KEY,next);lastRaw=next;
        if(status.includes('Sitzung'))status='';return true;
      }catch{status='Speichern nicht möglich: Fortschritt gilt nur für diese Sitzung. Bitte exportieren.';return false;}
    }
    function writable(){
      if(readOnly)return false;
      try{if((storage?.getItem(KEY)||null)!==lastRaw){readOnly=true;status='Spielstand in einem anderen Tab geändert. Bitte exportieren und neu laden.';return false;}}catch{}
      return true;
    }
    const manage=()=>canManage()&&writable();
    function refill(){while(profile.bag.length<CAPACITY&&profile.overflow.length)profile.bag.push(profile.overflow.shift());}
    function rollStats(keys,level,rank){
      const stats={};
      keys.forEach((k,index)=>{const cap=statInfo[k].max,weight=index===0?1:index===1 ? .8 : .6;
        const scale=(.18+level*.018)*(1+rank*.12)*(.7+rng()*.3)*weight;
        stats[k]=Math.round(Math.min(cap,cap*scale)*(statInfo[k].percent?1000:1))/(statInfo[k].percent?1000:1);
      });return stats;
    }
    function generate(wave=1,boss=false,region=0){
      const level=Math.max(1,Math.min(30,Math.floor(Number(wave)||1))),r=Math.max(0,Math.min(.999999,rng()));
      const rarity=boss?(r<.2?'legendary':'epic'):r<.45?'common':r<.73?'magic':r<.91?'rare':r<.985?'epic':'legendary';
      const local=catalogue.filter(t=>t.region===region&&t.region),regional=local.length&&rng()<(boss ? .5 : .25);
      const pool=regional?local:catalogue.filter(t=>!t.region),base=pool[Math.min(pool.length-1,Math.floor(rng()*pool.length))];
      const rank=rarities[rarity].rank,extra=Object.keys(statInfo).filter(k=>!base.stats.includes(k));
      for(let n=extra.length-1;n>0;n--){const j=Math.floor(rng()*(n+1));[extra[n],extra[j]]=[extra[j],extra[n]];}
      const stats=rollStats([...base.stats,...extra].slice(0,Math.min(4,Math.max(2,1+rank))),level,rank);
      let id;do{id='loot-'+profile.nextId;profile.nextId=profile.nextId>=1e9?1:profile.nextId+1;}while(find(id));
      const power=rank>=3&&base.power?base.power:rarity==='legendary'?['chain','sustain','bastion'][Math.min(2,Math.floor(rng()*3))]:null;
      return {id,baseId:base.id,slot:base.slot,name:base.name,rarity,level,stats,power,favorite:false};
    }
    function add(item){if(!writable()||find(item.id))return false;const candidate=copy(item),next=copy(profile);(next.bag.length<CAPACITY?next.bag:next.overflow).push(candidate);try{validate(next);}catch{return false;}profile=next;save();return true;}
    function equip(id,slot){if(!manage())return false;const i=find(id);slot=slot||i?.slot;if(!i||!Object.hasOwn(slots,slot)||!fits(i,slot)||profile.items.some(x=>x.id===id))return false;
      profile.bag=profile.bag.filter(x=>x.id!==id);profile.overflow=profile.overflow.filter(x=>x.id!==id);
      const old=profile.items.find(x=>x.id===profile.equipped[slot]);profile.items=profile.items.filter(x=>x.id!==old?.id);profile.items.push(i);profile.equipped[slot]=id;
      if(old)(profile.bag.length<CAPACITY?profile.bag:profile.overflow).push(old);refill();save();return true;
    }
    function unequip(slot){if(!manage()||!Object.hasOwn(slots,slot))return false;const i=profile.items.find(x=>x.id===profile.equipped[slot]);if(!i)return false;profile.items=profile.items.filter(x=>x.id!==i.id);profile.equipped[slot]=null;(profile.bag.length<CAPACITY?profile.bag:profile.overflow).push(i);refill();save();return true;}
    function favorite(id){if(!manage())return false;const i=find(id);if(!i)return false;i.favorite=!i.favorite;save();return true;}
    function salvageValue(i){return 5+rarities[i.rarity].rank*8+i.level;}
    function salvage(id){if(!manage())return false;const i=[...profile.bag,...profile.overflow].find(x=>x.id===id);if(!i||i.favorite)return false;profile.essence=Math.min(1e9,profile.essence+salvageValue(i));profile.bag=profile.bag.filter(x=>x.id!==id);profile.overflow=profile.overflow.filter(x=>x.id!==id);refill();save();return true;}
    function salvagePreview(){
      const targets=[...profile.bag,...profile.overflow].filter(i=>!i.favorite);
      return {count:targets.length,essence:targets.reduce((sum,i)=>sum+salvageValue(i),0)};
    }
    function salvageAll(){
      if(!manage())return false;
      const preview=salvagePreview();
      if(!preview.count)return false;
      // Commit once; equipped items and favorites never enter the candidate list.
      const next=copy(profile);
      next.bag=next.bag.filter(i=>i.favorite);
      next.overflow=next.overflow.filter(i=>i.favorite);
      while(next.bag.length<CAPACITY&&next.overflow.length)next.bag.push(next.overflow.shift());
      next.essence=Math.min(1e9,next.essence+preview.essence);
      try{validate(next);}catch{return false;}
      profile=next;save();return true;
    }
    function reforge(id){if(!manage()||profile.essence<50)return false;const i=[...profile.bag,...profile.overflow].find(x=>x.id===id);if(!i||i.favorite)return false;i.stats=rollStats(Object.keys(i.stats),i.level,rarities[i.rarity].rank);profile.essence-=50;save();return true;}
    function milestone(wave){const reward={3:['armor','ash'],4:['weapon','echo'],8:['amulet','bell']}[wave];if(!reward||profile.milestones.includes(wave)||!writable())return false;const i=starter('milestone-'+wave,...reward);i.level=wave;profile.milestones.push(wave);return add(i);}
    function validateImport(text){if(typeof text!=='string'||text.length>15000000)throw Error('Datei zu groß');const e=JSON.parse(text);if(e.format!=='denkmal-loot'||![1,2].includes(e.version))throw Error('Falsches Format oder Version');return decode(e);}
    function importJSON(text){if(!canManage())return false;try{if((storage?.getItem(KEY)||null)!==lastRaw){readOnly=true;status='Spielstand in einem anderen Tab geändert. Bitte exportieren und neu laden.';return false;}}catch{}let next;try{next=validateImport(text);}catch{return false;}if(readOnly&&status.includes('anderen Tab'))return false;profile=next;readOnly=false;try{lastRaw=storage?.getItem(KEY)||null;}catch{}save();return true;}
    function unlockLevel3(){if(!writable())return false;profile.level3=true;save();return true;}
    function claimKirchendeReward(){if(!writable()||profile.kirchendeCompleted)return null;const item=generate(12,true);delete item.baseId;Object.assign(item,{name:'Hainkern',power:'grove',slot:'ring1',rarity:'epic'});const next=copy(profile);(next.bag.length<CAPACITY?next.bag:next.overflow).push(item);next.kirchendeCompleted=true;if(!next.milestones.includes(12))next.milestones.push(12);try{validate(next);}catch{return null;}profile=next;save();return copy(item);}
    function generateKirchende(wave=9,boss=false){return generate(wave,boss,3);}
    function unlockLevel(){if(!writable())return false;profile.level2=true;save();return true;}
    return {storage,get count(){return profile.bag.length;},get overflowCount(){return profile.overflow.length;},get profile(){return copy(profile);},get readOnly(){return readOnly;},get status(){return status;},generate,generateKirchende,unlockLevel3,claimKirchendeReward,add,equip,unequip,favorite,salvage,salvagePreview,salvageAll,reforge,milestone,unlockLevel,save,salvageValue,find:id=>{const i=find(id);return i?copy(i):null;},snapshot:()=>copy(profile.items),exportJSON:raw,exportRecovery:()=>lastRaw||raw(),validateImport,importJSON};
  }
  globalThis.DenkmalLoot={create,totals,slots,rarities,statInfo,powers,fits,catalogue,regions,KEY,BACKUP,CAPACITY};
})();
