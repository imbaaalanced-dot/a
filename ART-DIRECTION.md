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

## Hauptmenü v4 „Herbstwacht“ (ab 2026-11-21)

Alle Menügrafiken benutzen einen gemeinsamen Stilanker: handgemalter Dark-Fantasy-Herbstabend mit tiefblaugrauem Abendhimmel, warmem Gold-Seitenlicht von links, Bodennebel, nass-dunklem Schieferboden mit Bernsteinlaub und türkisem Runenlicht als Verbündeten-Akzent. Denkmaldarstellungen stammen aus detaillierten, foto-basierten Strukturbeschreibungen der realen Denkmäler (Workflow: siehe `docs/MENU_V4_REDESIGN_20261121.md`), nicht aus Bildbearbeitung der Fotos selbst.

**Palette:** Slate `#0b141a`/`#0e171c`, Bernstein `#d9a45b`, Gold `#f0ce8f`, Bronze-Rahmen `#8a6a3b`, Runen-Türkis `#58c8b0`/`#9ce9ee` (nur Fokus-Ringe und Verbündeten-Akzente).

**Implementierung:** Optische Überlagerung in `dist/menu-v4.css` als letzte CSS-Schicht; `dist/menu.css` bleibt unangetastet. Neue Bilder heißen `*-v4.webp` (Denkmalhof, Wappen), Galerie-Assets behalten ihre Dateinamen und wurden inhaltlich ersetzt (Cache-Busting `?v=menu-v4a1`).
