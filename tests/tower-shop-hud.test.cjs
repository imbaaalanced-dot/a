const assert=require('assert');
const fs=require('fs');
const path=require('path');
const html=fs.readFileSync(path.join(__dirname,'../dist/index.html'),'utf8');
// V6-Menuefluss + Touch-Dismiss (#300, #308): Der Cache-Key haengt am letzten game.js-Stand.
assert.match(html,/game\.js\?v=touch-menu-dismissal-20261115/,'changed JS cache key');
assert.ok(html.includes('id="towerShop"'),'tower shop HUD present');
assert.ok(!/tower-shop\.js/.test(html),'tower shop code lives in game.js');
console.log('tower-shop-hud.test.cjs OK');
