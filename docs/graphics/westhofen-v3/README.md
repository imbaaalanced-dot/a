# Westhofen V3 — Bronzeemblem-Pilot

**Status: SOURCE PILOT, NICHT IM SPIEL AKTIV, NICHT VISUELL FREIGEGEBEN.**

## Grundlage

Verbindliche visuelle Detailreferenz sind die intern bereitgestellten Originalaufnahmen des Westhofener Denkmals: Nahaufnahme Flügelhelm/Schild/Querschwert und Originalfrontansicht. Diese Fotos sind **nicht** in diesem öffentlichen Repository enthalten; die Aufnahmezeitpunkte sind nicht verifiziert. V2-Chromium-Auswertung und priorisierte Abweichungen: [PR #251](https://github.com/imbaaalanced-dot/a/pull/251), [Issue #252](https://github.com/imbaaalanced-dot/a/issues/252).

## Grafik-Änderung gegenüber V2

- Helmflügel weniger lang und V-förmig, mit gebogener Außenkontur und separaten Federrippen.
- Schild breiter und flacher oval, mit plastischen Kanten und knapper Reliefzeichnung.
- Waagerechtes Schwert hinter Schild, mit sichtbarer linker Griffwicklung und Klinge.
- Helmöffnung/Backenstücke beim kleinen Sprite deutlicher lesbar.
- V2-Mauerwerk, Altar, Stufen und leere zentrale Tafelfassung **unverändert**. Deren Detailkorrektur folgt separat; keine historischen Schriftzüge oder zusätzlichen Feuer-Objekte.

## Dateien

- `westhofen-emblem-v3.svg`: neue, separat renderbare 768×512-RGBA-kompatible SVG-Lage.
- `westhofen-composite-v3-candidate.svg`: nur für die QA zusammengesetzter Kandidat mit unverändertem V2-Steingerüst.
- `../../tests/westhofen-v3-bronze-source.test.py`: Sicherheits-/Kompositionsvertrag.
- `../../tools/export-westhofen-v3-bronze.py`: 64-/128-Pixel-Vergleiche, dunkle/helle Hintergründe, Vollgröße und Alpha-Rand-Checks.

## Status und Abnahmekriterien

1. Technische SVG-Parsing-, Transparenz-, Rand- und Vergleichsexporte.
2. **Manuelle** Sichtprüfung der tatsächlichen V3-Pixelbilder gegen die Detailfotos.
3. Falls nötig: Referenzkorrektur von Schild-/Federproportion und Materialwirkung.
4. Erst nach eigenständiger Freigabe in einem **neuen** Integrations-PR Runtime-Asset und Loader ändern und in realem Desktop-Chromium / Touch-Emulation abnehmen.
5. Physische Android-Prüfung mit 4 GB RAM separat. Keine ungeprüften FPS-/RAM-Aussagen.

Bestehende V1/V2-Assets, Cache-Keys, Spielstände und `dist/` bleiben unverändert. Kein Merge und kein Deployment ohne zielbezogene Freigabe.
