# Denkmal TD · v3.1.0-alpha.2

Browser-Testbuild mit Marcel dem Denkmalschützer. Die spielbaren Dateien liegen direkt in `dist/`; es ist kein Build-Schritt und keine zusätzliche Laufzeit-Abhängigkeit erforderlich.

## Aktueller Alpha-Stand

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

## Spielen

WASD/Pfeile oder Touch-Joystick bewegen Marcel. Der Runenstab feuert automatisch. `E` baut, `Q` wertet auf, `X` verkauft, Leertaste weicht aus, `F` löst den Seelenruf aus, `H` öffnet Ausrüstung und `I` das Inventar. Auf Touch-Geräten stehen dieselben Aktionen als Bildschirmtasten bereit.

Level 1 umfasst Wellen 1–5. Danach wird Level 2 dauerhaft im Hauptmenü freigeschaltet. Ein laufender Durchgang wird beim Neuladen nicht gespeichert.

## Prüfung

Der GitHub-Actions-Workflow führt vor Veröffentlichung beide Regression-Suites aus:

- `node tests/game.test.cjs`
- `node tests/combat-fx.test.cjs`

Der Pages-Workflow veröffentlicht nur nach erfolgreicher Prüfung den Inhalt von `dist/` auf `gh-pages`.

Ein Langzeittest auf echten Android-Geräten bleibt weiterhin Teil des Alpha-Testings.

## Lokal starten

```bash
python -m http.server 8777 --directory dist
```
