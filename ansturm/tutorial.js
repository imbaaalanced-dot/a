export const TUTORIAL_KEY='denkmal-ansturm-tutorial-v1';
export const TUTORIAL_STEPS=[
 {mark:'◆',title:'Verteidige das Denkmal',text:'Gegner erscheinen an allen Kartenrändern. Das Denkmal greift automatisch an. Lass seine Lebenspunkte nicht auf null sinken.',tip:'Im Ansturm steuerst du keinen Helden, sondern die Verteidigung des Denkmals.'},
 {mark:'✦',title:'Sammle Gold',text:'Für besiegte Gegner erhältst du Gold. Oben siehst du deinen Vorrat, die aktuelle Welle und deinen bisherigen Rekord.',tip:'Nach jeder Welle folgt eine kurze Baupause. In jeder fünften Welle erscheint ein Boss.'},
 {mark:'⚙',title:'Verbessere die Technik',text:'Öffne „Ausbauen“ und wähle „Technik“. Mit deinem Gold erhöhst du Schaden, Angriffstempo, Lebenspunkte oder Regeneration.',tip:'Auf großen Bildschirmen findest du die Verbesserungen rechts. Die erste Angriffsstufe kostet 20 Gold.'},
 {mark:'ϟ',title:'Schalte neue Waffen frei',text:'Unter „Waffen“ kannst du beispielsweise Mehrfachschuss oder Tesla-Kette kaufen. Diese Fähigkeiten wirken automatisch und haben bis zu drei Ausbaustufen.',tip:'Alle Käufe gelten für diesen Durchlauf. Pause und Kurzanleitung findest du im Spielmenü.'}
];
export function tutorialSeen(storage){try{return storage?.getItem(TUTORIAL_KEY)==='done';}catch{return false;}}
export function rememberTutorial(storage){try{storage?.setItem(TUTORIAL_KEY,'done');}catch{/* Hilfe darf bei gesperrtem Speicher weiterhin schließen. */}}
