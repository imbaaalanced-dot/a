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
assert.match(fs.readFileSync(path.join(__dirname,'../dist/index.html'),'utf8'),/game\.js\?v=gameplay-voice-20261123/,'game.js cache key gebumpt');
console.log('Gameplay A-Pass: Kampf-Vorschau, Boss-Distanz und Endlos-Rekord gepinnt');
/* B-Anschluss: Portal-Rekord (tiefster erreichter Abschnitt, analog zum Endlos-Rekord). */
{
  const s=source;
  assert.match(s,/function readPortalRecord\(\)\{try\{return Number\(storage\?\.getItem\('td2\.portal\.record\.section'\)\)\|\|0\}catch\{return 0\}\}/,'Portal-Rekord-Lese mit Storage-Guard');
  assert.match(s,/function writePortalRecord\(section\)\{try\{const prev=readPortalRecord\(\);if\(section>prev\)storage\.setItem\('td2\.portal\.record\.section',String\(section\)\)\}catch\{\}\}/,'Portal-Rekord schreibt nur persoenliche Bestmarken');
  assert.match(s,/writePortalRecord\(portalRun\.section\);showToast\('PORTALREISE · ABSCHNITT '/,'Tiefe wird beim Abschnitts-Eintritt dokumentiert');
  assert.match(s,/PORTAL-REKORD: ABSCHNITT '\+readPortalRecord\(\)/,'Portal-Abschluss zeigt die Bestmarke');
  assert.match(s,/' · REKORD '\+readPortalRecord\(\)/,'HUD zeigt den Portal-Rekord');
}
console.log('Portal-Rekord gepinnt');
/* Chronik-Stimmen: Trigger im Spiel (23.11.2026). */
{
  assert.match(source,/bossVoiceSeen!==game\.wave&&campaign20Plan\(game\.wave\)&&!campaign20Plan\(game\.wave\)\.boss&&campaign20Plan\(game\.wave\+1\)\?\.boss\)\{bossVoiceSeen=game\.wave;saga\.speak\('bossnear'\);\}/,'Boss-Ankuendigung: einmal je Welle vor der Bosswelle (20er-Kampagne)');
  assert.match(source,/if\(reached>prev&&reached>0\)saga\.speak\('record'\);/,'Endlos-Rekord wird besprochen');
  assert.match(source,/if\(portalRun\.phase==='exit'\)saga\.speak\('portalsecure'\);/,'Portal-Abschnittssicherung wird besprochen');
  assert.match(source,/prevPortalRecord=readPortalRecord\(\);if\(portalRun\.section>prevPortalRecord\)saga\.speak\('record'\);/,'Portal-Rekord wird nur bei Bestmarke besprochen');
}
console.log('Chronik-Stimmen-Trigger gepinnt');
