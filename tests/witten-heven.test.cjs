'use strict';
/* Level 8 Witten-Heven: geometry, wave gates, wave module, boss pool/loot mapId 8,
   campaign progress flag and legacy save key. Run: node tests/witten-heven.test.cjs */
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const memory=new Map(),writes=[],storage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>{memory.set(k,v);writes.push(k);},removeItem:k=>memory.delete(k)};
const box={Math,localStorage:storage,console};
box.globalThis=box;
vm.createContext(box);
vm.runInContext(fs.readFileSync('dist/persisted-state.js','utf8'),box);
vm.runInContext(fs.readFileSync('dist/levels.js','utf8'),box);
vm.runInContext(fs.readFileSync('dist/witten-heven.js','utf8'),box);
const lib=box.DenkmalLevels,heven=box.DenkmalWittenHeven,level=lib.levels[8],center=lib.center;

assert.ok(level,'level 8 exists');
assert.match(level.name,/HEVEN/);
assert.equal(level.firstWave,29);assert.equal(level.lastWave,32);
assert.equal(level.startEssence,360);assert.equal(level.maxTowers,12);
assert.ok(level.approximate,'layout stays explicitly illustrative');
assert.equal(level.paths.length,3);assert.equal(level.gates.length,3);
assert.equal(JSON.stringify(level.gateLabels),JSON.stringify(['WALDRAND WEST','WALDRAND OST','ZUGANG SÜD']));
assert.equal(level.airGate.y,center.y-1020,'air gate over the northern wall');
assert.ok(level.hevenPlatform&&level.hevenWall,'platform and name-plate wall are part of the map');

for(const [i,route] of level.paths.entries()){
  assert.ok(route.length>=4,'lane has waypoints');
  assert.deepEqual(route.at(-1),center,'every lane ends at the monument');
  assert.equal(route[0].x,level.gates[i].x);assert.equal(route[0].y,level.gates[i].y);
}
assert.ok(level.slots.length>=12&&level.slots.length<=16,'slot count in design range, got '+level.slots.length);
for(const pad of level.slots){
  assert.ok(level.paths.every(route=>lib.pathDistance(pad,route)>=90),'slot stays off lanes');
  assert.ok(Math.hypot(pad.x-center.x,pad.y-center.y)>=190,'slot stays off the monument');
  const x=pad.x-center.x,y=pad.y-center.y,p=level.hevenPlatform,w=level.hevenWall;
  assert.ok(x<p.left-45||x>p.right+45||y<p.top-45||y>p.bottom+45,'slot never on the platform');
  assert.ok(!(Math.abs(x-p.stair.x)<p.stair.width/2+65&&y>p.stair.top-65&&y<p.stair.bottom+65),'slot never on the stairs');
  assert.ok(x<w.left-70||x>w.right+70||y<w.top-70||y>w.bottom+70,'slot never on the north wall');
}
for(let i=0;i<level.slots.length;i++)for(let j=i+1;j<level.slots.length;j++)
  assert.ok(Math.hypot(level.slots[i].x-level.slots[j].x,level.slots[i].y-level.slots[j].y)>115,'slots stay apart');

assert.equal(JSON.stringify(lib.getWaveGates(8,29,'campaign')),JSON.stringify([0,1]),'wave 29 opens on the two forest lanes');
assert.equal(JSON.stringify(lib.getWaveGates(8,30,'campaign')),JSON.stringify([0,1,2]),'stair entrance joins from wave 30');
assert.equal(JSON.stringify(lib.getWaveGates(8,32,'campaign')),JSON.stringify([0,1,2]));
assert.equal(JSON.stringify(lib.getWaveGates(8,33,'endless')),JSON.stringify([0,1,2]),'endless uses all gates');

assert.equal(JSON.stringify(heven.campaignWave(29)),JSON.stringify({count:40,interval:.58}));
assert.equal(JSON.stringify(heven.campaignWave(32)),JSON.stringify({count:60,interval:.38}));
assert.equal(heven.campaignWave(33),null,'endless has no chapter opening override');
assert.equal(JSON.stringify(heven.waveMods(30)),JSON.stringify({armorAll:.05}));
assert.equal(JSON.stringify(heven.waveMods(31)),JSON.stringify({speedAll:1.06}));
assert.equal(JSON.stringify(heven.waveMods(32)),JSON.stringify({damageAll:1.08}));
assert.equal(heven.enemyType(32,0,'campaign'),'boss','wave 32 starts with the boss');
assert.ok(heven.enemyType(30,7,'campaign')!=='wraith','wave 30 mixes in air every 8th');
const comp=new Set();for(let i=0;i<40;i++)comp.add(heven.enemyType(29,i,'campaign'));
assert.ok(comp.has('wraith')&&comp.has('runner'),'opening wave is wraith/runner ground');
assert.ok(heven.enemyType(31,5,'campaign')==='brute'||[...Array(56)].some((_,i)=>heven.enemyType(31,i,'campaign')==='brute'),'brute joins by wave 31');
assert.equal(heven.enemyType(36,0,'endless'),'boss','endless boss every 4th wave');
assert.equal(heven.waveName(29),'NEBEL ÜBER HEVEN');
assert.equal(heven.waveName(32),'DIE LETZTE WACHT');
assert.match(heven.warning(29,'campaign'),/LUFT AB WELLE 30/);
assert.match(heven.warning(31,'campaign'),/LUFTANGRIFF AUS DEM NORDEN/);

// Progress: level 8 is additive like level 7; legacy key migrates.
assert.equal(lib.level8Completed,false,'locked by default');
assert.equal(lib.completeLevel8(),true);
assert.equal(lib.level8Completed,true);
assert.ok(writes.includes('denkmal-progress-v2'),'progress written under the v2 key');
const legacy=new Map([['denkmal-level8-completed-v1','true']]);
const box2={Math,localStorage:{getItem:k=>legacy.get(k)||null,setItem:()=>{},removeItem:()=>{}},console};
box2.globalThis=box2;vm.createContext(box2);
vm.runInContext(fs.readFileSync('dist/persisted-state.js','utf8'),box2);
vm.runInContext(fs.readFileSync('dist/levels.js','utf8'),box2);
assert.equal(box2.DenkmalLevels.level8Completed,true,'legacy denkmal-level8-completed-v1 migrates');
// Old saves without level8 stay valid and default to locked.
const box3={Math,localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}},console};
box3.globalThis=box3;vm.createContext(box3);
vm.runInContext(fs.readFileSync('dist/persisted-state.js','utf8'),box3);
vm.runInContext(fs.readFileSync('dist/levels.js','utf8'),box3);
assert.equal(box3.DenkmalLevels.level8Completed,false,'saves without level8 default to locked');

// Loot: mapId 8 is valid for enemy drops and carries a boss pool.
const eqBox={Math,console};eqBox.globalThis=eqBox;vm.createContext(eqBox);
vm.runInContext(fs.readFileSync('dist/equipment-catalog.js','utf8'),eqBox);
const C=eqBox.DenkmalEquipmentCatalog;
assert.ok(C.bossPools[8]&&C.bossPools[8].length===4,'boss pool 8 exists with four slots');
for(const id of C.bossPools[8])assert.ok(C.templates[id],'pool template exists: '+id);
assert.equal(C.validEnemy({mapId:8,wave:29,enemyType:'wraith'}),true,'mapId 8 accepted');
assert.equal(C.validEnemy({mapId:9,wave:29,enemyType:'wraith'}),false,'mapId 9 still rejected');

// Generated runtime assets (WebP-Derivate der Cloudinary-Cutouts) liegen lokal.
const path=require('node:path');
const assetDir='dist/assets/witten-heven';
const webps=fs.readdirSync(assetDir).filter(f=>f.endsWith('.webp'));
assert.ok(webps.length>=40,'alle Cutouts als WebP lokal, got '+webps.length);
for(const f of webps){
  const p=path.join(assetDir,f);
  assert.ok(fs.statSync(p).size>5000,f+' ist zu klein');
  assert.equal(fs.readFileSync(p).subarray(0,4).toString('latin1'),'RIFF',f+' ist kein WebP');
}
for(const f of ['monument-heven-style2.webp','boss-pfeilerwaechter-v1.webp','gedenkwand-neutral.webp','treppe.webp','baum1-herbst.webp','busch-efeu.webp','platte1.webp','rest-felsen-gross.webp'])
  assert.ok(webps.includes(f),f+' fehlt im Asset-Ordner');
assert.ok(fs.existsSync('dist/assets/menu/level-gallery/level-08-witten-heven.webp'),'Galerie-Karte level-08 fehlt');
const art=fs.readFileSync('dist/witten-heven-art.js','utf8');
assert.ok(art.includes('drawBoss'),'Boss-Sprite-Hook im Art-Modul');
assert.match(fs.readFileSync('dist/game.js','utf8'),/level===8&&e\.type==='boss'&&globalThis\.DenkmalWittenHevenArt\?\.drawBoss/,'game.js zeichnet den Heven-Boss');

console.log('Level 8 Witten-Heven: geometry, gates, waves, progress, loot mapId 8, assets passed ('+level.slots.length+' slots)');
