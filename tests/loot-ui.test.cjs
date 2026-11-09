'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
// Small in-memory DOM for testing real UI handlers with the real inventory model.
class Element {
 constructor(tag='div'){this.tagName=tag;this.children=[];this.dataset={};this.attrs={};this.hidden=false;this.style={setProperty(){}};this.className='';this._text='';this.classList={toggle:()=>{},add:()=>{},remove:()=>{}};}
 set textContent(s){this._text=String(s);this.children=[];} get textContent(){return this._text+this.children.map(c=>c.textContent).join(' ');}
 setAttribute(k,v){this.attrs[k]=String(v);} getAttribute(k){return this.attrs[k]??null;}
 append(...nodes){for(const n of nodes){if(n.parentNode)n.parentNode.children=n.parentNode.children.filter(c=>c!==n);n.parentNode=this;this.children.push(n);}}
 replaceChildren(...nodes){for(const n of this.children)n.parentNode=null;this.children=[];this._text='';this.append(...nodes);}
 contains(n){return n===this||this.children.some(c=>c.contains(n));} focus(){document.activeElement=this;} scrollIntoView(){} getClientRects(){return this.hidden?[]:[{}];}
 querySelectorAll(){return this.children.flatMap(c=>[c,...c.querySelectorAll()]);}
}
const elements=new Map(),get=id=>{for(const parent of elements.values()){const child=parent.querySelectorAll().find(c=>c.id===id);if(child)return child;}if(!elements.has(id)){const e=new Element();e.id=id;elements.set(id,e);}return elements.get(id);};
const document={getElementById:get,createElement:tag=>new Element(tag),activeElement:null};
let mobile=true,hero='kim',editable=true;const events={};
const box={document,console,matchMedia:()=>({matches:mobile}),addEventListener:(n,fn)=>events[n]=fn,setTimeout:fn=>fn()};
get('inventoryScreen').append(get('loadoutSlots'),get('inventoryGrid'),get('lootDetail'));
vm.createContext(box);const dist=path.join(__dirname,'../dist');
for(const f of ['equipment-catalog.js','loot.js','loot-ui.js'])vm.runInContext(fs.readFileSync(path.join(dist,f),'utf8'),box);
const data=new Map(),model=box.DenkmalLoot.create({storage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)},canManage:()=>editable,getHero:()=>hero});
let fixtureId=0;
function addItem(name,slot,stats,power=null){const e=JSON.parse(model.exportJSON()),id='ui-'+(++fixtureId);e.profile.essence=500;e.profile.owned.push({id,slot,stats,baseStats:{...stats},legacy:true,upgradeRank:0,power,favorite:false,name,rarity:'epic',level:5});assert.equal(model.importJSON(JSON.stringify(e)),true);return model.find(id);}
const item=addItem('Teststab','weapon',{damage:12,health:3});
let heroInitialized=false;
let heroSwitchCount=0;
const ui=box.DenkmalLootUI.create(model,{editable:()=>editable,onClose(){},onImport(){},onSelectHero(next){hero=next;heroSwitchCount++;},getHero:()=>{if(!heroInitialized)throw Error('Hero getter must wait until game startup finishes');return hero;}});
heroInitialized=true;
const find=(root,predicate)=>root.querySelectorAll().find(predicate);
ui.render();
assert.equal(get('lootForgeTab').getAttribute('aria-selected'),'false','forge is a third accessible view');
assert.equal(get('lootForgePanel').hidden,true);
get('lootForgeTab').onclick();assert.equal(get('lootForgePanel').hidden,false);
assert.equal(get('lootBagPanel').hidden,true);assert.equal(get('lootEquipmentPanel').hidden,true);
get('lootEquipmentTab').onclick();
assert.equal(get('lootSelectKim').getAttribute('aria-pressed'),'true');
get('lootSelectMarcel').onclick();assert.equal(hero,'marcel');assert.equal(heroSwitchCount,1);
assert.match(get('lootHeroTitle').textContent,/MARCEL/);
get('lootSelectKim').onclick();assert.equal(hero,'kim');assert.equal(heroSwitchCount,2);
assert.match(get('lootHeroRole').textContent,/TREFFSICHERE/);
assert.match(get('lootHeroPortrait').src,/kim/,'inventory portrait follows selected hero');
assert.match(get('lootHeroTitle').textContent,/KIM/);
get('lootBagTab').onclick();
assert.equal(get('lootBagPanel').hidden,false);assert.equal(get('lootEquipmentPanel').hidden,true);
get('lootEquipmentTab').onclick();assert.equal(get('lootEquipmentPanel').hidden,false);assert.equal(get('lootBagPanel').hidden,true);
get('lootBagTab').onclick();find(get('inventoryGrid'),e=>e.dataset.itemId===item.id).onclick();
assert.equal(get('inventoryScreen').dataset.detailOpen,'true');
assert.equal(get('lootDetail').getAttribute('role'),'dialog','mobile comparison is a dialog');
assert.equal(get('lootDetail').getAttribute('aria-modal'),'true');
assert.match(get('lootDetail').textContent,/Angelegt/);assert.match(get('lootDetail').textContent,/Auswahl/);
assert.ok(find(get('lootDetail'),e=>e.className==='positive'&&e.textContent.includes('+12')),'comparison shows explicit positive difference');
assert.ok(find(get('lootDetail'),e=>e.className==='negative'&&e.textContent.includes('Entfällt')),'lost power is visible');
const actions=()=>find(get('lootDetail'),e=>e.className==='loot-core-actions').children;
assert.match(actions()[0].textContent,/ANLEGEN/);assert.match(actions()[1].textContent,/FAVORISIEREN/);assert.match(actions()[2].textContent,/RECYCELN/);
actions()[1].focus();actions()[1].onclick();assert.equal(document.activeElement.id,'lootFavoriteAction','favorite action retains keyboard focus after rendering');assert.equal(model.find(item.id).favorite,true);assert.equal(actions()[2].disabled,true,'favorites cannot be recycled');
actions()[1].onclick();actions()[0].onclick();assert.equal(model.view(hero).equipped.weapon,item.id);
get('lootDetail').onkeydown({key:'Escape',preventDefault(){},stopPropagation(){}});
assert.equal(get('inventoryScreen').dataset.detailOpen,'false','escape closes item sheet, not inventory');
assert.equal(document.activeElement.dataset.itemId,item.id,'focus returns to clicked item after sheet close');
assert.equal(get('lootDetail').getAttribute('role'),'region');
const disposable=addItem('Recycling','boots',{speed:.1});ui.render();
find(get('inventoryGrid'),e=>e.dataset.itemId===disposable.id).onclick();actions()[2].onclick();
get('lootConfirm').children.find(e=>e.tagName==='button'&&e.textContent==='BESTÄTIGEN').onclick();
assert.equal(get('inventoryScreen').dataset.detailOpen,'false','recycling closes the removed item sheet');
const forge=addItem('Schmiedestab','weapon',{damage:20,haste:.1});ui.render();find(get('inventoryGrid'),e=>e.dataset.itemId===forge.id).onclick();
assert.match(get('lootDetail').textContent,/50/);get('lootUpgradeAction').onclick();get('lootConfirm').children.find(e=>e.tagName==='button'&&e.textContent==='BESTÄTIGEN').onclick();assert.equal(model.find(forge.id).stats.damage,21);get('lootUpgradeAction').onclick();
hero='marcel';ui.render();assert.equal(get('lootConfirm').hidden,true,'hero change discards the open forge confirmation');assert.equal(model.find(forge.id).upgradeRank,1);
const shared=find(get('inventoryGrid'),e=>e.dataset.itemId===item.id);assert.ok(shared,'all-items filter includes equipment used only by Kim');assert.match(shared.textContent,/Kim/);shared.onclick();assert.equal(get('lootRecycleAction').disabled,true,'inactive hero equipment is protected in the UI');
for(const [winner,loser,name]of [['ash','oath','Steinwacht'],['echo','ember','Abendrot'],['bell','lantern','Erinnerungslicht']]){
 const candidate=addItem('Precedence '+winner,'boots',{speed:.1},winner);ui.render();
 const candidateCard=find(get('inventoryGrid'),e=>e.dataset.itemId===candidate.id);
 assert.equal(!!find(candidateCard,e=>e.className==='loot-upgrade'),false,`${winner} must not promise a guaranteed upgrade when it suppresses ${loser} in another slot`);
 candidateCard.onclick();assert.match(get('lootDetail').textContent,new RegExp('Entfällt.*'+name),'comparison warns before equipping a precedence-changing item');get('lootDetailClose').onclick();
}
const ringLow=addItem('Ring low','ring1',{damage:1}),ringHigh=addItem('Ring high','ring1',{damage:20}),ringCandidate=addItem('Ring candidate','ring1',{damage:5});
assert.equal(model.equip(ringLow.id,'ring1','marcel'),true);assert.equal(model.equip(ringHigh.id,'ring2','marcel'),true);ui.render();
find(get('inventoryGrid'),e=>e.dataset.itemId===ringCandidate.id).onclick();
assert.ok(find(find(get('inventoryGrid'),e=>e.dataset.itemId===ringCandidate.id),e=>e.className==='loot-upgrade'));
find(get('lootDetail'),e=>e.className==='loot-ring-choice').children[1].onclick();
assert.equal(!!find(find(get('inventoryGrid'),e=>e.dataset.itemId===ringCandidate.id),e=>e.className==='loot-upgrade'),false,'upgrade marker follows the selected Ring II comparison');
get('lootDetailClose').onclick();
find(get('inventoryGrid'),e=>e.dataset.itemId===forge.id).onclick();get('lootUpgradeAction').onclick();
const confirm=get('lootConfirm').children.find(e=>e.tagName==='button'&&e.textContent==='BESTÄTIGEN');const newer=JSON.parse(data.get(box.DenkmalLoot.KEY));newer.profile.essence++;data.set(box.DenkmalLoot.KEY,JSON.stringify(newer));confirm.onclick();assert.equal(model.find(forge.id).upgradeRank,1);assert.equal(model.readOnly,true);
assert.match(get('lootHeroPortrait').src,/marcel/);
mobile=false;events.resize();assert.equal(get('lootBagPanel').hidden,false);assert.equal(get('lootEquipmentPanel').hidden,false,'desktop keeps both panels');
get('lootEquipmentTab').onclick();get('lootEquipmentTab').onkeydown({key:'End',preventDefault(){}});
assert.equal(get('lootForgeTab').getAttribute('aria-selected'),'true','End key reaches third view');
get('lootForgeTab').onkeydown({key:'ArrowRight',preventDefault(){}});
assert.equal(get('lootEquipmentTab').getAttribute('aria-selected'),'true','arrow keys wrap through three tabs');
editable=false;ui.render();find(get('inventoryGrid'),e=>e.dataset.itemId===item.id).onclick();assert.ok(actions().every(e=>e.disabled),'combat inventory cannot change equipment');
assert.equal(get('lootSelectKim').disabled,true,'read-only armory locks hero editing');
assert.equal(get('lootSalvageAllBtn').disabled,true,'read-only armory locks bulk recycling');
ui.close();assert.equal(get('inventoryScreen').dataset.detailOpen,'false');
editable=true;
const original=fs.readFileSync(path.join(__dirname,'fixtures/loot-v2.json'),'utf8'),recoveryData=new Map([[box.DenkmalLoot.KEY,original],[box.DenkmalLoot.KEY+'-pre-v3','broken']]);
const recovery=box.DenkmalLoot.create({storage:{getItem:k=>recoveryData.get(k)||null,setItem:(k,v)=>recoveryData.set(k,v)}});assert.equal(recovery.save(),false);
box.DenkmalLootUI.create(recovery,{editable:()=>true,onClose(){},onImport(){}}).render();
assert.equal(get('lootRecoveryBtn').hidden,false,'a blocked migration offers original primary raw export');assert.equal(get('lootPreMigrationBtn').hidden,false,'the conflicting pre-v3 raw remains exportable too');
console.log('Inventory hero portraits, mobile tabs, comparison values, consistent actions and write guards passed');
// V2 filters apply to the collection without changing equipment.
const filterModel=box.DenkmalLoot.create({storage:{getItem:()=>null,setItem(){}}});
const filterUI=box.DenkmalLootUI.create(filterModel,{editable:()=>true,onClose(){},onImport(){}});filterUI.render();
get('lootSlotFilter').onchange({target:{value:'armor'}});assert.equal(get('inventoryGrid').children.filter(e=>e.dataset.itemId).length,1);
get('lootSlotFilter').onchange({target:{value:'all'}});get('lootFilter').onchange({target:{value:'upgrades'}});assert.equal(get('inventoryGrid').children.filter(e=>e.dataset.itemId).length,0);
assert.equal(filterModel.profile.owned.length,3,'filters never mutate collection');
const rings=JSON.parse(filterModel.exportJSON());rings.profile.owned.push({id:'ring-upgrade',name:'Ring',slot:'ring1',level:1,rarity:'magic',power:null,favorite:false,legacy:true,stats:{crit:.1},baseStats:{crit:.1},upgradeRank:0});assert.equal(filterModel.importJSON(JSON.stringify(rings)),true);
get('lootFilter').onchange({target:{value:'all'}});find(get('inventoryGrid'),e=>e.dataset.itemId==='starter-ember').onclick();
get('lootFilter').onchange({target:{value:'upgrades'}});assert.ok(find(get('inventoryGrid'),e=>e.dataset.itemId==='ring-upgrade'),'ring upgrade remains visible after inspecting a weapon');
// New inventory tools are presentation state only: combining search and filters cannot mutate loot v4.
const saveBeforeSearch=filterModel.exportJSON();
get('lootFilter').onchange({target:{value:'all'}});
get('lootSearch').oninput({target:{value:'rInG'}});
assert.ok(find(get('inventoryGrid'),e=>e.dataset.itemId==='ring-upgrade'),'case-insensitive search finds ring');
get('lootSlotFilter').onchange({target:{value:'rings'}});
get('lootFilter').onchange({target:{value:'magic'}});
assert.ok(find(get('inventoryGrid'),e=>e.dataset.itemId==='ring-upgrade'),'search, slot, and rarity filters combine');
assert.match(get('lootResultCount').textContent,/von \d+/,'result count is visible');
get('lootClearFilters').onclick();
assert.equal(get('lootSearch').value,'');
assert.equal(get('inventoryGrid').children.filter(e=>e.dataset.itemId).length,4,'reset restores all items');
assert.equal(filterModel.exportJSON(),saveBeforeSearch,'filters never write to the saved collection');
get('lootForgeTab').onclick();
const bulkPreview=filterModel.salvagePreview();
assert.match(get('lootSalvageAllBtn').textContent,new RegExp(String(bulkPreview.count)));
get('lootSalvageAllBtn').onclick();
assert.match(get('lootConfirm').textContent,new RegExp(String(bulkPreview.essence)));
assert.equal(filterModel.exportJSON(),saveBeforeSearch,'bulk recycling waits for explicit confirmation');
get('lootConfirm').onkeydown({key:'Escape',preventDefault(){},stopPropagation(){}});
assert.equal(get('lootConfirm').hidden,true,'Escape cancels destructive confirmation');
assert.equal(filterModel.exportJSON(),saveBeforeSearch,'Escape cannot recycle anything');
get('lootSalvageAllBtn').onclick();
find(get('lootConfirm'),e=>e.tagName==='button'&&e.textContent==='ABBRECHEN').onclick();
assert.equal(filterModel.exportJSON(),saveBeforeSearch,'cancelling recycling leaves inventory unchanged');
