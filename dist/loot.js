/* Persistent inventory model. No DOM; all management commands enforce menu origin. */
(() => {
  'use strict';
  const KEY='denkmal-loot-v1',BACKUP=KEY+'-backup',CAPACITY=30;
  const slots={weapon:'Waffe',head:'Kopf',armor:'Rüstung',gloves:'Handschuhe',boots:'Stiefel',amulet:'Amulett',ring1:'Ring I',ring2:'Ring II'};
  const rarities={common:{label:'Gewöhnlich',color:'#b9c1bd',rank:0},magic:{label:'Magisch',color:'#75baff',rank:1},rare:{label:'Selten',color:'#efd16f',rank:2},epic:{label:'Episch',color:'#c999ff',rank:3},legendary:{label:'Legendär',color:'#ffab61',rank:4}};
  const statInfo={damage:{label:'Stabschaden',max:40},health:{label:'Lebenspunkte',max:100},haste:{label:'Angriffstempo',max:.25,percent:true},speed:{label:'Lauftempo',max:.2,percent:true},defense:{label:'Schadensreduktion',max:.18,percent:true},crit:{label:'Kritische Treffer',max:.12,percent:true},leech:{label:'Lebensraub',max:.04,percent:true},tower:{label:'Turmschaden',max:.15,percent:true}};
  const powers={ember:{name:'Abendrot',desc:'+25 % Stabschaden.'},echo:{name:'Nachhall',desc:'30 % kürzere Angriffspausen und zwei zusätzliche Seelenechos.'},oath:{name:'Steinwacht',desc:'25 % weniger erlittener Schaden.'},ash:{name:'Aschenläufer',desc:'+20 % Tempo und 30 % kürzere Ausweich-Abklingzeit.'},lantern:{name:'Erinnerungslicht',desc:'Seelenruf heilt 25 LP.'},bell:{name:'Letzte Glocke',desc:'+40 % Seelenruf-Schaden und +1 Seele pro besiegtem Feind.'},chain:{name:'Rissfunke',desc:'Stabgeschosse springen auf ein weiteres Ziel über.'},sustain:{name:'Lebenslicht',desc:'+3 % Lebensraub durch Stabgeschosse.'},bastion:{name:'Bollwerk',desc:'+15 % Turmschaden.'}};
  const bases={weapon:'Runenstab',head:'Wächterkapuze',armor:'Steinmantel',gloves:'Runenhandschuhe',boots:'Aschenstiefel',amulet:'Seelenamulett',ring1:'Siegelring',ring2:'Siegelring'};
  const copy=x=>JSON.parse(JSON.stringify(x));
  function totals(items){
    const s={damage:0,health:0,haste:0,speed:0,defense:0,crit:0,leech:0,tower:0,powers:{}};
    for(const item of items){for(const [k,v] of Object.entries(item.stats))s[k]+=v;if(item.power)s.powers[item.power]=true;}
    if(s.powers.sustain)s.leech+=.03;if(s.powers.bastion)s.tower+=.15;
    for(const [k,max] of Object.entries({damage:160,health:400,haste:.6,speed:.5,defense:.6,crit:.35,leech:.12,tower:.6}))s[k]=Math.min(max,s[k]);
    return s;
  }
  function starter(id,slot,power){return {id,slot,power,name:powers[power].name,rarity:'magic',level:1,stats:{},favorite:true};}
  function fresh(){const items=[starter('starter-ember','weapon','ember'),starter('starter-oath','armor','oath'),starter('starter-lantern','amulet','lantern')];return {version:1,nextId:1,essence:0,items,bag:[],overflow:[],equipped:{weapon:'starter-ember',head:null,armor:'starter-oath',gloves:null,boots:null,amulet:'starter-lantern',ring1:null,ring2:null},milestones:[],level2:false};}
  function validate(p){
    const fail=()=>{throw Error('Ungültiger Spielstand');};
    if(!p||p.version!==1||!Number.isSafeInteger(p.nextId)||p.nextId<1||p.nextId>1e9||!Number.isSafeInteger(p.essence)||p.essence<0||p.essence>1e9||typeof p.level2!=='boolean')fail();
    if(!Array.isArray(p.items)||p.items.length>8||!Array.isArray(p.bag)||p.bag.length>30||!Array.isArray(p.overflow)||p.overflow.length>100000||!p.equipped||Object.keys(p.equipped).length!==8||!Array.isArray(p.milestones)||p.milestones.some(x=>![3,4,8].includes(x))||new Set(p.milestones).size!==p.milestones.length)fail();
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
  function create({storage,rng=Math.random,canManage=()=>true}={}){
    if(storage===undefined){try{storage=globalThis.localStorage;}catch{}}
    let profile=fresh(),status='',readOnly=false,lastRaw=null;
    function parse(raw){const env=JSON.parse(raw);if(env.version!==1)throw Error('version');return validate(env.profile);}
    try{
      lastRaw=storage?.getItem(KEY)||null;
      if(lastRaw){try{profile=parse(lastRaw);}catch(e){
        let parsed;try{parsed=JSON.parse(lastRaw);}catch{}
        if(parsed?.version!==undefined&&parsed.version!==1){readOnly=true;status='Neuere Speicherversion erkannt. Export sichern und passende Spielversion öffnen.';}
        else {try{profile=parse(storage?.getItem(BACKUP));status='Spielstand aus Sicherung wiederhergestellt.';}catch{readOnly=true;status='Spielstand beschädigt. Export sichern oder eine gültige Sicherung importieren.';}}
      }}
    }catch{status='Speichern blockiert: Fortschritt gilt nur für diese Sitzung. Bitte exportieren.';}
    const all=()=>[...profile.items,...profile.bag,...profile.overflow];
    const find=id=>all().find(i=>i.id===id);
    const raw=()=>JSON.stringify({format:'denkmal-loot',version:1,profile});
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
    function generate(wave=1,boss=false){
      const level=Math.max(1,Math.min(30,Math.floor(Number(wave)||1))),r=Math.max(0,Math.min(.999999,rng()));
      const rarity=boss?(r<.2?'legendary':'epic'):r<.45?'common':r<.73?'magic':r<.91?'rare':r<.985?'epic':'legendary';
      const slot=Object.keys(slots)[Math.min(7,Math.floor(rng()*8))]||'weapon',rank=rarities[rarity].rank;
      const primary={weapon:'damage',head:'health',armor:'defense',gloves:'haste',boots:'speed',amulet:'tower',ring1:'crit',ring2:'leech'}[slot];
      const stats={},choices=[primary,...Object.keys(statInfo).filter(k=>k!==primary).sort(()=>rng()-.5)];
      for(const k of choices.slice(0,Math.min(4,1+rank))){const scale=(.18+level*.018)*(1+rank*.12)*(.7+rng()*.3);stats[k]=Math.round(Math.min(statInfo[k].max,statInfo[k].max*scale)*(statInfo[k].percent?1000:1))/(statInfo[k].percent?1000:1);}
      let id;do{id='loot-'+profile.nextId;profile.nextId=profile.nextId>=1e9?1:profile.nextId+1;}while(find(id));
      const power=rarity==='legendary'?['chain','sustain','bastion'][Math.min(2,Math.floor(rng()*3))]:null;
      const suffix=['der Wacht','der Asche','des Echos','der Erinnerung'][Math.min(3,Math.floor(rng()*4))]||'der Wacht';
      return {id,slot,name:power?powers[power].name:bases[slot]+' '+suffix,rarity,level,stats,power,favorite:false};
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
    function reforge(id){if(!manage()||profile.essence<50)return false;const i=[...profile.bag,...profile.overflow].find(x=>x.id===id);if(!i||i.favorite)return false;for(const k of Object.keys(i.stats)){const cap=statInfo[k].max,scale=(.18+i.level*.018)*(1+rarities[i.rarity].rank*.12)*(.7+rng()*.3);i.stats[k]=Math.round(Math.min(cap,cap*scale)*(statInfo[k].percent?1000:1))/(statInfo[k].percent?1000:1);}profile.essence-=50;save();return true;}
    function milestone(wave){const reward={3:['armor','ash'],4:['weapon','echo'],8:['amulet','bell']}[wave];if(!reward||profile.milestones.includes(wave)||!writable())return false;const i=starter('milestone-'+wave,...reward);i.level=wave;profile.milestones.push(wave);return add(i);}
    function validateImport(text){if(typeof text!=='string'||text.length>15000000)throw Error('Datei zu groß');const e=JSON.parse(text);if(e.format!=='denkmal-loot'||e.version!==1)throw Error('Falsches Format oder Version');return validate(e.profile);}
    function importJSON(text){if(!canManage())return false;try{if((storage?.getItem(KEY)||null)!==lastRaw){readOnly=true;status='Spielstand in einem anderen Tab geändert. Bitte exportieren und neu laden.';return false;}}catch{}let next;try{next=validateImport(text);}catch{return false;}if(readOnly&&status.includes('anderen Tab'))return false;profile=next;readOnly=false;try{lastRaw=storage?.getItem(KEY)||null;}catch{}save();return true;}
    function unlockLevel(){if(!writable())return false;profile.level2=true;save();return true;}
    return {storage,get count(){return profile.bag.length;},get overflowCount(){return profile.overflow.length;},get profile(){return copy(profile);},get readOnly(){return readOnly;},get status(){return status;},generate,add,equip,unequip,favorite,salvage,salvagePreview,salvageAll,reforge,milestone,unlockLevel,save,salvageValue,find:id=>{const i=find(id);return i?copy(i):null;},snapshot:()=>copy(profile.items),exportJSON:raw,exportRecovery:()=>lastRaw||raw(),validateImport,importJSON};
  }
  globalThis.DenkmalLoot={create,totals,slots,rarities,statInfo,powers,fits,KEY,BACKUP,CAPACITY};
})();
