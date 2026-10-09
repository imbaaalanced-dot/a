# v3.6.0-alpha.2 — Die neue Wacht

## Änderungen

- Neues Hauptmenü mit separat generiertem Laternenhüter-Panorama nach Marcels Grafikvorlagen, bronzenem Wappen und klarer Aktionshierarchie.
- Kapitel I starten, Rüstkammer öffnen und freigeschaltetes Labyrinth direkt wählen.
- Eigene „denk mal nach“-Kachel öffnet https://www.youtube.com/@denk-malnach in einem neuen Tab. Kein automatisch ladender Videoplayer.
- Kleine WebP-Varianten: Desktop-Panorama etwa 130 KB, mobiles Portrait etwa 74 KB, Wappen etwa 9 KB. Das picture-Element wählt die passende Hauptgrafik.
- Hochformat mit großen Touch-Zielen, Safe Areas und scrollbar erreichbaren Aktionen; Desktop und Querformat mit Bild neben dem Menü.
- Aufklappbare Hilfe mit Touch- oder Tastatursteuerung. Tab-Navigation berücksichtigt jetzt Kanal-Link und Hilfe.
- Einheitlicher Cache-Schlüssel `v360a2` für alle Skripte und Styles.

Die dauerhafte Sammlung, Ausrüstungssperre während eines Durchgangs, Kampflogik und Speicherformat aus Alpha.1 bleiben erhalten.

## Prüfung

- 17 Inventarprüfungen.
- 71 Gameplayprüfungen jeweils im Desktop- und simulierten Mobile-Kontext, einschließlich Link-/Hilfe-Tastaturfokus.
- Combat-FX- und Feature-Suite.
- Bilddekodierung sowie Größenbudget für die Menübilder; HTML prüft auch srcset-Dateipfade.
- Echte Android-Hardware, thermische Last und Langzeitstabilität bleiben offen.
