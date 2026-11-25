'use strict';
/* Loot-Stufe 3 Wegweiser: suggested strict upgrades must never trade a stat
   or an active power for a gain, must not reuse one item for two slots, may
   share an item with the other hero, and must ignore placebo swaps at caps.
   Field-wise assertions because the model runs inside a vm realm. */
const assert=require('node:assert/strict');
const {load,memory}=require('./helpers/equipment.cjs');
const {DenkmalLoot:L}=load();
const emptyLoadout={weapon:null,head:null,armor:null,gloves:null,boots:null,amulet:null,ring1:null,ring2:null};
function item(id,name,slot,stats,power=null){return {id,name,slot,rarity:'epic',level:5,power,favorite:false,legacy:true,stats,baseStats:{...stats},upgradeRank:0};}
function build(owned,loadouts={marcel:{...emptyLoadout},kim:{...emptyLoadout}},canManage=()=>true,hero='marcel'){
  const m=L.create({storage:memory(),canManage,getHero:()=>hero});
  const env=JSON.parse(m.exportJSON());
  env.profile.owned=owned;env.profile.loadouts=loadouts;env.profile.nextId=1000;
  assert.equal(m.importJSON(JSON.stringify(env)),true,'test setup import must validate');
  return m;
}
// Empty rucksack: no steps, no apply.
{
  const m=L.create({storage:memory()});
  assert.equal(m.suggest().steps.length,0);
  assert.equal(m.equipBest(),false);
}
// Simple strict gain: better damage weapon without power change is suggested and applied in one commit.
{
  const worn=item('w-old','Alter Stab','weapon',{damage:5});
  const better=item('w-better','Besserer Stab','weapon',{damage:8});
  const m=build([worn,better],{marcel:{...emptyLoadout,weapon:'w-old'},kim:{...emptyLoadout}});
  const steps=m.suggest().steps;
  assert.equal(steps.length,1);assert.equal(steps[0].slot,'weapon');assert.equal(steps[0].to,'w-better');assert.equal(steps[0].from,'w-old');
  const before=m.exportJSON();
  assert.equal(m.equipBest(),true);
  assert.equal(m.profile.loadouts.marcel.weapon,'w-better');
  assert.notEqual(m.exportJSON(),before);
  assert.equal(m.suggest().steps.length,0,'applied suggestion is exhausted');
}
// Power loss is never a strict upgrade: dropping ember for raw damage stays rejected.
{
  const worn=item('w-ember','Glutstab','weapon',{damage:1},'ember');
  const raw=item('w-raw','Kalter Stab','weapon',{damage:9});
  const kept=item('w-ember2','Glutstab II','weapon',{damage:9},'ember');
  const m=build([worn,raw,kept],{marcel:{...emptyLoadout,weapon:'w-ember'},kim:{...emptyLoadout}});
  const steps=m.suggest().steps;
  assert.equal(steps.length,1);assert.equal(steps[0].to,'w-ember2','ember-preserving candidate wins, raw candidate rejected');
}
// A worse stat is never compensated: mixed candidates stay rejected.
{
  const worn=item('h-old','Kapuze','head',{damage:5,haste:.02});
  const mixed=item('h-mixed','Schnelle Kapuze','head',{damage:9});
  const m=build([worn,mixed],{marcel:{...emptyLoadout,head:'h-old'},kim:{...emptyLoadout}});
  assert.equal(m.suggest().steps.length,0,'haste loss rejects the swap');
  assert.equal(m.equipBest(),false);
}
// Rings: two ring candidates fill both ring slots with two different items.
{
  const r1=item('r-a','Siegel I','ring1',{damage:1}),r2=item('r-b','Siegel II','ring1',{damage:2});
  const m=build([r1,r2],{marcel:{...emptyLoadout},kim:{...emptyLoadout}});
  const steps=m.suggest().steps;
  assert.equal(steps.length,2,'both ring slots gain');
  assert.equal(new Set(steps.map(s=>s.to)).size,2,'one item is never equipped twice');
  assert.equal(steps.map(s=>s.slot).join(),'ring1,ring2');
}
// Shared instance: an item worn by Kim can still be suggested for Marcel.
{
  const shared=item('w-shared','Verbündeter Stab','weapon',{damage:10});
  const own=item('w-own','Eigener Stab','weapon',{damage:5});
  const m=build([shared,own],{marcel:{...emptyLoadout,weapon:'w-own'},kim:{...emptyLoadout,weapon:'w-shared'}});
  const steps=m.suggest().steps;
  assert.equal(steps.length,1);assert.equal(steps[0].to,'w-shared');
  assert.equal(m.equipBest(),true);
  assert.equal(m.profile.loadouts.marcel.weapon,'w-shared');
  assert.equal(m.profile.loadouts.kim.weapon,'w-shared','shared instance stays on both heroes');
}
// Caps: swapping damage 40 against damage 40 at the 160 damage cap is a placebo and gets no step.
{
  const mk=(id,slot)=>item(id,'Probe '+id,slot,{damage:40});
  const worn=['weapon','head','armor','gloves'].map(s=>mk('cap-'+s,s));
  const twin=item('cap-twin','Zwillingsstab','weapon',{damage:40});
  const m=build([...worn,twin],{marcel:{weapon:'cap-weapon',head:'cap-head',armor:'cap-armor',gloves:'cap-gloves',boots:null,amulet:null,ring1:null,ring2:null},kim:{...emptyLoadout}});
  assert.equal(L.totals(m.snapshot('marcel')).damage,160,'setup reaches the cap');
  assert.equal(m.suggest().steps.length,0,'no placebo step at the cap');
  assert.equal(m.equipBest(),false);
}
// Guards: menu origin and unknown heroes.
{
  const worn=item('w-old','Alter Stab','weapon',{damage:5});
  const better=item('w-better','Besserer Stab','weapon',{damage:8});
  let menu=true;const m=build([worn,better],{marcel:{...emptyLoadout,weapon:'w-old'},kim:{...emptyLoadout}},()=>menu);
  menu=false;
  assert.equal(m.suggest().steps.length,1,'suggest stays readable during a run');
  assert.equal(m.equipBest(),false,'equipBest respects menu origin');
  menu=true;
  assert.equal(m.equipBest(),true);
  assert.equal(m.suggest('nobody').steps.length,0,'unknown hero yields no steps');
  assert.equal(m.equipBest('nobody'),false);
}
// Stale view: suggest recomputes from the live profile, never from a cached snapshot.
{
  const worn=item('w-old','Alter Stab','weapon',{damage:5});
  const better=item('w-better','Besserer Stab','weapon',{damage:8});
  const m=build([worn,better],{marcel:{...emptyLoadout,weapon:'w-old'},kim:{...emptyLoadout}});
  const stale=m.suggest().steps;
  assert.equal(m.equip('w-better','weapon','marcel'),true);
  const fresh=m.suggest().steps;
  assert.equal(fresh.length,0,'suggestion follows manual equips');
  assert.equal(stale.length,1,'stale snapshot object keeps its own history');
}
console.log('Wegweiser: strict gains, power/stat protection, ring sharing, cap placebos and menu guards passed');
