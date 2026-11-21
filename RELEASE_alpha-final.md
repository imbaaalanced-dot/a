# Denkmal TD2 · Alpha Final (21.11.2026)

Vollständiger, reproduzierbarer Abschlussstand der Alpha vor dem Beta-Schnitt, wie in der Bestandsaufnahme (docs/beta-inventar-2026-11-17.md, Abschnitt 8) empfohlen. Release-Tag: `alpha-final` auf main `9430cd9` (Intro-Cutscene-Merge; Notes-Update darueber hinaus). Spielbar: https://imbaaalanced-dot.github.io/a/ (Publish verifiziert, Live-Dateien byte-identisch mit main).

## Beta-Vorbereitung seit dem 17.11.2026 (Issue #330)

- **Bestandsaufnahme & Sicherungen:** Inventar mit 500-Datei-Asset-Scan (PR #365), Archiv-Fixpunkte `archive/alpha-snapshot-20261117` und `archive/alpha-snapshot-20261118`, Backup-Tags `alpha-branch-backup/*`.
- **Asset-Matrix & Bereinigung:** 401 Unreferenz-Kandidaten mit visuellen Vorschauen (PR #373); Freigabe-Verifikation über drei Stufen (Textscan, Template-/Manifest-Analyse, empirische Lösch-Testung); 24 tatsächlich unbenutzte Legacy-Assets entfernt, 377 als test-/runtime-gesichert behalten (PR #376); 23 überholte Branches gelöscht, alle Köpfe als Backup-Tags gesichert.
- **Beta-CI:** Eigenes Workflow-Set `td2-beta-ci.yml` (Unit/Mobile, Asset-Gates, Browser-QA) mit Katalog `docs/beta-ci-katalog-2026-11-18.md` (PR #374), Audio-Unlock-Gate inkl. statischem Pin (PR #375).
- **Audio (P1):** Aufgenommene Heldenstimme priorisiert verdrahtet mit TTS-Fallback (PR #377); Schuss-/Einschlag-/Zauber-SFX über den Burst-Pfad (PR #378); Audio-Unlock-Verkabelung per Gate abgesichert.
- **Lesbarkeit (P1):** Zoom-Kompensation fuer Projektile und Treffer-Ringe auf mobil-weitem Hochformat (PR #379/#380), Desktop unveraendert.
- **Ansturm (P1):** Prozedurale Laufanimation aller Gegner aus Einzelbild-Sprites (PR #381) und Angriffs-Tells mit Monument-Trefferblitz (PR #382); Intro-Cutscene nach VERTEIDIGUNG STARTEN mit deploybaren Clips (PR #371, Paritaetsspiegel byte-identisch).
- **Audio-Ausbau:** Gemeinsame Lautstaerkestufen 100/70/40 % quer ueber WebAudio-SFX, MP3-Stimme und TTS mit abwaertskompatibler Persistenz (PR #384).
- **Held:** Marcel-Runtime-Blaetter side/left/up inkl. Walk neu gegen die Zauberstab-Referenz produziert (PR #383).
- **Doku & Betrieb:** Echter Gameplay-Screenshot im README aus der Chromium-QA (PR #385), Abnahmekatalog fuer die physische Android-4-GB-Pruefung (PR #386), Intro-Ship-Guard gegen 404-Regressionen (PR #387), Beta-Schnitt-Tracking-Issue #388 samt gh-pages-Vollbackup-Tag.
- **Perf:** sqrt-freie Hot-Loop-Distanzchecks (#315), Save/Restore-Reduktion (#361), nur ein aktiver Style-2-Turmrenderer (#370).

## Verifikation

- Vollständige Test-Batterie grün: alle `tests/*.test.cjs` (inkl. `TEST_MOBILE=1`), alle `tests/*.test.py` (38/38), Ansturm 92/92.
- CI auf main grün (Test, Publish, CodeQL, Beta-CI-Gates, Desktop/Touch- und Hero-Browser-QA).
- Live-Site nach jedem Merge geprüft; finaler Vollaudit: **633/633** dist-Dateien byte-identisch zur Auslieferung (0 diff, 0 fehlend). Zusaetzlich 3.931 nur auf gh-pages existierende Legacy-Dateien via Tag `alpha-ghpages-backup-20261121` gesichert.

## Bekannte Grenzen (kein Anspruch darüber hinaus)

- Keine physische Android-4-GB-Abnahme in diesem Zyklus; FPS/RAM-Aussagen beruhen auf CI-Chromium-QA und Budget-Tests.
- Offene visuelle Abnahmen und Grafik-Entscheidungen (Denkmalrotation, Terrain-Realismus, Ansturm-Gegneranimationen) bleiben Marcel vorbehalten und sind Teil der Beta-Arbeit, nicht dieses Abschlusses.
- Nachfolgende Tiefenbereinigung weiterer Asset-Blöcke erfordert vorher Test-Updates plus Runtime-Request-Logs je Kandidat.

## Archiv

Release-Artefakt: vollständiger Quell-Tarball dieses Stands (`denkmal-td2-alpha-final.tar.gz`). Erhältlich unabhängig vom Branch-Ref über dieses Release.
