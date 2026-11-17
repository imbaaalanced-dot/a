# Save/restore-Hot-Path-Reduktion und Geräte-Benchmark-Protokoll (2026-11)

Dieser Patch bearbeitet die priorisierte Restliste aus
`docs/performance-bench-2026-11.md`: Punkt 2 (save/restore reduzieren) ist
umgesetzt, Punkt 3 (Partikel-Deckelung) wurde geprüft und ist bereits
abgesichert, Punkt 1 (GPU-Rasterisierung am Gerät) wird durch das untenstehende
Messprotokoll vorbereitet. Style-2-Look, Gameplay und Touchbedienung bleiben
unverändert; alle 133 Testdateien (inkl. `TEST_MOBILE=1`-Varianten der
Render-Tests) bleiben grün.

## 1. Save/restore-Reduktion im Frame-Hot-Path (Restpunkt 2)

Vorher/Nachher-Attribution mit `tools/diag-save-attribution.cjs` (40-Gegner-
Endlosszenario, gleiche Technik wie `tools/bench-td2.cjs`): Die sechs größten
Quellen waren `Style2Phase6.upright` (~51/Frame), `shadow()` (~49/Frame),
`drawDamage` (~13/Frame), `drawParticle` (~12/Frame) und der Rüstungs-Pin
(~12/Frame).

Umbau (verhaltensidentisch, keine neue Allokation im Frame):

1. **`dist/game.js` – `shadow()`**: setzt nur `fillStyle`; ersetzt
   `save()/restore()` durch direktes Zurückschreiben des vorherigen
   `fillStyle`.
2. **`dist/game.js` – Rüstungs-Pin in `drawEnemy`**: `translate`-Paar statt
   Stack, `fillStyle` wird zurückgeschrieben.
3. **`dist/style2-phase6.js` – `upright()`**: statt `save()/restore()` wird im
   `finally` die exakte inverse Transformationsmatrix angewendet
   (`translate/scale(1,depth)/translate`). Verbleibende Float-Drift
   (< 1e-9 px) wird durch `draw()`s eigenes `save()/restore()` pro Frame
   zurückgesetzt; der Projektions- und Rundflug-Test in
   `tests/style2-phase6.test.cjs` prüft die Rückstellung weiter.
4. **`dist/combat-fx.js` – `drawDamage()` / `drawParticle()`**: je Zweig
   werden nur die tatsächlich gesetzten Felder (`globalAlpha`, `fillStyle`,
   `strokeStyle`, `lineWidth`, `lineCap`, `textAlign`, `font`) zurückgeschrieben;
   die Transformationsumkehr für Schadenszahlen ist exakt (Scale ist auf
   [.6, 1] begrenzt).

**Bewahrung der Garantien:** Painter, die eigene Transformationen setzen
(`drawEnemy`, `drawTower`, `drawMonument`), balancieren diese weiterhin über
ihre eigenen `save()/restore()`-Paare; `upright` muss nur seine eigene
Projektion zurücknehmen.

### Messwerte Vorher/Nachher (`tools/bench-td2.cjs`)

| Kennzahl                     | Vorher (main) | Nachher      |
|------------------------------|---------------|--------------|
| save/restore je Frame (l3endless) | 260/260  | **90/90 (−65 %)** |
| save/restore je Frame (l1campaign) | 228/228 | **95/95 (−58 %)** |
| Zeichenoperationen je Frame  | unverändert (fills/strokes/drawImage identisch, ±Simulationsrauschen) | |
| draw() JS-Zeit                | 1,7–2,4 ms    | 1,8–2,3 ms (innerhalb der ±0,15-ms-Laufstreuung) |

Anmerkung: Der JS-Zugewinn auf der Node-Sandbox ist gering, weil der
Stub-`ctx` `save/restore` kaum kostet. Der eigentliche Effekt zeigt sich am
Gerät, wo `save/restore` Canvas- und GPU-Status-Snapshots erzwingt — genau das
muss Restpunkt 1 am Zielgerät nachmessen.

### Regressionstests

- Neu: `tests/save-restore-reduction.test.cjs`
  - `drawDamage`/`drawParticle`: Felder und Transform zurückgestellt, keine
    `save/restore`-Aufrufe, Mal-Aufrufe erhalten;
  - `upright`: keine Stack-Nutzung, exakte Rückstellung auch bei Exception
    im Paint;
  - Ganzframe-Budget im 40-Gegner-Szenario: save/restore ≤ 150/Frame und
    identische Mal-Operationen gegenüber der Vorher-Messung
    (fill ≈ 209, stroke ≈ 69, drawImage = 10).
- Angepasst: `tests/mobile-fps-render-budget.test.cjs` (neuer `shadow`-
  Vertrag: kein Stack, `fillStyle` zurückgeschrieben) und
  `tests/style2-phase6.test.cjs` (Transform-Rückstellung mit 1e-9-Toleranz
  statt exakter Deep-Equal-Prüfung, begründet in der inversen Matrix).
- Cache-Keys für `game.js`, `combat-fx.js`, `style2-phase6.js` auf
  `save-restore-20261117` gebumpt (`dist/index.html`,
  `tests/cache-busting.test.cjs` und die Key-Asserts).

## 2. Partikel-Deckelung Endlos (Restpunkt 3): geprüft, bereits abgesichert

Kein Codeänderungsbedarf. Nachweis:

- `dist/combat-fx.js`: `MAX_PARTICLES = 240`; jeder Partikel-Pushpfad
  (`push`, `burst`, Mündungs-/Splitter-/Bolzeneffekte) respektiert die Grenze.
- `dist/game.js` `spark()`: bricht bei `fx.MAX_PARTICLES` ab; im Update-Pfad
  kürzen die Stufen zusätzlich auf 90 (niedrig) bzw. 170 (mittel).
- `tools/bench-td2.cjs l3endless`: Ø 189,8 Partikel bei 40 Dauergegnern;
  Worst-Case-Wellen laufen stabil am Deckel von 240.
- Tests sichern das Budget bereits ab: `tests/style2-cannon.test.cjs` und
  `tests/style2-impact-pass4.test.cjs` prüfen Overflow-Verhalten.

## 3. GPU-Rasterisierung am Gerät messen (Restpunkt 1): Protokoll

Der 4-GB-Android-Test bleibt offen, bis er durchgeführt wurde. Ablauf:

1. **Telemetrie einschalten**: Frame-Overlay (FPS, P95, SIM, DRAW, >50-ms-
   Stutter, Gegner-, Partikel- und Heap-Zahlen) aktivieren.
2. **Szenarien am Gerät** (je 3 Minuten, OLED-Helligkeit fest):
   - Endlos Level 3 ab Welle 20 mit 8 Türmen (CPU/Partikel-Worst-Case),
   - Kampagne Level 1, Welle 6 (Vergleichspunkt zur Node-Messung),
   - Ansturm ab Welle 150 (~1000 Gegner, Tick-Last).
3. **Je Qualitätsstufe** (hoch/mittel/niedrig, je Modus festgesetzt):
   FPS-Mittel, P95-Framezeit, DRAW-Anteil, Stutter > 50 ms und JS-Heap
   aufzeichnen. Erwartung aus dieser Messung: save/restore 260→90 sollte
   v. a. auf „hoch" (shadowBlur aktiv) die Frame-Zeiten stabilisieren.
4. **Vergleichspunkt**: identische Messung auf Desktop-Chromium
   (`tools/measure-level4-performance.cjs`, `tools/verify-*-browser.cjs`
   zeigen das Vorgehen) getrennt ausweisen.
5. **Ergebnisse** in `docs/performance/` als eigener Datensatz ablegen und
   die Restliste in `docs/performance-bench-2026-11.md` damit abarbeiten.

## Reproduktion

```
node tests/save-restore-reduction.test.cjs   # neuer Hot-Path-Regressionstest
node tools/diag-save-attribution.cjs         # save/restore-Quellen zuordnen
node --expose-gc tools/bench-td2.cjs l3endless
for f in tests/*.test.cjs; do node $f; done  # 133/133 grün
```
