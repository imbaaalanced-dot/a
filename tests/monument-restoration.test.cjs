'use strict';
/* Denkmal-Restaurierung (#330 C): Kapitelabschluesse staerken das Denkmal der Karte dauerhaft (max. Stufe 3, +10 % je Stufe). */
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
  // readRestoration: Storage-Guard, Deckelung bei 3
  const sandbox={storage:{getItem:k=>({'td2.restoration.level2.record':'9','td2.restoration.level2':'3','td2.restoration.level3':'1'})[k]||null}};
  vm.createContext(sandbox);
  vm.runInContext(takeFunction('readRestoration'),sandbox);
  assert.equal(sandbox.readRestoration(2),3,'Bei Stufe 3 wird der Deckel gehalten');
  assert.equal(sandbox.readRestoration(3),1,'Stufe 1 gelesen');
  assert.equal(sandbox.readRestoration(4),0,'ohne Restaurierung 0');
}
{
  // writeRestoration: nur bis Stufe 3, sonst unverändert
  const state={'td2.restoration.level2':'2'};
  const sandbox={storage:{getItem:k=>state[k]??null,setItem:(k,v)=>{state[k]=String(v);}}};
  sandbox.captured={...state};
  vm.createContext(sandbox);
  vm.runInContext(takeFunction('readRestoration')+'\n'+takeFunction('writeRestoration'),sandbox);
  sandbox.writeRestoration(2);
  assert.equal(sandbox.readRestoration(2),3,'Stufe 2 -> 3');
  sandbox.writeRestoration(2);
  assert.equal(sandbox.readRestoration(2),3,'Deckelung: Stufe 3 bleibt 3');
  sandbox.writeRestoration(5);
  assert.equal(sandbox.readRestoration(5),1,'neue Karte startet bei Stufe 1');
}
{
  // Wirkung: Denkmal-Gesundheit in Kampagne/Endlos, Portal unberÃ¼hrt
  assert.match(source,/monument:\{x:WORLD_W\*\.5,y:WORLD_H\*\.5,r:48,hp:mode==='portal'\?500:Math\.round\(500\*\(1\+\.1\*\(mode==='campaign'\|\|mode==='endless'\?readRestoration\(level\):0\)\)\)/,'Denkmal-Gesundheit skaliert mit Restaurierungsstufe (Kampagne/Endlos)');
  // Vergabe: nur echter Kampagnen-Abschluss
  assert.match(source,/if\(game\.mode!=='endless'&&game\.mode!=='campaign-pilot'&&game\.mode!=='portal'\)writeRestoration\(game\.level\);/,'Vergabe nur im echten Kampagnenmodus (kein Endlos/Portal/Pilot)');
  assert.match(source,/Denkmal-Restaurierung: Stufe \$\{r\}\/3 · \+\$\{r\*10\}% Denkmal-Gesundheit/,'Abschluss-Screen zeigt Stufe und Wirkung');
  assert.match(fs.readFileSync(path.join(__dirname,'../dist/index.html'),'utf8'),/game\.js\?v=lesbarkeit-20261125/,'game.js cache key gebumpt');
}
console.log('Denkmal-Restaurierung: Deckelung, Wirkung, Vergabe und UI gepinnt');
