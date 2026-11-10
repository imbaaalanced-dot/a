export const TUTORIAL_KEY='denkmal-ansturm-tutorial-v1';
export const TUTORIAL_STEPS=[
 {mark:'◆',title:'Schütze das Denkmal',text:'Gegner kommen von allen Kartenrändern. Dein Denkmal greift automatisch an. Halte seine Lebenspunkte über null.',tip:'Du steuerst die Ausbauten – einen Helden gibt es in Ansturm nicht.'},
 {mark:'✦',title:'Verdiene Gold',text:'Besiegte Gegner bringen Gold. Oben siehst du deinen Vorrat, die aktuelle Welle und deinen Rekord.',tip:'Nach jeder Welle gibt es eine kurze Baupause. Jede fünfte Welle bringt einen Boss.'},
 {mark:'⚙',title:'Verstärke deine Technik',text:'Öffne unten „Ausbauen“ und wähle „Technik“. Verbessere Angriff, Tempo, Leben oder Regeneration mit deinem Gold.',tip:'Im Querformat und am Desktop stehen die Ausbauten rechts. Ein erster Angriffsausbau kostet 20 Gold.'},
 {mark:'ϟ',title:'Schalte Waffen frei',text:'Unter „Waffen“ kaufst du zum Beispiel Mehrfachschuss oder Tesla-Kette. Sie wirken automatisch und lassen sich bis Stufe 3 ausbauen.',tip:'Alle Käufe gelten für diesen Durchlauf. Pause und die Anleitung findest du jederzeit in der Spielsteuerung.'}
];
export function tutorialSeen(storage){try{return storage?.getItem(TUTORIAL_KEY)==='done';}catch{return false;}}
export function rememberTutorial(storage){try{storage?.setItem(TUTORIAL_KEY,'done');}catch{/* Hilfe darf bei gesperrtem Speicher weiterhin schließen. */}}
