'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('dist/freeze-diagnostics.js','utf8');
const game=fs.readFileSync('dist/game.js','utf8');
const html=fs.readFileSync('dist/index.html','utf8');
assert(html.indexOf('freeze-diagnostics.js?v=diag1')<html.indexOf('game.js?v=v410a1freeze1'));
assert(game.includes('globalThis.TD2FreezeDiagnostics?.beat(state,game)'));
function setup(){
 let clock=1000,watchdog;const callbacks={},panels=[];
 const document={hidden:false,body:{appendChild(el){panels.push(el)}},createElement(tag){return{tag,style:{},children:[],appendChild(el){this.children.push(el)},remove(){this.removed=true}}}};
 const context={document,Date:{now(){return clock}},setInterval(cb){watchdog=cb},addEventListener(type,cb){callbacks[type]=cb},navigator:{clipboard:{writeText(){return Promise.resolve()}}}};
 vm.createContext(context);vm.runInContext(source,context);
 return {context,document,callbacks,panels,watchdog,advance(ms){clock+=ms}};
}
const stalled=setup();stalled.context.TD2FreezeDiagnostics.beat('playing',{level:7,wave:26,enemies:0});
stalled.advance(3000);stalled.watchdog();assert.equal(stalled.panels.length,0);
stalled.advance(1600);stalled.watchdog();assert.equal(stalled.panels.length,1);
assert.match(stalled.panels[0].children[0].textContent,/Level 7 · Welle 26/);
stalled.watchdog();assert.equal(stalled.panels.length,1,'no repeated error overlays');
const background=setup();background.context.TD2FreezeDiagnostics.beat('playing',{level:7,wave:26});background.document.hidden=true;background.advance(9000);background.watchdog();assert.equal(background.panels.length,0);
const paused=setup();paused.context.TD2FreezeDiagnostics.beat('paused',{level:7,wave:26});paused.advance(9000);paused.watchdog();assert.equal(paused.panels.length,0);
const thrown=setup();thrown.callbacks.error({message:'Canvas error',filename:'game.js',lineno:12});assert.equal(thrown.panels.length,1);assert.match(thrown.panels[0].children[0].textContent,/Canvas error/);
console.log('Freeze diagnostics: stalled loop, focus/paused guards, single overlay and JS error capture passed');
