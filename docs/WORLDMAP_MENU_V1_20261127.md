# Weltkarten-Hauptmenü – Stufe 1

## Vorschau
Opt-in: `?td2WorldMap=1`. Standardmäßig bleibt die bestehende Levelgalerie unverändert. Acht kreisförmige Levelknoten nutzen die vorhandenen Levelbilder und die ursprünglichen Buttons. Freischaltungen, Spielstände, Levelstarts und Kampagnenfolge verbleiben in game.js. Gesperrte Kapitel zeigen nur die bestehende Ortsbezeichnung und das Schloss, keine Vorschaugrafik.

Die Positionen sind reine Layout-Slots, keine historischen oder geografisch geprüften Koordinaten. Das bestehende Hintergrundbild dient als Platzhalter. Die Vorschau startet ein freigeschaltetes Kapitel wie bisher direkt.

## Weitere Stufen
- Geografisch geprüfte regionale Karte mit Ruhr, Herdecke, Kirchende, Witten-Heven, Hohensyburg und Westhofen; Einleitung und Labyrinth als abstrakte Startstationen.
- Dark-Fantasy-Kartenillustration als separates optimiertes Asset mit lokaler Kopie und optionalem CDN.
- Hauptmenü-Hierarchie: Weltkarte als Startansicht, Level-Detailkarte mit ausdrücklicher Spielen-Aktion; bestehende Helden-, Inventar-, Chronik-, Optionen- und Endlos-Funktionen anbinden, keine zweite Spielstandslogik.
- Gebietserkundung und Chronik aus bestätigtem Fortschritt, keine künstlichen Belohnungen oder erfundenen historischen Angaben.
- Responsive Abnahme auf 320–480 px, Desktop, Touch, Tastatur, 4-GB-Android; alte Galerie als Rückfall bis zur Freigabe.

Ansturm wird nicht wieder als abhängiger Spielmodus eingeführt. Keine Spielbalance-, Preloader- oder Save-Migration in dieser Stufe.
