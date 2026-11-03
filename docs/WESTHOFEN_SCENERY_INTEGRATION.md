# Westhofen: optionale Szenendekoration im Boden-Cache

Stand: 03.11.2026, neuer Branch auf Basis von `feature/v4.3-westhofen-environment-pilot`.

## Umsetzung
- `dist/westhofen-art.js` lädt Pergola, Treppe und Mauer asynchron, ohne das Starten des Levels zu blockieren.
- Drei **illustrative** Positionen in relativen Weltkoordinaten: Pergola (-825,-420), Treppe (+850,-530), Mauer (+820,-115). Keine vermessenen historischen Originalpositionen.
- Vor jeder Dekorationszeichnung werden Mindestabstände zu allen drei Gegnerwegen, zu Turmbauplätzen, zu Denkmal und Weltgrenzen geprüft. Nicht zulässige Elemente werden ausgelassen.
- Sprites werden in den bestehenden 1536×1536-Boden-Cache gezeichnet, mit Kompensation der 0,82-Tiefenprojektion für aufrechte Objekte. Bei erfolgreichem Nachladen werden sie nur durch Neugenerierung des Boden-Caches übernommen.
- Fehlende oder fehlerhafte Bilder führen zu keiner Unterbrechung und ändern keine Spielmechanik. Historisch belegte Platzierung ist noch offen.

## Kontrollnachweise
- Isolierte Laufzeitprüfung am GitHub-Quelltext: **11/11** Checks erfolgreich, einschließlich Freiraum für drei Platzierungen, Laden, Cache-Rebuild, warmem Cache, Fehler-Fallback, fehlender Image-API und Cache-Kennung.
- Eine ursprüngliche Treppenposition (+805,-420) wurde wegen zu geringem Abstand zu einem Turmbauplatz verworfen. Korrigiert zu (+850,-530).
- Regressionstest im Repo: `node tests/westhofen-scenery-placement.test.cjs`.
- **Nicht ausgeführt:** vollständige Node-/Python-Suite, echter Browser-Screenshot, Android-Gerätetest, FPS-/RAM-Messung.

## Ausstehend
- Originalfotos/Historie mit der dekorativen Platzierung abgleichen, bevor wir sie als faktische Rekonstruktion kennzeichnen.
- Ansicht bei Gameplay-Zoom 64/128 px prüfen; gegebenenfalls Symbolgrößen, Vordergrund-Überdeckung oder Platzierung korrigieren.
- Vollständige CI und isolierten Testbuild veröffentlichen; kein Merge nach main.
