/* TD2 V4.1 touch build patch: tap-to-build guards, stable build controls, armory contrast. Run: node tests/touch-build.test.cjs */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../dist');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const game=read('game.js'),levelsSource=read('levels.js'),lootUI=read('loot-ui.js'),lootCss=read('loot.css'),portraitCss=read('portrait-patch.css'),html=read('index.html');

// Tap-to-select: touch only, playing only, drag threshold, modal and menu guards.
assert.match(game,/function buildTowerAt\(p\)\{/,'buildTowerAt must exist');
assert.match(game,/function buildTower\(\)\{buildTowerAt\(towerPosition\(\)\);\}/,'the build button keeps delegating to the hero-facing slot');
assert.match(game,/e\.pointerType==='mouse'\|\|state!=='playing'\|\|!tapDown/,'mouse or paused taps must not open build controls');
assert.match(game,/Math\.hypot\(e\.clientX-tapDown\.x,e\.clientY-tapDown\.y\)>14/,'drag gestures must not open build controls');
assert.match(game,/nearestSlot\(screenToWorld\(e\.clientX,e\.clientY\),game\.level,120\)/,'taps snap with a thumb-friendly radius');
assert.match(game,/tapDown=null;\n    if\(document\.querySelector\('\.modal:not\(\.hidden\)'\)\)return;/,'an open modal must swallow taps after the drag check');
assert.match(game,/const menu=\$\('hudMenu'\);if\(menu\?\.open\)return;/,'an open HUD menu must swallow taps');
assert.match(game,/function openTouchBuildContext\(slot\)/,'free pads must open the tower selector');
assert.match(game,/function openTouchTowerContext\(tower\)/,'existing towers must open targeted actions');
assert.match(game,/if\(tower\)openTouchTowerContext\(tower\)/,'tower interaction takes priority over empty pad selection');
assert.match(game,/else if\(slot\)openTouchBuildContext\(slot\)/,'taps on free pads select instead of buying');
assert.doesNotMatch(game,/if\(slot\)buildTowerAt\(slot\)/,'one touch must never immediately spend essence');

// Stable build controls: visible during play, dimmed without a build context.
assert.match(game,/setHidden\(\$\('arsenal'\),!playing\)/,'the arsenal stays in place while playing');
assert.match(game,/setDisabled\(\$\('buildBtn'\),!playing\|\|!buildContext\)/,'the build button dims instead of disappearing');
assert.match(game,/setHidden\(\$\('buildBtn'\),!playing\|\|portalRun\.phase==='exit'\)/,'the portal exit phase keeps the build button hidden');
assert.match(portraitCss,/\.arsenal button:disabled\{opacity:\.5/,'disabled arsenal buttons must look disabled');
assert.match(portraitCss,/\.controls \.action-btn:disabled\{opacity:\.55/,'disabled action buttons must look disabled');

// nearestSlot: the historical 88 stays the default; taps may widen it explicitly.
const box={localStorage:{getItem:()=>null,setItem(){}}};
vm.createContext(box);
vm.runInContext(fs.readFileSync(path.join(root,'persisted-state.js'),'utf8'),box);
vm.runInContext(levelsSource,box);
const L=box.DenkmalLevels;
const slots=L.levels[2].slots;
assert.ok(slots.length>0,'level 2 has authored build pads');
let chosen=null;
const dirs=[[1,0],[0,1],[-1,0],[0,-1],[.7071,.7071],[-.7071,.7071],[.7071,-.7071],[-.7071,-.7071]];
outer:
for(const s of slots){
  for(const r of [95,100,105,110,115]){
    for(const [dx,dy] of dirs){
      const probe={x:s.x+dx*r,y:s.y+dy*r};
      const nearest=slots.reduce((best,q)=>{const d=Math.hypot(q.x-probe.x,q.y-probe.y);return !best||d<best.d?{s:q,d}:best;},null);
      if(nearest.s===s){chosen={slot:s,probe,r};break outer;}
    }
  }
}
assert.ok(chosen,'level 2 has a build pad with a clear thumb-tap probe zone');
assert.equal(L.nearestSlot(chosen.slot,2),chosen.slot,'exact pad positions still snap');
assert.equal(L.nearestSlot(chosen.probe,2),null,'the default snap radius must stay 88');
assert.equal(L.nearestSlot(chosen.probe,2,88),null,'an explicit radius of 88 matches the historical default');
assert.equal(L.nearestSlot(chosen.probe,2,120),chosen.slot,'a tap radius of 120 accepts nearby thumb taps');

// Armory: rarity is machine-readable and secondary text keeps its tint while gaining contrast.
assert.match(lootUI,/b\.dataset\.rarity=item\.rarity;/,'item cards expose their rarity');
assert.match(lootCss,/data-rarity="legendary"/,'legendary items get a stronger glow');
assert.match(lootCss,/data-rarity="epic"/,'epic items get a glow');
assert.match(lootCss,/color-mix\(in srgb,var\(--rarity\) 60%,#cfd8d6\)/,'item sublabels keep the rarity tint with a lighter floor');
assert.match(lootCss,/appearance:none;-webkit-appearance:none/,'filter dropdowns drop the native look');
assert.match(lootCss,/#loadoutStats\{display:flex;flex-direction:column;gap:7px;font-size:12px/,'build stats grow into badges');

// Cache keys for every changed file.
// Current game.js cache key is audited centrally in cache-busting.test.cjs.
assert.match(html,/levels\.js\?v=level7btouch1/);
assert.match(html,/loot-ui\.js\?v=v5-armory-hub1/);
assert.match(html,/loot\.css\?v=v5-armory-hub1/);
assert.match(html,/portrait-patch\.css\?v=v410a1touch1/);
console.log('TD2 touch build, stable build controls and armory contrast checks passed');
