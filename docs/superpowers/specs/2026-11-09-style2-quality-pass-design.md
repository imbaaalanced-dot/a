# TD2 V5 Style-2-Qualitätspass – Design

## Zweck

Die fünf am 09.11.2026 freigegebenen Grafikbaustellen in einer überprüfbaren Entwicklungsrunde bearbeiten: (1) Helden, (2) Westhofen, (3) Ansturm-Zuschnitte, (4) Levelumgebungen und (5) Effekte/Altbestände. Ziel ist ein einheitlicher Graphic-Dark-Fantasy-Look bei funktionsfähiger Android-Canvas-2D-Laufzeit.

## Verbindliche Vorgaben

- Referenz-Lock aus PR #124: Marcel mit Cap, Hoodie, Schwert/Löwenschild; Kim blond mit Sonnenbrille, schwarzem Outfit und Bogen. Originale unverändert.
- Renderer auf `main` nutzt 0,82 Tiefenprojektion und `upright` für stehende Sprites, keine echte 3D-Kamera.
- Westhofen: derzeitiger Denkmalzustand 2026 mit fehlender zentraler Bronzetafel und fehlenden Feuerschalen; Geometrie, Wege, Bauplätze, Wellen und Speicherstände unverändert.
- Ansturm: Randspawns, zentrales Denkmal, keine spielbaren Helden oder Spawnportale.
- Android 4 GB RAM: neue Texturen lazy laden, decodierte Größe prüfen; Browser- und Gerätetests trennen.
- Neue Bilddateien versioniert ablegen; keine Originale löschen, kein Merge nach `main`, keine ungefragte Veröffentlichung.

## Ansätze und Entscheidung

1. Alles in einem neuen Bildstil neu erzeugen: optisch großer Sprung, aber hohe Identitäts-, Geschichts- und Performance-Risiken.
2. **Gewählt:** bestehende Style-2-Master erhalten, nur belegte Störungen und fehlende Assets versioniert bearbeiten; pro Bereich eigene Tests und Fallbacks. Bewahrt Save-Kompatibilität und erlaubt partielle Abnahme.
3. Nur Code-Fallbacks ändern: schnell, behebt aber historische Platzhalter und beschädigte Freistellungen nicht.

## Ergebnisdefinition

1. Helden: V5-Portraits sauber freigestellt und bei Miniaturgröße lesbar; fehlerhafte Sprite-Raster/Manifest-Zuordnungen behoben oder sicher deaktiviert; kein Rückfall auf falsche Identitäten ohne sichtbare Kennzeichnung.
2. Westhofen: eigenständiges, transparentes Denkmal-Sprite als historisch angenäherte Illustration; passender Eintrag in der Levelgalerie; alter Canvas-Fallback bleibt bei Ladefehler.
3. Ansturm: diagnostizierte Rand-/Fremdpartikel gezielt bereinigt, gleiches Bildformat und feste Fußpunkte; eine ausführbare QA verhindert neue abgeschnittene Silhouetten. Nicht geprüfte Grafiken ausdrücklich als offen kennzeichnen.
4. Level 3–6: bestehende Boden-, Wege- und Baumebenen optisch angleichen, ohne Pfade oder Kollisionsaussagen zu ändern. Fokus kleine, wiederverwendbare Canvas-Materialkorrekturen.
5. Effekte/Altbestand: aktuelle Standardpfade dokumentieren, problematische Rift-/Impact-Übergänge gezielt testen; deaktivierte Motive archivieren statt löschen.

## Nichtziele

- Keine Spielbalance-, Tower-Rollen-, Wellen- oder Save-Migrationen.
- Kein gleichzeitiges Ersetzen aller 21 Gegner-Animationsatlanten.
- Keine behauptete historische Maßgenauigkeit ohne Belege.
- Kein physischer Android-FPS-Nachweis aus Node-/Desktop-Tests.

## Abnahme

Jede Änderung erhält einen vorher fehlschlagenden gezielten Test, eine 64/128-Pixel-Sichtprüfung, Dateiformat-/Alpha-/Pivot-Checks und den vorhandenen Projekttestlauf. Nicht erfüllte Teilbereiche bleiben als offene TODO im Report. Ein unveröffentlichter Draft ist kein Release.
