# Denkmal TD2 V5 — Level-Umgebungs-Audit

Stand: 2026-11-10 · Baseline: `main` @ `bbe0a46296de194c6de0e9ed8c758494609ad175` (Merge #186 Westhofen)
Umfang: **Bestandsprüfung von Repository-Dateien, keine visuelle Laufzeitabnahme**.

## Verifizierte Kampagnen-Level

Die sieben Level sind in `dist/levels.js` definiert. Die festen Gegnerwege, Tore, Turmplätze und die Mitte der 3072×3072-Spielwelt sind im Code abgelegt. Die Definition belegt den implementierten Kampagnenumfang, nicht die fehlerfreie Erreichbarkeit jedes Levels auf einem realen Gerät.

| Level | Datei und vorhandene Grafikpipeline | Bereits vorhanden | Noch zu prüfen / verbessern |
| --- | --- | --- | --- |
| 1 Einleitung | `dist/style2-maps.js`, `dist/game.js` | gecachte 1536px-Karte, prozedurales Pflaster, Waldrand, Laternen, Bauplatz-Marker | Steinkanten, Bodentiefe, Vegetationsvarianten, Weganschluss und Lesbarkeit auf Android |
| 2 Das Labyrinth | `dist/style2-maps.js` | gemeinsame Kartenpipeline, kurvige Pflaster-Lane, Hecken | Wiederholung der Hecken, Übergänge auf engem Raum, eindeutige Kampfroute |
| 3 Kriegerdenkmal Kirchende | `dist/kirchende-art.js`, `dist/terrain-polish.js`, `dist/forest-crowns.js` | `ground-style2-v1.webp`, `environment-atlas-style2-v1.webp`, `monument-photo-v2.webp`, Wurzeln und Vegetation | korrekte Bodenanker/Alpha der Atlaszellen, Wegsaum, Baumgröße/Überdeckung, Landmarken-Kontrast |
| 4 Ender Dorfkirche und Schlafender Löwe | `dist/church-art.js`, `dist/style2-level4-reference.js` | Kirche, Löwe, Gräber, Bänke, Bäume, Wald-/Moosboden und Laterne | Straßenmaterial gegenüber Level 3 angleichen, Gebäude-Sprite, Einbindung des Kirchhofs, verdeckte Bauplätze |
| 5 Hohensyburg | `dist/hohensyburg-art.js` | gecachter Terrassenboden, Waldzugänge, Vorplatz/Treppen und Denkmal-Sprite | Texturübergänge zwischen Terrasse, Wald und Steintreppe, maßstäbliche Beleuchtung und Baumrand |
| 6 Herdecke Goethestraße | `dist/goethestrasse-art.js` | gecachter Parkboden, Straßenkante, Rosenbeete, Wald, Ehrenmal | zu ähnlich wirkende Materialien für Straße vs. Fußweg, Garten-/Waldränder, Übergänge, Luftlane sichtbar halten |
| 7 Kriegerdenkmal Westhofen | `dist/westhofen-art.js` | Straßenfront, Bushaltestelle, Grünzug, Denkmal-Sprite, bestehender Umgebungspass (PR #186) | Übergänge von Stadtstraße zu Grünfläche, Bäume/Schatten, Kontrast am Denkmal und Mobile-Screenshot-Abnahme |

## Shared-Runtime und Redundanzen

- `dist/levels.js`: maßgebliche, **nicht zu ändernde** `paths`, `slots`, `gates`, `center` und Speicher-/Progress-Logik.
- `dist/game.js`: `drawGround` delegiert an `Style2Maps` (1/2), `DenkmalTerrain` (3), `DenkmalChurch` (4), `DenkmalHohensyburgArt` (5), `DenkmalGoetheArt` (6), `DenkmalWesthofenArt` (7). `drawLevel` legt für 3/4 Wege über den Boden; 1/2 sind bereits in die Karte eingebrannt.
- `dist/style2-environment-palette.js`: globale Materialpalette für mehrere Kampagnenbereiche; allein noch keine durchgängigen Material- und Weg-Assets.
- `dist/terrain-polish.js`: gemeinsamer Boden sowie `drawRoad`; Level 3 und 4 nutzen bereits diese Pipeline.
- `dist/forest-crowns.js`: wiederverwendete gezeichnete Baumkronen/Sträucher. Level-3-Atlas umfasst Bäume, Busch, Ruine, Fels und Laterne.
- `dist/style2-ambience.js`: atmosphärische Effekte und feste Lichter; die bestehende Mobil-Qualitätsstufe ist zu berücksichtigen.
- Für Level 5–7 bleiben eigenständige `createGround`-Funktionen und Wegstriche bestehen. Das ist ein **potenzielles Stilabweichungs- und Wartungsrisiko**, kein automatisch bewiesener visueller Defekt.
- Doppelte oder unbenutzte Assets **nicht allein anhand ähnlicher Dateinamen löschen**. Zuerst Referenzketten aus HTML, Loadern, Manifesten und Laufzeit verfolgen.

## Prüfung und offene Evidenz

- Geprüft: Dateibaum und Textquellen des GitHub-`main`, `ART-DIRECTION.md`, `docs/STYLE2_UMGEBUNGSPILOT_KIRCHENDE.md`, `docs/STYLE2_MAPS_PASS5.md`, `docs/STYLE2_V5_QUALITY_REVIEW_20261109.md`, relevante Testdateien und aktiv aufgerufene Renderer.
- **Nicht geprüft:** echte Screenshots der sieben Karten, Sichtprüfung einzelner WebP-Alpha-Ränder, Pixelanker, Spielsitzung/Touch, exakter VRAM/RAM-Verbrauch, frische CI-Ausführung, Chromium sowie physisches Android-Gerät mit 4 GB RAM.
- Bestehende Grafiktests u. a.: `style2-maps.test.cjs`, `terrain-polish.test.cjs`, `style2-environment-coherence.test.cjs`, `environment-style2-pilot.test.cjs`, `style2-ground.test.cjs`, `westhofen-style2-art.test.cjs`.
- Bestehende Browser-Skripte: `verify-style2-environment-pilot.cjs`, `verify-level4-style2-environment.cjs` bis `verify-level7-style2-environment.cjs`.
- Frühere Dokumentation nennt bekannte Alt-Testfehler. Ergebnisse müssen gegen **dieselbe Baseline** neu gemessen werden; keine neue Regression mit einem Altfehler verwechseln.

## Priorität

**P0:** vollständige, vergleichbare Vorher-Screenshots bei identischem Kameraausschnitt/Zoom; Wegoberflächen, Terrain-Übergänge und klar erkennbare Bauplätze; realistisches Mobile-Speicherbudget.

**P1:** 2–3 kontrollierte Materialfamilien mit Levelvarianten, optisch konsistente Bäume/Sträucher mit Bodenankern, Randbegrünung statt überklebter Wegtexturen; zuerst Pilot Level 3, anschließend 1/2 und 4–7.

**P2:** lokale Denkmal- und Gebäude-Einbettung (Schatten, Sockel, Laternen, Kleinvegetation) und getrennte Abnahme bei 64/128px.

Nicht eigenmächtig Pfade, Kollision, Wellen, Bauplätze, Progress, Helden oder Kampflogik verändern.
