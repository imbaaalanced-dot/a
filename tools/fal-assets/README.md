# Denkmal TD2: fal.ai Asset-Pipeline

Server-/Entwicklerwerkzeug, **nicht** in den öffentlichen GitHub-Pages-Build importieren.

## Einrichtung

1. In [fal.ai](https://fal.ai/) einen API-Key erstellen.
2. Im Verzeichnis `tools/fal-assets` `npm install` ausführen.
3. `FAL_KEY` lokal als Umgebungsvariable setzen (nicht committen).
4. `npm run generate -- "Isometric dark fantasy stone tower, isolated object, transparent background, consistent 2.5D game art"` ausführen.

Optional: `FAL_MODEL` setzt einen anderen fal-Endpunkt. Das Skript erwartet einen Text-zu-Bild-Endpunkt mit `data.images`; andere Modelle benötigen einen eigenen Adapter.

Die Ergebnisse werden unter `generated/` gespeichert und sind von Git ausgeschlossen. Vor einer Übernahme in `dist/` müssen Transparenz, Lizenz, Perspektive, Sprite-Schnitt und Performance geprüft werden.

**Sicherheit:** Den Key niemals in Frontend-JavaScript, GitHub Pages oder öffentlichen Repository-Dateien speichern. Für spätere Ingame-Generierung wäre ein geschützter Server-Proxy mit Authentifizierung, Rate-Limit und Budgetgrenzen erforderlich.

**Status:** Setup-Dateien bereitgestellt; Live-Generierung erfordert einen lokal konfigurierten Schlüssel. Kein Deployment des Spiels.
