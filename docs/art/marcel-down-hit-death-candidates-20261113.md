# Denkmal TD2 V5 · Marcel Treffer- und K.-o.-Reihen nach unten – zwölf RGBA-Kandidaten

Stand: 13. November 2026 · Issue #205 · **keine Runtime-Integration, `art_approval=manual-required`**

## Produktion

- Zwölf eigenständige Einzelframes (keine Spiegelung, keine umbenannten Walk-Frames): je Pose einzeln illustriert auf flachem Magenta-Hintergrund, anschließend Chroma-Key-Freistellung mit Kantenumrechnung (Alpha-Ringe, Un-Mixing der Hintergrundfarbe), Spill-Unterdrückung am Rand und Pivot-Normalisierung auf `[64, 116]`.
- **Einheitliche Skalierung je Sequenz** (Hit und Death jeweils eine gemeinsame Skalierung über alle sechs Frames) für konsistente Charaktergröße und Packer-Konformität.
- Hit-Folge: 00 Verteidigungshaltung, 01 leichtes Zurückweichen, 02 deutlicher Rückstoß mit hochgezogenem Schild, 03 tiefe Abfanghaltung, 04 Aufrichten, 05 Rückkehr zur Verteidigung.
- Death-Folge (familienfreundlich, ohne Blut): 01 Vorneigen, 02 In-die-Knie-Gehen, 03 Ein-Knie-Aufkommen, 04 Absinken, 05–06 liegende Endpose mit abgelegtem Schwert. Death-Höhenverlauf im 128er-Raum stetig fallend (max. Übergang 18 px, Grenzwert 52 px).
- Identität nach `docs/art/HERO_REFERENCE_LOCK_20261107.md`: schwarze Kappe mit weißem Zeichen, dunkelblauer Kapuzenpullover mit weißen Streifen, verwitterte braune Leder-/Metallrüstung, Schwert rechts, metallverstärkter Löwenschild links, Bartstoppeln, kein Umhang. Sichtprüfung aller 12 Frames: keine Magenta-Säume, kein Text, kein Blut, keine zusätzlichen Gliedmaßen.

## Technische Prüfung

- `tools/verify-hero-attack-sheet.py` auf beiden 3×2-Bögen (1536×1024 RGBA, 512-px-Zellen): **je `pixel_gate=pass`, 0 Issues**. Je Frame ≥ 73 % vollständig transparenter Hintergrund, Randabstand ≥ 12 px (512er-Raum; im 128er-Export ≥ 3 px), Fußpivot exakt 464/512 (= 116/128), je sechs unterscheidbare sichtbare Silhouetten und sechs verschiedene RGBA-Frames.
- Export der zwölf 128×128-Kandidaten nach `source-art/hero/actions-v5/marcel/down/hit/00.png…05.png` und `…/death/00.png…05.png` mit identischer Verarbeitungs-Pipeline wie die Attack-Reihe (Frame-Verarbeitung aus `verify_hero_attack_sheet.analyze()`).
- **Vollständiger Packer-Gate-Nachweis (lokal, unveränderte Kopie von `tools/pack-hero-action-directions.py` @ main 9dfa852):** `--hero marcel --direction down` mit `attack`, `hit`, `death` aus den Kandidaten-Ordnern verarbeitet alle 18 Frames erfolgreich; je Aktion 6 unique Frames, 6 unique Alpha-Silhouetten, `max_height_drop_px` attack 2 / hit 11 / death 18. WebP-Kandidat `candidate-unapproved` (168 526 Bytes, sha256 `5384e5702ceff4765a422388fc5673a59943025f24e4dd14f0733f6c63f94ef0`) wurde **nicht** ins Repository übernommen; `dist/` bleibt unberührt.
- Binärübertragung als temporärer Base64-Handoff mit `sha256sum -c`-Gate (Manifest hash-ersten); Commit durchläuft denselben Prozess wie PR #242.

## Mitgelieferte Abnahme-Dateien

- `marcel-hit-down-concept-3x2.png` / `marcel-death-down-concept-3x2.png`: geprüfte 3×2-Bögen (512-px-Zellen) im selben Ordner.
- `marcel-hit-down-preview-6x1.png` / `marcel-death-down-preview-6x1.png`: 6×1-Vorschauen in Spielgröße.

## Status und Grenzen

- **`art_approval=manual-required`**: Das Pixel-Gate ist keine Kunstfreigabe. Die visuelle Identitäts- und Richtungsabnahme durch Malle steht aus.
- Keine Änderungen an `dist/`, aktiven Manifesten, Save-Keys, Leveln oder Kampfregeln; kein automatischer Merge.
- Nach Abnahme folgen: `tools/verify-hero-direction-candidate.py`, Registrierung und Opt-in-Spieltest.
- Chromium-Abnahme und echte Android-4-GB-Prüfung: **nicht durchgeführt**.

## SHA-256-Manifest

| Datei | SHA-256 |
| --- | --- |
| `hit/00.png` | `827232651f101a7fc7f232105e6f969c1cb33637ab349b584628fcb9356ff95a` |
| `hit/01.png` | `528dbf8e960f14dab32ee797170adeffd246ca0efecdf696da55ac47def45ef4` |
| `hit/02.png` | `7ff009e2f6eeb1589ae202b48d2dbb31b8714614599b22c93b63520c5a29f301` |
| `hit/03.png` | `f7fd2cfe14cc828670ee3e9517ed82f56e495246fc1cd8b3ade60d977ccf56b8` |
| `hit/04.png` | `5e08202165525588afa2621be934455c866dbc916ecc05125fca1019c10677c9` |
| `hit/05.png` | `32e2304e67f191e8a2d774cac393648820d39f43d4b4ca9e85af3438fc6eb474` |
| `death/00.png` | `a7a5c090a42241c17ea7701b476e84600ab0864d5c3c43a595b3277f05822e46` |
| `death/01.png` | `57eab2468a675f2853697f36e412f4beed5a5224a429c22f286d44115b91f222` |
| `death/02.png` | `a129a8a3ecc8dde0e4ae279c2d8b381aa708c9a1ab8a634eaedf6287f44bb494` |
| `death/03.png` | `ee868175d71fdcd0344573d9a37c55976017afec82fec5122c24ee901052af7d` |
| `death/04.png` | `d3eb4e216c486ce3e768f2bbc822d8f93ac1791869511643714c34fdb0ade1fb` |
| `death/05.png` | `84cd225df7231c12ce471d7150defad16450c95bcab4fa96128f2ac088d43f77` |
| `marcel-hit-down-concept-3x2.png` | `029133d345efc8dea583d0f2514b17e3fa9ba1a5a19d0e1aacb37ed8ab2f75aa` |
| `marcel-death-down-concept-3x2.png` | `6e6985734ffad8c5dc7700a47f3c8f063b8d096f7bd858c382ee5dad17383eb6` |
| `marcel-hit-down-preview-6x1.png` | `463eb1601eabe77d4940a239e47cc6680969c6519e74d405d515a24cfdfce1fb` |
| `marcel-death-down-preview-6x1.png` | `cf9ce321f578308b6eaf661f2f02964aae7114a15681d4fcd4956bdceb2b6621` |
