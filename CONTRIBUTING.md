# Zu Denkmal TD2 beitragen

Danke, dass du Denkmal TD2 verbessern möchtest! 🎉 Das Spiel läuft im Browser; Android-Geräte mit etwa 4 GB RAM sind eine wichtige Testplattform.

## Bugs melden

Öffne ein [Bug-Report-Issue](https://github.com/imbaaalanced-dot/a/issues/new/choose). Bitte beschreibe:

- Tatsächliches und erwartetes Verhalten
- Schritte zur Reproduktion sowie Level, Welle und Spielmodus
- Gerät, Betriebssystem und Browser/WebView
- Messwerte oder Screenshots, falls vorhanden (keine FPS/RAM-Werte schätzen)

## Ideen einreichen

Nutze das **Feature-Request-Formular**. Beschreibe zuerst das Problem und den Nutzen. Fragen und Diskussionen gehören in [Discussions](https://github.com/imbaaalanced-dot/a/discussions), sobald diese Funktion aktiviert ist.

## Pull Requests

1. Forke das Repository und erstelle einen Branch wie `feat/mein-feature` oder `fix/mein-bug`.
2. Halte PRs klein und auf ein Thema fokussiert.
3. Beschreibe Änderung, Motivation, betroffene Levels und mögliche Auswirkungen auf gespeicherte Spielstände.
4. Ergänze Tests oder nachvollziehbare Reproduktionsschritte.
5. Prüfe die relevanten Tests, Build-Ausgabe und gegebenenfalls die mobile Touch-Steuerung.
6. Fülle das [PR-Template](.github/pull_request_template.md) aus.

## Lokales Testen

Am Repository-Root gibt es derzeit **kein** `npm run dev`. Starte das statische Spiel mit Python 3:

```bash
python3 -m http.server 8777 --directory dist
```

Öffne dann `http://localhost:8777/`. Für automatisierte Checks werden Node.js 22 und Python 3 verwendet:

```bash
node tests/game.test.cjs
TEST_MOBILE=1 node tests/game.test.cjs
npm test --prefix ansturm-alpha1-5
python3 tests/assets.test.py
```

Weitere Prüfungen stehen unter `.github/workflows/test.yml` und `.github/workflows/pages.yml`. Falls bestehende Tests auf `main` fehlschlagen, trenne diese Ausgangslage klar von neuen Fehlern.

## Grafik, Stil und Sicherheit

- Bestehenden JavaScript-/CSS-Stil und die [Style-2-Art-Direction](ART-DIRECTION.md) beibehalten.
- Keine Geheimnisse, Zugangsdaten, persönlichen Daten oder urheberrechtlich unklaren Fremdassets committen.
- Referenzfotos, Lizenzen und Asset-Herkunft kenntlich machen.
- Änderungen an Save-Keys, Level-Freischaltungen und Touch-Steuerung besonders sorgfältig testen.
- Lokale Tests, CI-Ergebnisse und echte Android-Tests getrennt dokumentieren.

## Miteinander

Sei respektvoll und lies den [Verhaltenskodex](CODE_OF_CONDUCT.md). Gute Einstiege sind Issues mit `good first issue` oder `help wanted`.
