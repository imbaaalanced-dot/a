# TD2 Kaserne V1 · Balance und Abnahme
Status: experimenteller Entwicklungsbranch. **Kein Merge / kein Android-Pass / kein Live-Release** vor Runtime- und Geräteabnahme.

Die Werte sind ein erster Balance-Vorschlag, keine nachgewiesene Spielbalance. Die Kaserne kostet 55 Essenz. Aufwertung auf L2 kostet 35 und auf L3 50 (bestehender UI-Kostenpfad).

| Stufe | Rekrut | LP | Schaden | Intervall | Reichweite | Aktive Einheiten |
|---|---|---:|---:|---:|---:|---:|
| L1 Holzbaracke | Schwertmiliz | 65 | 8 | 1,20 s | 35 | 1 |
| L2 Steingarnison | Speerträger | 105 | 13 | 1,35 s | 57 | 2 |
| L3 Ordensfestung | Elite-Hellebardier | 150 | 21 | 1,70 s | 65 | 2 |

Rekrutierungsabstand L1/L2/L3: 13/12/14 s. Globaler Cap: 10 Milizsoldaten. Sie ziehen zur nächsten Lane, halten sich im lokalen Kampfbereich, kämpfen gegen Bodengegner und erleiden Rückschläge. Fluggegner, Sappeure und der Entwurzelte können sie umgehen. Keine persistenten Milizdaten, keine Save-Migration.

## Grafiken
Die drei genehmigten Gebäudebilder sowie 44 transparenten Lauf-/Angriffsframes existieren im lokal erzeugten Milizpaket. Dieses PR enthält **vorübergehend einfache Canvas-Grafiken** als technische Fallback-Darstellung, weil die binären Originalbilder noch nicht in das GitHub-Repository übertragen wurden. Die Fallbacks sind *nicht* der final freigegebene Style-2-Look.

Vor Freigabe echte WebP-Sprites für alle Stufen integrieren. Es darf pro Einheit nur ein aktiver Renderpfad existieren; keine Überlagerung durch Standgrafik. Zusätzliche Stand-, Treffer-, Sterbe- und Spawn-Frames sind noch zu erzeugen.

## QA-Gates
- [ ] CI-Job `test` vollständig grün, Barracks-Regression inklusive
- [ ] Desktop-Chromium: Rekrutierung, Gegnergefecht, Upgrade/Verkauf, Bosswelle, Wellenende
- [ ] Mobile-Chromium: Tap-Bau, Upgrade, Verkauf, Touch-Steuerung
- [ ] Echte Android-Abnahme auf 4-GB-Gerät: 15–30 min große Wellen, FPS, RAM, Grafikflackern
- [ ] Alle vorgesehenen echten Sprite-Assets eingebunden und visuell freigegeben
- [ ] Keine JS-Fehler, HTTP-Fehler, Speicherlecks oder endlosen Spawns
- [ ] Merge nur nach erfolgreichen Checks und zusätzlicher Gameplay-Abnahme; Deployment danach unabhängig verifizieren
