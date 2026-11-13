# Denkmal TD2 · Level 7 Westhofen · Produktionsstufe 2 (13.11.2026)

**Status: Asset-Vorbereitung, nicht integrierter oder freigegebener Build.**

## Materialprüfung

Die zuletzt im Chat erzeugte Tafel **„Level 7 Westhofen · Asset-Pack · Produktionsstufe 2“** ist ein stimmiges **Konzeptbild**. Trotz der eingeblendeten Bezeichnung „transparent“ sind die Elemente in einer komponierten Grafik auf dunklen Feldern mit Beschriftungen dargestellt. Die visuelle Bezeichnung ist **kein technischer Alphakanalnachweis**.

**Entscheidung:** Die Konzepttafel nicht direkt als Sprite, Atlas oder Boden-Textur importieren. Kein automatischer Hintergrundentferner, der Pfeiler, Efeu und Helm mitschneidet. Die erzeugten Helm-„Animationsframes“ sind künstlerische Darstellungen; ein **unbewegliches Denkmal** braucht ohne nachgewiesene Gameplayanforderung keine animierte 8-Frame-Helmserie.

### Verbindlicher Bildinhalt

Die vom Nutzer hochgeladenen Fotos und das Video sind die **Geometrie-/Materialreferenz**, nicht die fiktiven Ausbaustufen der Konzepttafel. Der historische Zielzustand im bestehenden Level-7-Build ist die **leere mittlere Tafelfassung und keine Feuerschalen** nach dem 2026 dokumentierten Diebstahl. Keine brennenden Schalen, zusätzlichen Reliefs oder ausgedachten lesbaren Inschriften einsetzen. Die Bedeutung der Seitenornamente bleibt gemäß Issue #218 offen.

### Modulare Produktion, getrennt von Runtime

Externe freigestellte Quellen sollen als echte **768×512-RGBA-PNGs** in einem Koordinatensystem erstellt werden. Jedes Bild hat identische Canvas-Abmessung und transparenten Hintergrund; Standfüße/Pivots werden über alle Layer konsistent am bestehenden Monumentanker ausgerichtet.

| Layer | Dateiname (lokal, nicht in Git) | Notwendiger Inhalt | Hinter-/Vordergrund |
| --- | --- | --- | --- |
| 1 | `stone-frame.png` | Steinpfeiler, Querbalken, seitliche Bronzetafeln, verwitterte Fugen, Efeu als optionales Overlay | hinten |
| 2 | `altar-and-steps.png` | Sockel, Treppen, **leere Mitteltafelfassung**, leere Podeste | Mitte |
| 3 | `bronze-emblem.png` | aufrechte Flügel, Helm, breiter runder Schild, horizontal liegendes Schwert | vorne |

**Wichtig:** Das alte v1-Bild ist 768×512; der Renderer zeichnet das fertige Bild mit `450×300` an `m.x-225, m.y-265`. Der neue Kandidat muss diese Geometrie exakt respektieren. Zum Erstellen neuer transparenter Layer **nicht** den kompletten beschrifteten Konzeptbogen zurechtschneiden und als transparent deklarieren. Historische Details vor Erzeugung mit `docs/graphics/westhofen-live-sprite-reference-audit-20261112.md` abgleichen.

## Reproduzierbarer (noch nicht freigebender) Export

```bash
python tools/build-westhofen-candidate.py \
  --frame /private/td2-westhofen/stone-frame.png \
  --altar /private/td2-westhofen/altar-and-steps.png \
  --emblem /private/td2-westhofen/bronze-emblem.png \
  --out /tmp/td2-westhofen-v2-qa
```

Das Werkzeug erzeugt bei bestandenem **Pixelgate** ausschließlich außerhalb von `dist/`:
- `westhofen-memorial-candidate-v2.webp` als 768×512-RGBA-WebP mit unter 160.000 Byte Downloadbudget;
- `westhofen-v2-64-128-review.png` mit 64-/128-Pixel-Ansichten auf dunklem und hellem Hintergrund;
- `report.json` mit Quellen-Hashes, sichtbarem Alpha-Umriss und Status `pixel-pass-visual-review-pending`.

Bei falschem Format, RGB-Hintergrund, falschen Pixelmaßen, abgeschnittener Sichtkontur oder zu hohem Dateibudget wird der Kandidaten-Export blockiert und `report.json` enthält den Grund. **Ein Pixelpass ist keine historische oder visuelle Freigabe.**

## Geprüfte und offene Gates

- [x] Vorhandenen V1-Sprite und Renderer-Geometrie im GitHub-Repository nachvollzogen (siehe PR #221).
- [x] Konzepttafel als **nicht direkt einbaufertig** klassifiziert.
- [x] Ein deterministischer nicht-destruktiver Kandidaten-Composer und synthetische Regressionstests erstellt.
- [ ] Tatsächlich separat erzeugte, referenztreue transparente Quell-PNGs liegen vor.
- [ ] Einen V2-Kandidaten aus den echten Quellbildern exportiert und real anhand `report.json` bestanden.
- [ ] Optische Abnahme von 64/128 px sowie Vergleich vor hellem/dunklem Boden und im Hochformat.
- [ ] WebP, Alpharänder, tatsächlicher Anker und 3:2-Form in Chromium nachgewiesen.
- [ ] Reales Android-Gerät (4 GB RAM): FPS/RAM/Touch/Cache/Langlauf getestet.
- [ ] Erst nach allen entsprechenden Tests und Freigaben: **neue Datei** in `dist/assets/westhofen/`, Loader-/Cache-Key-Änderung in einem separaten Runtime-PR.

Diese Dokumentation führt **keine** neue Gameplay-Mechanik und keine Monument-Upgrades ein. Keine Originalfotos oder Videoframes des Nutzers in öffentliche Git-Dateien übertragen.

## Quellen

- `docs/graphics/westhofen-live-sprite-reference-audit-20261112.md` (PR #221)
- `docs/graphics/westhofen-user-photo-references-20261112.md`
- `docs/graphics/westhofen-video-reference-pass-20261112.md` (PR #217)
- `dist/westhofen-art.js`, `dist/levels.js`
- Historische Statusrecherche: [Issue #218](https://github.com/imbaaalanced-dot/a/issues/218).
