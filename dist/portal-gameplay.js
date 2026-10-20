/* Pilot configuration and interaction geometry, independent of campaign progress. */
(function(root){
  'use strict';
  const sections=Object.freeze([
    {name:'Verwilderter Vorhof',tint:'#87995812',spawn:{x:1536,y:2110},exit:{x:1536,y:880},gates:[0,1],waves:[{count:12,boss:false},{count:18,boss:false}]},
    {name:'Nebelpfad',tint:'#86b8ca1a',spawn:{x:1536,y:2110},exit:{x:1536,y:880},gates:[0,3],waves:[{count:20,boss:false},{count:26,boss:false}]},
    {name:'Die letzte Schwelle',tint:'#b75b551d',spawn:{x:1536,y:2110},exit:{x:1536,y:880},gates:[0,1,3],waves:[{count:30,boss:false},{count:36,boss:true}]}
  ].map(s=>Object.freeze({...s,waves:Object.freeze(s.waves.map(w=>Object.freeze(w)))})));
  const enemyCap=40;
  function canSpawn(alive,spawned,total){return Number.isInteger(alive)&&alive>=0&&alive<enemyCap&&spawned<total;}
  function atExit(hero,section,phase){return phase==='exit'&&Math.hypot(hero.x-section.exit.x,hero.y-section.exit.y)<80;}
  const api=Object.freeze({sections,enemyCap,canSpawn,atExit});
  if(typeof module==='object'&&module.exports)module.exports=api;else root.PortalGameplay=api;
})(globalThis);
