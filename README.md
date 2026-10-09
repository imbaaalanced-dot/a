# Denkmal TD · v3.6.0-alpha.2

Browser-Testbuild mit Marcel dem Denkmalschützer. Die spielbaren Dateien liegen direkt in `dist/`; es ist kein Build-Schritt und keine zusätzliche Laufzeit-Abhängigkeit erforderlich.

## Aktueller Alpha-Stand

v3.6.0-alpha.2 ergänzt ein neu gestaltetes Hauptmenü mit Laternenhüter-Panorama, mobilen Bildvarianten und einem direkten Link zum YouTube-Kanal **denk mal nach**. Die dauerhafte Rüstkammer aus Alpha.1 bleibt erhalten. Beute bleibt nach Niederlagen und Neuladen erhalten; Ausrüstung wird ausschließlich im Hauptmenü gewechselt.

- Vier feste Spawn-Tore in Level 1 und das freischaltbare Labyrinth als Level 2.
- Steuerbarer Held Marcel mit automatischem Runenstab, Ausweichen, Seelenruf, Ausrüstung und Beute-Inventar.
- Neuer Marcel-Look: Kapuze, dunkler Mantel und blaues Erinnerungslicht; im Spiel als eigener 4-Richtungs-Pixelatlas für oben, unten, links und rechts.
- Neues Portrait für Startbildschirm, Story, Charaktermenü und HUD; der alte Marcel-/Kael-Spritepfad wird nicht mehr für den aktiven Helden verwendet.
- Vier aktive Turmrollen: Bogen, Kanone, Magie und Riftlanze.
- Kontextuelles Bauen auf festen Bauplätzen, Aufwerten bis Stufe 3 und Verkaufen.
- Combat-Synergien: Kanone profitiert von verlangsamten Gegnern; Rift kann auf verlangsamte Ziele weiter ketten.
- Off-Screen-Bedrohungspfeile und optionale FPS-/Gegner-/FX-Telemetrie für Tester.
- Portrait-first Android-Layout mit Safe-Area-Unterstützung, angepasstem Kamera-Zoom, Touch-Joystick und kompaktem 2×2-Arsenal.
- Neue Projektil- und Treffer-Sprites für Bogen, Kanone, Magie und Rift. Der bisherige prozedurale Renderer bleibt als Fallback erhalten.
- Einheitliches Browser-Cache-Busting v360a2 für alle Skripte und Styles.
- Taktische Zielprioritäten pro Turm: ERSTER, STÄRKSTER, NÄCHSTER oder BOSS.
- Gegner-Vorschau während der Baupause.
- Mage-Slow verstärkt Kanonen-Impact/Splash um 25 % und gibt der Riftlanze einen zusätzlichen Kettensprung.
- Alpha-2 Mobile-Polish: Joystick-Deadzone mit analoger Response, weitere Kamera und leichter Bewegungs-Vorlauf.
- Kompaktere Touch-Aktionsflächen, die nur bei Bau-/Turmkontext breiter werden.
- Kurzer Wellen-Banner beim ersten Spawn einer neuen Welle.
- Alpha-3 Kampfprofile pro Welle: HETZJAGD, BRECHERSTURM, PFEILREGEN, SCHILDWALL, SABOTAGE und RISSSTURM.
- Runner geraten unter 45 % LP in Raserei; Wächter verlieren unter 50 % LP einen Teil ihrer Panzerung und werden schneller.
- Schützen weichen Marcel auf sehr kurze Distanz aus; Sappeure detonieren einmalig am Monument.
- Der Belagerer eskaliert bei 66 % und 33 % LP in Phase II und III mit mehr Tempo, Schaden, Angriffstakt und Panzerung.
- Trefferreaktionen und Boss-Phasen werden visuell stärker hervorgehoben.
- Alpha v3.2: Schadenszahlen mit automatischer Dichtebegrenzung auf mobilen Geräten.
- v3.2.0-alpha.2: leichte Treffer ohne Camera-Shake; normale Kanone 0,6; schwere Kanone/Boss-Treffer 3; Boss-Phasenwechsel 10. Hit-Stop bleibt Boss-Treffern und schweren Kanonen-Einschlägen vorbehalten.
- Gegnerpanzerung wird mit einem Schildindikator neben dem HP-Balken sichtbar.
- Ab Welle 12 erscheint alle vier Wellen ein rotierender Mini-Boss-Modifikator.

## Dauerhafte Beute & Rüstkammer

- Im Hauptmenü **HELD & INVENTAR** öffnen: Waffe, Kopf, Rüstung, Handschuhe, Stiefel, Amulett und zwei Ringe.
- 30 Rucksackplätze, gesicherter Überlauf, Seltenheitsfilter, Sortierung und Vergleich mit angelegten Gegenständen.
- Fünf Seltenheiten von gewöhnlich bis legendär. Zufällige Werte für Schaden, LP, Tempo, Schutz, kritische Treffer, Lebensraub und Turmschaden; legendäre Spezialeffekte.
- Jede abgeschlossene Welle gibt Beute, Bosse garantieren mindestens epische Ausrüstung. Alte Ausrüstungsvarianten werden nach Wellen 3, 4 und 8 einmalig dauerhaft freigeschaltet.
- **I / H** im Kampf öffnet die Sammlung nur zum Ansehen. Neue Funde verändern die Ausrüstung des laufenden Durchgangs nicht.
- Favoriten schützen; unangelegte Gegenstände zerlegen oder für 50 dauerhafte Schmiedessenz neu würfeln. Schmiedessenz ist getrennt von der Turmbau-Essenz.
- Autosave im Browser auf diesem Gerät. JSON-Export/Import für Sicherung und Gerätewechsel; Import ersetzt die Sammlung erst nach Bestätigung. Browserdaten löschen entfernt auch den lokalen Spielstand.
- Speicherfehler werden angezeigt: in diesem Fall exportieren. Andere Tabs dürfen einen neueren Spielstand nicht überschreiben.
- v3.5.0-alpha.2 hat keine dauerhafte Beute gespeichert. Frühere Lauf-Beute lässt sich deshalb nicht übernehmen. Die drei ursprünglichen Startboni sowie die bestehende Level-2-Freischaltung bleiben erhalten.

## Spielen

WASD/Pfeile oder Touch-Joystick bewegen Marcel. Der Runenstab feuert automatisch. `E` baut, `Q` wertet auf, `X` verkauft, Leertaste weicht aus, `F` löst den Seelenruf aus, `H` öffnet Ausrüstung und `I` das Inventar. Auf Touch-Geräten stehen dieselben Aktionen als Bildschirmtasten bereit.

Level 1 umfasst Wellen 1–5. Danach wird Level 2 dauerhaft im Hauptmenü freigeschaltet. Ein laufender Durchgang wird beim Neuladen nicht gespeichert.

## Prüfung

Die GitHub-Actions-Workflows führen vor Veröffentlichung die Regression-Suites aus:

- `node tests/loot.test.cjs`
- `node tests/game.test.cjs`
- `TEST_MOBILE=1 node tests/game.test.cjs`
- `node tests/combat-fx.test.cjs`
- `node tests/v3.1-features.test.cjs`

Der Pages-Workflow veröffentlicht nur nach erfolgreicher Prüfung den Inhalt von `dist/` auf `gh-pages`; der separate Testpfad `superpowers-alpha3/` bleibt erhalten.

Zusätzlich: `python tests/assets.test.py` (Pillow erforderlich) prüft die neuen Heldenbilder.

Ein Langzeittest auf echten Android-Geräten bleibt weiterhin Teil des Alpha-Testings.

## Lokal starten

```bash
python -m http.server 8777 --directory dist
```
