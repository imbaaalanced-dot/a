# Westhofen: Umgebungsgrafiken, Style-2-Pilot

Stand: 03.11.2026. Illustrative, transparente und eigenständige **SVG-Produktionspiloten**, keine fotografisch vermessenen oder spielintegrierten Objekte.

| Datei | Inhalt | Export | Laufzeit |
|---|---|---|---|
| `dist/assets/westhofen/pergola-pilot.svg` | moosbewachsene offene Pergola | 256×192, transparent | noch nicht referenziert |
| `dist/assets/westhofen/stairs-pilot.svg` | vier verwitterte Steinstufen | 256×192, transparent | noch nicht referenziert |
| `dist/assets/westhofen/wall-pilot.svg` | niedriges Steinmauersegment | 256×192, transparent | noch nicht referenziert |

## Stilvorgaben

Gedämpfter grau-beiger Stein, kalte dunkelgrüne Schatten und sparsam gesetztes Moos. Perspektive als niedrige erhöhte 3/4-Darstellung für vorhandenes Canvas 2D; transparente Margins. Keine eingefärbten Hintergründe, kein UI-Text, keine Fremdbilder.

## Platzierungsvertrag

Die tatsächlichen Standorte, Ausrichtung und Dimensionen der Pergola sowie Treppen und Mauer sind auf Basis der vorliegenden historischen Referenzdaten **nicht vermessen**. Ihre Nutzung muss daher vor Platzierung mit Fotos oder Spielskizze abgeglichen werden. Nicht direkt auf `layout.paths`, `layout.slots`, Spawnpunkte, Luftkorridor-Markierung oder Denkmal-Footprint zeichnen. Zuerst eine Screenshot-Abnahme in tatsächlicher Spielkameraperspektive bei 64/128 px. Dekoration erhält niemals automatisch eine Kollision.

## QA

`node tests/westhofen-environment-assets.test.cjs` prüft drei SVG-Verträge (256×192, keine externen Bildquellen/Skripte, transparente Margins, Dateigröße). Der Code ist eine isolierte Assetprüfung; er ersetzt keine Browser-Screenshotabnahme oder Android-Messung.

## Folgeschritt

Nach Bestätigung der Platzierungsskizze können die Assets als optionale visuelle Dekoration in den bestehenden gecachten Hintergrund eingebaut werden. Die Renderer-Fallbacks für das Hauptdenkmal bleiben unverändert. Basisbranch/PR #74 wurde nicht angerührt.
