/* TD2 HUD 2.0: context menu behavior, not the mocked callback itself. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');

class Node {
  constructor(){this.textContent='';this.children=[];this.hidden=false;this.disabled=false;this.dataset={};this.attributes={};this.classes=new Set();this.classList={add:x=>this.classes.add(x),remove:x=>this.classes.delete(x),contains:x=>this.classes.has(x)};}
  replaceChildren(...children){this.children=children;}
  appendChild(child){this.children.push(child);}
  setAttribute(k,v){this.attributes[k]=v;}
  click(){if(!this.disabled)this.onclick?.();}
}
const title=new Node(),choices=new Node(),closeButton=new Node(),root=new Node();
root.querySelector=s=>({'.touch-context-title':title,'.touch-context-options':choices,'.touch-context-close':closeButton})[s];
const sandbox={document:{createElement:()=>new Node()},console};
vm.createContext(sandbox);
const script=path.join(__dirname,'../dist/touch-context-hud.js');
assert.ok(fs.existsSync(script),'the contextual tower UI module must exist');
vm.runInContext(fs.readFileSync(script,'utf8'),sandbox);
const css=fs.readFileSync(path.join(__dirname,'../dist/combat-hud-v2.css'),'utf8');
const closeRule=css.match(/\.touch-context-close\{([^}]+)\}/)?.[1]||'';
assert.match(closeRule,/min-height:48px/,'the menu close button remains an accessible 48px touch target');
const landscape=css.split('@media (pointer:coarse) and (orientation:landscape)')[1]||'';
assert.match(landscape,/\.touch-context\{bottom:calc\(var\(--hud-safe-bottom,12px\) \+ 82px\)/,'landscape menu must sit above ability buttons');

let playing=true,allowBuild=true,builds=0,spent=0;
const hud=sandbox.DenkmalTouchContext.create(root,{
  isPlaying:()=>playing,
  canBuild:()=>allowBuild,
  build:(slot,kind)=>{builds++;spent+=kind==='bow'?25:35;return true;},
});
const slot={x:120,y:180};
const types=[{kind:'bow',label:'BOGEN',cost:25,enabled:true},{kind:'cannon',label:'KANONE',cost:35,enabled:false}];
hud.openBuild(slot,types);
assert.equal(hud.isOpen(),true,'touching a free pad opens the tower palette');
assert.equal(choices.children.length,2,'all available choices are rendered');
assert.equal(choices.children[0].textContent,'BOGEN · 25','the cost and name are visible');
assert.equal(choices.children[1].disabled,true,'unaffordable choices are disabled');
choices.children[0].click();
assert.equal(builds,1,'the chosen tower builds once');
assert.equal(spent,25,'the purchase costs the correct essence');
assert.equal(hud.isOpen(),false,'the palette closes after building');

hud.openBuild(slot,types);
allowBuild=false;
choices.children[0].click();
assert.equal(builds,1,'a stale palette cannot buy when funds changed');
hud.openBuild(slot,types);
playing=false;
choices.children[0].click();
assert.equal(builds,1,'the same open palette cannot build after pausing');
playing=true;allowBuild=true;

const tower={x:320,y:420,level:1,targetMode:'first'};
let upgraded=null,targeted=null,sold=null;
hud.openTower(tower,[
  {label:'AUFWERTEN · 35',enabled:true,run:t=>{upgraded=t;t.level++;}},
  {label:'ZIEL · ERSTER',enabled:true,run:t=>{targeted=t;t.targetMode='strongest';}},
  {label:'VERKAUFEN',enabled:true,run:t=>{sold=t;}},
]);
assert.equal(choices.children.length,3,'the occupied tower shows context actions');
choices.children[1].click();
assert.equal(targeted,tower,'target priority applies to tapped tower');
assert.equal(tower.targetMode,'strongest');
hud.openTower(tower,[{label:'AUFWERTEN',enabled:true,run:t=>{upgraded=t;t.level++;}}]);
choices.children[0].click();
assert.equal(upgraded,tower,'upgrade applies to tapped tower');
assert.equal(tower.level,2);
hud.openTower(tower,[{label:'VERKAUFEN',enabled:true,run:t=>{sold=t;}}]);
choices.children[0].click();
assert.equal(sold,tower,'sell applies to tapped tower');
hud.openBuild(slot,types);
closeButton.click();
assert.equal(hud.isOpen(),false,'closing never builds or spends');
assert.equal(builds,1);
console.log('TD2 contextual HUD behavior tests passed');
