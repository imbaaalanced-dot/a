# Ansturm-Menü und Kurzeinführung

Ziel: Den vorhandenen TD2-Menüaufbau in Ansturm übernehmen und beim ersten neuen Durchlauf vier kurze Hinweise zeigen.

Entscheidung: Vorhandene Friedhofsszene und Wappen wiederverwenden, ohne Heldenbanner. Start/Fortsetzen als goldene Hauptaktion, Anleitung und Hauptmenü als dunkle Nebenaktionen. Im Spiel liegen Ton, Tempo, Neustart und Hilfe im aufklappbaren Menü; Pause und Wellenstart bleiben direkt erreichbar.

Tutorial: Denkmal/automatischer Angriff, Gold, Technik, Waffen. Überspringbar, Escape schließt, später über Hilfe wiederholbar. Während der Anleitung keine Simulation. Abschluss oder Überspringen merkt sich ein separater lokaler Schlüssel; Speicherfehler blockieren das Spiel nicht. Fortsetzen eines alten Spielstands startet keine Einführung.

- [ ] Verhaltenstests zuerst: automatische Einführung, Pause, Überspringen, Wiederholung, bestehende manuelle Pause, Speicherausfall.
- [ ] Tutorialmodul und App-Anbindung implementieren; Menülayout und Touchflächen anpassen.
- [ ] Quell-/Ausgabedateien synchronisieren, gesamte Tests ausführen, mobile und Desktop-Browser prüfen.
- [ ] Separaten Branch und PR bereitstellen, bestehenden PR #61 und main unverändert lassen.

Prüffokus: Kleine Hochformat-Displays, flaches Querformat, Escape/Fokus, bestehende Durchläufe und gesperrter localStorage. Ein echter Android-Lastlauf wird nicht durch Chromium ersetzt.
