# Ansturm-Entwicklermodus: wählbares 5× Spieltempo (#330)

Datum: 2026-11-17 · Branch: `feature/ansturm-dev-speed-20261117`

## Änderung
- `ansturm-alpha1-5/config.js` (neu: `SPEED_LIMITS`, `nextSpeed()`): normales Tempo-Obergrenze 2×, Ansturm-Entwicklermodus bis 5×. Reine Funktion, ohne DOM-Zugriff.
- `ansturm-alpha1-5/app.js`: Tempo-Knopf nutzt `nextSpeed(speed, developerSpeedMode)`. Entwicklermodus wird per URL-Parameter `?dev=1` oder `localStorage['ansturm-developer-speed']='enabled'` aktiviert (Standard: aus). Knopfbeschriftung zeigt im Entwicklermodus den Zusatz `· DEV`.
- `ansturm-alpha1-5/index.html`: Cache-Schlüssel von `app.js?v=copy-20261110a` auf `app.js?v=ansturm-devspeed-20261117` aktualisiert; in `app.js` ebenso für `config.js`.
- `dist/ansturm/` (app.js, config.js, index.html): byte-identische Bereitstellungskopien (Paritätstest `tests/ansturm-source-parity.test.cjs`).
- Vorheriges Verhalten: Tempo-Zyklus 1×→2×→3× für alle. Neu: 1×→2× normal; 1×→2×→3×→4×→5× im Entwicklermodus.

## Determinismus
Das Tempo wirkt ausschließlich auf den Fixschritt-Akkumulator (`acc = min(.30, acc + dt*speed)`, Ticks `1/30 s`, Deckel 10 Ticks pro Frame). Bei 5× und einem 0,1-s-Rahmen erreicht der Nachlauf genau die 0,30-s-Deckelgrenze; keine Abhängigkeit von der Render-Bildrate, kein Spiral-of-Death. Kampagne (`dist/game.js`) bleibt unberührt (maximal 2× gemäß AGENTS.md Abschnitt 7).

## Tests (Stufe 1, lokal, Node v22.20.0)
- Neu: `ansturm-alpha1-5/tests/dev-speed.test.js` (3 Tests: Normalmodus-Kappung bei 2×, Entwicklermodus-Zyklus bis 5×, ungültige Werte bleiben gebunden) – 3/3 bestanden.
- Angepasst: `ansturm-alpha1-5/tests/resume-flow.test.js` – Normalzyklus 1×/2×, Doppelzeit- und Pausen-/Catchup-Test auf 2× übertragen; neuer Test: 5×-Zyklus inkl. Catchup-Deckel – bestanden.
- Gesamtsuite `node --test tests/*.test.js` im Quellverzeichnis: 77/77 bestanden; `tests/ansturm-v2-visual.test.js` und `tests/visual-feedback-v2.test.js` konnten lokal nur wegen fehlender `dist/`-Relativpfade nicht ausgeführt werden und laufen in der CI (Ansturm-Integration-Workflow liest das vollständige Repository aus).

## Offen
- Stufe 2–3 (Chromium-Smoke, Mobile-Emulation) und Stufe 4 (physisches Android 4 GB) sind nicht durchgeführt und werden nicht als bestanden erklärt.
- Keine Änderung an Spielständen, Freischaltungen oder Assets. Kampagnen-Tempo unverändert.