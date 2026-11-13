# Spät geladene V3-Böden aktualisieren gecachte Karten

Basis: `main` @ `85250bacbfc57ce1bfac68d4332923d8100f2ecb` (veröffentlichter PR #255).

## Reproduzierter Fehler

Wird eine Karte vor dem Dekodieren der V3-Materialien gezeichnet, bleibt ihr Ersatzboden im Canvas-Cache. Das spätere Laden der Texturen löst keinen Neuaufbau aus. Im kontrollierten Chromium-Test gegen unveränderten `main` scheitert Level 1: Vorher-/Nachher-Pixelhash identisch (`4274246678`). Der neue Unit-Test reproduziert ebenfalls die ausgebliebene Aktualisierung.

Außerdem lieferte ein zweiter Aufruf von `DenkmalTerrain.load()` bereits Erfolg, sobald die ältere Grundtextur geladen war, obwohl der erste Aufruf noch auf die V3-Materialien wartete.

## Korrektur

- Der V3-Loader veröffentlicht nach Abschluss seines einmaligen Downloadpakets eine Materialrevision. Auch teilweise erfolgreiche Downloads erhalten eine Revision; bei komplettem Fehlschlag bleibt die Revision unverändert.
- Die gecachten Bodendarstellungen für Level 1/2, 3/4 und 5–7 vergleichen diese Revision. Nach dem Laden wird der Ersatzboden einmal ersetzt. Danach greifen dieselben Caches wie vorher.
- Kirchende/Dorfkirche können eine bereits geladene V3-Grundtextur direkt verwenden, auch wenn die ältere Grundtextur noch fehlt.
- Gleichzeitige Terrain-Ladeaufrufe erhalten dieselbe noch laufende Promise. Kein vorzeitiges Erfolgssignal zwischen Grundtextur- und V3-Decode.
- Individuelle Script-Cache-Keys aktualisiert. Keine neuen Spielassets, Änderungen an Wegen, Bauplätzen, Spielständen oder Kampflogik.

## Nachweise

- 15 gezielte Unit-/Regressionstestdateien bestanden, einschließlich Cacheversionen, Level 4/5/6/7, optionaler Vorschauen und gemeinsamer Bildverwaltung.
- `tests/ground-late-load.test.cjs`: alle sieben Level; gecachter Ersatzboden während des Ladens, genau ein Neuaufbau nach erfolgreichem Decode, stabile Folgeframes, unveränderte Layoutdaten, teilweise/komplett fehlgeschlagene Downloads und konkurrierende Terrain-Ladeaufrufe.
- `tools/verify-ground-late-load-browser.cjs`: 14 Chromium-Szenarien (sieben Level × Desktop/Touch-Emulation). V3-Netzwerkantworten werden kontrolliert zurückgehalten, bis der Ersatzboden gecacht ist. Danach ändern sich die tatsächlichen Canvas-Pixel; exakt eine zusätzliche Welt-Canvas-Allokation, genau neun Materialrequests und keine weiteren Allokationen in 20 Folgezeichnungen. Keine JavaScript- oder HTTP-Assetfehler.
- Dieser isolierte Renderertest zeichnet die echten Bodenmodule auf ein Canvas; er ist kein vollständiger Spieltest. Die separate Prüfung mit `tools/verify-all-level-environments.cjs` hat ebenfalls alle 14 Spielansichten (1280×800 Desktop / 412×915 Touch-Emulation) ohne JavaScript-/Assetfehler bestanden; alle neun V3-Materialien sind dekodiert. Ergebnisse: [gameplay.json](gameplay.json).
- Neuer Unit-Test im Haupt-Testworkflow; verzögerter Chromium-Test samt Bild-/JSON-Artefakten in der Referenzboden-CI ergänzt.

[Level-1-Vergleich](level1-delayed-decode.webp) · [14 Renderer-Ergebnisse](delayed-decode.json)

Keine physische Android-Abnahme oder FPS-/Gesamtspeichermessung. Der einmalige Neuaufbau nach spätem Laden benötigt Renderarbeit; eine Performanceverbesserung wird nicht behauptet. Kein Merge oder Deployment dieses Folgepatches ohne gesonderte Freigabe.


## Ergänzung: normaler Menüstart ohne Vorladen

Kompatibilitätsbasis: aktueller `main` @ `7e79f6d` mit Westhofen-V3-Grafik/Vorplatz und Marcel-Stab-Effekten, konfliktfrei in diesen Prüfbranch übernommen. Keine fremden PRs oder `main` dabei geändert.

Der Menütest deckte eine zusätzliche Lücke auf: Nach normalem Start über Kampagne → Level 1 war der Spielzustand `playing`, aber es gab **null V3-Materialrequests** und **null geladene Materialien**. Die Grafiktests hatten das Laden ausdrücklich gestartet und diesen Unterschied damit verdeckt. [Vorher-Befund](menu-start-before.json).

Die ersten beiden Karten starten jetzt beim ersten Zeichnen selbst das gemeinsame V3-Ladepaket. Währenddessen bleibt die Ersatzdarstellung verfügbar; die bereits geprüfte Materialrevision aktualisiert den Boden nach dem Decode. Weitere Frames und Kartenwechsel starten keine zusätzlichen Pakete. `td2GroundV3=0` und der isolierte alte Style-2-Pilot bleiben ohne V3-Downloads.

`tools/verify-game-cold-start-browser.cjs` startet das Spiel ausschließlich über Menüschaltflächen und schließt Story/Tutorial über deren Bedienelemente. Keine Vorladeaufrufe oder manuelle Cache-Resets. Vier Fälle bestanden: Desktop und Touch-Emulation, jeweils mit zurückgehaltenen und absichtlich fehlgeschlagenen Materialdownloads. Tastatureingaben bewegen den Helden bereits während der zurückgehaltenen Downloads. Genau neun Materialrequests; nach Erfolg genau ein Karten-Neuaufbau; nach komplettem Fehlschlag kein Neuaufbau und keine Downloadschleife. Keine JavaScript-Ausnahmen oder unerwarteten lokalen Assetfehler.

Die Arbeitsumgebung blockiert die optionale externe Google-Fonts-Anfrage; die Tests verwenden dabei die vorhandenen Ersatzschriften. Diese externe Anfrage wird getrennt von lokalen Spielassets in den Ergebnissen protokolliert.

Zusätzlich alle **114** Hauptworkflow-Testbefehle und alle **14** vollständigen Levelansichten auf dieser aktuellen Integrationsbasis bestanden. Der neue Menüstart-Test ist mit seinen Bild-/JSON-Artefakten in die Referenzboden-CI eingebunden.

[Menüstart-Browserergebnisse](menu-start.json) · [Touch-Vergleich](menu-start-touch.webp) · [14 aktuelle Levelansichten](gameplay-current-main.json)

Physisches Android weiterhin ungeprüft. Kein Merge/Deployment durch diese Ergänzung.

Der Unit-Test prüft den automatischen Ladestart separat für Level 1 und 2 ohne Vorladeaufruf sowie jeweils 20 weitere Zeichnungen ohne zusätzliche Requests. Die beiden Abschaltvarianten (`td2GroundV3=0` und alter Style-2-Pilot) erzeugen dabei null V3-Requests.
