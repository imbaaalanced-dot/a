'use strict';
// V5 duo art must never interfere with menu navigation if image delivery fails.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'../dist');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'portrait-avatars-v5.css'),'utf8');
const source=fs.readFileSync(path.join(root,'portrait-avatars-v5.js'),'utf8');

assert.match(html,/portrait-avatars-v5\.css\?v=duo-v5a1/);
assert.match(html,/portrait-avatars-v5\.js\?v=duo-v5b1/);
assert.match(source,/marcel-guardian-v5b\.webp\?v=v5b1/);
assert.match(source,/kim-marksman-v5b\.webp\?v=v5b1/);
assert.match(source,/successful===sources\.length/);
assert.match(source,/stage\.remove\(\)/);
assert.doesNotMatch(source,/localStorage|startGame\(|fetch\(|requestAnimationFrame\(/);
assert.match(css,/prefers-reduced-motion:reduce/);
assert.match(css,/max-height:700px/);
assert.match(css,/pointer-events:none/);

function node(){
 const n={
   attrs:{},events:{},children:[],classList:{added:[],add(v){this.added.push(v)}},
   appendChild(x){this.children.push(x)},setAttribute(k,v){this.attrs[k]=v},
   addEventListener(k,fn){this.events[k]=fn},remove(){this.removed=true},
   querySelector(){return null},insertBefore(x,target){this.inserted=x;this.before=target}
 };
 return n;
}
const home=node(),actions=node(),made=[];
home.querySelector=s=>s==='.td2-mode-stack'?actions:null;
const document={querySelector:s=>s==='#startScreen .td2-portrait-home'?home:null,createElement:()=>{const n=node();made.push(n);return n}};
vm.runInNewContext(source,{document});
const stage=home.inserted;
assert.ok(stage,'stage registered without changing navigation');
assert.equal(home.before,actions,'stage before existing buttons');
assert.equal(stage.classList.added.length,0,'unloaded art does not replace current menu');
const heroes=made.filter(n=>n.className&&n.className.startsWith('td2-v5-hero '));
assert.equal(heroes.length,2);
heroes[0].naturalWidth=200;heroes[0].naturalHeight=400;heroes[1].naturalWidth=200;heroes[1].naturalHeight=400;
heroes[0].events.load();assert.equal(stage.classList.added.length,0,'both heroes must load');
heroes[1].events.load();assert.deepEqual(stage.classList.added,['is-ready']);
heroes[0].events.error();assert.equal(stage.removed,true,'failed asset restores previous menu instead of broken images');

console.log('V5 avatar stage: guarded asset loading, no save mutations, reduced-motion CSS passed');
