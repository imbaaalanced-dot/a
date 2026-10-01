# Denkmal TD · v2.7.0

Privater Browser-Testbuild mit Marcel dem Denkmalschützer. Spieldateien liegen in `dist/` und benötigen keinen Build und keine zusätzlichen Laufzeit-Abhängigkeiten.

## Änderungen

- Kamera-Zoom 0,78: rund 28 % mehr sichtbare Welt je Richtung; Mauskoordinaten werden korrekt zurückgerechnet.
- Marcel ersetzt Kael in Spiel, Menüs, Chronik und Dialogen. Neue Sprites für Marcel, Monument, Tore und drei Gegnerklassen teilen Kamera, Materialien und Licht.
- Steinboden statt Lava; Wege lassen die Bodentextur durchscheinen. Bestehende Bogen- und Kanonengrafiken behalten ihre drei Ausbaustufen und proportionalen Größen.
- 60 Startessenz in Level 1, fünf Sekunden erste Baupause und sechs Sekunden vor weiteren Wellen. „Welle starten“ beendet die Pause vorzeitig.
- Kanone: 34 Schaden, 275 Reichweite, 64 Radius für Flächenschaden. Bogen: 300 Reichweite. Türme priorisieren Gegner mit dem kürzesten verbleibenden Weg zum Monument.
- Aschensplitter geben +3 Stabschaden; Rissrunen verkürzen Angriffspausen um 6 %; Wächtersiegel geben +30 maximale LP und heilen 50 Helden- sowie 80 Monument-LP. Die Effekte gelten für den Lauf und nur für eingelagerte Beute. Volles Inventar ergibt acht Essenz pro weiterem Fundstück.
- Beute wird aus 170 Welteinheiten angezogen. Abgelaufene Gegenstände sowie Beute der letzten Welle werden gesammelt.
- Wege und Monument bleiben von neuen Türmen frei. Das Labyrinth verwendet weiter die markierten Bauplätze.
- Kleine Bildschirme: kompakter HUD, erreichbares Inventar, passende Aktionsknöpfe und korrigierter Joystick. Pause und Dialoge löschen aktive Eingaben.

## Spielen

WASD/Pfeile oder Touch-Joystick bewegen Marcel. Automatischer Runenstab. E baut, Q wertet auf, X verkauft, Leertaste weicht aus, F löst den Seelenruf aus, H öffnet Ausrüstung und I die Beute. Handy-Aktionsknöpfe bieten dieselben Aktionen.

Level 1 umfasst Wellen 1–5. Danach bleibt Level 2 im Hauptmenü freigeschaltet. Nur die Level-Freischaltung und Tonpräferenzen werden dauerhaft gespeichert; ein laufendes Spiel wird beim Neuladen beendet. Marcels Dialogstimme ist optional und nutzt die deutsche Browser-Sprachausgabe; vorhandene Kael-Aufnahmen werden nicht abgespielt.

## Prüfung

`node tests/game.test.cjs` · 37 Gameplay-Prüfungen, Asset-Referenzen und Kamera-Koordinaten.

`node tests/combat-fx.test.cjs` · Audiofreigabe, Stummschaltung, Stimmen-/Partikelgrenzen und reduzierte Bewegung.

Zusätzlich im lokalen Chromium geprüft: 1440×900, 844×390 und 390×844, neue Grafik geladen, keine fehlenden lokalen Dateien oder JavaScript-Fehler, Turmbau, Inventar, echte Touch-Ereignisse und Levelwechsel. Dies ersetzt keinen Langzeittest auf einem echten Android-Gerät.

Lokaler Start: `python -m http.server 8777 --directory dist`.
