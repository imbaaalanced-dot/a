# Denkmal TD · v3.5.0-alpha.1

Browser-Testbuild mit Marcel dem Denkmalschützer. Die spielbaren Dateien liegen direkt in `dist/`; es ist kein Build-Schritt und keine zusätzliche Laufzeit-Abhängigkeit erforderlich.

## Aktueller Alpha-Stand

v3.5.0-alpha.1 konsolidiert die bisher getrennten v3-Patches auf einem gemeinsamen Tester-Stand.

- Vier feste Spawn-Tore in Level 1 und das freischaltbare Labyrinth als Level 2.
- Steuerbarer Held Marcel mit automatischem Runenstab, Ausweichen, Seelenruf, Ausrüstung und Beute-Inventar.
- Vier aktive Turmrollen: Bogen, Kanone, Magie und Riftlanze.
- Kontextuelles Bauen auf festen Bauplätzen, Aufwerten bis Stufe 3 und Verkaufen.
- Combat-Synergien: Kanone profitiert von verlangsamten Gegnern; Rift kann auf verlangsamte Ziele weiter ketten.
- Off-Screen-Bedrohungspfeile und optionale FPS-/Gegner-/FX-Telemetrie für Tester.
- Portrait-first Android-Layout mit Safe-Area-Unterstützung, angepasstem Kamera-Zoom, Touch-Joystick und kompaktem 2×2-Arsenal.
- Neue Projektil- und Treffer-Sprites für Bogen, Kanone, Magie und Rift. Der bisherige prozedurale Renderer bleibt als Fallback erhalten.
- Einheitliches Browser-Cache-Busting für den v3.1-Testbuild.
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

## Spielen

WASD/Pfeile oder Touch-Joystick bewegen Marcel. Der Runenstab feuert automatisch. `E` baut, `Q` wertet auf, `X` verkauft, Leertaste weicht aus, `F` löst den Seelenruf aus, `H` öffnet Ausrüstung und `I` das Inventar. Auf Touch-Geräten stehen dieselben Aktionen als Bildschirmtasten bereit.

Level 1 umfasst Wellen 1–5. Danach wird Level 2 dauerhaft im Hauptmenü freigeschaltet. Ein laufender Durchgang wird beim Neuladen nicht gespeichert.

## Prüfung

Die GitHub-Actions-Workflows führen vor Veröffentlichung die Regression-Suites aus:

- `node tests/game.test.cjs`
- `TEST_MOBILE=1 node tests/game.test.cjs`
- `node tests/combat-fx.test.cjs`
- `node tests/v3.1-features.test.cjs`

Der Pages-Workflow veröffentlicht nur nach erfolgreicher Prüfung den Inhalt von `dist/` auf `gh-pages`.

Ein Langzeittest auf echten Android-Geräten bleibt weiterhin Teil des Alpha-Testings.

## Lokal starten

```bash
python -m http.server 8777 --directory dist
```
