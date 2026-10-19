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
vm.createContext(box);const dist=path.join(__dirname,'../dist');
for(const f of ['loot.js','loot-ui.js'])vm.runInContext(fs.readFileSync(path.join(dist,f),'utf8'),box);
const data=new Map(),model=box.DenkmalLoot.create({storage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)},canManage:()=>editable});
const item=model.generate(5);item.slot='weapon';item.stats={damage:12,health:3};item.power=null;item.favorite=false;item.name='Teststab';model.add(item);
const ui=box.DenkmalLootUI.create(model,{editable:()=>editable,onClose(){},onImport(){},getHero:()=>hero});
const find=(root,predicate)=>root.querySelectorAll().find(predicate);
ui.render();
assert.match(get('lootHeroPortrait').src,/kim/,'inventory portrait follows selected hero');
assert.match(get('lootHeroTitle').textContent,/KIM/);
assert.equal(get('lootBagPanel').hidden,false);assert.equal(get('lootEquipmentPanel').hidden,true);
get('lootEquipmentTab').onclick();assert.equal(get('lootEquipmentPanel').hidden,false);assert.equal(get('lootBagPanel').hidden,true);
get('lootBagTab').onclick();find(get('inventoryGrid'),e=>e.dataset.itemId===item.id).onclick();
assert.equal(get('inventoryScreen').dataset.detailOpen,'true');
assert.match(get('lootDetail').textContent,/Angelegt/);assert.match(get('lootDetail').textContent,/Auswahl/);
assert.ok(find(get('lootDetail'),e=>e.className==='positive'&&e.textContent.includes('+12')),'comparison shows explicit positive difference');
assert.ok(find(get('lootDetail'),e=>e.className==='negative'&&e.textContent.includes('Entfällt')),'lost power is visible');
const actions=()=>find(get('lootDetail'),e=>e.className==='loot-core-actions').children;
assert.match(actions()[0].textContent,/ANLEGEN/);assert.match(actions()[1].textContent,/FAVORISIEREN/);assert.match(actions()[2].textContent,/RECYCELN/);
actions()[1].onclick();assert.equal(model.profile.bag[0].favorite,true);assert.equal(actions()[2].disabled,true,'favorites cannot be recycled');
actions()[1].onclick();actions()[0].onclick();assert.equal(model.profile.equipped.weapon,item.id);
get('lootDetailClose').onclick();assert.equal(get('inventoryScreen').dataset.detailOpen,'false');
const disposable=model.generate(2);disposable.favorite=false;model.add(disposable);ui.render();
find(get('inventoryGrid'),e=>e.dataset.itemId===disposable.id).onclick();actions()[2].onclick();
get('lootConfirm').children.find(e=>e.tagName==='button'&&e.textContent==='BESTÄTIGEN').onclick();
assert.equal(get('inventoryScreen').dataset.detailOpen,'false','recycling closes the removed item sheet');
hero='marcel';ui.render();assert.match(get('lootHeroPortrait').src,/marcel/);
mobile=false;events.resize();assert.equal(get('lootBagPanel').hidden,false);assert.equal(get('lootEquipmentPanel').hidden,false,'desktop keeps both panels');
editable=false;ui.render();find(get('loadoutSlots'),e=>e.dataset.itemId===item.id).onclick();assert.ok(actions().every(e=>e.disabled),'combat inventory cannot change equipment');
ui.close();assert.equal(get('inventoryScreen').dataset.detailOpen,'false');
console.log('Inventory hero portraits, mobile tabs, comparison values, consistent actions and write guards passed');
