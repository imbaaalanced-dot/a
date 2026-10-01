# Grafiksystem v2.7

Einheitliche Materialien: dunkler Stein, Bronze, dunkelblaue Stoffe; warmes Licht von links oben. Verbündete verwenden dezentes türkisfarbenes Runenlicht, feindliche Tore Rot. Alle Figuren verwenden den gleichen erhöhten Blickwinkel und einen Bodenanker. Die Turmstufen bleiben klar unterscheidbar.

## Dateien

| Datei | Verwendung |
|---|---|
| `dist/assets/guardian-atlas-v27.png` | 1536×1024, transparent; 3 Spalten × 2 Zeilen |
| `dist/assets/stone-terrain-v27.png` | 1254×1254; ruhiger Boden ohne fest eingebrannte Wege |
| `dist/assets/hero/marcel-portrait-v27.png` | Vorhandener Marcel-Entwurf für Startbild, Porträt und Ausrüstung |
| `dist/visuals.js` | Zellaufteilung, sichtbare Alpha-Grenzen und gemeinsame Größen/Bodenanker |

Atlas-Zellen, zeilenweise: Marcel, Monument, Tor / Infanterie, Grobian, Boss. Originalbilder bleiben unverändert; Zellgrenzen und sichtbare Bereiche werden einmalig beim Laden im Browser ausgewertet.

## Verwendete Bildaufträge

Erstellt mit dem eingebauten Bildgenerator, je ein Auftrag pro neuem Asset.

**Atlas:** Transparentes Spiel-Spritesheet, exakt drei Spalten und zwei Zeilen mit isolierten Objekten. Marcel mit schwarzer Cap, blaugrauen Augen, kurzem braunem Bart, dunkler Trainingsjacke mit weißen Streifen, Cargohose, Sneakern und Denkmalstab; daneben historisches Stein-/Bronze-Monument und Spawn-Tor. Untere Reihe: dunkler Infanteriegegner, massiger Grobian, gepanzerter Boss. Einheitliche erhöhte Spielkamera, realistische stilisierte 3D-Malerei, Stein/Bronze/Dunkelblau, türkises Runenlicht, warmes Licht links oben, keine Schrift oder Rasterlinien, echte Transparenz und getrennte Zellen.

**Boden:** Quadratische Draufsicht auf dunkle Schieferpflasterung und felsige Erde mit wenig Moos. Ruhige offene Mitte, dezente historische Stein-/Bronze-Stimmung, gleiche Beleuchtung. Keine Gebäude, Wege, Tore, Figuren, Lava oder Benutzeroberfläche. Die spielrelevanten Routen entstehen aus den tatsächlichen Leveldaten.
