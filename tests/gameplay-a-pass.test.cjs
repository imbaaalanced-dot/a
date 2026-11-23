'use strict';
/* Gameplay A-Pass (#Beta): Folgewellen-Vorschau im Kampf, Boss-Distanz, Endlos-Rekord. */
const assert=require('node:assert/strict');
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../dist/game.js'),'utf8');
function takeFunction(name){
  const start=source.indexOf('function '+name+'(');
  assert.ok(start>=0,name+' existiert');
  const bodyStart=source.indexOf('{',start);
  let depth=0;
  for(let i=bodyStart;i<source.length;i++){
    if(source[i]==='{')depth++;
    if(source[i]==='}'){depth--;if(depth===0)return source.slice(start,i+1);}
  }
  assert.fail(name+' nicht extrahierbar');
}
{
  const sandbox={campaign20Plan:w=>(w>20?null:w===10||w===20?{boss:true}:{})};
  vm.createContext(sandbox);
  vm.runInContext(takeFunction('bossAhead'),sandbox);
  assert.equal(sandbox.bossAhead(10),' · BOSSWELLE!','Bosswelle selbst wird markiert');
  assert.equal(sandbox.bossAhead(9),' · BOSS IN EINER WELLE','Distanz 1');
  assert.equal(sandbox.bossAhead(5),' · BOSS IN 5 WELLN','Distanz 5');
  assert.equal(sandbox.bossAhead(3),'','Distanz >5 wird bewusst NICHT vorangekuendigt');
  assert.equal(sandbox.bossAhead(25),'','ohne 20er-Planer kein Text');
}
{
  const saved={'td2.endless.level2.record':'23'};
  const sandbox={storage:{getItem:k=>saved[k]||null}};
  vm.createContext(sandbox);
  vm.runInContext(takeFunction('readEndlessRecord'),sandbox);
  assert.equal(sandbox.readEndlessRecord(2),23,'Rekord gelesen');
  assert.equal(sandbox.readEndlessRecord(3),0,'ohne Rekord 0');
}
{
  assert.match(source,/if\(game\.mode==='endless'\)\{const reached=\(campaign20Plan\(game\.wave\)\?campaignWaveLabel\(game\.wave\)-1:game\.wave-1\),prev=readEndlessRecord\(game\.level\)/,'GameOver schreibt/liest den Rekord nur im Endlosmodus');
  assert.match(source,/td2\.endless\.level'\+game\.level\+'\.record/,'Rekord-Schluessel pro Level');
  assert.match(source,/ENDLOS-REKORD: WELLE \$\{reached\} \(NEU\)/,'neuer Rekord wird markiert');
  assert.match(source,/'ENDLOS · REKORD WELLE '\+endlessRecord/,'Level-Label zeigt den Rekord');
}
{
  assert.match(source,/`NÄCHSTE WELLE · \$\{wavePlan\(game\.wave\+1\)\.name\} · \$\{wavePreviewText\(game\.wave\+1\)\}/,'Kampf-Vorschau zeigt die FOLGEWelle');
  assert.match(source,/wavePreviewText\(wave=game\.wave\)\{/,'Preview-Text akzeptiert eine Wellennummer (Cache pro Welle)');
  assert.match(source,/setHidden\(preview,!playing\|\|inPortal\(\)&&portalRun\.phase!=='build'\)/,'Preview bleibt im Kampf sichtbar, Portal respektiert Bau-Phase');
  assert.match(source,/campaign20Plan\(game\.wave\)\?bossAhead\(game\.wave\):/,'Baupause: Boss-Distanz im 20er-Feld');
  assert.match(source,/campaign20Plan\(game\.wave\+1\)\?bossAhead\(game\.wave\+1\):''/,'Kampf: Boss-Distanz auf die Folgewelle');
}
assert.match(fs.readFileSync(path.join(__dirname,'../dist/index.html'),'utf8'),/game\.js\?v=gameplay-b-20261123/,'game.js cache key gebumpt');
console.log('Gameplay A-Pass: Kampf-Vorschau, Boss-Distanz und Endlos-Rekord gepinnt');
