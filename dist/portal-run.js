/* Portalreise: serializable run state and deterministic transition accounting. */
(function(root){
'use strict';
const KEY='denkmal-portal-run-v1',phases=['build','combat','perk','exit','loading','finished','failed'];
const clone=x=>JSON.parse(JSON.stringify(x));
function amount(n){if(typeof n!=='number'||!Number.isFinite(n)||n<0||n>1e9)throw Error('Invalid amount');return n;}
const perkIds=['power','endurance','step','recovery','precision','reach','cadence','choke','mark','cover','counter','circle'];
function valid(r){if(!r||r.version!==1||!phases.includes(r.phase)||typeof r.runId!=='string'||!r.runId||!Number.isInteger(r.section)||r.section<1||!Number.isInteger(r.maxSections)||r.maxSections<1||r.section>r.maxSections||!Number.isInteger(r.revision)||r.revision<0||![1,2].includes(r.waveInSection)||!['marcel','kim'].includes(r.heroId)||!Number.isInteger(r.rngState)||!r.perkRanks||typeof r.perkRanks!=='object')throw Error('Invalid run');amount(r.gold);amount(r.startBudget);if(r.heroHp!==null)amount(r.heroHp);for(const [id,v] of Object.entries(r.perkRanks))if(!perkIds.includes(id)||!Number.isInteger(v)||v<0||v>3)throw Error('Invalid perk');
if(r.offers!==null&&(!Array.isArray(r.offers)||r.offers.length!==3||new Set(r.offers).size!==3||r.offers.some(id=>!perkIds.includes(id))))throw Error('Invalid offers');
if(r.checkpoint!==null){const c=r.checkpoint;if(!c||!c.hero||!Array.isArray(c.towers)||c.towers.length>100||!Number.isInteger(c.wave)||c.wave<1)throw Error('Invalid checkpoint');amount(c.gold);amount(c.hero.hp);amount(c.hero.maxHp);amount(c.hero.x);amount(c.hero.y);if(c.hero.hp>c.hero.maxHp||c.hero.maxHp===0)throw Error('Invalid hero');if(c.monumentHp!==undefined)amount(c.monumentHp);for(const t of c.towers){amount(t.spent);amount(t.x);amount(t.y);amount(t.damage);amount(t.range);amount(t.fireRate);if(!['bow','cannon','mage','rift','boomerang'].includes(t.kind)||![1,2,3].includes(t.level))throw Error('Invalid tower');}}
return r;}
function create({runId,seed,heroId,startBudget,maxSections=3}){return valid({version:1,revision:0,runId,section:1,waveInSection:1,phase:'build',heroId,gold:amount(startBudget),startBudget,heroHp:null,perkRanks:{},rngState:seed>>>0,maxSections,offers:null,checkpoint:null});}
function refund(towers){return towers.reduce((n,t)=>amount(n+amount(t.spent)),0);}
function reduce(input,e){valid(input);let r=clone(input),accepted=true;switch(e.type){
case 'START':if(r.phase==='build')r.phase='combat';else accepted=false;break;
case 'CLEAR':if(r.phase!=='combat'){accepted=false;break;}if(r.waveInSection===1){r.waveInSection=2;r.phase='build';}else r.phase=r.section===r.maxSections?'finished':'perk';break;
case 'CHOOSE':if(r.phase==='perk'&&perkIds.includes(e.id)&&(r.perkRanks[e.id]||0)<3){r.perkRanks[e.id]=(r.perkRanks[e.id]||0)+1;r.phase='exit';}else accepted=false;break;
case 'ENTER':if(r.phase!=='exit'){accepted=false;break;}r.gold=amount(amount(e.gold)+refund(e.towers)+r.startBudget*.25);r.heroHp=Math.min(amount(e.maxHp),amount(e.hp)+e.maxHp*(.1+(r.perkRanks.recovery||0)*.03));r.phase='loading';break;
case 'READY':if(r.phase==='loading'){r.section++;r.waveInSection=1;r.phase='build';r.offers=null;r.checkpoint=null;}else accepted=false;break;
case 'FAIL':r.phase='failed';break;
default:accepted=false;
}if(accepted)r.revision++;return {run:accepted?valid(r):input,effects:[]};}
function createStore(storage){
  let observed=false,knownRaw=null;
  function decode(raw){
    const data=JSON.parse(raw);
    if(data?.schemaVersion!==undefined){
      if(data.schemaVersion!==2)return {status:'incompatible'};
      if(!Number.isFinite(data.lastUpdated))return {status:'corrupt'};
      try{return {status:'ok',run:valid(data.run)};}catch{return {status:'corrupt'};}
    }
    if(data?.version!==1)return {status:'incompatible'};
    try{return {status:'ok',run:valid(data)};}catch{return {status:'corrupt'};}
  }
  return {
    load(){try{const raw=storage?.getItem(KEY)??null;observed=true;knownRaw=raw;return raw===null?{status:'missing'}:decode(raw);}catch{return {status:'corrupt'};}},
    save(run,expectedRevision){
      try{
        valid(run);
        if(!storage)return false;
        const raw=storage.getItem(KEY)??null,old=raw===null?null:decode(raw);
        if(observed&&raw!==knownRaw)return false;
        if(old!==null&&old.status!=='ok')return false;
        if((old?.run.revision??null)!==expectedRevision)return false;
        const next=JSON.stringify({schemaVersion:2,lastUpdated:Date.now(),run});
        storage.setItem(KEY,next);observed=true;knownRaw=next;
        return true;
      }catch{return false;}
    }
  };
}
const api={KEY,create,reduce,refund,createStore,validate:valid};root.PortalRun=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
