# QA: Ansturm Style-2-Voll-Rendering (v6-style2full1) – Stufe 2 Browser

Headless-Chromium-Lauf (playwright-core, chromium headless shell) gegen lokalen
Loopback-Server (`dist/` auf 127.0.0.1), Desktop 1280×800 und Mobile 412×915 (Touch).

## Ergebnis

- 59/59 WebP-Requests HTTP 200, 0 Page-Errors, 0 `requestfailed` (Runtime-Laden der neuen Assets nachgewiesen)
- Spiel startbar, Tutorial überspringbar, Tempo-Shops klickbar; bis **Welle 2 mit aktiven Gegnern** gespielt
- Screenshots: `desktop-intro.webp` (Intro-Szene + Crest), `desktop-game.webp` (Arena: Denkmal mit türkisem Runenlicht, Waffen-Sprites im Ring, Gegner mit roten Akzenten, Reichweitenring), `mobile-full.webp` (Hochformat, Shop-Karten mit Bronze-Icons)
- Maschinelle Sichtprüfung der Screenshots: keine Magenta-Reste, keine fehlenden/geclippten Sprites, keine Opaque-Boxen
- Details: `report.json`

## Grenzen

Stufe 2 (Chromium-Smoke) – **keine** physische Android-Abnahme (Stufe 4 offen),
keine FPS/RAM-Messung auf echtem Gerät. Verifiziert gegen den Branch-Stand
`0ccfcdb` (PR #364, nach Merge auf `main` d0b1731 identisch in `dist/ansturm/`).
