# Denkmal TD2 Beta – Grafikentscheidungsboard (Startbestand)

Stand: 16.11.2026. Erfasst für Issue #330. **Dies ist eine Auswahlvorlage, keine künstlerische Abnahme und keine Löschliste.**

| Motiv / Ort | Aktive Version (in `main`) | Reale Kandidaten / Alternativen | Technische Evidenz | Marcel entscheidet |
|---|---|---|---|---|
| Marcel – Lauf/Normalangriff | `dist/assets/hero/marcel-walk-v5b.webp`, `marcel-side-actions-v5b.webp` (veraltete Waffen-Identität laut Feedback) | Zauberstab/Crystal-Referenz vom 15.11., Kandidaten auf `art/marcel-wand-down-candidates-20261115`, siehe Vorschauen unten | 18 Frames, Pixel-Gate bestanden; nur **Down Attack/Hit/Death** gefertigt, **nicht** aktive Runtime | **Wunschrichtung ist festgelegt: Zauberstab, kein Schwert/Schild.** Frames/Pose/Proportionen vor Runtime-Freigabe sichtbar auswählen |
| Kim – Lauf/Aktionen | `kim-walk-v5b.webp`, `kim-side-actions-v5b.webp` und Richtungsatlanten | Noch keine alternativ freigegebene neue Komplettversion; aktuell gemeldete Magenta-Artefakte prüfen | V5b-Alpha-/Rahmenprüfungen vorhanden; diese belegen **nicht** das Fehlen sichtbarer Magentareste in allen Frames | Bow-Identität beibehalten; nach visueller Fehlerliste Variante auswählen |
| Marcel/Kim – Hauptmenü | Ein selektiver `menuHeroBanner`, aktive `TD2CanonicalHeroArt.portrait`-Grafik | [Draft-PR #334](https://github.com/imbaaalanced-dot/a/pull/334): beide bestehenden Porträts gleichzeitig sichtbar, auch kleines Querformat | CSS-/DOM-Fix; keine neue Hero-Illustration freigegeben | Bildidentität und Positionen nach Vorschau festlegen; Marcel muss mit Zauberstab erscheinen |
| Kaserne – Gebäude | Style-2-VP8-Sprite `kasernen-atlas-96px-style2.webp` | Bestehende drei Gebäudestufen, **nicht** ersetzen | PR #331 ergänzt Sterne L1–L3, ggf. visuelle Position nachprüfen | Nur bei unpassender Silhouette alternative Gebäude wählen |
| Kaserne – Rekruten | Selber Style-2-VP8-Sprite, ursprünglich **ohne Alphakanal** | [Draft-PR #333](https://github.com/imbaaalanced-dot/a/pull/333): Kanten-Matte als transparenter Laufzeit-Frame ausgeschnitten | Technischer Fix für Walk/Attack; noch keine visuelle Freigabe bei 128 px/Android | Rekruten-Design behalten, solange Freistellung und Größe visuell passen |
| Kirchende – Denkmal | Aktive Style-2-Monument-Ansicht | Drehung zur unteren Spielecke gemäß Foto-/Spielerreferenz | Blickrichtung aus Live-Besprechung, keine fertige Korrektur | Winkelvariante und Platzierung per Vorher/Nachher freigeben |
| Kirchende – Straßenzug/Gelände | Aktive Terrain-/Road-/Canopy-Renderer | Fotoabgleich: asphaltierte deutsche Straßen, echte Bäume/Waldränder/Gras/Böden | Referenzgenauigkeit aktuell offen | Dokumentarisch passende Variante aus Vor-Ort-Bildern auswählen |

## Marcel-Zauberstab: bereits vorhandene sichtbare Kandidaten

Originalquelle: [Produktionsbericht](https://github.com/imbaaalanced-dot/a/blob/art/marcel-wand-down-candidates-20261115/docs/art/marcel-wand-down-candidates-20261115.md), dort auch Referenz und SHA-256.

- [Attack – 6 Frames in Spielgröße](https://github.com/imbaaalanced-dot/a/blob/art/marcel-wand-down-candidates-20261115/source-art/hero/actions-v5/marcel/down/marcel-attack-down-preview-6x1.png)
- [Hit – 6 Frames in Spielgröße](https://github.com/imbaaalanced-dot/a/blob/art/marcel-wand-down-candidates-20261115/source-art/hero/actions-v5/marcel/down/marcel-hit-down-preview-6x1.png)
- [Death – 6 Frames in Spielgröße](https://github.com/imbaaalanced-dot/a/blob/art/marcel-wand-down-candidates-20261115/source-art/hero/actions-v5/marcel/down/marcel-death-down-preview-6x1.png)

**Produktionshinweis:** Die Down-Kandidaten besitzen laut Bericht null nahe-Magenta-Pixel nach Export, aber die meisten Einzelbilder wurden noch nicht manuell im Bild geprüft. Nicht mit dem bereits behobenen violetten Marcel-Runtime-Frame verwechseln. Keine neuen Grafikdateien durch diese Bestandsaufnahme erzeugt.

## Beschlussroutine pro Grafik

1. **Aktuelle Runtime**, reale Fotoreferenz und vorhandene Kandidaten in gleicher Perspektive/Größe gegenüberstellen.
2. Vorläufige Entscheidung durch Marcel: **behalten / bearbeiten / ersetzen / archivieren / löschen**.
3. Erst nach technischer Abnahme (echte Transparenz, Atlasränder, Fußanker, mobile Miniatur, Dateipfade) als `selected` markieren.
4. Veraltete Bilder aus dem **neuen Beta-Runtime-Paket** entfernen; Originale bis zum unabhängigen Archivabschluss nicht irreversibel löschen.
5. Nur wenn CI/Android/Screenshots passen und Marcel das Motiv bestätigt, die neue Grafik in Beta veröffentlichen.

## Noch nicht erhoben
- Vollständige Dateiliste und tatsächliche Loader-Referenzen auf dem neuesten `main`; historischer `ALPHA9_ASSET_INVENTORY.csv` reicht nicht aus.
- Alle PR-/Branch-Grafiken in einer kontaktblattartigen Galerie, inklusive Westhofen/Kirchender Kirche und Löwe.
- Entscheidung über neues Beta-Repository vs. Bereinigung desselben Repo (inklusive Pages/CI/alte URLs).

Keine Grafikfreigabe ist implizit; die oben genannten Pull Requests sind Entwürfe.
