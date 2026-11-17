# Beta-Bestandsaufnahme (17.11.2026)

Erster Schritt aus Issue #330 Abschnitt 4 („Beta-Repository und Asset-Bereinigung"): Bestandsaufnahme des Alpha-Zustands und Sicherung eines reproduzierbaren Stands. **Es wurde nichts gelöscht und keine Grafik entfernt**; alle Lösch- und Archiventscheidungen bleiben Marcel vorbehalten.

## 1. Reproduzierbarer Stand (Backup)

- **Neu angelegt:** Branch `archive/alpha-snapshot-20261117` als Referenz auf den main-HEAD **77d0a648** (Merge #363, 17.11.2026 08:29 UTC). Zusammen mit dem bereits vorhandenen `archive/alpha-before-beta-20261116` und Tag `td2-20261115` (Release „Bronze-Sockel-Modul & Zauberstab-Abnahme") sind damit drei wiederherstellbare Fixpunkte gesichert.
- Live-Site: https://imbaaalanced-dot.github.io/a/ (Publish-Pipeline grün, `dist/game.js` zum Erstellungszeitpunkt byte-identisch mit main).

## 2. Repository-Struktur und Größen (Tarball main 77d0a64-Vorgänger, 17.11.2026)

| Bereich | Größe | Anmerkung |
| --- | --- | --- |
| `dist/` | 98 MB | ausgelieferte Site, davon `dist/assets/` 96 MB / 500 Dateien |
| `docs/` | 28 MB | inkl. Grafiken, QA-Raster, Releases |
| `source-art/` | 13 MB | Quelldaten, wird nicht ausgeliefert |
| `tests/` + `tools/` | 3,5 MB | QA-Infrastruktur |
| `ansturm-alpha1-5/` | 0,7 MB | Ansturm-Quelle (kopiert nach `dist/ansturm/`) |
| `originals/` | 0,4 MB | Referenz-Originale |

Wurzel: 28 `RELEASE_*.md`-Dateien (alpha-Historie), keine `CHANGELOG.md`.

## 3. Branches (31 gesamt, inkl. neuem Archiv-Branch)

- **Aktiv (nicht antasten):** `assets/ansturm-style2-full-rerender-20261117` (offener PR #364), `diag/hero-chroma-20261117`, `main`.
- **Archive (behalten):** `archive/alpha-snapshot-20261117`, `archive/alpha-before-beta-20261116`, `archive/gh-pages-before-compact-release-20261106`, `archive/gh-pages-before-size-fix-20261106`, `archive/pr325-before-conflict-resolution-20261116`, `archive/superpowers-v3.5.0-alpha.3`.
- **Löschkandidaten nach Review** (gemergte oder überholte Feature-/Review-Branches, jeweils via PR-Historie wieder auffindbar): `art/hero-reference-v6-pair-20261113`, `art/marcel-wand-down-candidates-20261115`, `art/westhofen-v3-bronze-pilot-20261113`, `art/westhofen-v4-tablets-review-20261115` (Inhalt via #313 auf main), `assets/hero-directional-v5-candidate2-20261113`, `assets/style2-impacts-icons-v2-20261021`, `assets/style2-user-towers-1to5-20261020`, `balance/v3.6.0-alpha.5-enemy-pressure`, `chore/td2-autonomous-development-policy-20261109`, `chore/td2-remove-unused-assets-20261109`, `design/equipment-hybrid-boss-loot-20261020`, `design/hero-reference-lock-20261107`, `docs/community-onboarding-20261110`, `docs/td2-v6-menu-gameplay-design-20261113`, `engine/fixed-timestep`, `feat/android-dev-longpress-20261109`, `feat/ansturm-3x-speed`, `feat/dev-activation-overlay-menu-version`, `feat/dev-mode-activation-sound`, `feat/dev-unlock-levels-3x-20261109`, `feat/fal-asset-pipeline`, `feat/v5-developer-mode`, `diag/issue303-qa-20261115` (Diagnose-Beleg zu Issue #303; Log bleibt im Branch, ggf. nur nach Übernahme des Logs in docs löschen).

**Wichtig:** Gelöschte Branches sind über gemergte PRs teilweise nicht vollständig rekonstruierbar. Vor dem Löschen sollte der archivierte Fixpunkt (`archive/alpha-snapshot-20261117`) als Fuse dienen; **kein Löschvorgang ohne Marcels Freigabe** (siehe #330: keine irreversible Löschung vor geprüfter Assetliste).

## 4. Tags und Releases

- Tag/Release: `td2-20261115` (einziges Release). Keine weiteren Tags.
- Empfehlung: vor Beta-Umzug ein Release `alpha-final` mit Archiv-Tarball erstellen (GitHub Releases bewahren das Artefakt unabhängig vom Branch-Ref).

## 5. Offene PRs/Issues (17.11.2026, 08:50 UTC)

- Offene PRs: **#364** (Ansturm-Komplett-Rerender Style 2, in Arbeit).
- Offene Issues: **#330** (dieser Meilenstein). Die P0-Positionen „Inventar mobile" (#345/#348), „Heldenanzeigen" (#344/#347), „Magenta-Artefakte" (#356/#362) und „Marcel-Zauberstab-Referenz" (#355/#363) sind technisch durch gemergte PRs abgedeckt, die Häkchen in #330 stehen noch auf Nutzer-Sichtprüfung aus.

## 6. Asset-Referenzanalyse (`dist/assets`)

**Methodik:** Textscan aller `.js/.html/.css/.json/.svg` unter `dist/` (ohne `dist/assets` selbst) auf Dateibasisnamen; zusammengesetzte Pfade wurden stichprobenartig manuell aufgelöst (z. B. `assets/elemental/'+key+'-style2.webp?v=style2a1'`, `assets/barracks/…-style2.webp`). Komplette Kandidatenliste: `docs/beta-inventar-2026-11-17-unreferenced.csv`.

| Kennzahl | Wert |
| --- | --- |
| Dateien in `dist/assets` | 500 (96 MB) |
| Referenziert (Textscan dist-Runtime) | 99 |
| **Unreferenziert (Obergrenze, inkl. False Positives)** | **401 Dateien / 78,9 MB** |
| Unreferenziert bei erweitertem Scan (dist + tools + tests) | 301 Dateien / 61,2 MB |
| davon direkt in `dist/assets/` (Top-Level) | 30 Dateien / 37,2 MB |

**Bekannte False-Positive-Quellen:** dynamisch zusammengesetzte Namen und per Manifest/Loader erst zur Laufzeit bestimmte Assets. Der Scan ist daher eine **Kandidatenliste, keine Löschliste**; vor jedem Rückschritt muss der Kandidat per Runtime-Request-Log (Chromium-QA, `page.on('request')`) verifiziert werden.

**Größte Blöcke (unreferenzierte Kandidaten):**
- Legacy-`-v1`-Atlanten und Zwischenstände: `asset-atlas.webp` (1,9 MB), `guardian-atlas-v27.webp` (1,2 MB), `church-ende-alpha8.webp`, `lion-ende-alpha8.webp`, `scenery-alpha8.webp`, `monument-level1-v2.webp`, `enemies/walk-v1.webp` (1,7 MB), komplette `-v1`-Sätze unter `assets/elemental/` (4,7 MB).
- Kirchende-Pilot-PNGs: `kirchende/towers-v1.png`, `monument-v1.png`, `mobs-v1.png`, `items-v1.png` (zusammen ~7,7 MB).
- Ballisten-/Mörser-Turmbögen (`tower-ballista-*.png` je 1,7–2,5 MB, `tower-mortar-volcanic-v1.png` 2,4 MB) sowie `tower-cannon-l3-v2.webp`, `tower-warden-shrine-v1.png`.
- Style-2-Zwischenstände: `style2-user-towers-v1/v3/v4` (je Ordner 1,1–5 MB), `style2-reference-impacts/projectiles-v1`.
- Terrain/Hintergrund: `stone-terrain-v27.png` (3,2 MB), `hellscape-map-v1.png` (2,9 MB).
- Menü-Altbilder unter `menu/` (2,9 MB) und `menu/v5-avatars` (1,0 MB, vermutlich durch `canonical-hero-art-v5` abgelöst; vor Archivierung prüfen).
- JSON-Manifeste (keine Runtime-Fetches in dist gefunden): `directional-v410/manifest.json` (0,5 MB), `barracks/atlas-manifest.json`, `barracks/integration-v2.json`, `elemental/flight-manifest.json`, `elemental/goethestrasse-manifest.json`, `barracks/README.md`.

**Ausdrücklich behalten (trotz Scan-Differenz):**
- `dist/assets/hero/voice/` (1,1 MB, MP3-Voice-overs) — benötigt für den offenen P1-Punkt „Voice-over-System" aus #330.
- `originals/` und `source-art/` — Quelldaten außerhalb der Auslieferung.
- Alle in #330 P1 (Dokumentationsgrafik) genutzten oder geplanten Referenzfotos.

## 7. Empfehlung: Beta-Repository-Strategie

**Empfehlung: Bereinigung des bestehenden Repos** statt Neuaufbau.

- *Dafür:* Git-Historie (Entscheidungs- und Review-Trail der Alpha), Issues #252/#303/#330 mit Abnahmekommentaren, funktionierende CI/Publish-Pipeline und Releases bleiben erhalten; `dist/assets`-Bereinigung reduziert die ausgelieferte Site direkt um geschätzt 50–70 MB; Risiko eines Übertragungsfehlers entfällt.
- *Neues schlankes Repo nur falls:* klare Trennung „Archiv-Repo vs. Beta-Repo" gewünscht ist. Dann: Archiv-Repo als Fork/Klon mit vollen Historie + Tag `alpha-final`, Beta-Repo mit neu gegliederter latest tree-Struktur (dist, tests, tools, docs-selection), Issues via Übertragung („Beta-Tracking") neu anlegen.
- Vorgehen in jedem Fall: (1) Asset-Matrix mit Vorschaubildern (Behalten/Überarbeiten/Archivieren/Löschen) aus der CSV erzeugen, Marcel entscheidet; (2) Lösch-/Archivierung in kleinen verifizierten PRs mit Runtime-Request-Log je Kandidat; (3) erst danach Beta-Release-Schnitt.

## 8. Offene Punkte (nächste Schritte)

1. Asset-Matrix mit Vorschaubildern aus `…-unreferenced.csv` erzeugen und Marcel zur Entscheidung vorlegen.
2. Branch-Löschliste aus Abschnitt 3 freigeben lassen; danach obsolete Branches entfernen.
3. Vor Beta-Schnitt: Release `alpha-final` mit Archiv-Artefakt.
4. Beta-CI-Katalog aus #330 Abschnitt 4 in ein eigenes Workflow-Set überführen (Asset-Checks, Desktop/Touch, Mobil-Hochformat, FPS/RAM Android 4 GB, 404/JS-Fehler, Audio-Unlock, Menü, Heldenatlanten). Physische Android-4-GB-Abnahme bleibt wie bisher separate, auszuweisende Aufgabe.

---
Methodik und Zahlen: Stand 17.11.2026, main 77d0a648 (Analyse-Tarball vom Vorgängerstand; Assetbestand unverändert). Erstellt im Rahmen von #330.