'use strict';
const assert=require('node:assert/strict');
const random=Math.random;let harness;try{Math.random=()=>.99;harness=require('./helpers/game.cjs')();}finally{Math.random=random;}
const {t,saga,element}=harness;t.startGame(1);saga.continueStory();const initial=t.lootModel.profile.owned.length;
for(let n=0;n<39;n++){t.spawnEnemy('wraith');t.hurtEnemy(t.game.enemies.at(-1),1e7,{fixedDamage:true});}
assert.equal(t.lootModel.profile.owned.length,initial);t.spawnEnemy('guardian');const enemy=t.game.enemies.at(-1);t.hurtEnemy(enemy,1e7,{fixedDamage:true});assert.equal(t.lootModel.profile.owned.length,initial+1);assert.match(element('toast').textContent,/BEUTE GESICHERT/);
assert.equal(t.lootModel.profile.owned.at(-1).source.kind,'enemy');t.hurtEnemy(enemy,1e7,{fixedDamage:true});assert.equal(t.lootModel.profile.owned.length,initial+1);
console.log('Loot V2 gameplay: actual normal kills grant at pity boundary exactly once');
