# Denkmal TD2 – Autonomer Entwicklungsmodus

Repository: `imbaaalanced-dot/a` · Hauptbranch: `main` · Ziel: Android (4 GB RAM), mobile Browser · Stil: düsterer, hochwertiger isometrischer Style 2.

## Auftrag
Arbeite in kleinen, prüfbaren Iterationen: Stand von `main`, offene PRs und Issues lesen; priorisieren; eigenen Branch erstellen; Fehler reproduzieren; minimale Änderung implementieren; Tests/CI und Chromium-Smoketests auswerten; nur nach bestandenen Gates zusammenführen; Deployment und veröffentlichte Versionsanzeige **separat** verifizieren. Danach innerhalb derselben aktiven Ausführung die nächste unabhängige Aufgabe angehen.

## Reihenfolge
1. **Hauptmenü / Developer-Modus:** Versionsanzeige dauerhaft sichtbar; Aktivierung im Optionen-Menü mit Ton und „Aktiviert“-Overlay; alle Level und optional 3× Tempo im Developer-Modus; Save-Isolation sicherstellen. Vor einer Änderung zuerst bereits vorhandene Implementierungen prüfen, keine Duplikate.
2. **Android (4 GB):** FPS, P95-Frametime, RAM, Touch, Grafikfehler, Cache und Langzeitstabilität prüfen; keine Leistungsgewinne ohne Vorher-/Nachher-Messung behaupten.
3. **Style 2 und UI:** Hauptmenü, kompakter HUD, Rüstkammer, Kim und Marcel, Sprites, Boss- und Turmeffekte einheitlich ausarbeiten.
4. **Gameplay:** Level, Ansturm, 20 Wellen, Bosswellen 10/20, Loot, Gegnerlogik, Upgrade- und Freischaltwege testen.

## Merge-Gates
- Jeder Codepatch zunächst in einem eigenen Branch mit PR; keine direkten Code-Pushes nach `main`.
- Draft, Konflikt, offene Review-Anforderungen, fehlende oder fehlgeschlagene verpflichtende CI-Checks blockieren den Merge.
- Relevante Node/Python-Regressionsprüfungen, mobile Spiel-/Save-Tests und Desktop-/Touch-Chromium-Smoke müssen erfolgreich sein.
- Risikoarme, rückwärtskompatible Änderungen dürfen anschließend automatisch nach `main` gemergt werden, sofern Repository-Regeln das erlauben.
- Änderungen an Speicherschema, Inventar-Recycling, Wirtschaft, großen Gameplay-Systemen, Build/Deployment, Sicherheitsregeln oder riskanten UI-Neuentwürfen erfordern zusätzliche gezielte Abnahme. Nicht blind mergen.
- Kein Force-Push, Umgehen von Branch-Protection oder Löschen von Spielständen/Assets ohne verifizierte Notwendigkeit.
- Browser-Emulation, CI, lokaler Test, GitHub-Pages-Deployment und physischer Android-Test sind **fünf verschiedene Nachweise**. Die echte Android-4-GB-Abnahme nicht als bestanden markieren, solange sie nicht tatsächlich durchgeführt wurde.

## Veröffentlichung
Der bestehende `pages.yml`-Workflow veröffentlicht nach `main`-Push. Ein grüner Actions-Run ist nur ein Deploy-Indiz: Release-Dateien, HTTP-Erreichbarkeit, Menüversion, Spielstart, Developer-Modus und Levelauswahl müssen danach separat geprüft werden. Root-URL: https://imbaaalanced-dot.github.io/a/ .

## Statusbericht pro Iteration
Version · Aufgabe · Branch/PR/Commit · lokal getestete Fälle · CI · Chromium Desktop/Touch · Android 4 GB · Merge · Deployment/live-Version · offener Blocker · nächster kleinster Schritt. Nur bestätigte Resultate melden.

## Aktuelle Blocker zum Zeitpunkt der Einrichtung (09.11.2026)
- PR #137 „Command Hub & RPG-Rüstkammer“: **Draft, mergeable_state=dirty (Konflikt)**, kein Merge. Tests des älteren PR-Standes ersetzen keine frischen Tests nach Konfliktlösung; manuelle visuelle und echte Android-Abnahme offen.
- `main` enthält bereits PR #141 (Menüversion), #142 (Android-Developer-Zugang) und #143 (alle Level/3× Tempo), HEAD `df183bc3d481a216c39cae15299572b380ec8b39`.
- `main`-Test-/Publish-Workflow an diesem HEAD erfolgreich; das belegt keine physische Android-Abnahme.

**Automationsgrenze:** Diese Datei ist die verbindliche Agent-Anweisung, selbst aber kein dauerhaft laufender Dienst. Unbeaufsichtigte, wiederkehrende Ausführung erfordert separat eingerichtete GitHub-Actions-/Agent-Infrastruktur mit passenden Berechtigungen und Schutzregeln.
