'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
let fixture=fs.readFileSync(path.join(__dirname,'game.test.cjs'),'utf8').split("if(process.env.TEST_MOBILE==='1'){")[0];
fixture=fixture.replace('let source=fs.readFileSync',"for(const file of ['portal-run.js','portal-perks.js','campaign-balance.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),sandbox);\nlet source=fs.readFileSync");
const {t,sandbox}=new Function('require','__dirname',fixture+';return {t,sandbox};')(require,__dirname);
const h=sandbox.DenkmalTestHooks,key=sandbox.PortalRun.KEY,storage=sandbox.localStorage;
const originalSet=storage.setItem.bind(storage);
let denyPortal=false;
storage.setItem=(k,v)=>{if(denyPortal&&k===key)throw Error('quota');return originalSet(k,v);};

assert.equal(h.startPortalRun({resume:false}),true);
assert.equal(h.getPortalRun().phase,'build');
h.launchWave();assert.equal(h.getPortalRun().phase,'combat');
const beforeClear=storage.getItem(key),beforeRevision=h.getPortalRun().revision;
denyPortal=true;h.endWave();
assert.equal(h.getPortalRun().phase,'combat','quota failure must not clear a combat phase');
assert.equal(h.getPortalRun().revision,beforeRevision,'failed CLEAR must not change revision');
assert.equal(t.state,'playing','failed CLEAR remains retryable');
assert.equal(storage.getItem(key),beforeClear,'failed CLEAR keeps old checkpoint');
denyPortal=false;h.endWave();
assert.equal(h.getPortalRun().phase,'build');assert.equal(h.getPortalRun().waveInSection,2);
const successfulClear=storage.getItem(key);
h.endWave();assert.equal(storage.getItem(key),successfulClear,'duplicate CLEAR has no extra effect');

h.launchWave();h.endWave();assert.equal(h.getPortalRun().phase,'perk');
const perkButton=sandbox.document.getElementById('perkGrid').children[0];
const beforePerk=JSON.stringify(h.getPortalRun().perkRanks),beforePerkRaw=storage.getItem(key);
denyPortal=true;perkButton.onclick();
assert.equal(h.getPortalRun().phase,'perk','failed perk claim remains selectable');
assert.equal(JSON.stringify(h.getPortalRun().perkRanks),beforePerk);
assert.equal(storage.getItem(key),beforePerkRaw);
denyPortal=false;perkButton.onclick();
assert.equal(h.getPortalRun().phase,'exit');
assert.equal(h.startPortalRun({resume:true}),true,'saved perk survives reload');
assert.equal(h.getPortalRun().phase,'exit');

// A failure after ENTER is durable as loading, never an unsaved next-section checkpoint.
t.game.essence=15;
let writes=0;
storage.setItem=(k,v)=>{if(k===key&&++writes===2)throw Error('quota on READY');return originalSet(k,v);};
assert.equal(h.enterPortal(),false);
assert.equal(sandbox.PortalRun.createStore(storage).load().run.phase,'loading');
storage.setItem=originalSet;
assert.equal(h.startPortalRun({resume:true}),true);
assert.equal(h.getPortalRun().section,2);assert.equal(h.getPortalRun().phase,'build');
assert.equal(sandbox.PortalRun.createStore(storage).load().run.section,2);

// Reward and run checkpoint occupy separate keys: a persisted item must survive
// a failed portal write, and a retry may not create a duplicate.
h.launchWave();h.endWave();h.launchWave();h.endWave();
sandbox.document.getElementById('perkGrid').children[0].onclick();
assert.equal(h.enterPortal(),true);assert.equal(h.getPortalRun().section,3);
h.launchWave();h.endWave();h.launchWave();
h.spawnEnemy('boss');t.hurtEnemy(t.game.enemies[0],1e9,{fixedDamage:true});
const lootBefore=t.lootModel.profile.owned.length,finalCheckpoint=storage.getItem(key);
denyPortal=true;storage.setItem=(k,v)=>{if(denyPortal&&k===key)throw Error('quota');return originalSet(k,v);};
h.endWave();
assert.equal(h.getPortalRun().phase,'combat');assert.equal(storage.getItem(key),finalCheckpoint);
assert.equal(t.lootModel.profile.owned.length,lootBefore);
denyPortal=false;h.endWave();
assert.equal(h.getPortalRun().phase,'finished');
assert.equal(t.lootModel.profile.owned.length,lootBefore,'retry must not duplicate already saved boss loot');
denyPortal=true;
assert.equal(h.startPortalRun({resume:false}),false,'new portal run cannot claim to start without durable save');
assert.equal(t.state,'start','failed new run must return to usable main menu');
denyPortal=false;

console.log('portal transactions: failed CLEAR and perk, duplicate request, partial ENTER and reload passed');
