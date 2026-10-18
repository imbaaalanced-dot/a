# Level 5 · Hohensyburg / Kaiser-Wilhelm-Denkmal

## Referenz & Ziel
Bildreferenzen: vom Nutzer bereitgestellte Google-Earth-3D-Ansichten, Luftperspektive und Video-Standbilder vom 18. Oktober 2026. Eine historische Einordnung erfolgt nach LWL, Dehio und der Stadt Dortmund. Das Denkmal wurde 1902 eingeweiht und 1935/36 stark umgebaut. **Der aktuelle Spiel-Look zeigt die heutige Ein-Turm-Anlage** mit dem Reiterstandbild Wilhelm I. und zwei flankierenden Bronzen (Bismarck, Moltke), nicht die ursprünglichen drei Türme.

Quellen:
- LWL: https://www.lwl.org/fremde-impulse-download/start/LWL/Kultur/fremde-impulse/die_baudenkmale/Impuls-Syburg-Westhofen/Kaiserdenkmal-Hohensyburg.html
- Dehio: https://de.dehio.org/bauwerk/syburg-hohensyburg-kaiser-wilhelm-denkmal
- Denkmal heute, Dortmund (PDF): https://www.dortmund.de/dortmund/projekte/rathaus/verwaltung/stadtplanungs-und-bauordnungsamt/bilder/denkmalschutz/tag-des-offenen-denkmals/tdod_2025/programmbroschuere-zum-tag-des-offenen-denkmals-2017.pdf

## Spielgeometrie (nicht vermessen)
- Denkmalobjektiv bleibt bei Weltkoordinate (1536, 1536). Erhöhter Podiumsbereich über dem darunterliegenden großen gepflasterten Aussichtsvorplatz.
- Die **2 Treppenläufe**, das Brüstungsmauerwerk, Steinquader, schattierte Sockelwände und Waldabhang bilden zwei deutlich unterscheidbare Höhenstufen.
- Zwei asymmetrische Waldwege nähern sich von hinten/seitlich; ein dritter Weg kommt über den östlichen Aussichtsvorplatz und eine Treppe. Die verzweigte Grundidee stammt aus der Besucher-Luftperspektive; exakte Wege sind mangels amtlichem Lageplan bewusst **Näherungen**.
- Luftmonster erscheinen separat über dem südlichen Hang. Eine steile, frei erfundene vierte Bodenzufahrt entfällt.
- Turmbauplätze vermeiden die Denkmalplattform, alle Treppen, Gegnerlinien und den südlichen Abhang.
- Ein einziges 1536×1536-Canvas für den Gelände-Cache und ein zweites 480×540-Canvas für das Denkmal. Keine neuen Bilder pro Frame; alternative Qualitätsstufen bleiben bestehen.

## Gegner / Wellen
- Wellen 17–20; erste Welle 2 Bodenwege, später 3; Boss Welle 20; gleichzeitig Luftangriffe (Schattenflügler, Gargoyle, Sturmgeist).
- Anfangsressourcen 300 Essenz, maximal 11 Türme. Balance-Zahlen und Heldenwerte bleiben wie im Level-5-Erstentwurf.
- Fortschritt und Endlosmodus verwenden getrennte Preview-Sperre: `/v4-level5/` testet ohne normale Kampagnenfreischaltungen zu überschreiben.

## Abnahme
- `node tests/level5.test.cjs` prüft Geometrie, Bauplätze, Treppen, Wege, Wellen, Speicherzustand und Cache-Wiederverwendung.
- `node tests/level5-preview.test.cjs` und `TEST_MOBILE=1 node tests/level5-preview.test.cjs` prüfen die Testvorschau.
- Die Tests laufen in **test.yml** und vor dem Pages-Publish in **pages.yml**.
- Offene manuelle Prüfung: reale Android-FPS, Größe der Bronzen und Sichtbarkeit der Treppen in der porträtierten 2.5D-Kamera, Eingangsrichtungen mit Vor-Ort-Aufnahmen nachmessen.

Vorschau nach erfolgreichem GitHub-Actions-Deployment:
https://imbaaalanced-dot.github.io/a/v4-level5/

Dieser Branch enthält auch die vorgelagerten Style-2-Änderungen. Nicht vor manueller Freigabe und CI-Status in `main` mergen.
