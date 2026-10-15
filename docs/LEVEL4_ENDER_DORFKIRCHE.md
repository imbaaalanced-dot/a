# TD2 V4 Alpha 6 – Ender Dorfkirche / Löwendenkmal

Stand: 15. Oktober 2026 · separater Entwicklungsbranch `feature/v4-level4-church-lion`, basiert auf dem kombinierten Kirchende-Bumerang-Branch.

## Historisch belegt

- Die **Ender Dorfkirche** in Herdecke-Kirchende hat mittelalterliche Ursprünge. Das heutige Kirchenschiff wurde 1756–1759 neu errichtet/eingeweiht.
- Das **Ehrenmal mit schlafendem Löwen** wurde **1879 auf dem alten Kirchhof** errichtet und erinnert an Gefallene der Kriege 1864, 1866 und 1870/71.
- Nicht verwechseln: Das anders gestaltete Ehrenmal für die Toten des Ersten Weltkriegs auf dem gegenüberliegenden Hülfiskirchhof wurde **1927** geweiht.

Quellen:
- https://www.kdwupper.de/historischer_friedhof_herdecke_kirchende.html
- https://www.kdwupper.de/herdecke-kirchende_ev_kirche.html
- https://commons.wikimedia.org/wiki/Category:Dorfkirche_Kirchende
- https://commons.wikimedia.org/wiki/Category:Ehrenmal_Schlafender_L%C3%B6we_(Ende)

## Spielumsetzung (bewusste Annäherung)

**Die genaue Topologie, Größen, Laufrichtungen und Turm-Bauplätze sind Gameplay-Entscheidungen und keine vermessene Rekonstruktion.**

- Verteidigungsziel Level 4 ist ausschließlich der 1879 errichtete **schlafende Löwe** (zentraler Plinth-Kontaktpunkt).
- Die Kirche liegt in der Kulisse nordöstlich des Ziels: Bruchsteinmauerwerk, Rundbogenfenster, Turmuhr, Schieferdach. Ein altes Grabsteinfeld und Bänke ergänzen den Kirchhof.
- Vier zugängliche Wege führen um das Gebäude zum Löwen; die Wege sind fest und vermeiden Kirchensockel und Bauplätze.
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