# Denkmal TD2 V5 – Westhofen V2 im Level-7-Laufzeittest

**Stand:** 13.11.2026 · **Status:** Testintegration auf Featurebranch, nicht für reguläre `main`-Veröffentlichung freigegeben.

## Grafikschalter (nur zum Vergleichen, keine Speicherung)

- Standard: **V1** (der bestehende handgemalte Denkmalsprite). Aufruf der gewohnten URL ohne Zusatz.
- Opt-in-Preview: **V2** durch Anhängen von `?westhofenArt=v2` an den Einstieg der **entsprechend gebauten Testversion**.
- Der Parameter wählt die Grafik beim Laden des Dokuments. Ein späteres Umschalten ohne Neuladen ist nicht implementiert.
- Beide Varianten zeichnen auf dem identischen `m.x-225,m.y-265,450,300`-Rechteck und verwenden dieselben Spielleveldaten.
- V2 braucht eine **neue** Bilddatei `dist/assets/westhofen/westhofen-memorial-style2-v2.webp` (768×512 RGBA WebP, 28.724 Byte laut reproduzierbarem Export).
- Falls V2-Dekodierung fehlschlägt, lädt der zentrale Asset-Manager **einmalig** V1 als Bildfallback. Während des Nachladens oder wenn beide Dateien fehlen, bleibt der bestehende gezeichnete Canvas-Fallback verfügbar. Der V1-Fallback wird beim Level-Release wieder freigegeben.

## Status der optischen Abnahme

Das aus den SVG-Quellen erzeugte V2-WebP wurde **als tatsächliches Bild begutachtet**. Gegenüber dem bestehenden V1 ist die Darstellung wesentlich **flacher und weniger handgemalt**. Positiv sind die aufrechteren Helmflügel, größere Schildform, getrennte Ebenen und die leere mittlere Tafelfassung. Noch offen sind historische Silhouetten-/Reliefpräzision, Materialtiefe und Lesbarkeit bei 64/128 Pixeln **auf dem realen Spielcanvas**.

**Keine Auslieferung als Standard**, solange V2 nicht mindestens dieselbe visuelle Qualität wie V1 erreicht. Das V1-Denkmal wird nicht gelöscht und ist die sichere Standardauswahl.

## Unveränderte Spielsysteme

`dist/levels.js`, Wegpunkte, Kollision, Tower-Slots, Wellen, Progress, Level-Freischaltung, Save-Keys, Helden und Gegner bleiben unverändert. Der URL-Parameter wird nicht in den Speicherstand geschrieben. Auf 4-GB-Android darf V2 nicht automatisch als abgenommen gelten.

## Automatisierte Kontrolle

- `node tests/westhofen-v2-preview-runtime.test.cjs` prüft V1-Default, V2-Opt-in, festen World-Pivot, bedarfsgesteuerten V1-Fallback und Cache-Release.
- `node tests/asset-manager.test.cjs`, `node tests/level67-single-image-owner.test.cjs`, `node tests/westhofen-style2-art.test.cjs` und `python tests/assets.test.py` erhalten die vorhandenen Loader-/Alpha-Verträge.
- `node tools/verify-level7-style2-environment.cjs` prüft V1 und V2 jeweils auf Desktop-Chromium sowie 412×915-Touch-Emulation und schreibt Vorher/Nachher-Screenshots plus JSON-Bericht.
- Das neue CI `.github/workflows/westhofen-v2-browser.yml` führt die Browserprüfung aus und speichert die Bilder als Artefakt.
- **Physisches Android mit 4 GB RAM und Langzeitsitzung muss zusätzlich getestet werden**; virtuelle Touch-Emulation ersetzt diese Prüfung nicht.

**Merge-Gate:** Ohne erfolgreiches aktuelles CI und visuelle/manual Android-Freigabe bleibt PR #232 offen. Ein Merge darf nicht als erfolgreiche Veröffentlichung bezeichnet werden.
