const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const manifest=JSON.parse(fs.readFileSync('ansturm-alpha1-5/assets.json','utf8'));
 assert.equal(Object.keys(manifest).some(k=>k.startsWith('gate_')),false,'obsolete gates must not be preloaded');
 const {createGame,startGame,spawnEnemy}=await import('../ansturm-alpha1-5/model.js');
 const s=createGame({random:()=>.5});startGame(s);
 assert.deepEqual(Array.from({length:4},()=>{const e=spawnEnemy(s);return [e.x,e.y]}),[[-1,0],[1,0],[0,-1],[0,1]]);
 console.log('Ansturm loads no gates and spawns at all four edges');
})();
