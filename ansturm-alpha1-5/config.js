export const TECH = {
 attack:{name:'Angriff',base:20,growth:1.2,increment:3,desc:'Erhöht den Schaden um 3.'},
 tempo:{name:'Tempo',base:35,growth:1.25,increment:.15,desc:'Erhöht die Angriffsrate um 0,15 pro Sekunde.'},
 hp:{name:'Lebenspunkte',base:30,growth:1.25,increment:30,desc:'Erhöht die maximalen Lebenspunkte um 30 und heilt das Denkmal.'},
 regen:{name:'Regeneration',base:45,growth:1.3,increment:1,desc:'Regeneriert 1 Lebenspunkt pro Sekunde zusätzlich.'},
 range:{name:'Reichweite',base:40,growth:1.3,increment:.035,desc:'Erhöht die Angriffsreichweite um 3,5 %.'},
 gold:{name:'Goldbonus',base:60,growth:1.4,increment:.1,desc:'Erhöht den Goldgewinn um 10 %.'}
};
export const UPGRADES = {
 multishot:{name:'Mehrfachschuss',prices:[200,450,800],desc:'Trifft pro Ausbaustufe ein zusätzliches Ziel.'},
 tesla:{name:'Tesla-Kette',prices:[500,750,1000],desc:'Blitze springen auf 3, 4 oder 5 Gegner über.'},
 explosion:{name:'Explosion',prices:[250,550,900],desc:'Verursacht Flächenschaden rund um das getroffene Ziel.'},
 frost:{name:'Frostfeld',prices:[180,420,700],desc:'Verlangsamt Gegner im Wirkungsbereich.'},
 shield:{name:'Energieschild',prices:[150,350,650],desc:'Errichtet einen Schutzschild, der sich regeneriert.'},
 fire:{name:'Seelenbrand',prices:[300,600,1000],desc:'Treffer verursachen zusätzlichen Brandschaden über Zeit.'},
 pierce:{name:'Durchschlag',prices:[350,700,1100],desc:'Geschosse treffen mehrere Gegner hintereinander.'},
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
