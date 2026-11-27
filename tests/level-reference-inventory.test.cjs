/* P1 #330 §2: per-level reference inventory pinned against the actual runtime code.
   Asserts that each level module still references its documented key assets and
   that every referenced file exists under dist/. Code reading, no browser run. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const root=path.join(__dirname,'..');
 const read=f=>fs.readFileSync(path.join(root,f),'utf8');
 const modulePins=[
  ['dist/game.js',['assets/monument-level1-style2.webp']],
  ['dist/asset-manager.js',['assets/monument-level1-style2.webp','assets/elemental/goethestrasse-memorial-style2.webp','assets/westhofen/westhofen-memorial-style2-v4.webp']],
  ['dist/terrain-polish.js',['assets/kirchende/ground-style2-v2.webp','assets/level4/level4-cobblestone-512-seamfix.webp','assets/level4/level4-flagstone-512-seamfix.webp']],
  ['dist/kirchende-art.js',['monument-style2-pilot.webp','monument-photo-v2.webp','environment-atlas-style2-v1.webp','rootrunner','stoneguard','mistcaller','uprooted']],
  ['dist/church-art.js',['assets/church-ende-reference-20261114.webp','assets/level4/graves-style2-20261114.png','assets/level4/lion-1879-style2-2x.webp']],
  ['dist/hohensyburg-art.js',['kaiser-wilhelm-style2-qa-v2-2x.webp','kaiser-wilhelm-style2-qa-v1-2x.webp']],
  ['dist/goethestrasse-art.js',['assets/elemental/goethestrasse-memorial-style2.webp']],
  ['dist/westhofen-art.js',['assets/westhofen/westhofen-memorial-style2-v4.webp']],
  ['dist/level-gallery.js',['level-07-westhofen.webp','level-08-witten-heven.webp']],
  ['dist/witten-heven-art.js',['monument-heven-style2.webp','boss-pfeilerwaechter-v1.webp','gedenkwand-neutral.webp','mauer-gebogen-links.webp','mauer-efeu-bogen.webp','treppe.webp','baum1-herbst.webp','busch-efeu.webp','platte1.webp','mauer-felsen.webp','rest-felsen-gross.webp']]
 ];
 const files=[
  'dist/assets/monument-level1-style2.webp',
  'dist/assets/scenery-style2.webp',
  'dist/assets/asset-atlas-style2.webp',
  'dist/assets/kirchende/ground-style2-v1.webp',
  'dist/assets/kirchende/ground-style2-v2.webp',
  'dist/assets/kirchende/monument-style2-pilot.webp',
  'dist/assets/kirchende/monument-photo-v2.webp',
  'dist/assets/kirchende/environment-atlas-style2-v1.webp',
  'dist/assets/kirchende/rootrunner.webp',
  'dist/assets/kirchende/stoneguard.webp',
  'dist/assets/kirchende/mistcaller.webp',
  'dist/assets/kirchende/uprooted.webp',
  'dist/assets/level4/level4-cobblestone-512-seamfix.webp',
  'dist/assets/level4/level4-flagstone-512-seamfix.webp',
  'dist/assets/church-ende-reference-20261114.webp',
  'dist/assets/level4/graves-style2-20261114.png',
  'dist/assets/level4/lion-1879-style2-2x.webp',
  'dist/assets/hohensyburg/kaiser-wilhelm-style2-qa-v2-2x.webp',
  'dist/assets/hohensyburg/kaiser-wilhelm-style2-qa-v1-2x.webp',
  'dist/assets/elemental/goethestrasse-memorial-style2.webp',
  'dist/assets/westhofen/westhofen-memorial-style2-v4.webp',
  'dist/assets/menu/level-gallery/level-07-westhofen.webp',
  'dist/assets/menu/level-gallery/level-08-witten-heven.webp',
  'dist/assets/witten-heven/bank.webp',
  'dist/assets/witten-heven/baum1-herbst.webp',
  'dist/assets/witten-heven/baum3-tanne.webp',
  'dist/assets/witten-heven/baum4-tanne-klein.webp',
  'dist/assets/witten-heven/baum5-birke.webp',
  'dist/assets/witten-heven/boss-pfeilerwaechter-v1.webp',
  'dist/assets/witten-heven/busch-efeu.webp',
  'dist/assets/witten-heven/busch-farn.webp',
  'dist/assets/witten-heven/busch-gras.webp',
  'dist/assets/witten-heven/busch-kugel.webp',
  'dist/assets/witten-heven/denkmal-original.webp',
  'dist/assets/witten-heven/gedenkwand-neutral.webp',
  'dist/assets/witten-heven/mauer-efeu-bogen.webp',
  'dist/assets/witten-heven/mauer-felsen.webp',
  'dist/assets/witten-heven/mauer-gebogen-links.webp',
  'dist/assets/witten-heven/mauer-gebogen-mitte.webp',
  'dist/assets/witten-heven/mauer-L.webp',
  'dist/assets/witten-heven/monument-heven-style2.webp',
  'dist/assets/witten-heven/plakette.webp',
  'dist/assets/witten-heven/platte1.webp',
  'dist/assets/witten-heven/platte2.webp',
  'dist/assets/witten-heven/platte3.webp',
  'dist/assets/witten-heven/platte4.webp',
  'dist/assets/witten-heven/platte5.webp',
  'dist/assets/witten-heven/platte6.webp',
  'dist/assets/witten-heven/platte7.webp',
  'dist/assets/witten-heven/platte8.webp',
  'dist/assets/witten-heven/rest-bank-holz.webp',
  'dist/assets/witten-heven/rest-bank-stein.webp',
  'dist/assets/witten-heven/rest-busch-gruen.webp',
  'dist/assets/witten-heven/rest-efeu.webp',
  'dist/assets/witten-heven/rest-felsen-gross.webp',
  'dist/assets/witten-heven/rest-felsen-klein.webp',
  'dist/assets/witten-heven/rest-kranz.webp',
  'dist/assets/witten-heven/rest-kreuz.webp',
  'dist/assets/witten-heven/rest-laterne.webp',
  'dist/assets/witten-heven/rest-laub.webp',
  'dist/assets/witten-heven/rest-pflanzkasten.webp',
  'dist/assets/witten-heven/rest-saeule.webp',
  'dist/assets/witten-heven/rest-schale-flamme.webp',
  'dist/assets/witten-heven/rest-schale-leer.webp',
  'dist/assets/witten-heven/treppe.webp'
 ];
 for(const [file,needles]of modulePins){
  const src=read(file);
  for(const needle of needles)assert.ok(src.includes(needle),file+' referenziert '+needle+' nicht mehr');
 }
 for(const file of files)assert.ok(fs.existsSync(path.join(root,file)),'fehlende Datei: '+file);
 console.log('Level reference inventory: '+modulePins.length+' Module und '+files.length+' Assets gepinnt und vorhanden');
})().catch(e=>{console.error(e);process.exitCode=1;});
