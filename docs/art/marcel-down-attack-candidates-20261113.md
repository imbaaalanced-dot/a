# Denkmal TD2 V5 · Marcel Angriff nach unten – sechs RGBA-Kandidaten

Stand: 13. November 2026 · Issue #205 · **keine Runtime-Integration, `art_approval=manual-required`**

## Produktion

- Sechs eigenständige Einzelframes (keine Spiegelung, keine umbenannten Walk-Frames): je Pose einzeln illustriert auf flachem Magenta-Hintergrund, anschließend Chroma-Key-Freistellung mit Kantenumrechnung (Alpha-Ringe, Un-Mixing der Hintergrundfarbe), Spill-Unterdrückung am Rand und Pivot-Normalisierung auf `[64, 116]`.
- Pose-Folge nach dem Storyboard aus Issue #205: 00 Verteidigungshaltung unten, 01 Gewichtsverlagerung/Ausholen rechts, 02 Beginn diagonaler Hieb, 03 Trefferphase, 04 Abfangen/Rückführen, 05 Rückkehr zur Verteidigung.
- Identität nach `docs/art/HERO_REFERENCE_LOCK_20261107.md`: schwarze Kappe mit weißem Zeichen, dunkelblauer Kapuzenpullover mit weißen Streifen, verwitterte braune Leder-/Metallrüstung, Schwert rechts, metallverstärkter Löwenschild links, Bartstoppeln. Ein Zwischenstand mit rotem Umhang (Frame 03) wurde als Identitätsabweichung verworfen und neu erzeugt.

## Technische Prüfung

- `tools/verify-hero-attack-sheet.py` auf dem 3×2-Bogen (1536×1024 RGBA, 512-px-Zellen): **`pixel_gate=pass`, 0 Issues**. Je Frame ≥ 73 % vollständig transparenter Hintergrund, ≥ 46 000 Pixel mit vollem Alpha, Randabstand ≥ 12 px, Fußpivot exakt 464/512 (= 116/128), sechs unterscheidbare sichtbare Silhouetten, sechs verschiedene RGBA-Frames.
- Sichtprüfung der Freistellung: keine Magenta-Säume, keine Schattenreste, keine angeschnittenen Waffen; Ausrüstung über alle Frames konsistent (Schwert rechts, Schild links).
- Export der sechs 128×128-Kandidaten nach `source-art/hero/actions-v5/marcel/down/attack/00.png…05.png`.
- Mitgeliefert zur Abnahme: `marcel-attack-down-concept-3x2.png` (3×2-Prüfbogen, 512-px-Zellen) und `marcel-attack-down-preview-6x1.png` (6×1-Vorschau in Spielgröße) im selben Ordner.

## Status und Grenzen

- **`art_approval=manual-required`**: Das Pixel-Gate ist keine Kunstfreigabe. Die visuelle Identitäts- und Richtungsabnahme durch Malle steht aus.
- Keine Änderungen an `dist/`, aktiven Manifesten, Save-Keys, Leveln oder Kampfregeln; kein automatischer Merge.
- Hit- und Death-Reihen (je 6 Frames) fehlen weiterhin; erst danach `tools/pack-hero-action-directions.py`, `tools/verify-hero-direction-candidate.py` und Opt-in-Spieltest.
- Chromium-Abnahme und echte Android-4-GB-Prüfung: **nicht durchgeführt**.

## SHA-256-Manifest

| Datei | SHA-256 |
| --- | --- |
| `attack/00.png` | `bb7427089df085ecfe83cd2a3f39f8de6e7053e5e10fedcf549cadecaafb2513` |
| `attack/01.png` | `f3998c1b2c43969d1540342c8885c9ab57b5495853d61a9edad7f5bafe7b5db6` |
| `attack/02.png` | `94eba0c056ddad1a983e7c39912dd55d8a4973ab79007d059261e713a2b080a8` |
| `attack/03.png` | `b855670aa4432f83e9090f91f55927f48bff586b42a864c4f7c33d1a7093b4ec` |
| `attack/04.png` | `37845f39c400b44527bd30cff518e529018ed384cc1e7b834c5e135a07530855` |
| `attack/05.png` | `081739be7ed10f2db8217194811d9c7e780ac7520757df7a26fd163db8fb6fcd` |
| `marcel-attack-down-concept-3x2.png` | `d31b7a2c60f719387a60cc4cc6fbffda510f0397f41ad299e93767d54acdf1e1` |
| `marcel-attack-down-preview-6x1.png` | `03e31f5a6e9b95870bf767e79a54afc29e6e3c944dde78c2d8824133cd0e818f` |
