# Denkmal TD2 – Performance-Benchmark & Optimierung (November 2026)

Ziel: möglichst konstante 60 FPS auf schwachen Android-Geräten (4 GB RAM).
Messumgebung: Desktop-Node v22.20.0 (Linux). **Kein Gerätetest durchgeführt** – GPU-Rasterisierung
und echte Frame-Zeiten müssen am Zielgerät gemessen werden (siehe „Offene Punkte").

## Benchmark-Harness

`tools/bench-td2.cjs` (Szenarien `l3endless`, `l1campaign`, `ansturm`) misst pro Szenario:
- update-Kosten pro gerendertem Frame (1x/2x Speed, Budget 16,7 ms)
- `towerTarget`-Kosten (2000 Aufrufe, 40 Gegner)
- `draw()` JS-Zeit (500 Aufrufe, ohne Rasterisierung)
- Canvas-Op-Zähler pro Frame (drawImage, fill, save/restore, filter-Set, live-gefilterte drawImage, shadowBlur)
- Heap-Churn (MiB/s, Sampling über 20000 Frames) und Frame-Spikes > 1 ms

Aufruf: `node --expose-gc tools/bench-td2.cjs [szenario]`

## Korrektur einer früheren Fehlangabe

Die Aussage „Ansturm: 16,9 ms pro Frame" war ein **Einheitenfehler**: Die Simulationskosten
von ~0,5–0,8 ms pro Tick × 30 Ticks/s ergeben **16–25 ms CPU pro Sekunde Gameplay** –
also ~1–1,5 % des 60-FPS-Rahmenbudgets. Der Ansturm-Modus ist damit **kein**
budget-sprengender Engpass; die Endlos- und Kampagnen-Frame-Pfade sind relevanter.

## Messwerte Vorher/Nachher (jeweils gegen denselben main-Stand rebased)

### l3endless (Endlos, 40 stehende Gegner, 20000 Frames)
| Metrik | Vorher | Nachher |
|---|---|---|
| update 1x/Frame | 0,253 ms | 0,258 ms (gleichauf) |
| towerTarget (8 Türme/Frame) | 0,78 ms | **0,16 ms (−80 %)** |
| draw JS mean | 1,943 ms | 1,928 ms (gleichauf) |
| drawImage mit Live-Filter/Frame | 18,1 | **0,0** |
| Allokations-Churn | 125,3 MiB/s | **87,6 MiB/s (−30 %)** |
| Frame-Spikes > 1 ms | 41 (worst 18,7 ms) | 35 (worst **10,6 ms**) |
| GC-Resets/200 Samples | 4 | 1 |

### l1campaign (Kampagne Level 1, 20000 Frames)
| Metrik | Vorher | Nachher |
|---|---|---|
| Allokations-Churn | 67,3 MiB/s | **26,0 MiB/s (−61 %)** |
| drawImage mit Live-Filter/Frame | 57 | **1** |
| Frame-Spikes > 1 ms | 27 | 24 |
| towerTarget (6 Türme/Frame) | 0,36 ms | 0,12 ms |

### Ansturm (991–993 Gegner, Welle 200, 2000 Ticks à 1/30 s)
| Metrik | Vorher | Nachher |
|---|---|---|
| step mean | 0,64–0,82 ms | 0,76–0,81 ms (Parität, Messrauschen) |
| p50 | ~0,39 ms | ~0,40 ms |

Der Ansturm-Refactor bringt CPU-Parität bei deutlich weniger Allokationen
(filter/sort/slice entfernt); der Effekt zeigt sich vor allem in weniger GC-Druck,
nicht in niedrigerer Step-Zeit.

## Umgesetzte Optimierungen (alle verhaltensidentisch, 83/83 Tests grün)

1. **dist/enemy-animations.js** – Filter-Bake-Cache: (atlasRow, filter)-Strips werden
   einmal in Offscreen-Canvases gebacken (Cap 24); `draw()` zeichnet aus dem Strip statt
   `ctx.filter` pro Gegner zu setzen. Fallback auf Live-Filter bleibt erhalten.
   → live-gefilterte drawImage: 18→0 (Endlos), 57→1 (Kampagne).
2. **dist/game.js** – Frame-Loop: 5× `.filter()` pro Frame → In-Place-Kompaktierung
   (`compactKeep`); 2× `.filter(e=>!e.dead).length` → `countAlive()`; Pierce-Spread
   `[...enemies].sort()` → wiederverwendeter `pierceScratch`; `remainingRoute(e)` pro
   Turm/Schuss → pro-Tick-Cache auf dem Gegner (nicht-enumerierbar, Spielzustand
   unverändert); `wavePreview()`-String-Bau pro Frame → memoisiert.
   → towerTarget −80 %, Churn −30 % (Endlos) / −61 % (Kampagne).
3. **dist/combat-fx.js** – `damageTexts.filter()` → In-Place-Kompaktierung.
4. **dist/ansturm/model.js + ansturm-alpha1-5/model.js** (identisch, Paritätstest):
   `damageEnemy(id)`-Lookups in Hot Paths → Objektreferenzen (`applyDamage`);
   Zielwahl (Multishot/Pierce) → Single-Pass-Bounded-Selection mit **exakt**
   `Math.hypot`-Semantik des Originals (stabil, gleiche Tie-Reihenfolge);
   Tesla-Sprung → Ein-Pass-Minimum statt filter+sort; `compactEffects()` In-Place mit
   Keep-last-120-Semantik; Gegnerliste In-Place-Kompaktierung.

**Wichtig fürs Review:** Zwei Verhaltensfallen wurden beim Umbau gefunden und behoben:
(a) quadrierte Distanzen (d²) ändern Reihenfolge/Grenzen gegenüber `Math.hypot`
(Fließkomma) – deshalb vergleicht die Auswahl wieder mit `hypot`;
(b) bei vollem Top-K-Fenster muss das **größte** (letzte) Element fallen, nicht das erste.
Beides wird durch `tests/simulation-equivalence.test.cjs` abgesichert: 30/30 Traces
stimmen mit der eingefrorenen Baseline nach jedem einzelnen Update exakt überein.

## Priorisierte Restliste (nicht umgesetzt)

1. **GPU-Rasterisierung am Gerät messen** – draw JS ~1,6–1,9 ms ist nur der CPU-Anteil;
   shadowBlur-Sets (12–19/Frame) und save/restore (260–290/Frame) kosten GPU-Zeit, die
   nur am Android-Gerät sichtbar wird. Benchmark im Browser-Devtools am Zielgerät wiederholen.
2. **save/restore reduzieren** (verdächtige Feldgröße, Risiko: Renderfehler).
3. **Partikel-Deckelung** in Endlos-Wellen prüfen (game.particles wächst unbeschränkt
   innerhalb einer Welle; kompaktiert jetzt zwar in-place, Anzahl bleibt aber hoch).

## Reproduktion

```
node --expose-gc tools/bench-td2.cjs l3endless
node --expose-gc tools/bench-td2.cjs l1campaign
node --expose-gc tools/bench-td2.cjs ansturm
for f in tests/*.test.cjs; do node $f; done   # 83/83 grün
```
