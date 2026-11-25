'use strict';
/* Loot-Stufe 4 Set-Boni: thematische Familien gewähren Stufen-Zuschläge (2/3 Teile),
   totals-Obergrenzen bleiben wirksam, Kern-Items und Einzelgänger zählen nicht,
   und der Wegweiser bewertet Set-Boni mit. */
const assert=require('node:assert/strict');
const {load,memory}=require('./helpers/equipment.cjs');
const box=load();
const L=box.DenkmalLoot,C=box.DenkmalEquipmentCatalog;
const emptyLoadout={weapon:null,head:null,armor:null,gloves:null,boots:null,amulet:null,ring1:null,ring2:null};
function roll(id,templateId,values){ // boss roll with hand-picked stats, valid per checkItem
  const t=C.templates[templateId];
  const stats={};t.keys.forEach((k,n)=>stats[k]=values[n]);
  return {id,templateId,name:t.name,slot:t.slot,rarity:'epic',level:5,power:t.power,stats,baseStats:{...stats},upgradeRank:0,source:{mapId:2,wave:5,bossType:'boss'},favorite:false};
}
function build(owned,loadouts){
  const m=L.create({storage:memory(),canManage:()=>true,getHero:()=>'marcel'});
  const env=JSON.parse(m.exportJSON());
  env.profile.owned=owned;env.profile.loadouts=loadouts;
  assert.equal(m.importJSON(JSON.stringify(env)),true,'test setup import must validate');
  return m;
}
const wornOf=m=>Object.values(m.profile.loadouts.marcel).map(id=>id?m.find(id):null).filter(Boolean);
const hood=()=>roll('hud','watch-hood',[10,.06]);
const coat=()=>roll('mantel','oath-coat',[.06,10]);
const boots=()=>roll('stiefel','guard-boots',[.05,.04]);
// 1) Stufen wirken kumulativ: 1 Teil = nichts, 2 Teile = +5 % Schadensreduktion, 3 Teile zusätzlich +10 LP.
{
  const t1=L.totals([hood()]);
  assert.equal(t1.defense,.06,'one family member grants no set bonus');
  const t2=L.totals([hood(),coat()]);
  assert.equal(t2.defense,.06+.06+.05,'two wacht members add the tier-2 defense bonus');
  const t3=L.totals([hood(),coat(),boots()]);
  assert.equal(t3.health,10+10+10,'tier-3 adds the wacht health bonus');
  assert.equal(t3.defense,.06+.06+.04+.05,'tier-3 keeps the tier-2 bonus');
  const sets=L.setBonuses([hood(),coat(),boots()]);
  const wacht=sets.find(s=>s.id==='wacht');
  assert.equal(wacht.count,3);assert.equal(wacht.max,3);
  assert.equal(wacht.bonuses.defense,.05);assert.equal(wacht.bonuses.health,10);
  assert.equal(sets.length,7,'all seven families are reported');
}
// 2) Zweier-Familien: Glutpfad, Steinwerk, Splitterkreis gewähren ihren 2er-Effekt.
{
  assert.equal(L.totals([roll('w1','ember-staff',[6,4]),roll('b1','ash-boots',[.05,.05])]).damage,6+6,'glutpfad tier-2 adds staff damage');
  assert.equal(L.totals([roll('k1','architect-hood',[10,.1]),roll('r1','bastion-ring',[.1,.05])]).tower,.1+.1+.15+.08,'steinwerk tier-2 adds tower damage');
  assert.equal(L.totals([roll('s1','splinter-staff',[6,.05]),roll('r2','sight-ring',[.05,6])]).crit,.05+.05+.04,'splitterkreis tier-2 adds crit');
  const sets=L.setBonuses([roll('s1','splinter-staff',[6,.05])]);
  assert.equal(sets.find(s=>s.id==='splitterkreis').count,1,'single pieces are listed without bonuses');
  assert.equal(Object.keys(sets.find(s=>s.id==='splitterkreis').bonuses).length,0);
}
// 3) Kern-Items (keine templateId) und Einzelgänger zählen nicht für Familien.
{
  const legacySample={id:'alt',name:'Wächterkapuze',slot:'head',rarity:'epic',level:5,power:null,favorite:false,legacy:true,stats:{health:10},baseStats:{health:10},upgradeRank:0};
  assert.equal(L.totals([legacySample,coat()]).defense,.06,'legacy items carry no family membership');
  const loners=L.setBonuses([roll('l1','light-coat',[10,.05]),roll('l2','rune-gloves',[.05,.05]),roll('l3','rift-gloves',[.05,6])]);
  assert.equal(loners.every(s=>s.count===0),true,'families without members stay silent');
}
// 4) Totals-Obergrenzen kappen auch Set-Zuschläge: 40 Stabschaden je Stück + alle drei Seelenecho-Teile.
{
  const a=roll('ec','echo-staff',[40,0]),b=roll('sh','soul-hood',[100,.12]),c=roll('ba','bell-amulet',[40,100]);
  const t=L.totals([a,b,c]);
  assert.equal(t.damage,40+40+8,'seelenecho tier-3 adds +8 damage');
  assert.equal(t.crit,.12+.05,'seelenecho tier-2 adds crit');
  const clamped=L.totals([...Array(3)].flatMap((_,n)=>[roll('e'+n,'ember-staff',[40,100]),roll('f'+n,'sight-ring',[.12,40]),roll('g'+n,'ash-boots',[.2,.12])]));
  assert.equal(clamped.damage,160,'raw damage (240+120+18) is clamped at the totals cap; set bonuses never bypass caps');
  assert.ok(Number.isFinite(clamped.crit)&&clamped.crit<=.35,'crit respects the totals cap');
  assert.equal(clamped.speed,.5,'speed is clamped at its totals cap too');
}
// 5) Der Wegweiser bewertet Set-Boni mit: leere Stiefel + getragener Abendrot → Aschenläufer vervollständigt Glutpfad.
{
  const m=build([roll('ember','ember-staff',[6,4]),roll('ash','ash-boots',[.05,.05])],{marcel:{...emptyLoadout,weapon:'ember'},kim:{...emptyLoadout}});
  const steps=m.suggest('marcel');
  assert.equal(steps.steps.length,1,'equipping the ash boots is the one strict improvement');
  assert.equal(steps.steps[0].slot,'boots');assert.equal(steps.steps[0].to,'ash');
  const before=L.totals(wornOf(m));
  assert.equal(m.equipBest('marcel'),true);
  const after=L.totals(wornOf(m));
  assert.ok(after.damage>before.damage,'the glutpfad bonus makes the swap strictly better');
  assert.ok(after.speed>=before.speed&&after.crit>=before.crit);
  const sets=L.setBonuses(wornOf(m));
  assert.equal(sets.find(s=>s.id==='glutpfad').count,2,'the pair is complete after equipBest');
}
// 6) Kein Placebo am Cap: ist ein Wert am Obergrenzen-Anschlag, setzt kein Stufen-Bonus noch eins drauf.
{
  const atCap=L.totals([roll('c1','sight-ring',[.12,0]),roll('c2','sight-ring',[.12,0]),roll('k1','architect-hood',[0,.15]),roll('k2','sight-ring',[0,0])]);
  assert.equal(atCap.crit,.12+.12+.04,'three splitterkreis members grant the tier bonus exactly once');
  assert.equal(atCap.tower,.15,'steinwerk stays silent with only one member present');
  const capped=L.totals([roll('x','bell-amulet',[0,100]),roll('y','memory-amulet',[100,0]),roll('z','sustain-ring',[100,0]),roll('q','ward-amulet',[0,0])]);
  assert.ok(capped.health<=400,'health cannot exceed the totals cap through set bonuses');
}
// 7) Reload-Stabilität: Set-Boni sind reine Rechenkost, kein Schema-Sprung.
{
  const m=build([roll('hud','watch-hood',[10,.06]),roll('mantel','oath-coat',[.06,10]),roll('stiefel','guard-boots',[.05,.04])],{marcel:{...emptyLoadout,head:'hud',armor:'mantel',boots:'stiefel'},kim:{...emptyLoadout}});
  const reloaded=L.create({storage:m.storage});
  assert.equal(reloaded.profile.version,5,'no schema bump for set bonuses');
  assert.equal(L.totals(wornOf(reloaded)).defense,.06+.06+.04+.05,'bonuses recompute identically after reload');
}
console.log('loot-setboni.test.cjs: alle Assertions grün');
