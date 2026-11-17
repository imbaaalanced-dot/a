# Marcel · Kristallstab-Menüporträt – Beta #330

Stand: 17.11.2026 · **Künstlerische Auswahl vom Projektinhaber ausdrücklich freigegeben, technische Integration noch im Draft-PR.**

## Umfang
- Nur Startmenü: ausgewählter Marcel als Hauptfigur, Marcel als Nebenfigur, wenn Kim ausgewählt ist.
- Kim behält `kim-marksman-v6.webp` mit Bogen.
- **Nicht verändert:** `TD2CanonicalHeroArt`, bestehende HUD-, Inventar-, Story- und Spielfigurenporträts, Walk-/Angriffsatlanten, Balancing, Spielstände und Spielmechanik.
- Grund: Keine schleichende Übernahme eines großen Portraits als kleines Gameplay-Sprite.

## Quelle / Export
- Freigegebene neue Grafik mit blauem Kristallstab, ohne Schwert oder Schild.
- Separate mobile Menü-Variante: `dist/assets/menu/v6/marcel-wand-menu-portrait-20261117.avif`.
- Technischer Export: 448 × 672 px, transparentes AVIF, 17.687 Bytes.
- SHA-256: `49cbffd9363b7498eb20bca19227082115ae18306888dfa9379dbfdb25fc567e`.
- Original-Master (1024 × 1536 PNG) bleibt außerhalb des Runtime-Repositories im ursprünglichen Bildpaket erhalten.

## Prüfgates
1. Statische Asset-, Fingerprint-, Cache- und Menü-/HUD-Isolationstests.
2. Echte Chromium-QA für Portrait-Touch 390×844, Landscape-Touch 844×390 und Desktop 1280×800, jeweils Marcel und Kim. AVIF-Decode 448×672, kein 404/JS-Fehler, beide Charaktere im Menü sichtbar, korrekte Figurenwechsel, Screenshots, unveränderte Gameplay-Atlanten und unverändertes kanonisches HUD-Porträt.
3. Sichtprüfung der sechs Menü-Screenshots vor Merge, besonders Überlappung/Kristallstab und Beschriftung.
4. Physische Android-/WebView-Abnahme (4 GB RAM) separat und ohne simulierte Bestätigung.

## Sicherheit
**Nicht automatisch mergen, keine Beta-Veröffentlichung, keine alten Grafiken löschen.**
