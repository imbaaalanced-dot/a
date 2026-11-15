# Marcel „down“ Zauberstab-Kandidaten – Chromium-Abnahme & Android-4-GB-Prüfung (Issue #301)

Stand: 15. November 2026 · **`art_approval=manual-required` – keine Runtime-Integration vor Abnahme**

## Zweck

Issue #301 verlangt vor dem nächsten Spiel-Release zwei verpflichtende Abnahmen der 18 „down“-Kandidaten (Attack/Hit/Death) aus `docs/art/marcel-wand-down-candidates-20261115.md`:

1. **Chromium-Abnahme** – Frame-für-Frame-Sichtprüfung gegen die Referenz `originals/marcel-der-beschuetzer-reference-20261115.png`.
2. **Echte Android-4-GB-Prüfung** – auf dem physischen Zielsegment, niemals simuliert oder als bestätigt ausgegeben ohne Durchführung.

Dieses Dokument liefert die Infrastruktur und die Checklisten dafür. Die **Sichtprüfung selbst macht Malle** – kein Automatismus ersetzt die Kunstfreigabe.

## Chromium-Abnahme (bereit zur Durchführung)

Workflow `td2-wand-down-acceptance.yml` (Branch `art/wand-down-acceptance-20261115`):

- SHA-256-Integritätsgate für alle 24 Manifest-Dateien + Referenz (kein Bypass).
- Rendert Referenz + 18 Frames in **echtem headless Chromium** (Playwright): je Frame 512 px Vollauflösung auf hellem Grund und 128 px Spielgröße auf dunklem Grund.
- Erzeugt `docs/art/wand-down-review-20261115/`: `wand-down-review-fullsheet.jpg` (Gesamtübersicht mit Referenz) + `attack-sequence.gif`, `hit-sequence.gif`, `death-sequence.gif` (Frame-für-Frame-Sequenzen).
- Review only – keine Änderung an `dist/`, Manifesten oder Save-Keys.

### Checkliste Frame-für-Frame (Malle ausfüllen)

| Frame | Zauberstab sichtbar? | Kein Schwert/Schild/Laterne/Umhang? | Richtung & Silhouette ok? | Glow ok? | Anmerkung |
| --- | --- | --- | --- | --- | --- |
| attack/00–05 | ☐ | ☐ | ☐ | ☐ | |
| hit/00–05 | ☐ | ☐ | ☐ | ☐ | |
| death/00–05 | ☐ | ☐ | ☐ | ☐ | |

Prüfkriterien je Frame: genau ein Zauberstab (ornat, dunkler Fantasy-Stab, blaue Runen, Kristallspitze, blaues Glow), keine alten Waffen, keine Laterne, kein Umhang, kein Text; Höhenverlauf bei Death stetig fallend; Pivot bleibt Fußpunkt (kein Springen).

## Android-4-GB-Prüfung (nach Chromium-Abnahme + Freigabe)

Voraussetzung: Chromium-Abnahme bestanden, danach Materialize-/Runtime-Integration als eigener PR (Muster: `td2-hero-directional-actions-materialize.yml`). **Erst dann** auf dem Gerät messen:

1. Gerät: echtes 4-GB-Android-Gerät (Modell, Android-Version, WebView-Version notieren).
2. Integrierten Build (Preview-URL) auf dem Gerät öffnen; Marcel „down“ auswählen.
3. Messen und dokumentieren: FPS (ingeschaltetes Qualitäts-/Telemetrie-Overlay), Speicherverbrauch (z. B. `adb shell dumpsys meminfo`), Kaltladezeit, erste sichtbare Spielszene.
4. Spielszenarien: Level 1 komplett (Attack-Sequenz mehrfach), mind. 10 Minuten Ansturm (Hit-/Death-Sequenzen), ein App-Reload.
5. Ergebnisse hier verlinken und im Release-Gate-Dokument des nächsten Releases ablegen; `art_approval` erst danach auf `approved` setzen.

## Status

- [x] Integrität: 24/24 Manifest-SHAs + Referenz verifiziert (`tools/verify-wand-down-acceptance.py`).
- [x] Chromium-Rendering-Infrastruktur + Review-Raster (Workflowerzeugnis).
- [ ] Chromium-Abnahme durch Marcel Schneider (Sichtprüfung anhand des Rasters und der GIFs).
- [ ] Materialize + Runtime-Integration nach Freigabe (eigener PR).
- [ ] Echte Android-4-GB-Messung auf dem Gerät, dokumentiert.
- [ ] Kein Release ohne beide Abnahmen.
