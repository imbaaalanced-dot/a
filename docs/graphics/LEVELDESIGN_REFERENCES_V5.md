# Denkmal TD2 V5 – Zentrale Leveldesign-Referenzsammlung (1–7)

Stand 12.11.2026. **Dokumentation/Recherche, keine Asset-Integration und keine reale Android-Abnahme.**
Die ausführliche lokale Ausarbeitung führt zusätzlich die Material-IDs, das Quellenprotokoll und das Abnahmeverfahren.

## Quellensicherheit und Style Lock

- **R**: aus Hauptbranch-Dateien und vorhandener Projektdokumentation abgeleitet, kein neuer Screenshot-Nachweis.
- **F**: externe Bild-/Archivquelle gefunden und als Referenz verlinkt, nicht in den Runtime-Build kopiert.
- **K**: bewusste künstlerische Vorgabe, keine historische Behauptung.
- **U**: nutzerseitig eingereichte Foto-Referenz, sichtbares Motiv geprüft; Aufnahmedatum, Rechte und historischer Zustand können weiterhin offen sein.
- **O**: noch zu recherchieren, zu lizenzieren oder zu testen.
- **Historisches Bild** heißt datierte ältere Ansicht. Ein heutiges Foto eines alten Bauwerks ist nicht selbst eine historische Fotografie.
- Style 2: Graphic Dark Fantasy Illustration, bestehende 2.5D-Canvas-Projektion, dunkler verwitterter Stein, feuchte Erde, Moos, Schiefer, Alt-Holz, Bronze, Eisen, kontrolliertes warmes Seitenlicht von links oben. Türkise Runen nur sparsam; feindliche Tore rot (ART-DIRECTION.md).
- Spielgeometrie aus **dist/levels.js** ist verbindlich: Pfade, Tore, Bauplätze, Monumentanker, Kirchenfußpunkt, Terrassen, Kamera und Save-Keys dürfen nicht für ein Grafik-Update verändert werden. Alle Karten der realen Orte sind Gameplay-Annäherungen, keine Vermessungen.
- **Aktive Level-Reihenfolge:** 1 Einleitung; 2 Labyrinth; 3 Kriegerdenkmal Kirchende; 4 Ender Dorfkirche/Schlafender Löwe; 5 Hohensyburg; 6 Goethestraße; 7 Westhofen. Ältere Dokumente können abweichende Levelnummern führen.
- Neue Bilder erst nach Dateisichtung, Lizenzprüfung, echtem RGBA-/Pivot-/Atlas-Test, Abgleich mit dem zuständigen Loader und Sichtprüfung bei 64/128 px verwenden.

## Referenzmatrix

| Level | Architektur / Denkmal | Boden / Wege | Bäume / Vegetation | Beleuchtung (K) | Referenzen |
| --- | --- | --- | --- | --- | --- |
| **1 Einleitung** | Fiktionaler Monolith, Torpfeiler, niedrige Mauer (K) | Dunkles Schieferpflaster, vier gerade Zugänge, Erd-/Moossaum | Eiche/Buche, lockerer Waldrand | Warmes Torlicht in ruhiger Abenddämmerung | R/K; keine historischen Fotos nötig |
| **2 Das Labyrinth** | Fiktionale Ruinen, Pfeiler, Hecken (K) | Gemusterter Pflasterkern entlang der bestehenden geknickten Maze-Route; weicher Rand | Eiche/Buche, Heckenvarianten, Ranken | Kühler Dunst, wenige helle Knoten | R/K; keine historischen Fotos nötig |
| **3 Kirchende** | Erster-Weltkrieg-Kriegerdenkmal am Kirchender Dorfweg | Feuchter moosiger Erdboden, Laub, Steinstufen und schmale Platten | Große Laubbäume, Wurzeln, dichtes Gebüsch | Waldschatten und warmer Denkmalsockel | R/F, historische Gesamtansichten O |
| **4 Dorfkirche / Löwe** | Kirche mit Bruchsteinturm/Schieferdach, Schlafender Löwe von 1879, Grabsteine | Kopfsteinpflaster, alte Steinplatten, Rasen/Moos; vier Dorf-/Kirchhofzugänge | Alte Eichen, Sträucher | Warme Streifsonne mit langen Mauerschatten | R/F, alte Kirchhofpläne O |
| **5 Hohensyburg** | Heutiger Pylon und Reiterstandbild; Stein-/Treppenterrassen | Große Steinplatten, Stufen, Fels, Waldschotter; zwei Wald- und ein Terrassenzugang | Eichen/Buchen in den Waldtaschen | Kaltblauer Bergdunst, Goldlicht am Sockel | R/F; Vorkriegsbilder vorhanden, Abgleich O |
| **6 Goethestraße** | Ehrenmal 1926, Mauer, Rosen-/Parkanlage | Getrennte Stadtstraße, Parkweg, Ziegel-/Plattenrand; drei asymmetrische Zugänge | Parklaub, Rosen, Hecken | Gefilterte späte Sonne | R/F, Einweihungs- und frühere Parkbilder O |
| **7 Westhofen** | Geflügelter Helm, Schwert/Schild, Sockel, Steinrahmen, Straßenfront und Bushaltestelle | Steinplatten und Stufen am Denkmal, Kiesweg, Asphalt, Gehwegpflaster und Grünzug | Hohe Laubkronen, Efeu, Hecken, Grünstreifen | Kühles Abendblau mit Laternenakzenten (K) | R/F/U; undatierte fotografische Objekt- und Platzdetails vorhanden, historische Datierung O |

## Level 1: Einleitung

**R:** dist/style2-maps.js rendert die gemeinsame Kartenbasis und vier geradlinige Zufahrten (dist/levels.js).
**K:** Monolith, torartige Bruchsteinpfeiler und niedrige Bepflanzung; zwei Natursteinvarianten plus ein stiller dunkler Waldboden. Warme Lichtpunkte an den Toren, ohne die Lane zu überstrahlen.
**O:** identischer Hochformat-Screenshot des aktuellen Builds, verifizierter Monolith-Standfuß und Materialkarten. Keine reale historische Gebäudevorlage erforderlich.

## Level 2: Das Labyrinth

**R:** dist/style2-maps.js; eine feste kurvige/abgewinkelte Maze-Lane, Hecken und bestehende Tower-Slots.
**K:** Abgebrochene Ruinenkante, Hecken in wenigstens drei Silhouetten, Pflasterkanten mit Wurzeln/Moos; Nebel etwas kühler als Level 1.
**O:** Prüfbilder enger Knicke, Sichtbarkeit aller Bauplätze und keinerlei gezeichnete Phantom-Wege. Historische Vorlagen entfallen bewusst.

## Level 3: Kriegerdenkmal Kirchende

**R:** dist/kirchende-art.js, dist/terrain-polish.js und dist/forest-crowns.js; laut Projektbestand transparente Monumentvorlage, ground-style2-v1.webp und environment-atlas-style2-v1.webp. Alpha, exakter Loader und Laufzeitstatus müssen neu geprüft werden.
**F:** [Commons-Foto des Kriegerdenkmals gegenüber der Kirche, 2022](https://commons.wikimedia.org/wiki/File:Herdecke,_Kirchender_Dorfweg,_Kriegerdenkmal_gegen%C3%BCber_der_Kirche.jpg) und [Gesamtansicht Alter Friedhof/Kriegerdenkmal](https://commons.wikimedia.org/wiki/File:Herdecke,_Kirchender_Dorfweg,_alter_Friedhof_und_Kriegerdenkmal_gegen%C3%BCber_der_Kirche,_Bild_1.jpg). Aktuelle Fotovorlagen, keine alten Aufnahmen.
**Boden/Wege:** lückiges Gras, feuchte Erde, Moos, Laub, rechteckige dunkle Steinplatten und flache Stufen; vier vorhandene Annäherungspfade nicht verändern.
**Bäume/Licht (K):** große Buchen/Eichen, Wurzelwerk, dichte Sträucher und kühler Waldschatten mit wenigen warmen Spots.
**O:** datierte Monumentaufnahme um 1927, historischer Kirchender Weg-/Friedhofsblick, genaue Bank-/Treppensituation und Orientierung. Recherchieren beim [Stadtarchiv Herdecke](https://www.herdecke.de/portal/seiten/stadtarchiv-900000036-37460.html).

## Level 4: Ender Dorfkirche / Schlafender Löwe

**R:** dist/church-art.js, dist/style2-level4-reference.js, dist/levels.js; Kirchen-Footprint und Löwe sind unabhängige Objekte. Vier vorhandene Zugänge.
**F:** [Commons Dorfkirche Kirchende](https://commons.wikimedia.org/wiki/Category:Dorfkirche_Kirchende?uselang=de) (Gebäudeansichten, Grabsteine, Löwen-Unterkategorie) und [KdWupper: Ender Dorfkirche, Kirchhof und Löwe](https://www.kdwupper.de/historischer_friedhof_herdecke_kirchende.html). Der Schlafende Löwe wurde 1879 am Kirchhof errichtet, die Kirche zeigt Bruchsteinmauerwerk, Rundbogenfenster und dunkles Dach.
**Boden/Wege (K):** gröbere Steinkanten an Kirchhof und Gebäudefuß, verwittertes Pflaster, Gras zwischen Grabplatten. Dorfweg nicht zum breiten Phantasie-Boulevard umdeuten.
**Bäume/Licht (K):** alte Eichen, wenige Sträucher, schmale Schattenfuge um Mauern, weiche Streifsonne.
**O:** datierte alte Außenansicht der Kirche, Grundriss/Plan des früheren Kirchhofs, Fotos der Seiten- und Rückansicht des Löwen.

## Level 5: Hohensyburg / Kaiser-Wilhelm-Denkmal

**R:** dist/hohensyburg-art.js und syburgTerrace in dist/levels.js; erhöhte Plattform, unterer Vorplatz, zwei Treppen, Felskante, drei historische Spielzugänge.
**F:** [Commons moderne Ansichten](https://commons.wikimedia.org/wiki/Category:Kaiser-Wilhelm-Denkmal_(Dortmund-Syburg)), [Dehio Baugeschichte](https://de.dehio.org/bauwerk/syburg-hohensyburg-kaiser-wilhelm-denkmal), [LWL Geschichte](https://www.lwl.org/fremde-impulse-download/start/LWL/Kultur/fremde-impulse/die_baudenkmale/Impuls-Syburg-Westhofen/Kaiserdenkmal-Hohensyburg.html).
**WICHTIG:** 1902 ursprünglich neugotische Dreiturmanlage, **1935/36 grundlegend zum heutigen Pylon umgebaut**. Keine falsche Synthese beider Bauzustände. [Commons Historische Galerie](https://commons.wikimedia.org/wiki/Kaiser-Wilhelm-Denkmal_Syburg), [historische Postkarte ca. 1914](https://commons.wikimedia.org/wiki/File:Hohensyburg_-_Denkmal.jpg).
**Boden/Wege (K):** breite Steinplatten und Stützmauern, Treppen, Felsbruch und Waldboden; Wege nur entlang bestehenden Pfaden, Terrassen freihalten.
**Bäume/Licht (K):** Buchen/Eichen an den Außenrändern, kühler Dunst und leichtes Goldlicht auf Sockel.
**O:** Vor-/Nach-1935-Vergleich aus derselben Richtung, alte Platz-/Höhenpläne, hochaufgelöste Treppen- und Mauerfugen.

## Level 6: Herdecke Goethestraße

**R:** dist/goethestrasse-art.js: Parkboden, Gedenkmonument, Rosenbeete, Straßenkante; drei asymmetrische Zugänge und Luftlane.
**F:** [Commons Galerie Goethestraße](https://commons.wikimedia.org/wiki/Category:Kriegerdenkmal_Goethestra%C3%9Fe_(Herdecke)), [Foto Hauptdenkmal 2015](https://commons.wikimedia.org/wiki/File:Herdecke_Kriegerdenkmal.JPG). Stadt Herdecke führt das Kriegerdenkmal als Werk von Hans Dammann aus **1926**.
**Boden/Wege (K):** alter rotbrauner Parkweg und helleres Gehwegpflaster klar vom Asphalt absetzen; keine undifferenzierte einheitliche graue Fläche.
**Bäume/Licht (K):** große Parkkronen, Rosensträucher, niedrige Hecke, gefilterte Nachmittagssonne.
**O:** Fotografie der Einweihungszeit um 1926, historisches Park-/Straßenbild und frühere Rosenbeetgestaltung. Recherchieren über Stadtarchiv und städtische Denkmaldokumentation.

## Level 7: Kriegerdenkmal Westhofen

**R:** dist/westhofen-art.js; Street-/Grün-Boden, Busstopp, Denkmal. docs/WESTHOFEN_LEVEL.md nennt Reichshofstraße gegenüber Nr. 141, geflügelten Bronzehelm, Schwert/Schild, drei Tafeln, Bauzustand 2026; docs/STYLE2_V5_QUALITY_REVIEW_20261109.md nennt späteren transparenten Hauptsprite mit Canvas-Fallback. Nur Loader-/Sichtprüfung entscheidet den heutigen Runtime-Status.
**Zeitgrenze:** Projektquellen dokumentieren Diebstahl der zentralen Bronzetafel und zweier Feuerschalen am **20.07.2026**; für November 2026 ist die zentrale Tafel **leer** und sind beide Podeste **leer** vorgesehen. Bilder von 1928 und 2026 getrennt behandeln und extern gegen Primärbelege absichern.
**F Umraum:** [Stadt Schwerte ISEK Westhofen 2019, S. 47, Abb. 57–58](https://www.schwerte.de/fileadmin/RUBRIK/VERWALTUNG/61/61_Publikationen/Berichte/ISEK/ISEK_Westhofen_Endbericht.pdf) (historische Bebauung und Blick vom Denkmal); [Heimatverein Westhofen](https://www.reichshof-westhofen.de/westhofen.html); [Schwerter Fotogalerie](https://stadt-schwerte-bilderarchiv.jimdofree.com/start/ereignisse/westhofen/). Dies sind **Recherchelinks**, keine verifizierten Detailaufnahmen oder freigegebenen Ingame-Assets.
**Boden/Wege (K):** Asphalt der Reichshofstraße, Gehweg, Kies beim Denkmal, Grünstreifen und Hecken; die zwei Straßenarme vereinigen sich vor dem Denkmal, nördliche Grünschneise bleibt gesondert.
**Bäume/Licht (K):** lockere Straßenbaumreihe, deutlicher schmaler Schlagschatten, kühlblaue Abendstunde mit warmen Laternen.
**O P0:** datierte Frontansicht aus ca. 1928; Seiten- und Rückansichten; Stufen/Steinbalken/Pergola; Schwert/Schild/Helm/Tafeln; Foto vor und nach Juli 2026; alte Straßen- und Wegeansichten. Quelle und Nutzungsrecht je Bild prüfen.
**Assetgrenze:** Die früher erwähnten sieben generierten Westhofen-Bildgruppen sind ohne sichtbare Quelldateien nicht freigegeben. Alpha-Freistellung, Einzelsprites und Animationssätze sind weiterhin offene Prüfungen.

## Ergänzung 12.11.2026: neue Westhofen-Fotoreferenzen aus dem Chat

**Nutzerquelle U (7 JPG und 1 MP4):** [Bildindex und detaillierte Motivprüfung](westhofen-user-photo-references-20261112.md). Die Bilder wurden visuell geprüft, die Videoinhalte und EXIF-Metadaten hingegen in diesem Durchgang **nicht** technisch verifiziert. Die Originalmedien liegen nur in der Nutzerkonversation, **nicht im öffentlichen GitHub-Repository**. Urheberschaft, Bilddatum und Wiederverwendungsrechte sind offen.

**Neu durch Nutzerfotos direkt belegte Objektformen:** geflügelter Metallhelm mit dunkler Patina; querliegendes Schwert und großer Schild; separater Mittelsteinsockel; grobe gemauerte Pfeiler mit horizontalem Steinbalken und kräftigem Efeubewuchs; hochrechteckige Seitentafeln; mehrfach gestufte Treppen; unregelmäßige Steinplatten, niedrige Mauern, Bänke und dichter Parkbewuchs. Die freie Weitwinkelansicht `..._10813.jpg` ist besonders hilfreich für die Vorderplatz-Komposition; `..._471.jpg` für den Helm und `..._10845.jpg` für Sockel/Tafel. Personen und Fahrräder nicht in historischen Assets übernehmen.

**Zustand ungeklärt:** Die sichtbare **mittlere Tafel** und **mindestens eine Feuerschale** widersprechen dem für Ende 2026 in den Projektnotizen festgehaltenen Zustand nach dem Diebstahl am 20.07.2026. Es ist **nicht** bekannt, wann die Nutzerfotos aufgenommen wurden oder ob später etwas ersetzt wurde. Zwei gestalterische Zustandsreferenzen getrennt katalogisieren: `WFH-PHOTO-UNDATED-PRESENT` (fotografierte Tafel/Schale vorhanden) und `WFH-2026-DOCUMENTED-MISSING` (laut Projektchronik entfernte Tafel/Schalen). Für den laufenden Spielstand keine stillschweigende Änderung am bisherigen 2026-Asset vornehmen.

**Recherchepriorität angepasst:** Für Level 7 sind Frontalmotiv, Helm, Pfeiler, Vorplatz, Treppen und Baumbestand nun mit undatierten Nutzerfotos gut abgedeckt. Fehlend bleiben *datiertes* historisches Fotomaterial, verifizierte Seiten-/Rückansichten, EXIF/Aufnahmezeit und eine sichere Aufnahme nach Juli 2026.

## Gemeinsame Material- und Vegetations-Referenzen (Produktion, nicht Behauptung vorhandener Dateien)

| Kennung | Material/Objekt | Einsatz | Regel |
| --- | --- | --- | --- |
| MAT-STONE | Bruchstein, Sockel, Schiefer | 1–5/7 | Keine generischen Steine anstelle echter Denkmalsilhouetten |
| MAT-PATH | Natursteinpflaster, Platten, Stufen | 1–7 | Path-Spline aus dist/levels.js, softe Ränder, keine neuen Kreuzungen |
| MAT-EARTH | Feuchte Erde, Moos, Laub | 1–7 | Nahtlos, gecacht, keine fertigen Wege auf Boden-Tiles |
| MAT-URBAN | Asphalt, Bordstein, Kies | 6/7 | Straßen- und Parkflächen kontrastreich unterscheiden |
| VEG-TREE | Eiche/Buche, 3 Varianten | 1–7 | Fußanker und Kronenüberdeckung in Touch-Ansicht prüfen |
| VEG-LOW | Hecke, Farn, Wurzel, Rosen | 1–7 | Keine Blockierung von Pfaden oder Tower-Slots |
| AMBIENCE | warme Laterne, kühler Nebel | 1–7 | Keine übermäßigen Partikel und keine neue Canvas-Allokation pro Frame |

## Offene historische Bilder – priorisierte Suche

| Priorität | Level | Fehlender Beleg | Recherche |
| --- | --- | --- | --- |
| P0 | 7 | Westhofen: datierte 1928er Aufnahmen, Seiten-/Rückansichten, bestätigtes Foto nach Juli 2026, Datum der neuen Nutzerbilder (Front und Platz bereits undatiert belegt) | Stadtarchiv Schwerte, Heimatverein, Presse/Originalfoto-Inhaber; Nutzer-Originaldaten |
| P0 | 5 | 1902/1935/1936 aus gleicher Blickrichtung und Terrassengrundriss | Commons, LWL, Dortmund |
| P1 | 3 | Kirchender Denkmal um 1927, Wege/Ortssituation | Archiv Herdecke, Kirchengemeinde |
| P1 | 4 | frühes Dorfkirchenfoto, Kirchhofplan, Löwe von mehreren Seiten | Archiv, Gemeinde, Commons |
| P1 | 6 | Gedenkpark und Ehrenmal um 1926 | Archiv Herdecke, städtische Kunstobjektliste |
| entfällt | 1/2 | keine realen historischen Orte | interne Style-2-Referenzbilder |

## Quellen-/Lizenzprotokoll und Abnahme

Jedes künftige Bild erhält: **Quellen-URL/Archivsignatur, Urheber, Datum oder unsicher, Motiv/Blickrichtung, historischer Zustand, Lizenz/Nutzungsrecht, Referenz-nur oder Asset-freigegeben, Sichter und Datum**. Commons-Dateiseiten haben je eigene Lizenz; Fotos von anderen Websites sind ohne Genehmigung nur verlinkte Vorlagen.

Vor jeder Grafikübernahme: Alpha, Pivot/Frame, Atlaszuschnitt, gekachelte Wegränder, statische Caches und tatsächlich geladene Pfade prüfen. Dann Screenshotvergleich 64/128px und Hochformat auf jeder Karte, insbesondere Weg-/Turmsichtbarkeit. Erst Tests, CI, Desktop-Chromium, mobile Touch-Emulation und **separat echtes Android-Gerät mit 4 GB RAM** ausführen. Keine früheren Ergebnisse als neue Tests ausgeben.

Querverweise: ART-DIRECTION.md; docs/graphics/level-environment-audit.md; docs/graphics/style2-environment-plan.md; docs/KIRCHENDE_PHOTO_TERRAIN.md; docs/STYLE2_UMGEBUNGSPILOT_KIRCHENDE.md; docs/WESTHOFEN_LEVEL.md; docs/style2/2026-11-10-westhofen-asset-audit.md; dist/levels.js.

**Grenze dieser Änderung:** Nur Dokumentation. Kein Umbau, kein Merge-/Release-Nachweis, keine Live- oder Android-Freigabe.
