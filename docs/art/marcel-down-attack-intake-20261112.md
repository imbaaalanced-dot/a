# Denkmal TD2 V5 · Marcel, Angriff nach unten (Sprite-Eingangsprüfung)

Stand: 12. November 2026 · Issue #205 · **kein freigegebener Runtime-Sprite**.

## Verbindliche Vorlage

`docs/art/HERO_REFERENCE_LOCK_20261107.md` hat Vorrang vor Stimmungsbildern und zufälligen Varianten: schwarze Kappe mit weißem Zeichen, dunkelblauer Kapuzenpullover mit weißen Streifen, verwitterte braune Leder-/Metallrüstung, graue Sneaker, verziertes Schwert und Löwenschild. Marcel bleibt der Beschützer. Die aktive V5b-Aktionsseite ist nach rechts gerichtet; der fehlende Angriff nach unten darf nicht einfach gespiegelt oder aus Laufbildern umbenannt werden.

## Neuer, bewusst nicht übernommener Entwurf

Der im Chat erzeugte Bildbogen mit dem Titel „HELDENANIMATIONEN – KOMPLETTPAKET V5“ wirkt wie ein beschriftetes Präsentationsboard. **Die auf dem Bild gedruckten grünen Haken sind keine QA-Nachweise.** Nach lokaler Pillow-Inspektion hat die Datei 1536×1024 Pixel, nominell RGBA, aber Alpha-Minimum 1 und Maximum 253 (kein vollständig transparentes Pixel und kein vollständig deckender Pixel). Der lesbare Hintergrund reicht bis an die Bildkanten. Die versprochene freigestellte 3×2-Sechsbilddatei liegt damit nicht vor. Außerdem entspricht die dargestellte Figur mit roter Kapuze und anderer Rüstung nicht dem Identitäts-Lock.

Ergebnis des lokalen neuen Gate-Laufs: `pixel_gate=hold`, 6 untersuchte Rasterzellen, in **jeder** Zelle fehlender echter transparenter Hintergrund, fehlende harte Vordergrundpixel, berührte Zellränder und nicht transparente Ecken. Es wurden keine Frame-Dateien aus diesem Bild exportiert. Das Bild selbst wird nicht in das GitHub-Repository aufgenommen.

## Implementierte sichere Vorbereitung

- `tools/verify-hero-attack-sheet.py`: nimmt zukünftige **PNG-RGBA-Bögen im echten 3×2-Raster** mit quadratischen 256–1024-px-Zellen an; prüft Alphatransparenz, freigestellte Zellränder, Fußpivot und sichtbare Silhouettendiversität.
- Ohne `--write-candidates` ist die Prüfung lesend. Expliziter Export schreibt genau sechs PNGs à 128×128 unter `<output-root>/<held>/<richtung>/attack/00.png…05.png`. Bereits vorhandene Zielordner werden nicht überschrieben.
- Status ist immer `art_approval=manual-required`, selbst bei bestandener Pixelprüfung. Auch ein guter Angriff allein vervollständigt **nicht** den 6×6-Aktionsatlas: Hit und Death mit je sechs Frames fehlen noch.
- `tests/hero-attack-sheet-intake.test.py`: positive synthetische 6-Frame-Sequenz, negative Tests für durchgehend eingefärbten Hintergrund, bloße Farbänderungen, falsches Raster und Überschreibschutz.
- Die bestehende CI führt den Test aus und triggert die Canonical-Hero-Chromium-QA bei Änderung des neuen Prüfers.

## Ablauf mit künftigem echten 3×2-Bogen

```bash
python tools/verify-hero-attack-sheet.py \
  --hero marcel --direction down \
  --file path/to/marcel-down-attack-3x2.png
```

Nur wenn `pixel_gate=pass` **und nach gesonderter visueller Identitätsabnahme**:

```bash
python tools/verify-hero-attack-sheet.py \
  --hero marcel --direction down \
  --file path/to/marcel-down-attack-3x2.png \
  --write-candidates \
  --output-root source-art/hero/actions-v5
```

Danach die noch fehlenden Hit-/Death-Zeilen mit eigenen Referenzposen zeichnen, `tools/pack-hero-action-directions.py` auf dem kompletten Satz ausführen, `tools/verify-hero-direction-candidate.py` prüfen und zunächst nur einen Opt-in-Spieltest mit Desktop-/Touch-Chromium durchführen. Echte Android-Abnahme (4 GB RAM) bleibt ein eigener Schritt.

**Sicherheitsgrenze:** keine Änderungen an `dist/assets/hero`, den aktiven Manifesten, Save-Keys, Leveln oder Kampfregeln. Es wird weder ein vollständiger Heldenatlas noch ein fertiges Art-Paket behauptet.
