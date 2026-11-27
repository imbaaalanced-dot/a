'use strict';
const assert=require('node:assert/strict');
const {campaign}=require('./helpers/simulation.cjs');
// A reloading tower has no target side effects. It must not calculate route scores.
const sim=campaign(25,{instrument:true});sim.state.towers=[];const template=sim.state.enemies[0];
const tower={x:template.x,y:template.y,kind:'bow',level:1,range:1000,damage:1,fireCd:10,fireRate:1,targetMode:'first'};
let coordinates=0;Object.defineProperty(tower,'x',{get(){coordinates++;return template.x;}});sim.state.towers.push(tower);sim.tick();
assert.equal(coordinates,0,'cooling tower does not scan targets');
console.log('Cooling towers skip target work');
