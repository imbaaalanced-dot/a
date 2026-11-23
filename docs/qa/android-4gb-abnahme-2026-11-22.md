# Geräte-Abnahme 2026-11-22: Sounds, Menü v4/v6, Performance (4-GB-Android)

Zusammenfassende Abnahme auf dem physischen **4-GB-Android-Gerät** (Hochformat,
WebView/Chrome) über die Live-Site https://imbaaalanced-dot.github.io/a/ nach den
Merges `fec2cca1` (SFX Hauptspiel, #395/#402), `82d9c4f0`/`f8af913d`
(prozedurale Sounds), `2ec74d06` (Hauptmenü v4, #394), `cd23bea1` (Key-Art v6,
#401) und `f8118c72` (v3-Aufräum-Patch, #404).

Katalog und Bewertungsrahmen: `docs/android-4gb-abnahme-2026-11-20.md`
(Median ≥ 50 fps je Szenario, keine Datenverluste, kein dauerhaft unspielbares
Szenario). **Urteil this Runde: BESTANDEN**, vom Eigentümer (Marcel Schneider)
bestätigt; diese Zusammenfassung ersetzt keine je-Szenario-Overlay-Aufzeichnung.

## Geprüfter Umfang (Eigentümer-Bestätigung)

| Bereich | Gegenstand | Urteil |
| --- | --- | --- |
| SFX Hauptspiel | 18 benannte Ereignis-Sounds: Spielstart, Wellen, Boss, Kills, Turmbau/-upgrade/-verkauf, Beute, Sieg/Niederlage, Monument/Lleden-Treffer, UI; Drossel bei Massen-Kills hörbar ok | bestanden |
| SFX Ansturm | 9 Rezepte: Wellenstart/-ende, Boss-Horn, Kill, Monument-Wummern, Niederlage, Kauf, UI; Ton-Toggle und Tempo | bestanden |
| Ton nach App-Wechsel | WebView-Hintergrund/Return, Kontext-Unlock und Wiedergabe | bestanden |
| Lautstärke-Stufen | 100/70/40 % wirken hörbar auf SFX und Stimme; Ton AN/AUS | bestanden |
| Hauptmenü v4/v6 | „Herbstwacht“-Grafiken, Key-Art v6, Wappen, Karten-Galerie; keine v3-Reste, keine Ruckler beim Menü | bestanden |
| Performance (P0-2 aus #398) | Großwellen/Spawn-Spam inklusive Bosswellen subjektiv flüssig; kein stetiger Heap-Anstieg über die Sitzung | bestanden |
| v3-Aufräum-Patch | Menü lädt ausschließlich v4, keine 404-Requests in der Konsole | bestanden |

## Einordnung und Follow-up

- Die Abnahme war eine **Zusammenfassungs-Abnahme nach Katalog**; je-Szenario-
  Overlay-Werte (FPS/P95/DRAW/Heap) wurden in dieser Runde nicht tabellarisch
  erfasst. Der Katalog bleibt für eine spätere, numerisch belegte
  Release-Abnahme verbindlich.
- Offene Punkte aus dieser Runde: keine. P0-1 (Rüstkammer-Clipping, #399) und
  P0-2 (Performance-Repro) sind damit aus Issue #398 abgedeckt.
- Beigetragene Automatisierung dieser Release-Linie: `audio-sfx-recipes`,
  `audio-game-flow` (#395) und `ansturm-sfx` (#402) prüfen die Sound-Verdrahtung
  headless in der CI; das Gerät bleibt für den subjektiven Hör- und
  App-Wechsel-Check.

---
Protokolliert am 22.11.2026, Katalog-Referenz: docs/android-4gb-abnahme-2026-11-20.md
