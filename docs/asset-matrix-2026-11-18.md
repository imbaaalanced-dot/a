# Beta-Asset-Matrix mit Vorschaubildern (18.11.2026)

Zweiter Schritt aus Issue #330 Abschnitt 4 bzw. Beta-Bestandsaufnahme
`docs/beta-inventar-2026-11-17.md` Abschnitt 8 Punkt 1: Asset-Matrix mit
visuellen Vorschaubildern für die 401 Unreferenz-Kandidaten aus
`docs/beta-inventar-2026-11-17-unreferenced.csv`.

**Es wurde nichts gelöscht, verschoben oder grafisch verändert.**
Alle Entscheidungen (Behalten / Überarbeiten / Archivieren / Löschen) trifft
Marcel; die Spalte „Vorschlag" ist eine Heuristik aus der Bestandsaufnahme.

## Artefakte

| Datei | Inhalt |
| --- | --- |
| `docs/asset-matrix-2026-11-18/asset-matrix.csv` | Alle 401 Kandidaten mit Größe, Vorschlag, Begründung, Vorschau-Referenz und leerer Entscheidungsspalte |
| `docs/asset-matrix-2026-11-18/index.html` | Statische Galerie nach Ordner gruppiert, mit Thumbnails und Entscheidungsspalten (lokal im Browser zu öffnen; keine externen Abhängigkeiten) |
| `docs/asset-matrix-2026-11-18/previews/` | 368 WebP-Miniaturen (max. 128 px, zus. ~2 MB) |
| `tools/asset-matrix-preview.py` | Reproduzierbares Generator-Skript (Pillow) |

## Vorschlagsverteilung (Heuristik)

| Vorschlag | Anzahl | Bedeutung |
| --- | --- | --- |
| BEHALTEN | 7 | `assets/hero/voice/` (MP3-Voice-overs für P1-Audiosystem), `assets/menu/v6/` (aktives v6-Menü, per `marcel-menu-wand.test.cjs` gepinnt) |
| PRUEFEN | 145 | Manifeste/Daten/README (kein Runtime-Fetch im Textscan), dynamisch zusammengesetzte Pfade (`elemental/`, `barracks/`), Helden-Assets (Referenz-Lock), `menu/v5-avatars` (vermutlich durch `canonical-hero-art-v5` abgelöst). Vor jedem Rückschritt: Runtime-Request-Log (Chromium-QA, `page.on('request')`) je Kandidat |
| ARCHIV/LOESCHEN (Vorschlag) | 249 | Legacy-Versionen/Zwischenstände laut Bestandsaufnahme: `-alpha8`-Bestände, `-v1`-/`-v27`-Atlanten, Style-2-Zwischenstände (`style2-user-towers-v1/v3/v4`, `style2-pilot-v1`), Kirchende-Pilot-PNGs, Ballisten-/Mörser-Turmbögen, `stone-terrain-v27.png`, `hellscape-map-v1.png` |

## Verfahren

- Eingabe: unveränderte Kandidatenliste der Bestandsaufnahme (Obergrenze inkl. False Positives, 401 Dateien / 78,9 MB).
- Kategorisierung über Pfadpräfixe und Dokument-Befunde (`PROTECTED`/`VORBEHALT`-Listen im Skript), sonst Legacy-Marker-Heuristik.
- Miniaturen: Pillow-`thumbnail` auf 128 px, WebP q70; Nicht-Bilddateien (33: JSON/MD/MP3/SVG/B64) ohne Vorschau.
- **Nebenbefund:** Drei `sources/`-PNGs sind beschädigt („broken data stream“, einheitlich ~786 KB, wirken abgeschnitten): `assets/style2-reference-impacts-v1/sources/boomerang-impact-6frames.png` und `ice-shatter-6frames.png`, `assets/style2-reference-projectiles-v1/sources/user-projectiles-395.png`. Die Vorschauen wurden mit toleranter Dekodierung erzeugt; die Originale wurden nicht angetastet. Bei allen dreien läuft ohnehin ein ARCHIV/LÖSCHEN-Vorschlag.
- Reproduzierbar: `python3 tools/asset-matrix-preview.py` (benötigt Pillow wie `tests/assets.test.py`).

## Nächste Schritte (freigabepflichtig)

1. Marcel entscheidet je Kandidat/Kandidatengruppe in `asset-matrix.csv` (Spalte `entscheidung_marcel`); empfohlen je Ordner-Block in der Galerie.
2. Nach Freigabe: Löschung/Archivierung in kleinen, verifizierten PRs mit Runtime-Request-Log je Kandidat; Fuse bleibt `archive/alpha-snapshot-20261117`.
3. Erst danach Release `alpha-final` und Beta-Schnitt (Bestandsaufnahme Abschnitt 7/8).

---
Erstellt im Rahmen von #330, Stand 18.11.2026 auf main `5301720`.
