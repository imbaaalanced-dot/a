# Marcel · Kristallstab-Menüporträt – Beta #330

Stand: 17.11.2026 · **Auswahlrichtung Kristallstab ausdrücklich freigegeben; diese nachträglich überarbeitete Bildvariante wartet noch auf die abschließende Sichtfreigabe und technische Prüfung im Draft-PR.**

## Umfang
- Nur Startmenü: ausgewählter Marcel als Hauptfigur, Marcel als Nebenfigur, wenn Kim ausgewählt ist.
- Kim behält `kim-marksman-v6.webp` mit Bogen.
- **Nicht verändert:** `TD2CanonicalHeroArt`, bestehende HUD-, Inventar-, Story- und Spielfigurenporträts, Walk-/Angriffsatlanten, Balancing, Spielstände und Spielmechanik.
- Grund: Keine schleichende Übernahme eines großen Portraits als kleines Gameplay-Sprite.

## Quelle / Export
- Neue überarbeitete Kandidatengrafik mit blauem Kristallstab, ohne Schwert oder Schild.
- Separate mobile Menü-Variante: `dist/assets/menu/v6/marcel-wand-menu-portrait-20261117-refined.webp`.
- Technischer Export: 384 × 576 px, transparentes WebP, 35.682 Bytes.
- SHA-256: `0a28d5e0bac6fabc9ac8da986467f07f15f728161118777590b18c12d38d6cf5`.
- Überarbeiteter Original-Master (1024 × 1536 PNG) bleibt außerhalb des Runtime-Repositories im ursprünglichen Bildpaket erhalten.

## Prüfgates
1. Statische Asset-, Fingerprint-, Cache- und Menü-/HUD-Isolationstests.
2. Echte Chromium-QA für Portrait-Touch 390×844, Landscape-Touch 844×390 und Desktop 1280×800, jeweils Marcel und Kim. WebP-Decode 384×576, kein 404/JS-Fehler, beide Charaktere im Menü sichtbar, korrekte Figurenwechsel, Screenshots, unveränderte Gameplay-Atlanten und unverändertes kanonisches HUD-Porträt.
3. Sichtprüfung der sechs Menü-Screenshots vor Merge, besonders Überlappung/Kristallstab und Beschriftung.
4. Physische Android-/WebView-Abnahme (4 GB RAM) separat und ohne simulierte Bestätigung.

## Sicherheit
**Bildvariante vor Merge erneut visuell abnehmen; nicht automatisch mergen, keine Beta-Veröffentlichung, keine alten Grafiken löschen.**
