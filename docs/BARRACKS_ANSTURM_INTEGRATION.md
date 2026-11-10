# Kaserne im separaten Ansturm: Integrationsgrenzen

Stand 10.11.2026, geprüft an `ansturm-alpha1-5` und `dist/ansturm`.

## Bestehender Vertrag
- `model.js`: normierte Arena-Koordinaten, zentral angreifendes Monument, Tech-/Upgrade-Käufe. Keine Türme, Lane-Pfade oder spielbaren Helden.
- `run-state.js`: Spielstand Version 1 mit festen Feldlisten und strenger Validierung. Einfaches Anhängen von Rekruten an den Lauf würde diese nicht speichern/wiederherstellen.
- `render.js` und `sprites.js`: eigener Renderer und eigene Assetverwaltung. Die kampagnenspezifischen Weltkoordinaten aus `dist/barracks.js` dürfen nicht direkt übernommen werden.
- Quell-/Distributionsparität ist durch bestehende Tests geschützt.

## Kleiner überprüfbarer Implementierungsweg
1. Eigene Ansturm-Kasernenfunktion in separatem Entwicklungsbranch/PR entwickeln. Kampagnen-Kaserne und bestehende Ansturm-Spielstände bleiben beim ersten Schritt unverändert.
2. Feste, antippbare Verteidigungspositionen um das Monument verwenden. Keine fiktiven Lanes, keine Portale und keine Helden hinzufügen. Baubereich und Leash werden in normierten Arena-Koordinaten definiert und in allen Seitenverhältnissen geprüft.
3. Kasernenmodell vom Renderer trennen. Rekrutenzahl, Besitzer-ID, LP, Cooldowns, Kampfradius und Verkauf begrenzen. Kandidatenauswahl mit quadrierten Distanzen; Gebäude und Figuren aus den bestehenden Style-2-Atlanten über genau einen Grafikpfad zeichnen.
4. Bau/Upgrade/Verkauf mit der vorhandenen Goldwirtschaft integrieren. Werte erst anhand gepaarter, reproduzierbarer Ansturm-Läufe festlegen; Kampagnen-Essenz nicht ungeprüft in Gold umbenennen.
5. Spielstandschema explizit erweitern: alte Version 1 weiterhin lesbar, neue Kasernenfelder strikt validieren; vor/nach Speichern identische Simulation prüfen. Alte Spielstände weder verwerfen noch überschreiben, wenn die Migration scheitert.
6. Quelle und `dist/ansturm` gemeinsam aktualisieren, Paritätstests ausführen. Chromium: Hoch-/Querformat, Baukosten, Grenzfälle, beide Upgrades, Verkauf, Wiederherstellen, 3×-Simulation, Bossmechaniken und große Gegnerzahlen.

## Merge-Gate
Dies ist ein Gameplay- und Spielstandumbau und braucht zusätzliche Abnahme vor dem Merge. Kein stiller Einbau in PR #168 und keine behauptete Ansturm-Abnahme aus Kampagnentests. Physischer Android-Test mit 4 GB bleibt zusätzlich erforderlich.
