# Denkmal TD2 V5 · Marcel „down" Zauberstab-Kandidaten (Attack/Hit/Death) – 18 RGBA-Kandidaten

Stand: 15. November 2026 · Issue #205 · Referenz: `originals/marcel-der-beschuetzer-reference-20261115.png` (Draft-PR #287) · **keine Runtime-Integration, `art_approval=manual-required`**

## Produktion

- Erste komplette Kandidatenproduktion gegen die **Zauberstab-Referenz vom 15.11.2026** (kein Schwert, kein Löwenschild, keine Laterne). 18 eigenständige Frames (je Pose einzeln illustriert, verkettete Bildbearbeitung pro Sequenz), flacher Magenta-Hintergrund (#FF00FF), Chroma-Key-Freistellung mit Kantenumrechnung, Spill-Unterdrückung, Pivot-Normalisierung auf `[64, 116]`, einheitliche Skalierung je Sequenz.
- **Attack:** 00 Guard (Zauberstab tief), 01 Ausholen (Glow intensiviert sich), 02 Zauberbeginn (Energie fließt), 03 Zauberschlag (blauer Magie-Ausbruch an der Kristallspitze), 04 Ausschwingen, 05 Rückkehr zur Guard.
- **Hit:** 00 Guard (identische Guard-Quelle wie Attack/00), 01 leichtes Zurückweichen, 02 starker Rückstoß (Zauberstabarm weit ausgeschlagen), 03 Abfang-Crouch (Glow schwach), 04 Aufrichten, 05 Guard.
- **Death (familienfreundlich, ohne Blut):** 01 Absinken, 02 Ein-Knie, 03 seitliches Absinken, 04 liegend mit Zauberstab daneben, 05 Endpose, Glow fast erloschen. Höhenverlauf stetig fallend (max. Übergang 36 px im 128er-Raum, Grenzwert 52 px).
- Hit/00 wurde nach einer 128-px-Sichtprüfung („schwertartig") durch die in zwei Auflösungen verifizierte Attack/00-Guard-Quelle ersetzt; Mid-Ketten-Frames (hit/02, hit/03) waren in Vollauflösung sauber als Zauberstab bestätigt.

## Technische Prüfung

- `tools/verify-hero-attack-sheet.py` auf allen drei 3×2-Bögen (1536×1024 RGBA, 512-px-Zellen): **je `pixel_gate=pass`, 0 Issues**; Fußpivot exakt 464/512 (= 116/128).
- Programmatic Magenta-Scan aller 18 Kandidaten: **0 nahe-Magenta-Pixel** (Abstand < 90, Alpha > 200).
- **Vollständiger Packer-Gate-Nachweis** (unveränderte Kopie `tools/pack-hero-action-directions.py` @ main, lokal, Ausgabe `out/wand-packed`, nie `dist/`): 18 Frames verarbeitet, je Aktion 6 unique Frames und 6 unique Alpha-Silhouetten; `max_height_drop_px` attack 20 / hit 16 / death 36. WebP-Kandidat `candidate-unapproved`, 147 542 Bytes, sha256 `dd3441fe5df775e656b478cc3a464aeaf24c96303615e6a821d9cbf1e865eb8a` – **nicht** ins Repository übernommen.
- Binärübertragung per temporärem Base64-Handoff mit `sha256sum -c`-Gate; alle 24 Dateien (18 Kandidaten, 3 Bögen, 3 Previews) per Git-Blob-SHA byte-identisch verifiziert.
- **Sichtprüfung (Vision-Modell):** Vollauflösung: attack/00, attack/03, hit/02, hit/03, death/04, death/05 konform (ein Zauberstab, keine alten Waffen, kein Laterne, kein Umhang, kein Text); 128-px: attack/00, death/04 konform. Die restlichen Frames (attack/01–02/04–05, hit/01/04–05, death/00–03) wurden nicht einzeln vision-geprüft und sind Teil der **manuellen Abnahme**.

## Mitgelieferte Abnahme-Dateien

- `marcel-{attack,hit,death}-down-concept-3x2.png`: geprüfte 3×2-Bögen (512-px-Zellen) im selben Ordner.
- `marcel-{attack,hit,death}-down-preview-6x1.png`: 6×1-Vorschauen in Spielgröße.

## Status und Grenzen

- **`art_approval=manual-required`**: Pixel-Gate ist keine Kunstfreigabe. Die visuelle Identitäts- und Richtungsabnahme durch Malle steht aus.
- Dieser Satz **ersetzt** die Schwert/Schild-Kandidaten aus PR #242 (Attack „down") und Draft-PR #266 gemäß Übergangsregel des Referenz-Locks; PR #266 sollte nach Merge dieses PRs geschlossen werden.
- Keine Änderungen an `dist/`, aktiven Manifesten, Save-Keys, Leveln oder Kampfregeln; kein Merge ohne ausdrückliche Freigabe. **Merge-Reihenfolge:** Referenz-PR #287 zuerst, danach dieser PR.
- Nach Abnahme: `tools/verify-hero-direction-candidate.py`, Registrierung, Opt-in-Spieltest; Chromium-Abnahme und echte Android-4-GB-Prüfung: **nicht durchgeführt**.

## SHA-256-Manifest

| Datei | SHA-256 |
| --- | --- |
| `attack/00.png` | `1fe5c1b443205fdb297e7ab2cedfa818a433cac6819592cfb0cb1eab5ed1a672` |
| `attack/01.png` | `1c2cf2aba2f5b1ddb827e3ecf9c566de4f336b7b7b38aa0aa12af08037614bd6` |
| `attack/02.png` | `b0dd7bedb6769a9e6a8bbcc80d05f75fabf11eee3f837a59d420ae03694ab143` |
| `attack/03.png` | `d289a0c99b4476349d5aed784b9f6e04245f4984bc289c02b87241a3f2ade46c` |
| `attack/04.png` | `18c513c9f980e36f872b8093ac32489b24fa115a86ace98eca212fde24473989` |
| `attack/05.png` | `87dcc43070fa77554e28121d37f0d8aa536275457cb4cfdecfee2120065d0318` |
| `hit/00.png` | `1fe5c1b443205fdb297e7ab2cedfa818a433cac6819592cfb0cb1eab5ed1a672` |
| `hit/01.png` | `df8d99e026caa9069de6f58e3701c00412df9147ee4682453dac404fb7ce647e` |
| `hit/02.png` | `356a47e8ab2469eeaed36f3f0fc50ce89bf62e8fe9d3b123d13c09f495aa493b` |
| `hit/03.png` | `fa28d37a64e3d5163e82666837f7f5150fb2e675e73790922173f1fa6344cea7` |
| `hit/04.png` | `0dcb4c615c59808ac3f4c9d3d3a2527f92fc7472ce2e5cb7b7ed7ca86ca6e286` |
| `hit/05.png` | `3ecd2437279db62a8d55bad198f994ac600e3aee4ea249af51f337873d52ba34` |
| `death/00.png` | `40dc082557fbf1c8c7217e6d87526333c21e374c5f35c7eac1d6841c9908b66c` |
| `death/01.png` | `1e6f45710e78518e08eeef588915c00be410f1b8ddb4b7e0808719535f0c5ba4` |
| `death/02.png` | `3f488808474967db3a2142e21222e8555714c3b4a8ce0e2fbb7e558c46ccae26` |
| `death/03.png` | `0125467063ad4a5d8d6639d7568dfc35dc4ed92c38404541ba95ecd6935298d6` |
| `death/04.png` | `b1453528fba321907a984029327d66e86926ecf800ee1c5ca9501d341ca97845` |
| `death/05.png` | `3c002005f7447965740025874f99b9afaf700f56d74023cb4cffb457e6c1658e` |
| `marcel-attack-down-concept-3x2.png` | `8b0cd36721bcd7c1d5d882f34b0d2ebd9f44e96229448f6bfef09ff08ae7ee11` |
| `marcel-hit-down-concept-3x2.png` | `5f41e11b1f42fcccdb87c37606e45e97ee63d5b61d137e233cade3cb96cb0d04` |
| `marcel-death-down-concept-3x2.png` | `a75011a4e9baf9484fe84c58a79ecd766784c386d0ce8523f28ee7f87ad4104a` |
| `marcel-attack-down-preview-6x1.png` | `cefdbea1833928dabd707b77fdcd4bf7d6e59ad2fb5d4e6ef272a92195279c91` |
| `marcel-hit-down-preview-6x1.png` | `92b99f021360221daf86e971dae9424bced86815edf205c193969c4cb3cc8ca9` |
| `marcel-death-down-preview-6x1.png` | `625266021e63e64e7571ba430a3d5301ab254240b7e4d446866c28a710c9c84b` |
