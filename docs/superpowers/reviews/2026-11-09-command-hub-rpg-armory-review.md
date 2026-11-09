# Denkmal TD2 V5: Command Hub & RPG-Rüstkammer – Entwicklungsabnahme

**Datum:** 09.11.2026  
**Branch:** `feature/td2-command-hub-armory-20261109`  
**Ausgangsbasis:** `af2e768f13c08d148f35907474169f35dce2a57c` (`main`); parallele V5-HUD-Verfeinerung aus `72faeb03d5b75831d5ebb238e3b380a19d6e02aa` in die Feature-Dateien übernommen.
**Status:** lokal implementiert, automatisierte Tests bestanden; keine veröffentlichte Vorschau und keine echte Android-Abnahme.

## Implementiert

- Vier direkte Hauptmenükacheln: Kampagne, Denkmal-Ansturm, Helden & Ausrüstung, Optionen; Kampagnen-Endlosspiel bleibt unter Kampagne.
- Doppelte mobile Navigation aus der Startseite entfernt; einheitliches responsive 2×2-Layout, sichtbares V5-Alpha-Label im Kopf, dezentere sekundäre Links.
- Korrekte freigegebene V5-Figurenbilder statt älterer, nicht referenztreuer Menübanner; charakterabhängiges Vorladen und Wechseln der Bilder.
- Rüstkammer mit Tabs für Ausrüstung, Rucksack und Schmiede. Marcel-/Kim-Auswahl aus demselben gespeicherten Menühelden, nicht einem zweiten Spielstandsmodell.
- Rucksack-Suche mit 150-ms-Verzögerung, kombinierbare Filter, Sortierung, Ergebniszahl und Reset; 60 Gegenstände pro Darstellungsblock bleiben erhalten.
- Sammelrecycling ausschließlich im bewusst geöffneten Schmiedebereich mit Voransicht und Bestätigung; einzelne Gegenstände behalten Upgrade-, Favoriten- und Anlegeschutz.
- Mobiler Gegenstandsvergleich als zugängliches Dialogfenster mit Fokus-Rückgabe, Escape-/Backdrop-Schließen und abgesichertem Bestätigungsdialog.
- Versionsspezifische Cache-Schlüssel der geänderten Dateien aktualisiert; die zwei alten Portrait-Decorator-Dateien bleiben zur Nachvollziehbarkeit erhalten, werden jedoch nicht mehr geladen.

## Abgegrenzt

- `dist/loot.js`, Loot-v4-Schema, Gegenstandskatalog, Drop-Raten, Stat-Grenzen, Wellen und Gegner-KI **nicht geändert**.
- Keine automatische Spielstandsmigration und kein Zugriff auf reale Nutzerdaten.
- Kein Merge nach `main`, kein Produktiv-Deployment.
- Bestehende Metadaten `v4.1.0-alpha.1` für den älteren Basispfad sind unverändert; der sichtbare neue UI-Bereich zeigt `V5 · ALPHA`. Vor einer öffentlichen V5-Veröffentlichung müssen Metadaten und endgültige Release-ID vereinheitlicht werden.

## Nachweise

- `node --check dist/game.js` und `node --check dist/loot-ui.js`: bestanden.
- Alle **95** `tests/*.test.cjs`: bestanden (Menü, Navigation, mobile Touch-Logik, Loot, Migration, Cache, Ansturm, parallele HUD-Verfeinerung und weitere Regressionen).
- Alle **14** `tests/*.test.py`: bestanden (Grafik-/Assetprüfung und weitere Prüfscripts).
- `git diff --check`: bestanden.
- Referenzbilder im Menü geprüft: `marcel-guardian-v6.webp` (661×1050, 139 KiB) und `kim-marksman-v6.webp` (645×1048, 119 KiB), beide mit Alphakanal. Neue Menüfelder nutzen vorhandene kleine Style-2-WebP-Grafiken.

## Noch offen (keine fiktiven Abnahmen)

1. **Visueller Chromium-Smoke-Test:** Playwright-Bibliothek ist vorhanden, Chromium-Binary nicht. Offizieller Downloadversuch scheiterte mit 0-MiB-/ungültigem ZIP-Inhalt. Daher keine echten 320/360/393/420px-Screenshots oder Browser-Touch-Messungen.
2. **Android 4 GB RAM:** Auf dem physischen Gerät Startmenü, Tabs, Scrollbereiche, 15–30 Minuten langes Spielen und große Gegnerwellen prüfen; FPS/RAM/Touch/Grafikflackern nicht gemessen.
3. **Desktop/Querformat:** visueller Durchgang in echtem Browser; Fokusreihenfolge und Info-Dichte begutachten.
4. **GitHub CI/Preview:** Nur nach tatsächlichem Branch-Push/Draft-PR und echtem Pages-Build als bestanden/veröffentlicht markieren.

## Kleinste nächste Prüfung auf Android

1. Feature-Preview im Android-Chrome öffnen; zunächst prüfen, dass die vier Kacheln vollständig sichtbar bzw. scrollbar und tappbar sind.
2. `Helden & Ausrüstung` → Rüstkammer; Kim/Marcel umschalten, mit Name suchen, Tabs und 2. Ringplatz bedienen.
3. Sammelrecycling-Vorschau öffnen und **abbrechen**; nach Neustart vergleichen, ob Ausrüstung, Favoriten und Essenz unverändert sind.
4. 15 Minuten spielen, dann zur Rüstkammer zurück; Touch, Bildfehler, RAM und FPS **tatsächlich** notieren.

**Freigaberegel:** Keine Änderung an `main`, solange Code-Review, veröffentlichte Vorschau und echte Android-Prüfung nicht separat bestätigt sind.
