# V4.1 Alpha1 Kunst- und Integrationsprüfung

Prüfstand: 01.11.2026. Autorenprovenienz: `art-a.json`, `art-b.json`, `hero-art-review.md`. Technische Exportdaten einschließlich Quell-/Laufzeithash, gemessenem Anker und Autorenkalibrierung: `dist/assets/directional-v410/manifest.json`.

## Aktionskunst

Marcel, Kim und die 21 Gegner-/Bossidentitäten enthalten jeweils vier eigene Richtungsansichten mit Angriff, Treffer und Tod, je vier Phasen. Korrekturstreifen für die ersten Gegner und sechs Ersatzposen für enemy12 wurden mit dem eingebauten Bildgenerator neu gezeichnet; der Export spiegelt oder rotiert keine Ansicht.

Der erste Integrationscheck wurde ausdrücklich verworfen: Rasterausschnitte konnten Waffen oder Figuren teilen, und einige Nebenansichten waren doppelt beziehungsweise zu klein. Vollständige Körper werden nun vor dem Packen getrennt. Der Export erhält sämtliche sichtbaren Quellpixel, weist verbundene Körper zurück und nutzt transparente Ränder. Die getrennt liegende Poleaxe von enemy10 gehört weiterhin zur Leiche in Zeile 6/Spalte 4. Die drei verwachsenen Paare von enemy12 wurden durch sechs vollständige neue Posen ersetzt.

Die finalen Autorenfaktoren wurden anhand Kopf, Torso und Beinen beurteilt. Sie gleichen neue Richtungsstreifen und Ersatzposen vor der gemeinsamen Atlasskalierung an. Nach der Korrektur wurden die auffälligen 00/01/02/12/15 zusammen mit Marcel nochmals als Kontaktbogen mit tatsächlichem Manifestanker und einheitlicher Renderhöhe geprüft: keine vorherigen groben Größensprünge, vollständige Waffen und erkennbare Gegenansichten. Der gesamte 23er-Satz wurde zuvor als Richtungsübersicht kontrolliert.

Grenzen der Kunst: Einzelstreifen haben teils schärfere Detailmalerei als die Originalfront. Manche Treffer-/Erholungsposen drehen den Oberkörper leicht zur Kamera. Gemessene Bodenanker und visuelle Faktoren sind Produktionsnäherungen; sie garantieren keine pixelgenau identische Silhouette oder anatomische Vermessung. Diese verbleibenden Unterschiede sind für den separaten Alpha-Testbuild dokumentiert.

## Technischer Vertrag

- 23 Atlanten, 1104 Zellen, transparente RGBA-WebP-Dateien, vier verschiedene Richtungsblöcke und gültige Provenienzhashes.
- 76,5 MiB dekodiert für den vollständigen Satz; im Spiel werden Figuren nach Bedarf geladen. Höchstens zwei neue Atlanten gleichzeitig und begrenzte Besitzgruppen.
- Ein gemeinsamer Laufzeitanker und eine gemeinsame Exportskalierung nach der dokumentierten Autorenkorrektur je Figur. Kein Abschneiden, um Zellränder zu erzwingen.
- Gemeinsame Zielrichtung im echten Gameplay geprüft: Auto-Schuss übergibt das Ziel, Todespose hält ihre Richtung. Zeichnen verändert keine Kampfwerte.

## Browsernachweis

`browser/report.json` enthält den zuletzt vollständig abgeschlossenen Testlauf. Die endgültige Freigabe setzt darin 23 erfolgreich  gezeichnete Atlanten je Desktop-, Hoch- und Querformat voraus. Canvas-Schnappschüsse sind WebP; Menüs, Kauf, Tutorial, Pause und Reload werden per DOM geprüft. Der Bericht bezeichnet die Emulation ausdrücklich und belegt keine physische Android-Abnahme oder Geräte-FPS/RAM.
