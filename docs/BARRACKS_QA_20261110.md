# Kaserne · Entwicklungsabnahme 10.11.2026

Version: v5-alpha, PR #168 bleibt Draft. Kein Merge nach main, kein Deployment.

## Änderungen
Drei Originalgebäude und 44 Lauf-/Angriffsframes im Originalatlas. 24 neue Stand-/Treffer-/Todes-/Rekrutierungsposen im Zusatzatlas. Ein aktiver Sprite pro Figur, gemeinsame Registry, 3.75 MiB Texturspeicher vor GPU-Overhead. Taste 6 funktioniert. Upgrade erhält Rekruten und relative LP, setzt Rekrutierung nicht zurück. Todesanimation ohne Aggro; Verkauf entfernt auch Leichen.

Main 7031867 wurde in den Entwicklungsstand übernommen; Scriptkonflikt in index.html mit beiden Modulen und neuer Cachekennung aufgelöst. Lokale Umsetzung: 9ff976c, 0107829, fdeb60a; Übertragung erfolgt als gemeinsamer GitHub-Commit mit beiden Remote-Eltern.

## Verifiziert
- 93/93 ausführbare Workflow-Befehle lokal erfolgreich (pip-Installation ausgenommen, vorhandene Abhängigkeiten verwendet). Remote-CI separat prüfen.
- Desktop- und mobiles VM-Gameplayprofil erfolgreich; dies sind keine Chromium-Smoke-Tests.
- Rekrutierung, Cap, Laneprojektion, Bodenkampf, Flug-/Sappeur-Aggro, Upgrade/Verkauf, Tastaturauswahl, Einzel-Blit und Asset-Prüfsumme/Alpha automatisiert geprüft.

## Synthetischer Node-Stresstest

```json
{
  "environment": "Node synthetic simulation; 300 simulated seconds, 8 barracks, 400 stationary enemies",
  "iterations": 18000,
  "medianMs": 1.3745290000006207,
  "p95Ms": 1.5430300000007264,
  "p99Ms": 1.781566000001476,
  "cpuUserMs": 25347.915,
  "cpuSystemMs": 0.118,
  "heapDeltaBytes": 2367912,
  "live": 10,
  "retainedUnits": 10
}
```

Heapdifferenz enthält Messarray und GC-Einflüsse, kein Lecknachweis. CPU-Zeit ist Prozesszeit, keine CPU-Auslastungsquote. Keine Browser-FPS/RAM-Messung.

## Offene Abnahmen und Risiken
- Chromium auf diesem Executor zweimal beim Start gescheitert: `socket() failed: Operation not permitted`, Prozess SIGABRT. Desktop-/Touch-Smoke und visuelle Laufzeitprüfung daher NICHT bestanden.
- Kein physisches Android-Gerät angebunden; 4-GB-Test und 15–30-Minuten-Test offen.
- Keine komplette Balanceabnahme gegen alle Türme/Gegner, keine Bosswellen-10/20-Abnahme. Balancewerte unverändert, keine unbelegte Anpassung.
- Separater Ansturm-Client hat weiterhin keine Kasernenimplementierung. Kampagnenintegration ist keine Ansturm-Abnahme.
- Generierte Zusatzposen: Grid/Alpha statisch geprüft; Fußpunkte, Richtungs-Spiegelung, Übergänge und Silhouetten im Spiel noch visuell abnehmen.
- Fehlender Basisatlas führt bewusst zu keiner Ersatzfigur; Fehleranzeige/Retry unter Netzausfall noch prüfen.

Nächster Schritt: Desktop-/Mobile-Chromium in einer Umgebung mit verfügbaren Browser-Sockets; danach reproduzierbare Gameplay- und echte Android-Abnahme. Erst anschließend Release-Gate bewerten.
