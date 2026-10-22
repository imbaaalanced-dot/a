export const TECH = {
 attack:{name:'Angriff',base:20,growth:1.2,increment:3,desc:'+3 Schaden'},
 tempo:{name:'Tempo',base:35,growth:1.25,increment:.15,desc:'+0,15 Angriffe/s'},
 hp:{name:'Lebenspunkte',base:30,growth:1.25,increment:30,desc:'+30 Max-HP und Heilung'},
 regen:{name:'Regeneration',base:45,growth:1.3,increment:1,desc:'+1 HP/s'},
 range:{name:'Reichweite',base:40,growth:1.3,increment:1/30,maxLevel:15,desc:'+3,33 % Arenaradius · maximal 15 Ränge'},
 gold:{name:'Goldbonus',base:60,growth:1.4,increment:.1,desc:'+10 % Gold'}
};
export const UPGRADES = {
 multishot:{name:'Mehrfachschuss',prices:[200,450,800],desc:'Zusätzliche Ziele: +1 pro Stufe'},
 tesla:{name:'Tesla-Kette',prices:[500,750,1000],desc:'Blitz springt auf 3/4/5 Gegner'},
 explosion:{name:'Explosion',prices:[250,550,900],desc:'Flächenschaden um Treffer'},
 frost:{name:'Frostfeld',prices:[180,420,700],desc:'Gegner werden verlangsamt'},
 shield:{name:'Energieschild',prices:[150,350,650],desc:'Schutzschild mit Regeneration'},
 fire:{name:'Seelenbrand',prices:[300,600,1000],desc:'Treffer verbrennen Gegner über Zeit'},
 pierce:{name:'Durchschlag',prices:[350,700,1100],desc:'Pro Schuss werden weitere Gegner in der Schusslinie getroffen'},
};
export const ENEMY = {
 normal:{hp:24,speed:.08,dps:5,gold:8,color:'#b45d55'},
 runner:{hp:16,speed:.13,dps:3,gold:10,color:'#d8a356'},
 armored:{hp:65,speed:.05,dps:10,gold:18,color:'#848c9f'},
 cultist:{hp:30,speed:.075,dps:6,gold:12,color:'#9861a8'},
 shieldbearer:{hp:78,speed:.045,dps:8,gold:20,color:'#5d91a0'},
 bomber:{hp:42,speed:.09,dps:14,gold:17,color:'#c07845'},
 gargoyle:{hp:48,speed:.11,dps:7,gold:22,color:'#7d7d9e'},
 siege:{hp:135,speed:.035,dps:18,gold:35,color:'#a76c58'},
 boss:{hp:400,speed:.035,dps:18,gold:125,color:'#9b5ac8'}
};
