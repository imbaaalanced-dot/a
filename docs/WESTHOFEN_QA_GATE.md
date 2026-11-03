# Westhofen V4.3: isolierte Qualitätssicherung

Stand: 03.11.2026, Branch `feature/v4.3-westhofen-qa-gate` auf Basis des Vegetationszweiges.

## Ursache fehlender CI-Rückmeldungen
Der vorhandene Workflow `.github/workflows/pages.yml` filtert Pushes auf eine feste Liste älterer Branches und `main`. Die neuen Westhofen-Folgebranches sind dort nicht enthalten. **Ein fehlender Workflowbericht war kein bestandener Test.**

## Neuer Workflow
`.github/workflows/westhofen-qa.yml` arbeitet nur auf diesem eigenständigen QA-Branch, mit `contents: read` und **ohne** Deploy- oder Merge-Schritt. Er installiert die vorhandenen Python-Bildtest-Abhängigkeiten und startet:
- alle `tests/*.test.py`;
- `npm test --prefix ansturm-alpha1-5`;
- alle `tests/*.test.cjs`, inklusive neuer Westhofen-Regressionstests;
- die dedizierten mobilen Logiktests mit `TEST_MOBILE=1`.

## Abnahmestufen
1. **Automatisiert:** Workflow muss tatsächlich grün sein; aus dem Vorhandensein der Datei darf keine Testfreigabe abgeleitet werden.
2. **Desktop-Browser:** Sprite-Ladevorgang, Denkmal, Pergola, Steintreppe, Mauer, Bodenvegetation und Kamera sichtbar kontrollieren. Der bisherige Stand wurde nur isoliert und ohne echte Screenshots untersucht.
3. **Android 4 GB:** Start, Wellen 25–28, Neustart, Cache/Speicher, Touch, Bildrate und Boss.
4. **Veröffentlichung:** Isolierter Tester-Link erst nach bestätigter CI und explizit eingerichteter Preview; dieser Workflow veröffentlicht **nichts**.

## Repositorieschutz
Die bestehenden PRs #74–#77, andere Branches und `main` bleiben unberührt. Keine automatisierte Merge-Operation. Die Workflow-Datei ist ein Testwerkzeug, kein Qualitätsnachweis an sich.
