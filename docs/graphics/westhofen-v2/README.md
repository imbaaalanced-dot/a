# Westhofen V2: modulare Sprite-Quellen (13.11.2026)

**Status: Produktionsvorlage, keine fertig abgenommene Spielgrafik.**

Dieses Paket ist eine bewusst **eigenständig gezeichnete, transparente SVG-Quellkonstruktion** mit drei unabhängig bearbeitbaren Ebenen, einem 768×512-Komposit und einem Validierungstest. Es handelt sich **nicht** um aus den Fotos freigestellte Pixel oder um eine vermessungsgerechte Rekonstruktion. Das bisherige `dist/assets/westhofen/westhofen-memorial-style2-v1.webp` wird unverändert weiterverwendet.

## 2.5D-Art Direction
- Steinrahmen: vier gegliederte Quaderpfeiler, offener Durchblick, horizontaler Balken, Efeu als separater Teil, zwei erhaltene Seitentafeln.
- Altar/Treppen: heller verwitterter Stein, Fugen, breit gestaffelte Stufen; **leere mittlere Tafelfassung** und zwei **leere** Feuerschalenpodeste (Zeitstatus nach dokumentiertem Diebstahl 20.07.2026, nicht als Beweis aktueller Restaurierung).
- Bronzeemblem: zwei deutlich **aufrechtere** Flügel, größerer breiter rund-ovaler Schild, waagerechtes Schwert, dunkelgrau-grüne Patina; keine fiktiven Inschriften.
- Keine kopierten Nutzerfotos oder Videoframes, keine HTML/JS-Skripte oder externen Bilder im SVG.
- Gemeinsamer `viewBox="0 0 768 512"`, Layerreihenfolge Rahmen → Altar → Bronzeemblem; keine eingebrannte Kartenlandschaft.

## Die vier Grafiken

| Datei | Inhalt |
| --- | --- |
| [westhofen-frame-v2.svg](westhofen-frame-v2.svg) | Steinpfeiler, Querbalken, seitliche Tafeln und Efeu |
| [westhofen-altar-steps-v2.svg](westhofen-altar-steps-v2.svg) | Mittelsockel, leere Tafelfassung, Treppen und leere Schalenpodeste |
| [westhofen-emblem-v2.svg](westhofen-emblem-v2.svg) | Helm mit aufrechteren Flügeln, Schwert, breiter Schild |
| [westhofen-composite-v2.svg](westhofen-composite-v2.svg) | Quellbild mit allen drei zusammengeführten Ebenen |

## Was jetzt noch nötig ist

1. SVGs in einem geeigneten Renderer visuell öffnen. Perspektive, Bildkomposition und getreue Silhouette mit den sieben Fotos und Zeitcodes überprüfen. SVG-Quellen **nicht** als fertig gerendertes WebP ausgeben.
2. RGBA-PNG mit 768×512 und echten Alpha-Rändern exportieren. Bei WebP auf 64/128 px gegen echte Referenz sowie den bisherigen Sprite prüfen, inklusive Heiligenschein-/Fransenprüfung auf dunklem und hellem Boden.
3. Priorität: Helmflügel-Winkel, Schildgröße, Seitenrelief. Die Seitenreliefs sind **noch nicht historisch ikonografisch identifiziert**; deshalb enthalten die SVGs keine erfundenen Namen oder genaue Reliefszene. Diese wird erst nach gesicherten Quellen als eigenes Detail ergänzt.
4. Einzelne SVG-Quellen **nur für Produktion**, keine vier parallelen Runtime-Downloads. Für die Runtime **ein** vorgerendertes 768×512-WebP mit bestehendem World-Pivot und `drawImage`-Größe 450×300.
5. Das laufende `westhofen-art.js` und das bestehende V1-WebP bleiben in diesem PR unverändert; neue Runtime-Datei, Cache-Key- und Loaderwechsel müssen in einem **separaten** Integrations-PR nach Tests erfolgen.
6. Alle realen Android-4-GB-Tests, Chromium-Browser-Screenshots, historische Quellenlage und Asset-Performance gesondert abnehmen. Wenn ein Gate fehlt: nicht nach `main` für die Runtime freigeben.

## Kontrolle

`python tests/westhofen-v2-source.test.py` validiert SVG-XML, Layer-IDs, 768×512, eingebettete Schrift-/Rasterfreiheit, Unabhängigkeit vom Netzwerk und kein Text im zusammengesetzten Sprite. Dies ist eine **strukturelle**, keine optische Abnahme.

Verweise: `docs/graphics/westhofen-live-sprite-reference-audit-20261112.md`, `docs/graphics/westhofen-user-photo-references-20261112.md`, `dist/westhofen-art.js`, Issue #218 (noch fehlender datierter Zustand nach Juli 2026).
