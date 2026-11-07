(function(root){'use strict';
const catalog=[
['power','Kraft','Held','Grundangriffsschaden',[8,16,24]],['endurance','Ausdauer','Held','Maximale Leben',[10,20,30]],['step','Schneller Schritt','Held','Bewegungstempo',[5,10,15]],['recovery','Erholung','Held','Zusätzliche Heilung nach Abschnitt',[3,6,9]],
['precision','Präzision','Türme','Turmschaden',[8,16,24]],['reach','Reichweite','Türme','Turmreichweite',[5,10,15]],['cadence','Taktung','Türme','Angriffstempo',[5,10,15]],['choke','Engpass','Türme','Verlangsamung für 1 Sekunde',[8,12,16]],
['mark','Zielmarkierung','Gemeinsam','Nächster Turmtreffer auf Heldenziel',[15,25,35]],['cover','Deckung','Gemeinsam','Weniger Heldenschaden in Turmreichweite',[5,8,11]],['counter','Gegenstoß','Gemeinsam','Geladener Heldenangriff, alle 2 Sekunden',[10,18,26]],['circle','Wächterkreis','Gemeinsam','Turmtempo nahe dem Helden',[5,8,11]]
].map(([id,name,group,desc,values])=>({id,name,group,desc,values}));
function choose(ranks,id){if(!catalog.some(p=>p.id===id)||(ranks[id]||0)>=3)throw Error('Invalid perk');return {...ranks,[id]:(ranks[id]||0)+1};}
function offer(ranks,rngState){let seed=rngState>>>0;const next=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};const pool=catalog.filter(p=>(ranks[p.id]||0)<3);for(let i=pool.length-1;i>0;i--){const j=Math.floor(next()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}return {ids:pool.slice(0,3).map(p=>p.id),rngState:seed};}
function derive(base,r={}){const rank=id=>r[id]||0,value=id=>{const p=catalog.find(p=>p.id===id);return p.values[rank(id)-1]||0;};return {...base,damage:(base.damage||0)*(1+.08*rank('power')),speed:(base.speed||0)*(1+.05*rank('step')),healthMultiplier:1+.1*rank('endurance'),towerDamage:1+.08*rank('precision'),towerRange:1+.05*rank('reach'),towerRate:1+.05*rank('cadence'),slow:value('choke')/100,mark:value('mark')/100,cover:value('cover')/100,counter:value('counter')/100,circle:value('circle')/100};}
const api={catalog,offer,choose,derive};root.PortalPerks=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
