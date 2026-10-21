# Style 2 – Randbereinigung der vier Turmfamilien, Pass 3

20.10.2026 · Draft PR #51 · Basis `e088da3` · Opt-in bleibt `?td2UserTowers=1`.

## Aktiver Umfang

Elf zusätzliche Imagegen-Bereinigungen ergänzen Pass 2. Damit verwenden Bogen, Kanone, Eis/Magie und Bumerang in allen drei Stufen bereinigte Varianten. Die drei Rift-Türme bleiben auf V1: Ihr beabsichtigtes violettes Leuchten wurde visuell geprüft, aber nicht pauschal entfernt. Weitere Rift-Randsäume sind damit nicht als behoben erklärt.

| Ursprung | Aktive Varianten | Ablage |
|---|---:|---|
| V3, dieser Schritt | 11 Türme | `dist/assets/style2-user-towers-v3/towers/`, je 512×512 RGBA plus `runtime-webp/towers/` |
| V2, Pass 2 | Kanone L1 und Eisprojektil L2 | `dist/assets/style2-user-towers-v2/` |
| V1, erhalten | 3 Rift-Türme und 14 Projektile | `dist/assets/style2-user-towers-v1/` |

Insgesamt 30 aktive Varianten, davon 13 versionierte Overrides. Alle V1-/V2-Dateien bleiben erhalten. V3 enthält elf PNG-Master, elf verlustfreie WebPs und ein Manifest mit Pivot, Größe, Bounding-Box, Eingabe-/Original-/Export-Prüfsummen. Cache-Key der V3-Bilder: `cleanup-3`, des Adapters: `user-towers-4`.

## Produktion und technische Grenzen

Jedes Original wurde einzeln als Imagegen-Edit-Ziel verwendet. Anweisung: nur künstliche pinke Freistellungssäume entfernen, Mechanik, Materialien, Upgrade-Identität, Kamera und legitime Effekte erhalten. Die Varianten sind modellbasierte Neufassungen mit kleinen Änderungen in gemalten Details, keine pixelidentische Retusche.

`tools/export_style2_cleanup_pass3.py` nutzt den bestehenden technischen Exporter: proportionale Skalierung, Platzierung auf transparentem Canvas, PNG und verlustfreies WebP. Kein Farbfilter retuschiert das Bild. Alle elf Boden-Kontaktlinien bleiben gleich; die horizontale Mitte der Referenz-Bounding-Box bleibt innerhalb eines halben Pixels. Die obere Bildgrenze unterscheidet sich je nach Variante um −1 bis +4 Pixel. Dies sind Bounding-Box-Werte, keine Zusicherung identischer Silhouetten.

Beim Eissturm L3 hat das Original eine abgesetzte Gruppe von 30 Saumpixeln bei `[56,394,62,400]`. Zur Ausrichtung dient die gemessene Hauptkomponente mit 77.025 Pixeln und Bounding-Box `[109,74,421,488]`; der Fremdrest beeinflusst die neue Skalierung/Position nicht. Die übrigen Eisstufen behalten ihre absichtlich schwebenden Kristalle.

## Tatsächlich geprüft

- Alle 22 V3-Dateien: Dimensionen, echter Alphakanal, leerer äußerer Canvasrand, Pivots, Prüfsummen und bitgleiche PNG-/WebP-Pixel bestanden. Originalprüfsummen bleiben unverändert.
- Der Pink-Rand-Test misst `R>180, B>120, G<90, Alpha>16` innerhalb von zwei Pixeln zur Transparenz. Bei allen elf Originalen waren 245–653 solche Pixel vorhanden; bei allen elf Exporten **0**. Das Test-Gate verlangt mindestens 90 Prozent Reduktion. Diese Farbmessung ist keine universelle Bewertung violetter Magie.
- Der erste Abschlusslauf fand zwei leere WebP-Dateien. Sie wurden aus den unveränderten PNG-Mastern neu codiert; ihre SHA-256-Werte entsprachen danach exakt den bereits im Manifest dokumentierten Werten. Ein separater vollständiger Rebuild reproduzierte anschließend **alle 22 Bilddateien bytegenau**. Die Ursache der vorherigen leeren Dateien wurde nicht abschließend belegt.
- **50 Projekt-Prüfkommandos aus dem CI-Workflow: 0 Fehler** nach der Korrektur. Der neue Assettest läuft auch in GitHub Actions.
- **Chromium 133**, Desktop 1280×900 und Touch-Emulation 412×915: kombinierte V1/V2/V3-Zuordnung, 30/30 echte WebP-Decodes und sichtbare Canvas-Ausgaben, Kaltstart-Fallback, alle sechs Level geöffnet, keine beobachteten JavaScript-Ausnahmen oder HTTP-Fehlerantworten.
- Miniaturvergleich bei 64/128 px geprüft. Holz, schweres Metall, Eiskristalle und Bumerang-/Sägeblattmechanik sowie ihre drei Stufen bleiben unterscheidbar. Filigrane Details sind bei 64 px erwartungsgemäß weniger deutlich.

[Miniaturvergleich](qa/style2-cleanup-pass3-20261020/towers-64-128.png) · [Desktop](qa/style2-cleanup-pass3-20261020/game-desktop.png) · [Touch-Hochformat](qa/style2-cleanup-pass3-20261020/game-touch-portrait.png) · [Browserbericht mit Renderer-SHA](qa/style2-cleanup-pass3-20261020/report.json).

Die Spielszenen verwenden eine synthetische Anordnung aller 15 Turmstufen. Das höhere Turmlimit gilt nur in der Fixture. Kampfwerte, Save-Keys, Gegnerwege, Upgrade-Sterne und Produktionsturm-Limits werden nicht geändert. Echte Android-/WebView-Prüfung, Langzeitspiel, FPS/Framezeiten und GPU-Speicher sind weiterhin offen bzw. nicht gemessen. Es wurden keine neuen Impact-Animationen erzeugt und kein Live-Build veröffentlicht.

## Verwendetes Prompt-Set

Elf getrennte englische Imagegen-Edit-Aufträge, je mit dem zugehörigen V1-PNG als einziger Edit-Referenz:

- `tower_bow_lv1`, `tower_bow_lv2`, `tower_bow_lv3`, `tower_cannon_lv2`, `tower_cannon_lv3`.
- `tower_mage_lv1`, `tower_mage_lv2`, `tower_mage_lv3`, `tower_boomerang_lv1`, `tower_boomerang_lv2`, `tower_boomerang_lv3`.

Inhaltliche Vorgabe: **precise-object-edit/background-extraction**. Ausschließlich künstliche hot-pink/magentafarbene Keying-Linien an Außenrändern und transparenten Löchern entfernen. Waffensystem, Anzahl/Anordnung von Teilen, Holz/Stein/Eisen/Bronze, Originalpalette, festgelegte erhöhte Dreiviertelkamera, Beleuchtung, Silhouette, transparente Ränder und normalisierte Position erhalten. Pivot nominell `[256,488]` auf 512×512. Natürliche Kantenglättung und echte RGBA-Transparenz. Keine neue Perspektive, Vergrößerung, vertikale Zentrierung, hinzugefügten/entfernten Hauptteile, kein Boden, Schattenrechteck, UI, Sterne, Schrift, Wasserzeichen oder eingebranntes Schachbrett. Bestehende blaue Eismagie und orange Glut/Lavarisse nicht entfernen. Bei Eisstufen sind freischwebende Kristalle ausdrücklich beabsichtigte Objektteile.

Export reproduzieren: `python tools/export_style2_cleanup_pass3.py candidates.json`. Die Eingabeliste enthält genau elf Objekte mit `kind`, `level` und lokalem `source`-Pfad zu den erzeugten Originalausgaben; der Exporter erzeugt selbst keine Bilder.

Ergebnisstufe: **generiert, technisch geprüft und im Opt-in-Renderer integriert; lokal im Desktop-/Touch-Browser geprüft**. Android-Abnahme und Release bleiben getrennt.
