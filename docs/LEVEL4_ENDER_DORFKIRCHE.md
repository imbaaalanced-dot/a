# TD2 V4 Alpha 6 – Ender Dorfkirche / Löwendenkmal

Stand: 16. Oktober 2026 · separater Entwicklungsbranch `feature/v4-level4-church-lion`, basiert auf dem kombinierten Kirchende-Bumerang-Branch.

## Historisch belegt

- Die **Ender Dorfkirche** in Herdecke-Kirchende hat mittelalterliche Ursprünge. Das heutige Kirchenschiff wurde 1756–1759 neu errichtet/eingeweiht.
- Das **Ehrenmal mit schlafendem Löwen** wurde **1879 auf dem alten Kirchhof** errichtet und erinnert an Gefallene der Kriege 1864, 1866 und 1870/71.
- Nicht verwechseln: Das anders gestaltete Ehrenmal für die Toten des Ersten Weltkriegs auf dem gegenüberliegenden Hülfiskirchhof wurde **1927** geweiht.

Quellen:
- https://www.kdwupper.de/historischer_friedhof_herdecke_kirchende.html
- https://www.kdwupper.de/herdecke-kirchende_ev_kirche.html
- https://commons.wikimedia.org/wiki/Category:Dorfkirche_Kirchende
- https://commons.wikimedia.org/wiki/Category:Ehrenmal_Schlafender_L%C3%B6we_(Ende)

## Lagebezug / belastbare Quellen (Alpha 6.2)

- Dorfkirche / OSM-Gebäudefläche **way 30729509**: vereinfachte Karten-Mittelpunktkoordinate ca. **51,41905° N / 7,42299° E**, Quelle: https://mapcarta.com/W30729509
- Denkmal-Kategorie Wikimedia Commons: **51,418844° N / 7,423072° E**, Quelle: https://commons.wikimedia.org/wiki/Category:Ehrenmal_Schlafender_L%C3%B6we_(Ende)
- ACHTUNG: Die GPS-Angabe des zugehörigen Fotos von 2012 kann der **Kamerastandort** sein. Auch die Kartenmitte ist keine amtliche Vermessungsreferenz. Aus den Punkten folgen ca. **23 m Nord-Süd- und 6 m Ost-West-Versatz**, aber **keine belastbare Aussage über den exakten Abstand zwischen Fassadenkante und Sockel**.
- Für die räumliche Korrektur wird daher die **relative Position** und eine *vorläufige* Umrechnung von **22 Pixeln/Spielmeter** verwendet. Kirchenbild: relativer Rahmen `x=-500,y=-930,w=720,h=760` mit Boden-Kollisionsfußabdruck `x=-415..235, y=-700..-290`; Löwe bei `(0,0)`. Daraus entsteht ein deutlicher Innenhof zwischen südlicher Kirchenwand und Löwen.
- **Nicht als Originalmaß angegeben:** Länge, Breite und Turmhöhe des Kirchenschiffs sowie Sockelhöhe/-breite. Diese Werte erfordern Gebäudebestandszeichnungen, ALKIS oder Aufmaß. Das Spiel bleibt stilisiert.
- Referenz des *wirklichen* Sockels (1879, Löwe über hohen verzierten Steinpfeilern und Bronze-Inschrifttafel): https://commons.wikimedia.org/wiki/File:Schlafender_Loewe.jpg und https://www.kdwupper.de/historischer_friedhof_herdecke_kirchende.html

## Spielumsetzung (bewusste Annäherung)

**Die genaue Topologie, Größen, Laufrichtungen und Turm-Bauplätze sind Gameplay-Entscheidungen und keine vermessene Rekonstruktion.**

- Verteidigungsziel Level 4 ist ausschließlich der 1879 errichtete **schlafende Löwe** (zentraler Plinth-Kontaktpunkt).
- Die Kirche ist im Testmodell **nördlich und leicht westlich** des Löwen versetzt. Ein gestrecktes Kirchenschiff mit Schieferdach, Bruchsteinmauern und altem Westturm ersetzt die kompakte Vorversion.
- Der Löwe sitzt auf einem **hohen, reich ornamentierten Sockel mit Bronzetafel** (nicht mehr auf einem flachen Quader). Das gesamte Denkmal-Sprite ist 20 % kleiner als der neue Ausgangs-Canvas und im Vergleich zur Kirche proportional zurückgenommen.
- Alte Grabplatten, Bänke und größere Eichen liegen außerhalb der Kirchenmauern. Die Kirche besitzt einen eigenen Kollisionsbereich; Marcel kann sie auch beim Ausweichen nicht durchqueren.
- Vier zugängliche Wege führen um das Gebäude zum Löwen; ihre Mittelachsen haben nun mindestens 48 Pixel Abstand vom gebauten Kirchen-Fußabdruck. Bauplätze halten mindestens 40 Pixel Abstand von den Mauern.
- Vier Wellen **13–16**, 245 Startessenz, maximal 10 Türme, ab Welle 16 ein „Grabwächter“ als Boss (bestehende Bossmechanik, vorerst kein neues Boss-Sprite).
- Der Bumerangturm bleibt auch in Level 4 verfügbar; Gegnerjagd auf Marcel nutzt die bestehende auf drei Gegner begrenzte Wegkorridor-Aggro.
- Gecachte Canvas-Kulissen: keine neue Kirche-/Pflastererzeugung in jedem Frame.
- Nach Abschluss der regulären Welle 16 wird das Endlosspiel für Level 4 gespeichert (`denkmal-level4-completed-v1`), ohne alte Speicherstände zu verändern.

## Direkte Testvorschau

Dieser Zweig veröffentlicht isoliert auf `/a/v4-level4/`. Nur dort ist die Level-4-Kampagnenkarte trotz noch fehlender Kirchende-Freischaltung testweise anklickbar. **Ein solcher Preview-Durchlauf schreibt keinen Level-4-Abschluss in den regulären Spielstand.** Das echte Level-4-Endlosspiel bleibt gesperrt, bis Level 3 regulär abgeschlossen und Level 4 ebenfalls gewonnen wurde.

## QA

- `node tests/level4.test.cjs` und `TEST_MOBILE=1 node tests/level4.test.cjs`
- Bestehende Gameplay-, Menü-, Cache-, Kirchende- und Bumerang-Tests
- **Noch offen:** echtes Android-Hochformat, FPS bei mehreren Türmen, Kollisions-/Lesbarkeitstests im Kirchhof, Balance Wellen 13–16 und detailgetreue kirchliche Architektur/Sprite-Verfeinerung.

Nicht ohne grünes CI und Sichtprüfung in `main` mergen.