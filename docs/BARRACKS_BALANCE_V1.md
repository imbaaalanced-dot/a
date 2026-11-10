# TD2 Kaserne V1 · Balance und Abnahme
Status: experimenteller Entwicklungsbranch. **Kein Merge / kein Android-Pass / kein Live-Release** vor Runtime- und Geräteabnahme.

Die Werte sind ein erster Balance-Vorschlag, keine nachgewiesene Spielbalance. Die Kaserne kostet 55 Essenz. Aufwertung auf L2 kostet 35 und auf L3 50 (bestehender UI-Kostenpfad).

| Stufe | Rekrut | LP | Schaden | Intervall | Reichweite | Aktive Einheiten |
|---|---|---:|---:|---:|---:|---:|
| L1 Holzbaracke | Schwertmiliz | 65 | 8 | 1,20 s | 35 | 1 |
| L2 Steingarnison | Speerträger | 105 | 13 | 1,35 s | 57 | 2 |
| L3 Ordensfestung | Elite-Hellebardier | 150 | 21 | 1,70 s | 65 | 2 |

Rekrutierungsabstand L1/L2/L3: 13/12/14 s. Globaler Cap: 10 Milizsoldaten. Sie ziehen zur nächsten Lane, halten sich im lokalen Kampfbereich, kämpfen gegen Bodengegner und erleiden Rückschläge. Fluggegner, Sappeure und der Entwurzelte können sie umgehen. Keine persistenten Milizdaten, keine Save-Migration.

## Grafiken · aktualisiert 10.11.2026
Die drei Gebäude und alle 44 Lauf-/Angriffsframes werden aus dem unveränderten 768×768-Atlas des beigefügten Pakets geladen. Zusatzatlas: 24 generierte Posen, 8 Spalten × 3 Stufen, für Stand/Treffer/Tod/Rekrutierung. Registrierung, Timing, Herkunft und Prüfsummen: `dist/assets/barracks/integration-v2.json`.

Pro Figur genau ein Sprite-Blit. Die alten Canvas-Figuren/Gebäude sind entfernt. Zwei gemeinsam gehaltene Texturen, zusammen 3.75 MiB RGBA, keine Einzeltexturen je Figur. Bei noch fehlendem Zusatzatlas werden Übergänge mit dem Basisatlas gezeichnet; bei fehlendem Basisatlas keine überlagerten Ersatzfiguren. Visuelle Ingame-Abnahme weiterhin offen.

Upgrade erhält Figurenidentität und relativen LP-Stand. Rekrutierungstimer wird nicht mehr zurückgesetzt. Tote Einheiten bleiben 0.65 Sekunden als nicht angreifbare Animation, Verkauf entfernt alle zugehörigen Einheiten im nächsten Simulationsschritt. Tastaturauswahl 6 korrigiert.

## QA-Gates
- [ ] CI-Job `test` vollständig grün, Barracks-Regression inklusive
- [ ] Desktop-Chromium: Rekrutierung, Gegnergefecht, Upgrade/Verkauf, Bosswelle, Wellenende
- [ ] Mobile-Chromium: Tap-Bau, Upgrade, Verkauf, Touch-Steuerung
- [ ] Echte Android-Abnahme auf 4-GB-Gerät: 15–30 min große Wellen, FPS, RAM, Grafikflackern
- [ ] Alle vorgesehenen echten Sprite-Assets eingebunden und visuell freigegeben
- [ ] Keine JS-Fehler, HTTP-Fehler, Speicherlecks oder endlosen Spawns
- [ ] Merge nur nach erfolgreichen Checks und zusätzlicher Gameplay-Abnahme; Deployment danach unabhängig verifizieren
