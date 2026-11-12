# Denkmal TD2 · Heldenanimationen QA v3

Stand: 12. November 2026. Basis: ursprüngliche Grafikquellen + lokales QA-v2-Archiv. Dieser Bericht autorisiert **keine** Grafikänderung im produktiven Runtime-Manifest.

## Lokal reproduzierbar korrigiert

- 108 RGBA-Einzelbilder (128 × 128 Pixel) und sechs WebP-Atlanten (768 × 768 Pixel) erneut gepackt.
- 27 Frame-Ersetzungen aus bereits vorhandenen Posen: 15 Angriffsperspektiven/Skalen, vier Blickrichtungs-Übergänge in Treffer/Tod und acht gestufte Todesanimationen.
- Alle 108 PNGs ohne leere Frames, unzulässige Zellränder oder versteckte RGB-Reste in vollständig transparenten Pixeln; sechs WebP-Atlanten dekodierbar.
- Angriff/Treffer 0=5 sowie Tod 4=5 sind **bewusste Ruhe-/Endposen**, nicht fehlerhafte Duplikate. Identische **mittlere** Frames gelten dagegen als Fehler.
- Ein zusätzlicher Motion-Gate-Test in `tools/pack-hero-action-directions.py` verhindert solche unerwarteten Wiederholungen und besonders abrupte Todes-Sprünge (mehr als 52 Pixel sichtbare Höhenänderung von einem Frame zum nächsten).

## Nicht behoben / Freigabe gesperrt

- **Marcel:** Der unfreigegebene Originalbogen zeigt einen blau umhangenen Schildritter ohne verbindliche Kapuze und blaue Laterne. Das ist ein Identitätskonflikt, kein Alpha-/Interpolationsfehler; vollständig neue, referenztreue Posen erforderlich.
- **Kim:** Mehrere Bogenspann-/Abschussphasen sind nur programmatisch abgeleitet, nicht eigenständig illustriert. Ihre perspektivische Bewegung und die Todesphase müssen von einer visuellen QA abgenommen werden.
- Die neuen Zwischenphasen sind **kein Ersatz für echte animierte Schlüsselposen**. Es wurden keine 27 unabhängigen Zeichnungen erzeugt.
- Die QA-v3-Atlanten wurden nicht in `dist/assets/hero` eingetragen und nicht live geschaltet; das lokale ZIP bleibt eine unfreigegebene Alternative zum bisherigen Paket.
- Chromium, Android-Geräteabnahme (4 GB), Langzeittest und veröffentlichtes Build wurden für diese lokalen Pixel nicht ausgeführt.

## Freigabekriterium

Für **jede** neue Richtungsdatei sind technische Gate-Prüfung, visuelle Identitäts- und Perspektivabnahme, Laufzeittest in Desktop-/Touch-Chromium und die getrennte Android-4-GB-Abnahme zu protokollieren. Ein erfolgreiches CI-Ergebnis des **QA-Codes** ist keine Freigabe der **Grafiken**. Verknüpft: Issue #205.


## Visuelle Nachkontrolle: QA v4 als konservativer Nachfolger

Die anschließend geprüfte QA-v3-Variante enthielt einige **nur gedrehte/skalierte** Ersatzposen, die gezeichnete Bogen- und Schwerthiebe verdeckten und bei Tod teilweise unnatürlich schwebten. Diese Ersetzungen sind **verworfen**.

**QA v4** ist der konservative lokale Nachfolger: nur zehn Blickrichtungs-Korrekturen an verdrehten Attack-/Hit-/Death-Frames, 108 PNG-Frames und sechs WebP-Atlanten bleiben erhalten. Originale Schlag-, Bogen- und Todesposen sind ansonsten unverändert. Der Pixel-Gate-Test ist lokal bestanden, das visuelle Gate bleibt **HOLD**. V4-Archiv-SHA256: `0c0d3b9afb1a331431736af16a2d7abff016d29356606904590d0b7db72861db`.

Art-Blocker bleiben: Marcel (fehlende Kapuze/blaue Laterne), perspektivische Angriffsaktionen, unzureichend gezeichnete Bewegungsübergänge. Weder QA v3 noch QA v4 wurde live eingebunden; beide bleiben nur lokal im Chat verfügbar.
