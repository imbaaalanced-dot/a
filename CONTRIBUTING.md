# Feedback und Fehlermeldungen zu Denkmal TD2

**Denkmal TD2 ist ein allein von [imbaaalanced-dot](https://github.com/imbaaalanced-dot) entwickeltes Projekt.** Der Quellcode ist öffentlich einsehbar und steht unter der im Repository angegebenen MIT-Lizenz. **Externe Pull Requests, Codebeiträge und Grafik-Assets werden derzeit nicht zur Übernahme angenommen.** Bitte eröffne deshalb keine PRs mit neuen Funktionen oder Änderungen.

Fehlerberichte, nachvollziehbare Testergebnisse, sachliches Feedback und Ideen sind weiterhin willkommen. Ob und wann etwas umgesetzt wird, entscheidet der Projektinhaber.

## Fehler melden

Öffne ein [Bug-Report-Issue](https://github.com/imbaaalanced-dot/a/issues/new/choose). Bitte nenne möglichst:

- Tatsächliches und erwartetes Verhalten
- Reproduzierbare Schritte, Spielversion, Level, Welle und Spielmodus
- Gerät, Betriebssystem und Browser beziehungsweise WebView
- Screenshots oder gemessene FPS-/RAM-Werte, sofern vorhanden (keine Werte schätzen)

## Ideen und Fragen

Nutze das [Feature-Request-Formular](https://github.com/imbaaalanced-dot/a/issues/new/choose) für Vorschläge oder [GitHub Discussions](https://github.com/imbaaalanced-dot/a/discussions) für offene Fragen. Das ist eine Feedback-Möglichkeit und keine Einladung zur Mitentwicklung.

## Spiel lokal prüfen (optional)

Das statische Spiel lässt sich mit Python 3 starten:

```bash
git clone https://github.com/imbaaalanced-dot/a.git
cd a
python3 -m http.server 8777 --directory dist
```

Danach `http://localhost:8777/` aufrufen. Für nachvollziehbare technische Meldungen existieren folgende Tests (Node.js 22 und Python 3):

```bash
node tests/game.test.cjs
TEST_MOBILE=1 node tests/game.test.cjs
npm test --prefix ansturm-alpha1-5
python3 tests/assets.test.py
```

Ein bestandener lokaler oder CI-Test ist **keine** bestätigte Android-Abnahme auf einem realen Gerät.

## Sicherheit, Rechte und Umgang

- Keine Zugangsdaten, privaten Informationen oder personenbezogenen Dateien in Issues und Discussions veröffentlichen.
- Sicherheitslücken **nicht öffentlich** melden; dafür die [Security Policy](SECURITY.md) nutzen.
- Referenzfotos, fremde Grafiken und Assets nur unter Beachtung ihrer jeweiligen Rechte verwenden.
- Die [MIT-Lizenz](LICENSE) erlaubt die dort beschriebenen Nutzungen und Forks des Projektcodes; sie begründet **keinen Anspruch auf Übernahme externer Änderungen**.
- Für den Austausch gilt der [Verhaltenskodex](CODE_OF_CONDUCT.md).
