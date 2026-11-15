# Level 4: Grabsteine nach Fotoreferenz

Vier eigenständige Grabsteinformen ergänzen den alten Kirchhof der Ender Dorfkirche. Das Atlasbild ist eine stilisierte Spielgrafik nach den vom Projektinhaber bereitgestellten Friedhofsfotos, keine Transkription einzelner Grabinschriften.

- Generierung: integrierte Bildgenerierung, 14. November 2026.
- Ausgang: 1312 × 1199 RGBA-PNG; vier freigestellte Varianten in einem 2×2-Raster.
- Runtime: `dist/assets/level4/graves-style2-20261114.png`, 1024 × 1024 PaletteAlpha-PNG mit 94 Farben, 227643 Byte; SHA-256 `7329d5cf4bf9fa05198d56829ee401e0c85c778414a6175695a78ae4e9349001`.
- Atlas: vier feste 512 × 512 Felder; gerundeter Stein, beschädigter Spitzbogen, dreilappiger Stein und schmale gebrochene Platte.
- Promptkern: verwitterter braun-grauer Sandstein, zurückhaltendes Moos/Flechten, erhöhte 2.5D-Kamera, weiches Licht von links oben, keine lesbaren Inschriften, Kreuze oder modernen Oberflächen, transparenter Hintergrund.
- PNG bleibt absichtlich erhalten: Der lokale WebP-Export verfälschte die transparenten RGB-Ränder dieses Atlas. Die geprüfte, für den Runtime-Einsatz palettenoptimierte PNG-Darstellung zeigt keine Farbschlieren oder störenden Farbstufen.
- Die Grafik lädt erst beim Zeichnen von Level 4. Bis zum erfolgreichen Dekodieren bleibt die bisherige prozedurale Darstellung aktiv.
- Positionen, Wege, Bauplätze, Kollisionen, Wellen und Speicherstände bleiben unverändert.

Offen: Chromium-Sichtprüfung bei Desktop- und Touch-Auflösung sowie echte Android-Abnahme.
