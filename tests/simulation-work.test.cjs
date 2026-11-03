'use strict';
const assert=require('node:assert/strict');
const {model,campaign}=require('./helpers/simulation.cjs');
// Burning enemies are already available by reference in the movement loop.
// Count inspected IDs rather than asserting a machine-dependent time budget.
const api=model(),s=api.createGame();s.status='running';s.wave=1;s.planned=s.spawned=200;
s.enemies=Array.from({length:200},(_,i)=>({id:i+1,x:1,y:0,hp:100,maxHp:100,alive:true,speed:.05,dps:1,gold:1,burnUntil:10,burnDps:3,slowUntil:0}));
let visits=0;s.enemies.find=function(predicate){return Array.prototype.find.call(this,(e,i,a)=>{visits++;return predicate(e,i,a);});};
api.step(s,1/30);assert.ok(visits<=400,`burn step must stay linear; ${visits} predicate visits`);
assert.equal(s.enemies[199].hp,99.9);
// A reloading tower has no target side effects. It must not calculate route scores.
const sim=campaign(25,{instrument:true});sim.state.towers=[];const template=sim.state.enemies[0];
const tower={x:template.x,y:template.y,kind:'bow',level:1,range:1000,damage:1,fireCd:10,fireRate:1,targetMode:'first'};
let coordinates=0;Object.defineProperty(tower,'x',{get(){coordinates++;return template.x;}});sim.state.towers.push(tower);sim.tick();
assert.equal(coordinates,0,'cooling tower does not scan targets');
console.log('Burn updates are linear and cooling towers skip target work');
