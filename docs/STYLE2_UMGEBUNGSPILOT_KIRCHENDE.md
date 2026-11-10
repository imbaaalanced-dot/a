# Denkmal TD2 V5 – Umgebungspilot Kirchende

## Ergebnis

Der Pilot ergänzt Level 3 um eine handgemalte, gekachelte Bodentextur und ein kleines, wiederverwendbares 3×2-Atlas mit Baumvarianten, Busch, niedriger Ruine, Felsgruppe und Laterne. Die Atlasgrafik wird nur beim Laden von Kirchende geladen. Zusammen belegen die beiden WebP-Dateien rund 607 KB.

Das vorhandene transparente Foto des Kirchender Kriegerdenkmals bleibt das zentrale historische Objekt. Es wurde nicht durch eine freie Fantasy-Neuschöpfung ersetzt. Die vorhandenen Wegenetze, Torpositionen, Bauplätze, Spawnpunkte und Kollisionsregeln bleiben unverändert. Dekoration wird nur an Kandidaten gerendert, die mindestens 150 Weltpunkte von Wegen und 140 Punkte von Bauplätzen entfernt liegen.

## Einordnung im aktuellen Build

| Level | Tatsächliche Umgebung | Befund und Reihenfolge |
|---|---|---|
| 1–2 | `style2-maps.js`, prozedurale Wege und Waldrand | Bereits gemeinsame Palette und Kartenprozedur; nach dem Pilot visuell abgleichen. |
| 3 Kirchende | `terrain-polish.js`, `kirchende-art.js`, `forest-crowns.js`; transparentes Denkmalfoto | Pilotziel: bisheriger ruhiger Farb-/Bodenpass wird durch eine gemalte Textur und atlasbasierte Vegetation ergänzt. |
| 4 Ender Dorfkirche | `church-art.js`, `style2-level4-reference.js`; Kirchengebäude und Löwenobjekt; eigener Style‑2-Kirchen-Sprite | Abgleichpass ergänzt: Level 4 nutzt jetzt denselben gekachelten Wald-/Moosboden und Laternenatlas. Bestehende Kirche, Löwe, Friedhofsdetails und Layout bleiben erhalten. |
| 5 Hohensyburg | `hohensyburg-art.js`; transparentes Kaiser-Wilhelm-Denkmal, Waldterrasse | Monument-Asset ist detailreich und deutlich heller als die bewaldete Fläche; Licht-/Bodenwert angleichen, ohne Monumentdetails zu übermalen. |
| 6 Goethestraße | `goethestrasse-art.js`; eigenes Ehrenmal, Straßenkante und Parkboden | Eigenständige, passende Parkkomposition; anschließend gemeinsame Textur- und Vegetationsfamilie prüfen. |
| 7 Westhofen | `westhofen-art.js`; transparentes Ehrenmal, Bushaltestelle und Straßenfront | Konkrete Ortsdetails sind eingebunden; anschließend Beleuchtungs- und Baumfamilie angleichen. |

## Referenzabgleich

- **Kirchender Denkmalanker:** `dist/assets/kirchende/monument-photo-v2.webp`, transparent und im laufenden Spiel bereits als Landmarke eingesetzt. Das Motiv bleibt unverändert.
- **Terrain-Pilot:** `dist/assets/kirchende/ground-style2-v1.webp`, neu erzeugte, nahtlos gekachelte dunkle Erde/Schiefer/Moos-Oberfläche. Sie enthält keine Wege und keine stehenden Landmarken.
- **Umgebungsatlas:** `dist/assets/kirchende/environment-atlas-style2-v1.webp`, transparentes 3×2-Raster. Einzelzellen werden erst beim Zeichnen auf den Canvas zugeschnitten.
- Die freigegebenen Projektquellen umfassen Figuren- und Menüreferenzen, aber keine zusätzliche vermessene Kirchende-Aufnahme. Der historische Aufbau wird deshalb nicht neu interpretiert; bestehende Wegdaten sind als spielerische Annäherung dokumentiert.

## Render- und Laufzeitregeln

- Die vorhandene Canvas-Projektion und Tiefe bleiben unverändert.
- Bodentextur und Kronen werden in bestehenden, gecachten Umgebungs-Canvas-Pässen gezeichnet.
- Der Boden und transparente Umgebungsatlas werden nur bei Eintritt in Level 3 oder 4 angefordert und über dieselben Loader wiederverwendet; einzelne Bilder pro Objekt oder pro Frame werden nicht erzeugt.
- Wenn Bilddateien nicht laden, bleiben prozedurale Boden- und Kronen-Fallbacks erhalten.
- Dekoration ist rein visuell und wird anhand der echten Pfade, Bauplätze und Objektflächen des jeweiligen Levels gefiltert.

## Abnahme und nächste Schritte

Nach Chromium-/Touch-Vorschau Farbkontrast und Pfadlesbarkeit bei normaler sowie reduzierter Grafik vergleichen. Nach dem Abgleich von Kirchende und Ender Dorfkirche folgt Hohensyburg: helle Steinflächen mit der Waldterrasse angleichen, ohne das Denkmal zu übermalen. Echte Android-Abnahme bleibt separat offen.
