'use strict';
// Tower shop contract: remove new Boomerang purchases, preserve old save behavior.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../dist');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const game=fs.readFileSync(path.join(root,'game.js'),'utf8');
const css=fs.readFileSync(path.join(root,'combat-hud-layout-v3.css'),'utf8');
assert.doesNotMatch(html,/data-tower=["']boomerang["']/i,'retired tower not in shop markup');
assert.doesNotMatch(game,/tower-boomerang'\)/,'retired tower not toggled back into the menu at level 3');
assert.doesNotMatch(game,/kinds\.push\(['"]boomerang['"]\)/,'retired tower not in touch build list');
assert.doesNotMatch(game,/enabledTowers\.has\(kind\)\|\|game\.level>=3&&kind==='boomerang'/,'no late-level exception');
assert.match(game,/function selectTower\(kind\)\{if\(!towerSpecs\[kind\]\|\|!enabledTowers\.has\(kind\)\)return/,'keyboard and touch selection must reject retired kinds');
assert.match(game,/if\(!enabledTowers\.has\(game\.selectedTower\)\)return/,'scripted build must reject legacy selection');
assert.match(game,/Digit5:'barracks',Digit6:'barracks'/,'barracks receives key 5 with key 6 legacy alias');
assert.match(html,/data-tower="barracks"[^>]*><kbd>5<\/kbd>/,'UI shows the new shortcut');
assert.match(game,/boomerang:\{name:'BUMERANGTURM'/,'retired tower stats retained for old saves');
assert.match(game,/function moveBoomerang\(/,'legacy projectiles retained');
for(const kind of ['bow','cannon','mage','rift','barracks'])
  assert.match(html,new RegExp('data-tower="'+kind+'"'),'active '+kind+' still available');
assert.match(html,/combat-hud-layout-v3\.css\?v=td2hud-layout-20261113a/,'new CSS cache key');
assert.match(html,/game\.js\?v=church-camera-20261114a/,'changed JS cache key');
assert.match(css,/@media \(hover:hover\) and \(pointer:fine\) and \(min-width:701px\)/,'scoped desktop layout');
assert.match(css,/#arsenal:not\(\.hidden\)/,'preserve hidden arsenal semantics');
assert.match(css,/@media \(hover:hover\) and \(pointer:fine\) and \(max-width:700px\)/,'narrow mouse layout');
assert.doesNotMatch(css,/@media\s*\(pointer:coarse\)\s*\{/, 'touch HUD 2.0 must remain untouched');
console.log('Five active tower types, retired Boomerang purchase paths, mobile-safe HUD layout and historical compatibility passed');
