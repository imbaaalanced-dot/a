# Style-2-V2: Einbau des Erweiterungspakets

Das am 21. Oktober generierte Paket mit 383 PNG-Einzelbildern ist im Grafik-Testzweig angeschlossen. Das Hauptspiel auf main wird durch den Testbuild nicht ersetzt.

| Bereich | Einbau |
|---|---|
| 21 Itemvorlagen | `templateId` wird auf eine individuelle Atlaszelle abgebildet; alte Gegenstände behalten Kategorie- bzw. Power-Fallbacks. Keine Save-Migration. |
| Fünf Kirchende-Powericons | Eigene neue WebPs für bestehende Legacy-Powers; neue Kataloggegenstände verwenden ihre individuellen Motive. |
| Marcel/Kim | Angriff, Treffer und Tod, jeweils vier Frames; bestehende gerichtete Laufanimationen bleiben erhalten. |
| 21 Gegner-/Bossdesigns | Drei gemeinsame Aktionstexturen; Identitätswahl durch den vorhandenen Enemy-Selector. Keine zusätzlichen KI-Klassen. |
| Kanone/Bumerang Stufe 1–2 | Vier materialgerechte Reihen mit je sechs Frames im vorhandenen Combat-FX-Pfad; Stufe 3 behält Feuer/Stahl. Im Effektsparmodus bleibt der prozedurale Fallback. |
| Portalreise | Neu/Fortsetzen mit Normal-/Hovergrafiken; Beschriftung und Bedienung bleiben HTML. |
| Sechs Karten | Je acht neue Dekorationsmotive; deterministische Platzierung mit Abstand zu Pfaden, Bauplätzen, Monument, Kirchenfläche und Hohensyburg-Terrassen. Keine Kollisionen oder neuen Routen. |
| Fünf ältere Ersatzmotive | Denkmal, Portal, Skelettwache, Keulenbrut und gekrönter Boss über den bestehenden Legacy-Zeichenpfad. |

`assets/expansion-v2/manifest.json` enthält die Runtime-Zuordnung, Größen und SHA-256-Prüfsummen. 23 WebP-Dateien benötigen zusammen 1.962.496 Downloadbytes und maximal 30.916.608 decodierte RGBA-Bytes (29,5 MiB), falls alle gleichzeitig resident wären. Alte und neue Grafikdaten zusammen sowie GPU-Speicher auf realem Android sind damit nicht gemessen.

Der zentrale Asset-Manager hält die Texturen während der Verwendung. Die Erweiterung startet höchstens zwei zusätzliche Ladevorgänge gleichzeitig. Kalte oder fehlgeschlagene Aktionsgrafiken verwenden weiterhin die vorhandenen Spritepfade. Beim Kartenwechsel wird die bisherige Umgebungstextur freigegeben. Animationsanker und Größen stammen aus dem ersten Referenzkontaktframe; die Frames eines Blattes verwenden dieselbe Skalierung. Todesposen werden nicht zusätzlich flachgedrückt.

Die neuen Aktionen enthalten pro Figur **eine feste Blickrichtung**. Vier echte Aktionsrichtungen sind weiterhin offen; die vorhandenen Laufanimationen haben ihre bisherige Richtungszuordnung. Es wird keine Drehung oder Spiegelung als neu generierte Richtung ausgegeben. Bei reduzierter Bewegung werden feste Aktionsposen verwendet.

Die Umgebung ist eine visuelle Annäherung. Die Trennung von Ender Dorfkirche und Löwendenkmal sowie die Südausrichtung des Löwen bleiben erhalten. Exakte historische Maße und eine neue Rekonstruktion werden aus diesen Dekorationen nicht abgeleitet.

Validierung: `docs/qa/v2-expansion-20261022/checks.json`, `browser.json` und Browserbilder. Reales Android/WebView, FPS bei hohen Wellen und vollständige künstlerische Abnahme aller Richtungswechsel bleiben offen. Die Browserprüfung unterscheidet Kontaktbögen aller Zellen von tatsächlichen Zeichenaufrufen im laufenden Renderer.
