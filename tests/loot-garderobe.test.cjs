'use strict';
/* Loot-Stufe 3 Garderobe: named equipment sets survive reloads, restore exact
   slot snapshots, tolerate salvaged (dangling) items, keep heroes separate
   and guard the preset schema on import. */
const assert=require('node:assert/strict');
const {load,memory,json}=require('./helpers/equipment.cjs');
const {DenkmalLoot:L}=load();
const emptyLoadout={weapon:null,head:null,armor:null,gloves:null,boots:null,amulet:null,ring1:null,ring2:null};
function item(id,name,slot,stats,power=null){return {id,name,slot,rarity:'epic',level:5,power,favorite:false,legacy:true,stats,baseStats:{...stats},upgradeRank:0};}
function build(owned,loadouts={marcel:{...emptyLoadout},kim:{...emptyLoadout}},canManage=()=>true,hero='marcel'){
  const m=L.create({storage:memory(),canManage,getHero:()=>hero});
  const env=JSON.parse(m.exportJSON());
  env.profile.owned=owned;env.profile.loadouts=loadouts;
  assert.equal(m.importJSON(JSON.stringify(env)),true,'test setup import must validate');
  return m;
}
const stable=item('stab','Fester Stab','weapon',{damage:9});
const quick=item('stiefel','Schnelle Stiefel','boots',{speed:.1});
// Save rounds a full loadout snapshot under the given name; reload restores exactly that snapshot.
{
  const m=build([stable,quick],{marcel:{...emptyLoadout,weapon:'stab',boots:null},kim:{...emptyLoadout}});
  assert.equal(m.savePreset('marcel','Bosswacht'),true);
  const preset=m.profile.presets.marcel[0];
  assert.equal(preset.name,'Bosswacht');assert.equal(preset.slots.weapon,'stab');
  assert.equal(m.equip('stiefel',null),true);
  assert.notEqual(m.profile.loadouts.marcel.boots,null,'preparation actually changed the loadout');
  assert.equal(m.applyPreset('marcel',preset.id),true);
  assert.equal(m.profile.loadouts.marcel.weapon,'stab','preset restores the saved weapon');
  assert.equal(m.profile.loadouts.marcel.boots,null,'slots not in the preset come back empty');
  const reloaded=L.create({storage:m.storage});
  assert.equal(reloaded.profile.presets.marcel.length,1,'presets survive the reload');
  assert.equal(reloaded.applyPreset('marcel',preset.id),true);
}
// Names are validated; the Garderobe stops at ten sets per hero.
{
  const m=build([stable]);
  assert.equal(m.savePreset('marcel','   '),false,'whitespace-only name rejected');
  assert.equal(m.savePreset('marcel','x'.repeat(25)),false,'too long name rejected');
  assert.equal(m.savePreset('marcel',' Namen '),true,'names are trimmed before storing');
  assert.equal(m.profile.presets.marcel[0].name,'Namen');
  for(let n=2;n<=10;n++)assert.equal(m.savePreset('marcel','Set '+n),true);
  assert.equal(m.savePreset('marcel','Elfmter'),false,'eleventh preset rejected');
  assert.equal(m.deletePreset('marcel','set-marcel-3'),true);
  assert.equal(m.savePreset('marcel','Der Elfte'),true,'one free slot opens after deleting');
  assert.ok(m.profile.presets.marcel.some(p=>p.name==='Der Elfte'&&p.id==='set-marcel-3'),'freed ids are reused deterministically');
  assert.equal(m.deletePreset('marcel','set-marcel-3'),true);
  assert.equal(m.deletePreset('marcel','set-marcel-3'),false,'double delete rejected');
  assert.equal(m.applyPreset('marcel','set-marcel-3'),false,'applying a deleted set rejected');
}
// Dangling references stay importable, applying clears the lost slots and counts them.
{
  const m=build([stable],{marcel:{...emptyLoadout,weapon:'stab'},kim:{...emptyLoadout}});
  assert.equal(m.savePreset('marcel','Alterungen'),true);
  // Clone the current save, replace the preset weapon with a salvaged-away id.
  const env=JSON.parse(m.exportJSON());
  
  env.profile.presets.marcel[0].slots.weapon='weg-ist-weg';
  const tampered=L.create({storage:memory({[L.KEY]:JSON.stringify(env)})});
  assert.equal(tampered.readOnly,false,'dangling preset ids stay loadable');
  env.profile.presets.marcel[0].slots.armor='stab';
  const misplaced=JSON.stringify(env);
  const bad=L.create({storage:memory()});
  assert.equal(bad.importJSON(misplaced),false,'weapon item in the armor slot of a preset is rejected');
  assert.equal(tampered.applyPreset('marcel','set-marcel-1'),true);
  assert.equal(tampered.profile.loadouts.marcel.weapon,null,'missing item leaves the slot empty');
}
// Heroes stay separate: Kim's Garderobe never touches Marcel's.
{
  const m=build([stable],{marcel:{...emptyLoadout,weapon:'stab'},kim:{...emptyLoadout,weapon:null}});
  assert.equal(m.savePreset('kim','Kim-Wacht',),true);
  assert.equal(m.profile.presets.kim.length,1);assert.equal(m.profile.presets.marcel.length,0);
  assert.equal(m.deletePreset('marcel','set-kim-1'),false,'ids are namespaced per hero');
  assert.equal(m.presets('nobody').length,0,'unknown hero has no Garderobe');
  const list=m.presets('kim');assert.equal(list.length,1)&&assert.equal(list[0].name,'Kim-Wacht');
}
// Schema guards: version fields move together and defaced presets are refused whole.
{
  const m=build([stable]);
  const before=m.exportJSON();
  const tampered=(mutate)=>{
    const e=JSON.parse(before);mutate(e.profile);
    const text=JSON.stringify(e);
    assert.equal(m.importJSON(text),false,'tampered profile must be rejected');assert.equal(m.exportJSON(),before,'state unchanged');
  };
  assert.equal(JSON.parse(before).version,5,'exports carry schema v5');
  tampered(p=>{p.presets.marcel.push({id:'set-marcel-1',name:'X',slots:{...emptyLoadout}});p.presets.marcel.push({id:'set-marcel-1',name:'Y',slots:{...emptyLoadout}});});
  tampered(p=>p.presets.marcel.push({id:'bad id!',name:'X',slots:{...emptyLoadout}}));
  tampered(p=>p.presets.marcel.push({id:'set-marcel-1',name:'Getrimmt ',slots:{weapon:null,head:null,armor:null,gloves:null,boots:null,amulet:null,ring1:null,ring2:null}}));
  tampered(p=>p.presets.marcel.push({id:'set-marcel-1',name:'X',slots:{weapon:null,head:null,armor:null,gloves:null,boots:null,amulet:null,ring1:null}}));
  tampered(p=>p.presets.marcel.push({id:'set-marcel-1',name:'X',slots:{...emptyLoadout,extra:'stab'}}));
  const many=[];const slotset={...emptyLoadout};
  for(let n=1;n<=11;n++)many.push({id:'set-marcel-'+n,name:'Set '+n,slots:{...slotset}});
  tampered(p=>{p.presets.marcel=many;});
}
// v4-Spielstand: Laden, erste Speicherung sichert unter pre-v5, KEY liegt danach auf v5.
{
  const m=build([stable]);
  assert.equal(m.savePreset('marcel','Vorher'),true);
  const current=JSON.parse(m.exportJSON());
  current.version=4;current.profile.version=4;delete current.profile.presets;
  const raw=JSON.stringify(current);
  const s=memory({[L.KEY]:raw});
  const older=L.create({storage:s});
  assert.equal(older.profile.version,5,'v4 storage migrates in memory to v5');
  assert.equal(older.profile.presets.marcel.length,0,'migrated Garderobe starts empty');
  assert.equal(older.save(),true);
  assert.equal(s.getItem(L.KEY+'-pre-v5'),raw,'first v5 write backs up the v4 raw once');
  assert.equal(JSON.parse(s.getItem(L.KEY)).version,5,'storage now holds schema v5');
  assert.equal(older.exportPreMigration(),raw,'pre-migration export prefers the v5 backup');
  const again=JSON.parse(s.getItem(L.KEY));again.version=4;again.profile.version=4;
  const second=memory({[L.KEY]:JSON.stringify(again)});
  const stale=L.create({storage:second});
  assert.equal(stale.save(),true);
  assert.equal(second.getItem(L.KEY+'-pre-v5'),JSON.stringify(again),'a v4 import keeps the chain alive');
  let menu=true;const guarded=L.create({storage:memory(),canManage:()=>menu});
  menu=false;
  assert.equal(guarded.savePreset('marcel','Verboten'),false,'garderobe writes respect menu origin');
  assert.equal(guarded.applyPreset('marcel',null),false);
  assert.equal(guarded.deletePreset('marcel',null),false);
  menu=true;
  assert.equal(guarded.savePreset('marcel','Erlaubt'),true);
}
// Wegweiser und Garderobe teilen sich den Rucksack, ohne sich gegenseitig zu blocken.
{
  const worn=item('w-old','Alter Stab','weapon',{damage:5});
  const better=item('w-better','Besserer Stab','weapon',{damage:8});
  const m=build([worn,better],{marcel:{...emptyLoadout,weapon:'w-old'},kim:{...emptyLoadout}});
  assert.equal(m.savePreset('marcel','Anfangsset'),true);
  assert.equal(m.equipBest('marcel'),true);
  const preset=m.profile.presets.marcel[0];
  assert.equal(preset.slots.weapon,'w-old','saved snapshot keeps the pre-wegweiser state');
  assert.equal(m.applyPreset('marcel',preset.id),true);
  assert.equal(m.profile.loadouts.marcel.weapon,'w-old','applying rewinds the wegweiser swap');
  assert.equal(m.suggest('marcel').steps.length,1,'wegweiser still offers the upgrade afterwards');
}
console.log('Garderobe: save/apply/delete, names, limits, dangling_ids, hero separation, schema guards and v4 backup passed');
