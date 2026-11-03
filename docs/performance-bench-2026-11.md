# TD2 Performance-Benchmark & Filter-PoC (2026-11)

## Werkzeug

`tools/bench-td2.cjs` – reproduzierbarer Benchmark auf Basis der bestehenden Test-Sandbox
(`tests/helpers/game.cjs`). Keine Engine-Datei wird verändert; game.js wird zur Laufzeit
nur gepatcht (Tutorial-Skip, Context-Zähler).

Aufruf:
```
node --expose-gc tools/bench-td2.cjs [l3endless|l1campaign|ansturm] [--frames=N]
```

Szenarien:
- `l3endless` – Level-3-Simulation, Endlos Welle 25, 8 Türme, Dauer-40-Gegner-Combat
- `l1campaign` – Level-1, Welle 6, 6 Türme
- `ansturm` – dist/ansturm, Welle 200, 1010 Gegner

## Gemessene Ergebnisse (Desktop Node v22, JS-seitig; Android ~3–5× langsamer)

| Metrik | l3endless | l1campaign | ansturm (W200) |
|---|---|---|---|
| update()/step pro Frame | 0.31 ms (1×), 0.62 ms (2×-Tempo) | 0.23 ms | 0.56 ms → **16.9 ms/frame** bei 30 Ticks/s |
| draw() JS-Anteil (ohne Rasterisierung) | ~1.5–2.1 ms | ~1.3–1.7 ms | – |
| Allokations-Churn | 16–20 MiB/s | **bis 118 MiB/s** | – |
| Frame-Spikes > 1 ms (GC) | 40 / 20 000 Frames | 39 / 20 000 Frames | – |

Render-Operationen pro Frame (gemessen, 40 Gegner): ~68 drawImage, ~160 Pfad-Fills,
~300 save/restore, 8–10 createRadialGradient, 3–17 ctx.filter-Set, 11–18 shadowBlur-Set.

## Filter-PoC (`dist/enemy-animations.js`)

Live `ctx.filter` erzwingt pro drawImage einen GPU-Filterpass. Der PoC backt jede
(atlas row, filter)-Kombination einmal in ein Offscreen-Strip (Cache, Cap 24) und
zeichnet mit `ctx.filter='none'`. Fallback auf Live-Filter, falls Baken nicht möglich
ist. `game.js` bleibt unangetastet.

Messergebnis (Benchmark-Metrik „drawImage mit aktivem Live-Filter“):
- vorher (main): **17.1 pro Frame**
- nachher (PoC): **0.0 pro Frame**

JS-seitige draw()-Zeit unverändert (erwartet); der Gewinn entsteht in der
Rasterisierung und muss per Gerätetest (Chrome USB-Debugging, FPS-Overlay)
bestätigt werden. Alle betroffenen Testdateien (enemy-animations, game,
directional-actions, flight-enemies, v2-expansion) laufen grün.

## Priorisierung (nach Messung)

1. Ansturm-Modell (model.js): 16.9 ms/frame bei Welle 200 desktop-seitig – einziges
   budget-sprengendes Einzelsystem (O(n²)-damageEnemy/Tesla/Pierce, Arrays pro Tick).
2. GC-Churn im Hauptspiel: bis 118 MiB/s – Filter-/Sortier-Allokationen pro Frame.
3. ctx.filter/shadowBlur: Op-Zahlen gemessen, GPU-Kosten Gerätetest; Filter-PoC ready.
4. towerTarget/remainingRoute: 0.93 ms/frame (8 Türme × 40 Gegner) – nach 1–2.

**Dieser Branch ist ein Mess-/PoC-Entwurf: nicht nach main mergen, bevor die
Gerätemessung auf dem 4-GB-Android-Zielgerät vorliegt.**
