# Abnahmekatalog: Physische Android-4-GB-Prüfung (20.11.2026)

Strukturierter Katalog für die physische 4-GB-Android-Abnahme aus Issue #330
(„Grafik-Caching sowie FPS/RAM bei großen Gegnerwellen auf einem echten
Android-Gerät mit 4 GB RAM testen" sowie die je Release auszuweisende
Geräteabnahme). **Diese Prüfung ist bewusst außerhalb der CI** —
CI-Chromium-Werte (SwiftShader) sind nicht mit einem physischen Gerät
vergleichbar.

## 1. Testgerät und Rahmenbedingungen

- Android-Smartphone mit **4 GB RAM**, aktuelles Chrome/WebView, Hochformat
- Akku > 50 %, Energiesparmodus aus, keine parallelen Downloads/Updates
- Testsuite: https://imbaaalanced-dot.github.io/a/ — vor Beginn:
  Browserdaten der Site löschen (echter Cold Start), danach nicht mehr leeren
- **Telemetrie einschalten:** Optionen → `FPS: AN`. Das Overlay zeigt
  `FPS · P95 ms · SIM ms · DRAW ms · >50ms Stutters/ Frames · E · FX · JS-Heap MiB`
- Optional: Chrome remote debugging (`chrome://inspect`) für Konsolenfehler
  und echte RAM-Last (Performance-Speicheraufzeichnung)

## 2. Szenarien (je ≥ 60 s stabil spielen, Overlay-Werte am Ende notieren)

| # | Szenario | Worum es geht |
| --- | --- | --- |
| A | Cold Start bis Hauptmenü | Ladezeit, keine hängende Ladeanzeige |
| B | Kapitel 1, Welle 1–5 (Tutorial/Intro) | Grundlegende Flüssigkeit, Stimme (MP3) + Untertitel |
| C | Kapitel 1, späte Welle 10–20 mit Boss | Erste Großwelle: FPS/E·FX-Last, SFX-Drossel hörbar ok |
| D | Kirchende (Level 4), laufende Welle + Bau über Touch | Terrain-Assets, Touch-Bauweise, Keinframetod |
| E | Endlosmodus, volle Karte mit laufender Großwelle | Worst-Case-Partikel: E/FX-Höchstwerte |
| F | Ansturm, ~Welle 15+ mit Frost+Tesla+Feuer | Neue Gegner-Walk-/Angriffsanimationen + Effektstapel |
| G | Rucksack mit vollem Inventar (Import/Export einmal testen) | HudMenü + Loot-UI unter Last; kein Scroll-Festhängen |
| H | Optionen: Lautstärke 100→70→40 %, Ton AN/AUS, Vollbild | Neue Volume-Stufen wirken hörbar auf SFX UND Stimme; Ton erst nach erster Geste (Unlock-Gate) |
| I | 10 Minuten Dauersitzung inkl. App-Wechsel (Hintergrund/Return) | Speicherprofil: kein stetiger JS-Heap-Anstieg, kein Reload-Verlust |

## 3. Aufzeichnung je Szenario (ausfüllen)

| Feld | Notiz |
| --- | --- |
| FPS-Median am Ende | |
| P95 / DRAW / SIM (ms) | |
| Stutters > 50 ms / Frames | |
| E / FX (Gegner/Partikel) | |
| JS-Heap (MiB) — Start vs. Ende | |
| Sichtbare Fehler (Ruckler, Artefakte, Crash, Konsole) | |
| Subjektiv: flüssig / akzeptabel / schlecht | |

## 4. Bewertungsrahmen (Vorschlag, Abstimmung Marcel)

- **Bestanden (Vorschlag):** Median ≥ 50 FPS in jedem Szenario; keine
  Spieldaten-Verluste; kein Szenario mit dauerhaft unspielbarer Reaktion (< 30 FPS über längere Zeit), das nicht durch LowFX/Tempo-Reduktion gerettet werden kann.
- **Ergebnisweise dokumentieren — keine Schönfärberei** (AGENTS-Grundsatz
  „Nur Belegtes behaupten"): ein nicht bestandenes Szenario wird mit Overlay-Beleg als Folgeticket dokumentiert (vor/nach Fix).
- CI-Werte aus `td2-beta-ci` (Chromium/SwiftShader) bleiben Komplement,
  kein Ersatz.

## 5. Bekannte Vorläufer-Befunde (Kontext für die Abnahme)

- Auf CI (Headless Chromium/SwiftShader): Level 4 Desktop/Touch mit geöffnetem Menü stabil bei
  60 FPS Median, P95 16,8 ms, Heap 10 MiB (Run-Beleg
  Beleg im Run `td2-level4-performance-and-menu` zum #384-Branch) —
  **nicht** auf Physisch-Geräte-Leistung übertragbar, nur als Plausibilitätsreferenz.
- Basiskonto neuer Audio-Systeme: Lautstärke verändert nur Gain-Skalierung
  (keine zusätzliche Voices); SFX-Stimmkappe 8 / Burst-Rate-Limit 55 ms
  halten die Großwellen-Spam-Kontrolle.

---
Erstellt am 20.11.2026 als Vorbereitung der finalen Veröffentlichungsabnahme für die Beta (#330 / Roadmap „Kurzfristig").
