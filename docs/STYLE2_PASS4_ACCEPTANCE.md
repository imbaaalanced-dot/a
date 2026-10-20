# Style 2 Pass 4 – Rift, Projektile und Android-Abnahme

Stand: 20.10.2026. Arbeitsbranch `assets/style2-user-towers-1to5-20261020`; PR #51 bleibt Draft. Diese Datei definiert Prüfkriterien, keine bereits durchgeführte Abnahme.

## Ausgangslage

Pass 3 hat elf Turmvarianten bereinigt. Drei Rift-Türme bleiben V1. Die aktive Bildzuordnung besteht aus 30 Varianten; bisherige Chromium-Smoke-Tests ersetzen keinen Android-Langzeittest. Keine Änderung von Save-Keys, Spielbalance oder Upgrade-Sternen.

## Gate A: Rift-Bildkorrektur

- Drei Rift-Türme (L1–L3) einzeln bei 64, 128 und 512 px auf dunklem und hellem Hintergrund prüfen.
- Nur künstliche pinke Keying-Säume entfernen; beabsichtigte violette Magie, Glows und freischwebende Elemente behalten.
- 512×512 RGBA, transparente Außenränder, Bodenanker [256,488], unveränderte Ausrichtung.
- Jede Korrektur als neue versionierte PNG-/verlustfreie WebP-Variante mit SHA-256 und Bounding-Box protokollieren.
- Ohne bestandenen visuellen Vergleich kein automatisches Aktivieren des Overrides.

## Gate B: Projektile und Treffer

- Alle 15 Projektile bei 64 und 128 px prüfen; insbesondere Eis/Magie L2 auf abgesetzte Fremdpartikel kontrollieren.
- 256×256 RGBA, Mittelpunkt [128,128] und bestehende Flugwinkel beibehalten.
- Einschläge pro Turmfamilie als getrennte Effekte entwickeln; keine Änderung an Schadenslogik oder Projektilgeschwindigkeit.
- Fallback muss bei noch ladenden oder fehlerhaften Assets sichtbar bleiben.

## Gate C: Android-Abnahme

- Test auf realem Android-Browser und wenn verfügbar Android-WebView, jeweils Kaltstart und Neustart.
- Je ein kompletter Durchlauf aller sechs Level sowie ein längerer Endloslauf mit vielen Gegnern.
- Bei Bewegung, Turm-Upgrades, Geschossen und Levelwechseln auf leere Frames, Flackern und Sprite-Sprünge prüfen.
- FPS, Framezeiten, JS-Fehler, HTTP-Asset-Fehler und soweit messbar Speicherverbrauch protokollieren.
- Opt-in `?td2UserTowers=1` gegen Opt-out vergleichen; keine Regression des normalen Builds akzeptieren.

## Release-Regel

PR #51 bleibt Draft und wird nicht gemergt oder live veröffentlicht, bevor die Bildprüfung und Android-Abnahme nachvollziehbar dokumentiert sind. Ergebnisse mit Datum, Gerät, Browser/WebView-Version, Build-SHA, Screenshots und Fehlerbeschreibung ergänzen.
