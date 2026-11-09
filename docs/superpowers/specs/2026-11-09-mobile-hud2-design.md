# TD2 HUD 2.0 — Mobile-Design

## Ziel

Im laufenden Kampf bleibt auf Android-Hochformat möglichst viel von Karte,
Gegnern und Bauplätzen sichtbar. Die bisherigen großen Status-, Turm- und
Aktionsfelder werden durch eine einzige schmale Statusleiste sowie kleine,
gut treffbare Kampffähigkeiten ersetzt.

## Gewählter Ansatz und Alternativen

- **Gewählt: Bauplatz-Kontextmenü.** Ein kurzer Tap auf einen freien Bauplatz
  zeigt die freigeschalteten Türme mit Kosten. Ein zweiter Tap auf den Turm
  baut an genau diesem Bauplatz. Ein Tap außerhalb oder auf Schließen bricht
  ohne Kosten ab.
- Alternative: dauerhafte Turmleiste (zu viel Kartenüberdeckung).
- Alternative: einklappbare Turmleiste (weniger Überdeckung, aber wiederholt
  zusätzliche Handgriffe und kein direkter Bezug zum angetippten Bauplatz).

## Verhalten

- Ein Tap auf einen bestehenden Turm zeigt Aufwerten, Zielpriorität und
  Verkaufen für exakt diesen Turm; Aktionen gelten auch ohne Heldennähe.
- Ziehen, Maus-Klicks, offene Modals, Pause und geschlossene Menüs führen
  niemals zu unbeabsichtigtem Bauen. Ohne genug Essenz und bei vollem
  Turmlimit wird kein Turm gebaut.
- Desktop bleibt bei den vorhandenen Tastenkürzeln und der Turmauswahl;
  die mobile Kontextauswahl ist für Geräte mit grobem Zeiger bestimmt.
- Oben kompakte Anzeige für Heldenleben, Denkmal, Essenz, Welle sowie bei
  Bossen eine einzelne schmale Bossleiste. Die Seelenruf-Ladung bleibt am
  Fähigkeitsknopf erkennbar. Debug-FPS bleibt optional.
- Unten links Joystick, unten rechts Seelenruf und Ausweichen; Zielwerte
  mindestens 48 CSS-Pixel. Die Menü-Schaltfläche bleibt erreichbar.
- Dialog und Bossleiste verdecken keine Bildschirmmitte im Normalbetrieb.
- Kein Eingriff in Save-Keys, Balance, Monument-/Helden-Assets oder Ansturm.

## Qualitätskriterien

- Belegte Tap-Logik in automatisierten Tests (frei, belegt, Abbruch,
  Maus/Drag/Modal/Pause, Kosten/Upgrades und Zielwahl).
- Regressionen für Spielstart, Steuerung, Statusupdates, Cache-Keys.
- Mobile Hochformat und Querformat am Browser prüfen, wenn verfügbar;
  physisches Android mit 4 GB RAM bleibt separat zu bestätigen.
- Neues Feature-Branch, nach grünen Checks und ausdrücklicher Freigabe
  Merge nach `main`. Keine bestehenden PRs verändern.
