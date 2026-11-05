'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'../dist');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'portrait-home-v1.css'),'utf8');
const source=fs.readFileSync(path.join(root,'portrait-home-v1.js'),'utf8');
assert.match(html,/href="portrait-home-v1\.css\?v=style2-portrait1"/);
assert.match(html,/src="portrait-home-v1\.js\?v=style2-portrait1"/);
for(const id of ['menuHomeActions','menuPlayBtn','menuCampaignBtn','menuAnsturmBtn','menuArcadeBtn','menuCharacterBtn','collectionBtn','menuOptionsBtn']){
 assert.match(html,new RegExp('id="'+id+'"'),'missing game navigation destination '+id);
}
assert.match(css,/@media\s*\(orientation:portrait\)/);
assert.match(css,/#startScreen #menuHomeActions\[hidden\]/);
assert.doesNotMatch(source,/localStorage|\.save\(|startGame\(/,'portrait decorator must not write game saves or start levels directly');
let actions=[],listeners={},elements={};
function el(id){
 if(!elements[id])elements[id]={id,clicked:0,click(){this.clicked++},querySelector(){return null},append(child){this.child=child},addEventListener(type,fn){listeners[type]=fn}};
 return elements[id];
}
const body={className:'',innerHTML:'',listeners:{},addEventListener(type,fn){this.listeners[type]=fn}};
const doc={getElementById(id){return id==='menuHomeActions'?el(id):el(id)},createElement(){return body}};
vm.runInNewContext(source,{document:doc});
assert.equal(el('menuHomeActions').child,body);
const trigger=(target)=>{body.listeners.click({target:{closest:()=>({dataset:{td2Target:target},disabled:false})}})};
trigger('campaign');assert.equal(el('menuPlayBtn').clicked,1);assert.equal(el('menuCampaignBtn').clicked,1);
trigger('endless');assert.equal(el('menuArcadeBtn').clicked,1);
trigger('rush');assert.equal(el('menuAnsturmBtn').clicked,1);
trigger('inventory');assert.equal(el('collectionBtn').clicked,1);
trigger('options');assert.equal(el('menuOptionsBtn').clicked,1);
trigger('equipment');trigger('heroes');assert.equal(el('menuCharacterBtn').clicked,2);
console.log('Portrait home: existing game routes, no save mutations, CSS wiring passed');
