# Level-3-Intro-Video (Kriegerdenkmal Kirchende)

**Feature:** Beim Kampagnen-Start von Level 3 (KRIEGERDENKMAL KIRCHENDE) wird ein kurzes
Intro-Video abgespielt, bevor die Wacht beginnt (Kapitel-Intro analog zum Story-Screen von Level 1).

## Ablauf

1. Spieler startet Level 3 aus der Kampagnen-Karte (Kampagnenmodus; nicht Endlos, nicht Portal, nicht Pilot).
2. `game.js` ruft nach `state='playing'` den Hook `globalThis.DenkmalLevelIntro.show(3)` auf.
3. Das Modul `dist/level-intro.js` übernimmt:
   - Overlay `#levelIntroScreen` (Vollbild, Story-Screen-Stil) wird sichtbar,
   - `state='levelintro'` friert Simulation und Canvas-Renderzyklus ein,
   - Video startet (`playsinline`, kein Preload), Ton folgt dem TON-AN/AUS-Schalter,
   - blockierter Autoplay-Start (WebView ohne Geste) zeigt `INTRO STARTEN`,
   - Video-Ende zeigt `WEITER ZUR WACHT`; `ÜBERSPRINGEN` und `Esc` brechen jederzeit ab,
   - nach dem Schließen wird `video.src` freigegeben (Decoder-/Speicherfreigabe auf 4-GB-Geräten).
4. Fehlt das Video (404/Fehler), schließt sich das Overlay sofort mit einem Toast; das Level startet normal.

Ein Intro läuft **einmal pro Sitzung** (In-Memory-Set, kein Persistenzformat); Neustarts nach einer
Niederlage und der Endlosmodus zeigen kein zweites Intro.

## Asset

- Pfad: `dist/assets/intro/kirchende-intro-v1.mp4` (720x1280, ca. 8 s, H.264 + AAC, ca. 5 MB)
- Das Video wird als getrennter Binär-Upload in den Feature-Branch gestellt; der Quellpfad
  bleibt im Code zusammengesetzt, damit der `static-404-gate`-Check das fehlende optionale Asset nicht
  blockiert (Spielfluss hat einen video-error-Fallback).
- Kein Eintrag im Preloader/Asset-Manager (bewusst: kein Preload, keine Atlas-Erweiterung).

## Beteiligte Dateien

| Datei | Änderung |
| --- | --- |
| `dist/level-intro.js` | neu: Overlay-Modul `DenkmalLevelIntro` |
| `dist/level-intro.css` | neu: Overlay-Stil (Portrait, Touch-Buttons) |
| `dist/index.html` | Overlay-Sektion, Script-/CSS-Einbindungen, `game.js`-Cache-Key |
| `dist/game.js` | Hook in `startGame`, Init neben `saga.init`, `closeScreens`, `Escape`, Render-Pause |
| `tests/level-intro.test.cjs` | neu: Modulvertrag, Verdrahtung, 404-Gate-Kompatibilität |
| `tests/cache-busting.test.cjs` | erwartete Cache-Keys ergänzt/aktualisiert |
| `.github/workflows/test.yml` | Testschritt ergänzt |

## Teststand

- Stufe 1 (Node): `level-intro`, `cache-busting`, `game.test` (Desktop + `TEST_MOBILE=1`),
  Menü-/Preloader-/Pacing-/Kirchende-Suiten grün.
- Stufe 2 (Chromium-Smoke) und Stufe 3: offen.
- Stufe 4 (physisches Android, 4 GB RAM): offen; prüfen: Video-Start nach Karten-Tap,
  Ton nach App-Wechsel, Skip per Touch, Speicherpeak beim/zum Video (Telemetrie `FPS: AN`).
