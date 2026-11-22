'use strict';
/* #394-Folge: v3-Menuegrafiken sind retired. Kein Laufzeit-Code darf sie
   referenzieren, keine Kopie darf wieder ins Repo gelangen. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');

const retired=['memorial-yard-v3.webp','memorial-yard-mobile-v3.webp','crest-v3.webp','hero-banner-marcel-v3.webp','hero-banner-kim-v3.webp'];
for(const dir of ['dist/assets/menu','dist/ansturm/assets/menu','ansturm-alpha1-5/assets/menu']){
  for(const name of retired){
    assert.ok(!fs.existsSync(path.join(root,dir,name)),`retired asset lagert noch: ${dir}/${name}`);
  }
}
assert.ok(fs.existsSync(path.join(root,'dist/assets/menu/memorial-yard-v4.webp')),'v4-Hintergrund bleibt geladen');
assert.ok(fs.existsSync(path.join(root,'dist/assets/menu/crest-v4.webp')),'v4-Wappen bleibt geladen');

// Laufzeit-Code (HTML/CSS/JS, dist + Parity-Quelle) referenziert keine v3-Grafik mehr.
const runtime=[
  ['dist/index.html','utf8'],['dist/menu.css','utf8'],['dist/menu-v4.css','utf8'],
  ['dist/preloader.js','utf8'],['dist/level-gallery.js','utf8'],['dist/game.js','utf8'],
  ['dist/ansturm/index.html','utf8'],['dist/ansturm/app.js','utf8'],
  ['ansturm-alpha1-5/index.html','utf8'],['ansturm-alpha1-5/app.js','utf8'],
];
for(const [rel] of runtime){
  const src=fs.readFileSync(path.join(root,rel),'utf8');
  for(const name of retired)assert.ok(!src.includes(name),`${rel} referenziert noch ${name}`);
}
// menu.css traegt die v4-Basis mit dem gemeinsamen Cache-Key.
const css=fs.readFileSync(path.join(root,'dist/menu.css'),'utf8');
assert.ok(css.includes('memorial-yard-v4.webp?v=menu-v4a1')&&css.includes('memorial-yard-mobile-v4.webp?v=menu-v4a1'),
  'menu.css-Grundlagen nutzen v4-Grafiken mit cache-key');
console.log('Menü-v3-Cleanup: 5 retired Assets weg, keine Laufzeit-Referenzen, v4-Basis im menu.css');
