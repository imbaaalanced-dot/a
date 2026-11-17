# Style-2-Voll-Rendering: Ansturm (2026-11-17)

Komplettes Neu-Rendern und Verbessern **aller** Ansturm-Grafiken im verbindlichen
Style 2 (isometrische 2.5D Dark Fantasy, siehe `ART-DIRECTION.md` und
`dist/style2-environment-palette.js`).

## Umfang

62 WebP-Dateien unter `dist/ansturm/assets/` (inkl. `menu/`), gespiegelt nach
`ansturm-alpha1-5/assets/` (Symlinks bzw. bytegleiche Kopien; Parity-Test grün):

- 1 Arena-Boden (`arena-stone-v1.webp`, 768×768, vollflächig)
- 1 UI-Slate (`ui-slate.webp`, 512×512, vollflächig)
- 3 Denkmäler/Plattformen (`monument`, `build_pad`, `research_shrine`) + 1 Gate (`gate_a`, unreferenziert aber gespiegelt; nicht gelöscht)
- 8 Gegner (`enemy_normal` … `enemy_siege`) + 4 Bosse (`boss_stonebreaker`, `boss_stormlord`, `boss_shieldwarden`, `boss_colossus`)
- 13 Shop-Icons (`icon_attack` … `icon_pierce`)
- 21 Waffen-Stufen (`weapon_<typ>_1..3`, 7 Typen × 3 Ausbaustufen)
- 6 Treffer-Effekte (`effect_bolt`, `effect_lightning`, `effect_blast`, `effect_ice`, `effect_fire`, `effect_lance`)
- 4 Menü-Grafiken (`menu/memorial-yard-v3`, `menu/churchyard-quiet-v1`, `menu/crest-v2`, `menu/crest-v3`)

## Style-Lock (in jedem Prompt)

Isometrische 2.5D Dark Fantasy; dunkler Stein, Bronze, dunkelblaue Stoffe;
warmes Licht von links oben; gleiche erhöhte Kamera; Bodenanker unten mittig;
verbündete Objekte mit dezentes türkisfarbenem Runenlicht, Feinde/Gates mit
roter Glut; keine Schrift, keine Rasterlinien, kein Rahmen; Cutouts auf
absolut einfarbigem Magenta `#FF00FF` (kein Verlauf/Schatten/Textur).

## Pipeline

1. Bildgenerator (eingebauter Imagegen, Black Forest API), **ein Auftrag pro Asset**.
2. Download der generierten JPGs (signierte URLs, nur lokal in `/tmp`, nie committet).
3. `tools/render_ansturm_style2.py <spec.json>`:
   - Cutouts: Magenta-Key per Border-Floodfill (Schwelle: Distanz zur Rand-Medianfarbe < 70,
     Fringe-Pass < 45), Alpha-Bbox-Crop, `ImageOps.contain` auf 88 % der bestehenden Zelle
     (zentriert, kompatibel zu `tools/pack_ansturm_gutters.py`), verlustfreies RGBA-WebP.
   - Vollflächige Hintergründe: Cover-Resize auf exakte Zellgröße, WebP q82 im Originalmodus.
   - Magenta-Residuum im sichtbaren Bereich muss 0 sein (Gate im Tool).
   - Byte-identischer Schreib in `dist/ansturm/` und Mirror.
   - `menu/crest-v3.webp` zusätzlich verlustbehaftet (q85 mit Alpha) re-encodiert, damit das Menü-Crest klein bleibt.
4. Cache-Busting: alle Asset-URLs in `asset-manifest.js` + `assets.json` (beide Kopien)
   tragen `?v=v6-style2full1`; `sprites.js`/`render.js`/`app.js`/`index.html` entsprechend gebumpt;
   `ansturm-alpha1-5/tests/sprite-cache.test.js` und `tests/ansturm-asset-edges.test.py`
   auf die neue Version aktualisiert.

Zellgrößen, Modi (RGBA/RGB) und Dateinamen sind unverändert; Loader, Pivots und
Zeilenverträge bleiben gültig.

## Größen

`dist/ansturm/assets`: 62 Dateien, vorher 1.226.200 B, nachher 1.489.730 B
(+21 %, v. a. durch detailreichere Sprite-Ränder; Arena 111 KB, Menü-Szene 157 KB,
Crest 60 KB – alle im mobilen Rahmen).

## Prüfstatus (Asset-Statuskette)

- **Generiert:** 62/62 via Imagegen.
- **Technisch geprüft:** `python tests/ansturm-asset-edges.test.py` → 52 geprüft, 52 sauber eingerückt, 0 Edge-Risk; Mirror byte-gleich; `node tests/ansturm-source-parity.test.cjs`, `ansturm-legacy-links`, `ansturm-integration`, `ansturm-no-portals`, `npm test --prefix ansturm-alpha1-5` (83/83), `node tests/game.test.cjs` (Desktop + `TEST_MOBILE=1`), `tests/cache-busting.test.cjs`, `tests/assets-headers.test.py`, `tests/assets.test.py` – alle grün. Loopback-Smoke (`python3 -m http.server 8777 --directory dist`): `/ansturm/`, Manifest und WebPs liefern HTTP 200.
- **Integriert:** Manifest/Loader/CSS/HTML aktualisiert, Parity gehalten – Runtime-Laden lokal per HTTP 200 nachgewiesen.
- **Im Spiel geprüft (visuell im Browser/Android): OFFEN.** Kontaktbögen (Figuren, Icons, Waffen/Effekte, Hintergründe/Menü) wurden lokal per Pixel-/Sichtprüfung freigegeben; echte Browser- und Android-Abnahme steht noch aus.

## Nächste Schritte

- Draft-PR reviewen, dann visuelle Abnahme im Browser (Desktop + mobiles Hochformat):
  lokal `python3 -m http.server 8777 --directory dist` → `http://127.0.0.1:8777/ansturm/`,
  veröffentlicht nach Merge: `https://imbaaalanced-dot.github.io/a/ansturm/`.
- Danach physisches Android-Gerät (4 GB) für FPS/RAM bei großen Wellen.
