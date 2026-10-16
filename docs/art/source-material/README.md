# Style 2 Materialquellen – Level 1 und 2

Die beiden kompakten WebP-Dateien in diesem Ordner sind künstlerische Materialquellen, nicht fertige Karten und keine historischen Belege. Sie wurden mit dem eingebauten Bildgenerator erzeugt und anschließend ausschließlich als Boden-/Vegetationstextur in der deterministischen Kartenkomposition verwendet. Wege, Tore, Bauplätze und Zielpunkte stammen weiterhin aus `dist/levels.js`.

## Level 1 – Einleitung

**Werkzeug:** eingebauter Bildgenerator
**Verwendung:** `stylized-concept`, Materialbasis für `tools/build_style2_maps.py`

> Square orthographic top-down dark-fantasy cemetery-garden ground material for Denkmal TD2: worn charcoal-green grass, damp earth, subtle dark stone fragments, moss and sparse autumn leaves; hand-painted semi-3D/2.5D strategy-game illustration; even detail density; cool moonlight with restrained amber reflection; no paths, buildings, props, actors, UI, text or watermark.

## Level 2 – Labyrinth

**Werkzeug:** eingebauter Bildgenerator
**Verwendung:** `stylized-concept`, Materialbasis für `tools/build_style2_maps.py`

> Square orthographic top-down dark-fantasy formal-garden ground material for Denkmal TD2: clipped hedge-floor greens, aged mossy soil, worn slate, roots and sparse burgundy accents; hand-painted semi-3D/2.5D strategy-game illustration; even detail density; cool dusk light with restrained amber reflection; no maze, paths, buildings, props, actors, UI, text or watermark.

## Reproduzierbarer Export

```bash
python tools/build_style2_maps.py --levels 1 2
python tests/map-assets.test.py --levels 1 2
node tests/map-layout.test.cjs --levels 1 2
```

Die generierten Materialquellen sind ausdrücklich `kuenstlerisch`. Die Exportskripte backen keine Bauplatzmarkierungen, Wegpfeile, Beschriftungen, Türme, Gegner oder Zielobjekte ein.

## Level 3 – Kriegerdenkmal Kirchende

**Werkzeug:** eingebauter Bildgenerator
**Verwendung:** `stylized-concept`, ausschließlich künstlerische Terrainbasis; Denkmal und Friedhofsbezug werden separat belegt

> Square orthographic top-down material inspired by an old Protestant cemetery: damp muted grass, compacted earth, fine pale gravel, irregular gray-brown stone, moss and sparse copper leaves; hand-painted dark-fantasy strategy-game surface; no memorial, graves, wall, church, paths, actors, UI, text or watermark.

## Level 4 – Ender Dorfkirche / Schlafender Löwe

**Werkzeug:** eingebauter Bildgenerator
**Verwendung:** `stylized-concept`, ausschließlich künstlerische Terrainbasis; Kirche und Löwendenkmal bleiben separate belegte Runtime-Objekte

> Square orthographic top-down material inspired by a historic churchyard: old grass, worn pale sandstone and slate chips, compacted gravel, moss and sparse russet leaves; hand-painted graphic dark-fantasy strategy-game surface; no church, lion, monument, graves, walls, paths, actors, UI, text or watermark.

## Marcel-Laufatlas V2

- Quelle: vom Nutzer bereitgestelltes `marcel_walk_4x3.png`.
- Bearbeitung: OpenAI built-in image generator, Modus `background-extraction`.
- Ausgabe: `marcel-walk-atlas-v2-source.png`, 3 Spalten × 4 Richtungszeilen, echte RGBA-Transparenz.
- Runtime: `dist/assets/hero/marcel-walk-atlas-v2.webp`, 362 × 362 Pixel je Zelle.
- Unverändert gefordert: zwölf Posen, Reihenfolge, Ausrichtung, Laternenlicht, Konturen und Zellenanker; ausschließlich Magenta wurde entfernt.

## Magieturm / Äther-Säule V2

- Stilreferenzen: bestehende Kanonentürme Stufe 1–3 für Kamera, Footprint und Materialprogression; alter Magieturm nur als Motivhinweis.
- Bearbeitung: OpenAI built-in image generator, Modus `stylized-concept`.
- Quelle: `tower-mage-aether-atlas-v2-source.png`, drei gleich große 724-Pixel-Zellen.
- Runtime: `dist/assets/tower-mage-l1-v2.webp` bis `tower-mage-l3-v2.webp`, echte RGBA-Transparenz.
- Progression: einfache einzelne Ätherflamme → Doppel-Fokus → großer Resonanzkristall mit drei Orbitalsplittern.
- Nicht verändert: Kosten, Schaden, Reichweite, Verlangsamung und Upgrade-Balance.

## Bogenturm / Wehrarmbrust V3

- Stilreferenzen: bestehende Bogentürme Stufe 1–3 für Identität und Progression; Äther-Säulen-Atlas V2 für Kamera, Footprint, Kontrast und Renderqualität.
- Bearbeitung: OpenAI built-in image generator, Modus `stylized-concept`.
- Quelle: `tower-bow-style2-atlas-v3-source.png`, drei gleich große 724-Pixel-Zellen.
- Runtime: `dist/assets/tower-bow-l1-v3.webp` bis `tower-bow-l3-v3.webp`, echte RGBA-Transparenz.
- Progression: kompakte Eichenarmbrust → verstärkte Repetiermechanik → schwere Doppelmechanik mit kleinem Bernstein-Runenkern.
- Nicht verändert: Kosten, Schaden, Reichweite, Feuerrate und Upgrade-Balance.
