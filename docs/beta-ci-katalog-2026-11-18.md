# Beta-CI-Katalog (18.11.2026)

Setzt Issue #330 Abschnitt 4 („Beta-CI") und die Bestandsaufnahme
`docs/beta-inventar-2026-11-17.md` Abschnitt 8 Punkt 4 um: die für die Beta
geforderten Prüfkategorien sind in ein **eigenes Workflow-Set** überführt —
`.github/workflows/td2-beta-ci.yml` (Name: *TD2 Beta CI Gates*).

## Auslöser und Schutz

- Läuft bei Pull Requests auf `main`, sobald `dist/`, `tests/`, `tools/`,
  `ansturm-alpha1-5/` oder die Workflow-Datei selbst betroffen sind; zusätzlich
  manuell per `workflow_dispatch`.
- Nicht als Required-Check gesetzt — Blockierung von PRs bleibt Marcels
  Einstellung (Settings → Branches). Bestehende `test.yml` bleibt unangetastet.

## Katalog: Anforderung → Gate

| #330-Anforderung | Gate im Workflow | Wiederverwendete Basis | Status |
| --- | --- | --- | --- |
| Asset-Checks | Job `beta-asset-gates` | `tests/assets.test.py`, `tests/hero-art-magenta-gate.test.py`, `tests/asset-manager.test.cjs` (Pillow via pip) | vorhanden |
| Tests Desktop/Touch | Job `beta-unit-and-mobile` | `node tests/game.test.cjs`, `TEST_MOBILE=1`, `npm test --prefix ansturm-alpha1-5` | vorhanden |
| Mobil-Hochformat | `beta-unit-and-mobile` + `beta-browser-gates` | `tests/portrait-home-v1.test.cjs`, mobile Viewports (412×915, Touch) in `verify-browser-fullscreen.cjs` | vorhanden |
| FPS/RAM Android 4 GB | anteilig | `TEST_MOBILE`-Budgets (Decode-/Render-Budgets in den Tests); physisches 4-GB-Gerät bleibt **separate, auszuweisende Aufgabe** und ist in CI nicht ersetzbar | CI-Näherung, physische Abnahme offen |
| keine JS-/404-Fehler | Job `beta-browser-gates` | `tools/verify-game-cold-start-browser.cjs` (fängt `pageerror`, `requestfailed` ab), `verify-browser-fullscreen.cjs` (fängt Responses ≥ 400 ab) | vorhanden |
| Audio unlock | — | `dist/game.js` unlocked Audio per `pointerdown`/`keydown` (`fx.unlock()`), im Cold-StartQA indirekt mitgedeckt; kein eigener automatisierter Assert auf hörbare Wiedergabe | **Lücke**: dedizierter Gatestub empfohlen (z. B. `AudioContext.state==='running'` nach Touch im Browser-QA) |
| Menüfunktion | `beta-unit-and-mobile` | `tests/menu-navigation.test.cjs`, `tests/main-menu.test.cjs`, Browser-QA klickt Options-/Fullscreen-Menü | vorhanden |
| Heldenatlanten | `beta-asset-gates` | `tests/hero-runtime-visibility.test.cjs`, `tests/marcel-menu-wand.test.cjs`, Magenta-Gate | vorhanden |

## Architektur des Workflow-Sets

Drei Jobs, bewusst getrennt für parallele Ausführung und gezielte Neu-Anlässe:

1. `beta-unit-and-mobile` — Node/Unit- und Touch-Suiten, Menü-Kern, Ansturm.
2. `beta-asset-gates` — Python-Decodierung (Pillow) für Asset-Integrität, Magenta-Gate, Helden-Atlas-Sichtbarkeit.
3. `beta-browser-gates` — echter Chromium (Playwright, SwiftShader): Cold Start ohne JS-Fehler/Fehlrequests, Fullscreen/Portrait auf Desktop und Touch.

Artifacts: Cold-Start-Pixelevidence (`/tmp/td2-beta-cold-start`) wird bei jedem Lauf als `td2-beta-ci-browser-qa` hochgeladen (`if: always()`).

## Offene Punkte

1. Audio-Unlock-Gate ergänzen (siehe Lücke oben), bevor die Beta-Abnahme finalisiert wird.
2. Physische Android-4-GB-Abnahme (FPS/RAM) bleibt außerhalb von CI und ist je Release gesondert zu dokumentieren.
3. Nach Beta-Schnitt: Prüfsummen-/404-Systematik prüfen, ob `td2-beta-ci.yml` zusätzlich auf Push-Läufe zum Beta-Branch erweitert wird.

---
Erstellt im Rahmen von #330 (Abschnitt 4 / Bestandsaufnahme Abschnitt 8 Punkt 4), Stand 18.11.2026.
