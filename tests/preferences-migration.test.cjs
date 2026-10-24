'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const base=fs.readFileSync(path.join(__dirname,'game.test.cjs'),'utf8').split("if(process.env.TEST_MOBILE==='1'){")[0];
function boot(entries){
  let fixture=base.replace("vm.runInContext(fs.readFileSync(path.join(root,'levels.js'),'utf8'),sandbox);",
    "vm.runInContext(fs.readFileSync(path.join(root,'persisted-state.js'),'utf8'),sandbox);vm.runInContext(fs.readFileSync(path.join(root,'levels.js'),'utf8'),sandbox);");
  const values=JSON.stringify(entries);
  fixture=fixture.replace('let source=fs.readFileSync',`for(const [k,v] of Object.entries(${values}))sandbox.localStorage.data.set(k,v);\nlet source=fs.readFileSync`);
  return new Function('require','__dirname',fixture+';return {t,sandbox};')(require,__dirname);
}
const legacy=boot({'denkmal-character':'kim','denkmal-graphics':'low','denkmal-zoom':'standard','denkmal-sound':'off','denkmal-telemetry':'on','td2-v4-intro-tutorial':'done'});
const prefs=JSON.parse(legacy.sandbox.localStorage.getItem('denkmal-preferences-v1'));
assert.equal(prefs.schemaVersion,1,'legacy settings are migrated into a versioned record');
assert.equal(prefs.data.character,'kim');assert.equal(prefs.data.graphics,'low');
assert.equal(prefs.data.zoom,'standard');assert.equal(prefs.data.sound,false);
assert.equal(prefs.data.telemetry,true);assert.equal(prefs.data.tutorialSeen,true);
assert.equal(legacy.sandbox.document.getElementById('chooseKim')['aria-pressed'],'true');
const bad='{';
const corrupt=boot({'denkmal-preferences-v1':bad,'denkmal-character':'kim'});
assert.equal(corrupt.sandbox.localStorage.getItem('denkmal-preferences-v1'),bad,'corrupt modern settings must not be overwritten');
assert.equal(corrupt.sandbox.document.getElementById('chooseMarcel')['aria-pressed'],'true','bad settings use safe defaults');
console.log('preferences: legacy character, graphics, sound and tutorial migration; corrupt record preserved');
