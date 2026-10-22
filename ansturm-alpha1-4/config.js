export const TECH = {
 attack:{name:'Angriff',base:20,growth:1.2,increment:3,desc:'+3 Schaden'},
 tempo:{name:'Tempo',base:35,growth:1.25,increment:.15,desc:'+0,15 Angriffe/s'},
 hp:{name:'Lebenspunkte',base:30,growth:1.25,increment:30,desc:'+30 Max-HP und Heilung'},
 regen:{name:'Regeneration',base:45,growth:1.3,increment:1,desc:'+1 HP/s'},
 range:{name:'Reichweite',base:40,growth:1.3,increment:.035,desc:'+3,5 % Arenaradius'},
 gold:{name:'Goldbonus',base:60,growth:1.4,increment:.1,desc:'+10 % Gold'}
};
export const UPGRADES = {
 multishot:{name:'Mehrfachschuss',prices:[200,450,800],desc:'Zusätzliche Ziele: +1 pro Stufe'},
 tesla:{name:'Tesla-Kette',prices:[500,750,1000],desc:'Blitz springt auf 3/4/5 Gegner'},
 explosion:{name:'Explosion',prices:[250,550,900],desc:'Flächenschaden um Treffer'},
 frost:{name:'Frostfeld',prices:[180,420,700],desc:'Gegner werden verlangsamt'},
 shield:{name:'Energieschild',prices:[150,350,650],desc:'Schutzschild mit Regeneration'},
};
export const ENEMY = {
 normal:{hp:24,speed:.08,dps:5,gold:8,color:'#b45d55'},
 runner:{hp:16,speed:.13,dps:3,gold:10,color:'#d8a356'},
 armored:{hp:65,speed:.05,dps:10,gold:18,color:'#848c9f'},
 boss:{hp:400,speed:.035,dps:18,gold:125,color:'#9b5ac8'}
};