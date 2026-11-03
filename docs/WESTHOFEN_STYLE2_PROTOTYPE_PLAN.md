# Westhofen Style-2-Prototyp: Produktionsauftrag

Status: Planung auf isoliertem Entwicklungsbranch. Keine neuen Sprites integriert, keine Tests ausgeführt.

## Bestätigte Ausgangsbasis
- Basisbranch: `feature/level7-westhofen-20261102`; Level 7 mit drei Zugängen, 16 Bauplätzen, 12 aktiven Türmen und Wellen 25–28.
- `dist/westhofen-art.js`: gecachter prozeduraler Boden und prozedurales Denkmal; keine externen Monument-Sprites.
- `tests/westhofen.test.cjs`: bestehende Geometrie-, Wellen-, Spielstand- und Rendererprüfungen.
- Grafikgruppen liegen außerhalb des GitHub-Bestands als Entwürfe vor; Freistellung und Einzeldateien noch nicht abgenommen.

## Reihenfolge und technische Abnahme
1. **Baseline:** `node tests/westhofen.test.cjs`, `node tests/game.test.cjs`, übrige `tests/*.test.cjs` und `python tests/assets.test.py` ausführen; Ergebnisse dokumentieren.
2. **Sprite-Pilot:** Hauptdenkmal als transparentes PNG mit festen Kontaktpunkten und ausreichend Rand; WebP als Laufzeitkopie. Historischer Zustand laut `docs/WESTHOFEN_LEVEL.md`: geflügelter Helm, Schild, Schwert, leeres mittleres Tafelfeld, zwei leere Feuerschalen-Sockel. Keine erfundenen Schriftzüge.
3. **Renderer-Fallback:** Prozedurales Denkmal bleibt erhalten, bis Bild erfolgreich geladen und dekodiert ist; bei Fehler weiter prozedural zeichnen. Keine Änderungen an Kollision, Monument-HP oder Speicherformat.
4. **Boden-Pilot:** Maximal ein separates Bodentextur-Asset für den grünen Bereich. Wege und Bauplätze müssen lesbar bleiben; keine zusätzlichen Cache-Canvas pro Frame.
5. **Gegneranimationen:** Zunächst EIN Gegnertyp als vertikaler Schnitt; aktuelle Atlas-Zellgröße und Mapping vor Export im aktiven Branch prüfen. Idle/Walk/Attack/Hit/Death erst nach Renderer-Anbindung als integriert bezeichnen.
6. **QA:** Transparenz und Ränder bei 64/128 px, Bottom-Center-Pivot, Projektion mit 0.82 Tiefenfaktor, keine Zitter-/Flackereffekte, keine verdeckten Wege, keine Speicherregression.
7. **Android-Abnahme:** Echtes 4-GB-Gerät, Start/Reload, Pause, Wellen 25–28, Boss, Endlos, Touch, FPS und RAM messen; ohne Gerät keine Gerätefreigabe.
8. **Preview:** Erst nach grünen automatisierten Tests isolierte HTTPS-Vorschau; kein Merge nach `main` ohne ausdrückliche Freigabe.

## Nicht Bestandteil dieses Patches
- Keine Änderung bestehender Pull Requests.
- Keine stillschweigende Umstellung auf 25 Wellen.
- Keine Änderung der Gegner-KI, Spielstände oder Turmbalance.
- Keine Behauptung, dass generierte Bildgruppen bereits runtimefähige Sprites sind.
