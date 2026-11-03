# Render-Pipeline-Optimierung: 60 FPS und adaptive Grafikstufen (2026-11-03)

Dieser Patch optimiert die tatsächliche Canvas-Rendering-Pipeline in `dist/game.js`
und ergänzt adaptive Grafikstufen mit Hysterese. Style-2-Look, Gameplay und
Touchbedienung bleiben unverändert; alle bestehenden Tests bleiben grün.

## Messverfahren

`tools/bench-render.cjs` lädt das Spiel in einer instrumentierten VM-Sandbox
(`tests/helpers/render-sandbox.cjs`, gleiche Technik wie `tests/game.test.cjs`),
baut ein deterministisches Stressszenario (4 Türme, ~40 Gegner in Turmreichweite,
Projektile, 240 Partikel, Schadenszahlen) und misst über 480 Frames:

```bash
node tools/bench-render.cjs --level 1 --frames 480          # Desktop
node tools/bench-render.cjs --level 1 --frames 480 --mobile # Handy (720x1600, DPR 2)
```

Gemessen werden JS-Zeit pro `draw()`, Zeichenoperationen pro Frame und neu
erstellte Gradienten pro Frame.

## Vorher / Nachher (gleiches Szenario, 480 Frames, Desktop 1280x800)

| Kennzahl                       | Vorher (main) | Nachher (hoch) | Nachher (mittel) | Nachher (niedrig) |
|--------------------------------|---------------|----------------|------------------|-------------------|
| draw() JS-Zeit pro Frame       | ~1,12 ms      | ~0,7–1,0 ms    | ~0,80 ms         | ~0,69 ms          |
| Radiale Gradienten pro Frame   | 7,46          | 0,47           | 0,47             | 0,00              |
| Zeichenoperationen pro Frame   | 2381          | ~2392 (identisch, kein Qualitätsverlust) | 2278 | 1730 |
| Canvas-Pixelbudget (Handy)    | 900k / 550k   | 2,0M / 900k / 550k je Stufe | | |

Anmerkung: Die JS-Zeit streut zwischen Läufen (±0,15 ms); der Gradientenwert ist
deterministisch (Cache). Auf der Stufe „niedrig" werden ~27 % der
Zeichenoperationen eingespart, ohne dass sichtbare Spielobjekte verschwinden.

## Umgesetzte Optimierungen

1. **Statische Hintergründe**: Der Hellscape-Boden war bereits in einem
   Offscreen-Canvas (`groundCache`) vorgelagert; die Stufe bleibt erhalten und
   wird nicht verändert.
2. **Gradienten-Cache statt Neuerzeugung pro Frame**: `monumentAura` und
   `runeAnchor` erzeugten pro Frame neue radiale Gradienten mit zeitabhängigen
   Alphawerten. Beide cachen jetzt den Gradienten (positionsunabhängig, per
   Farbe/Radius) und modulieren die Intensität über `globalAlpha` — der Look
   bleibt gleich, die Neuerzeugung entfällt (7,46 → 0,47 pro Frame).
3. **Allokationsreduktion in `draw()`**: Das Level-Layout (`{...levels[x],
   center}`) wird pro Frame bis zu dreimal gespreadet — jetzt per Level gecacht.
   Die Objektliste (Monument, Türme, Gegner, Todes-FX, Held) erzeugte pro Frame
   Wrapper-Objekte, Map-Arrays, Filter-Array und pro Objekt eine Paint-Closure —
   jetzt Wrapper-Pool mit Wiederverwendung und eine geteilte Closure.
4. **Sichtbarkeitsprüfung**: bestand bereits (`visible()`); die Objektsamme-
   lung filtert jetzt direkt ohne Zwischenarray.
5. **Schatten/Beleuchtung nach Stufe**: `blurFor(base)` liefert auf „mittel"
   halbierte und auf „niedrig" deaktivierte Schattenweichzeichnung (Turm-Glow,
   Loot-Glanz, Denkmal-Aura, Bedrohungsmarker). Auf „mittel" entfällt der
   Runen-Streichring.
6. **Partikel nach Stufe**: `spark()` und das Partikel-Deckel bleiben auf
   „niedrig" wie bisher (90), auf „mittel" bei 170 (vorher 240 unbegrenzt).
7. **Canvas-Auflösung nach Stufe**: DPR-Kappen und Pixelbudgets je Stufe
   (hoch 1,75/2,0M, mittel 1,25/900k, niedrig 0,85/550k auf dem Handy). Das
   HUD ist reines DOM und bleibt von der Canvas-Auflösung unberührt.
8. **Sprite-Atlas**: `style2-impact-atlas.js` und der Asset-Manager cachen
   Sprites bereits einmalig; kein Änderungsbedarf (nachweislich kein
   wiederholtes Dekodieren im Frame).

## Adaptive Grafikstufen mit Hysterese

- `qualityTier`: `'high' | 'medium' | 'low'`.
- Modus HOCH/SPARMODUS fixiert die Stufe; Modus STANDARD (auto) startet wie
  bisher (Desktop hoch, Handy niedrig) und passt dann an.
- Monitor: EMA der Bildrate; Absenkung nach 4 s unter 45 FPS, Anhebung nach 8 s
  über 57 FPS, jeweils nur eine Stufe pro Wechsel und 15 s Abklingzeit —
  ständiges Umschalten ist ausgeschlossen.
- `advanceQualityMonitor(frameSeconds)` hängt in `loop()` und läuft nur im
  Spielzustand `playing`.

## Regressionstests

`tests/graphics-quality.test.cjs` prüft (auch mit `TEST_MOBILE=1`):

1. Stufen-Mapping der Modi inkl. `lowFX`/`medFX`,
2. DPR-Auflösung je Stufe und unangetastetes DOM-HUD,
3. Hysterese: stufenweise Absenkung, Abklingzeit gegen Hochschalten,
   Mindestabstand 14 s zwischen Wechseln,
4. Gradienten-Cache: zweiter Frame erzeugt keine neuen Aura-Gradienten,
5. Sichtbarkeitsprüfung: Off-Screen-Gegner sparen Zeichenoperationen,
6. Gameplay/Touch auf Stufe niedrig: Turmbau, Turmfeuer, Gegnerbewegung,
   Schaden/Tod, Pointer-Erkennung.

Der Cache-Key von `game.js` wurde auf `v410a1perf1` gebumpt
(`dist/index.html`, `tests/cache-busting.test.cjs`,
`tests/menu-patch-a.test.cjs`, `tests/westhofen.test.cjs`).
