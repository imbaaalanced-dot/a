'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function setup(){
 let doc;
 class Node{
  constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.dataset={};this.style={setProperty(){}};this.classList={toggle(){}};this.attributes={};this._text='';}
  set textContent(v){this._text=String(v);this.children=[];} get textContent(){return this._text+this.children.map(c=>c.textContent).join(' ');}
  append(...nodes){this.children.push(...nodes);}replaceChildren(...nodes){this._text='';this.children=[...nodes];}setAttribute(k,v){this.attributes[k]=v;}
  contains(node){return this===node||this.children.some(c=>c.contains(node));}focus(){doc.activeElement=this;}scrollIntoView(){}getClientRects(){return [{}];}
 }
 const nodes=new Map();doc={activeElement:null,getElementById(id){if(!nodes.has(id)){const n=new Node();n.id=id;nodes.set(id,n);}return nodes.get(id);},createElement:tag=>new Node(tag)};
 const ctx={document:doc,matchMedia:()=>({matches:true})};vm.createContext(ctx);
 for(const f of ['loot.js','loot-ui.js'])vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),ctx);
 const data=new Map(),model=ctx.DenkmalLoot.create({storage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)}});
 const item=(id,slot,rarity,stats)=>({id,name:id,slot,rarity,stats,level:10,power:null,favorite:false});
 model.add(item('helm','head','rare',{health:20,defense:.03}));model.add(item('boots','boots','rare',{speed:.1}));
 model.add(item('magic-helm','head','magic',{health:10}));model.add(item('ring','ring2','rare',{crit:.02}));
 const ui=ctx.DenkmalLootUI.create(model,{editable:()=>true,onClose(){},onImport(){}});ui.render();
 return {model,ui,$:doc.getElementById.bind(doc)};
}
const ids=n=>n.children.filter(c=>c.dataset.itemId).map(c=>c.dataset.itemId);
test('Inventory combines rarity and slot filters, including both ring slots and overflow',()=>{
 const {$,model,ui}=setup();assert.equal(typeof $('lootSlotFilter').onchange,'function','slot filter is wired');
 $('lootFilter').onchange({target:{value:'rare'}});$('lootSlotFilter').onchange({target:{value:'head'}});
 assert.deepEqual(ids($('inventoryGrid')),['helm']);
 for(let n=0;n<30;n++)model.add({id:'filler-'+n,name:'Füllgegenstand',slot:'weapon',rarity:'common',stats:{damage:1},power:null,level:1,favorite:false});
 const extra={id:'overflow-helm',name:'Überlaufhelm',slot:'head',rarity:'rare',stats:{health:10},power:null,level:1,favorite:false};model.add(extra);ui.render();
 const rendered=$('lootOverflow').textContent;assert.ok(rendered.includes('Überlaufhelm'));assert.ok(!rendered.includes('boots'));
 $('lootSlotFilter').onchange({target:{value:'rings'}});assert.deepEqual(ids($('inventoryGrid')),['ring']);
 $('lootFilter').onchange({target:{value:'favorites'}});assert.deepEqual(ids($('inventoryGrid')),[]);assert.match($('lootEmptyHint').textContent,/Filter/);
});
test('Item selection displays current, found and delta values in a comparison table',()=>{
 const {$}=setup();$('inventoryGrid').children.find(n=>n.dataset.itemId==='helm').onclick();
 const detail=$('lootDetail'),table=detail.children.find(n=>n.tagName==='TABLE');assert.ok(table,'actual accessible comparison table');
 for(const label of ['Angelegt','Fund','Änderung','Lebenspunkte','20'])assert.ok(table.textContent.includes(label));
 assert.ok(detail.textContent.includes('ANLEGEN'));
});
test('Favorite remains protected from bulk recycling while filters are active',()=>{
 const {model,$}=setup();model.favorite('helm');$('lootFilter').onchange({target:{value:'magic'}});
 $('lootSalvageAllBtn').onclick();const confirm=$('lootConfirm').children.find(n=>n.tagName==='BUTTON'&&n.textContent==='BESTÄTIGEN');confirm.onclick();
 assert.ok(model.find('helm'));assert.equal(model.find('boots'),null);assert.equal(model.profile.items.length,3);
});
test('Occupied equipment compares positive health and negative percentage-point deltas',()=>{
 const {model,ui,$}=setup();
 model.add({id:'worn-head',name:'Alter Helm',slot:'head',rarity:'rare',stats:{health:10,defense:.05},power:null,level:8,favorite:false});model.equip('worn-head');ui.render();
 $('inventoryGrid').children.find(n=>n.dataset.itemId==='helm').onclick();
 const table=$('lootDetail').children.find(n=>n.tagName==='TABLE'),rows=table.children.find(n=>n.tagName==='TBODY').children;
 const health=rows.find(n=>n.textContent.includes('Lebenspunkte')),defense=rows.find(n=>n.textContent.includes('Schadensreduktion'));
 assert.deepEqual(health.children.slice(1).map(n=>n.textContent),['10','20','+10']);
 assert.deepEqual(defense.children.slice(1).map(n=>n.textContent),['5 %','3 %','-2 % Pkt.']);
});
test('Ring comparison and equip action use the explicitly selected second ring slot',()=>{
 const {model,ui,$}=setup();
 model.add({id:'worn-ring',name:'Alter Ring',slot:'ring2',rarity:'rare',stats:{crit:.05},power:null,level:8,favorite:false});model.equip('worn-ring','ring2');ui.render();
 $('inventoryGrid').children.find(n=>n.dataset.itemId==='ring').onclick();
 $('lootDetail').children.find(n=>n.className==='loot-ring-choice').children.find(n=>n.textContent==='Ring II').onclick();
 const table=$('lootDetail').children.find(n=>n.tagName==='TABLE');assert.match(table.textContent,/Ring II/);assert.match(table.textContent,/-3 % Pkt\./);
 $('lootDetail').children.find(n=>n.className==='loot-detail-actions').children.find(n=>n.textContent==='ANLEGEN').onclick();
 assert.equal(model.profile.equipped.ring2,'ring');assert.equal(model.profile.equipped.ring1,null);
});
