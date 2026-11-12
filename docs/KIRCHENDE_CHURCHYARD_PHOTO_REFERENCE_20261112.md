# Kirchende / Ender Dorfkirche: Foto-Referenzbrief für Denkmal TD2 Style 2

Stand: 2026-11-12. Quellen: zehn vom Nutzer bereitgestellte Vor-Ort-Fotos vom 23.10.2026 (165, 166, 167, 168, 169, 170, 172, 173, 174, 178.jpg); Foto-Wasserzeichen ungefähr 51°25'8"N 7°25'22"E. Diese Bilddateien sind derzeit **Gesprächsanhänge, nicht als GitHub-Assets bestätigt**. Nicht behaupten, dass Originalbilder im Repository vorliegen. Keine automatisch aus GPS abgeleitete Bauwerksvermessung.

## Levelzuordnung

Die Serie zeigt den Kirchhof unmittelbar neben einem Bruchstein-Kirchenbau, mit Grabsteinen und einem **liegenden Löwen auf hohem, mehrstufigem Steinsockel**. Sie ist besonders für **Level 4: Ender Dorfkirche / Löwendenkmal** einschlägig, vergleiche `docs/STYLE2_LEVEL4_REFERENCE.md`. Das separate **Level 3: Kirchende** besitzt eine eigene Foto- und Terrain-Dokumentation (`docs/KIRCHENDE_PHOTO_TERRAIN.md`). Historische Landmarken und Laufwege beider Level nicht verwechseln. Die genauen Spielfeldkoordinaten müssen im aktuellen Quellcode geprüft werden.

## Bildinventar (sichtbare Beobachtungen, keine Vermessung)

| Datei | Sichtbarer Inhalt | Produktionsrelevanz |
| --- | --- | --- |
| 165.jpg | Kirchhofübersicht: fächerförmiges helles Kleinpflaster, begrünte Grabstätte mit unterschiedlich hohen Steinen, Denkmal, Wohn- und Fachwerkhäuser, Laternen | Layout- und Materialreferenz |
| 166.jpg | Kirchenmauer links, geschwungener Pflasterweg, Kirchhofgrabfeld rechts, großer Laubbaum und Wohnhaus | Weganschlüsse und Höhenstaffelung |
| 167.jpg | Kirchenecke mit zwei Wandtafeln, schmalem Nebenportal, Natursteinfassade und bogenförmigem Kopfsteinpflaster | Fassadendetails und Wege |
| 168.jpg | Vier großformatige Steinrelief- und Gedenktafeln an grober Kirchenmauer, seitliche Plattenwege und niedrige Steinmauer | Reliefmodule, Randbegrenzung |
| 169.jpg | Helle Rundbogen-Rahmungen, dunkle zweiflügelige Kirchentür, hohe Fenster an Natursteinfassade | Portal-/Fenstermodul |
| 170.jpg | Nahansicht eines bleiverglasten Kirchenfensters, heller Fenstersockel und unregelmäßige Mauersteine | Materialspezifikation |
| 172.jpg | Dunkles Rundbogen-Türblatt mit Metallring, heller verzierter Steinrahmen und Bogeninschrift | Hauptportal-Detail |
| 173.jpg | Steinernes Denkmal mit liegendem, moosigem Löwen, Inschriftentafel, Stufensockel und benachbarten Grabsteinen | Landmarkenmodell |
| 174.jpg | Zweiter Blick auf denselben Löwensockel, Pflaster und angrenzendes Fachwerk-/Steinhaus | Silhouette und Maßrelation |
| 178.jpg | Längsseite des Kirchengebäudes: mehrere Rundbogenfenster, Schieferdach, gewölbte Pflasterbögen | Gesamtarchitektur und Boden |

Weder Nordrichtung, exakte Gebäudemaße, Höhen noch Lage aller Grabsteine lassen sich aus diesen perspektivischen Aufnahmen verlässlich gewinnen. Beschriftungen dürfen nicht erfunden werden.

## Verbindliche sichtbare Eigenschaften

1. **Boden:** helle graue Kleinpflastersteine in gebogenen Fächer-/Bogenverbänden, dunkle Fugen, punktuell Moos. An den Mauern unregelmäßige flache Natursteinplatten; auf Grünflächen ungleichmäßiges Herbstlaub.
2. **Kirche:** geschichteter grau- bis sandbrauner Bruchstein mit dunklen Fugen; hohe, rundbogige Bleiglasfenster in hellen, geometrisch klaren Steinrahmen; teils dunkle Holztüren; Schieferdach. Helle Portalrahmungen müssen als Architekturdetails, nicht als magische Leuchteffekte erscheinen.
3. **Denkmal:** liegender Löwe oben auf dem Sockel, quadratischer hoher Steinkörper mit Tafeln und Ornamenten sowie abgestuften Sockelplatten. Front- und Seitenbezüge aus 173/174 ableiten, **Ausrichtung im Spiel unverändert lassen**.
4. **Grabfeld:** unterschiedliche alte Natursteine, unregelmäßige Formen, einige mit Rund-/Wellenkontur, auf niedrigem Rasen; keine standardisierten modernen Grabkreuze als Ersatz.
5. **Vegetation und Umgebung:** große Laubbäume mit spät-herbstlichen Kronen, Laub am Boden, Sträucher; zurückhaltende gebogene Straßenlaternen; Fachwerkfassaden in Randebene.

## Style-2-Übersetzung (künstlerisch, nicht als Originalbefund)

- Hochwertige handgemalte, leicht erhöhte 2.5D-Isometrie, definierte Bodenanker, identische Blickrichtung für alle Sprites.
- Dunkelere Schattenfugen und mehr Materialtiefe, aber lesbare Wege und Türme; lichtwarme Kanten bei Laternen und Fenstern sparsam.
- Dezente Nebelschicht und kleine Laubpartikel nur auf Qualitätsstufe, ohne zufällige Laufzeit-Canvas-Erzeugung.
- Kein erfundener Friedhofsumbau, keine veränderte Anzahl historisch bedeutsamer Denkmäler, keine frei erfundenen Inschriften.

## Geometrie-, Render- und Android-Vertrag

- Unverändert: Gegnerwege, Path-Endpunkte, Start-/Zielanker, Turm-Bauplätze, Kollision/Hitboxen, Löwen-Ausrichtung, Wellen, Save-Keys.
- **Nicht** einen kompletten fotografischen Grundriss als einziges Hintergrundbild an den bestehenden Canvas skalieren. Bodenmaterialien als wiederverwendbare Texturen, Architektur/Denkmäler als separate verankerte Sprites vorbereiten.
- Deko von begehbaren Routen und Bauplätzen fernhalten; Tiefensortierung und Alpha-Ränder mit realen Spielfiguren prüfen.
- Mobile Hardware: Android 4 GB RAM. Optimierte WebP-Runtimegrafiken, einzelne Masterquellen, kein zusätzliches Bilddecode pro Frame, Terrain-Cache wiederverwenden. Exakte Pixel-/Atlasbudgets erst nach Prüfung bestehender Renderer- und Assetbudgets festlegen.
- Bei Ladefehler Canvas-Fallback erhalten; keine Assetnamen oder Cache-Keys vor Manifestabgleich überschreiben.

## Fototreue-Check vor Integration

- Liegt der **Löwe** auf dem Denkmal? Ist die Silhouette auch bei 64/128 px klar erkennbar?
- Sind Tür-/Fensterbögen gerundet, und ist das Bruchsteinmauerwerk nicht mit gleichmäßigem Ziegel verwechselt?
- Zeigt der Boden eine **gebogene**, nicht rechtwinklig gekachelte Pflasterstruktur? Folgt die tatsächliche Gegnerroute weiter den Leveldaten?
- Sind Grabsteine, Laternen und Fachwerk Umgebungselemente, keine neue Path-Geometrie?
- Bleiben Helden/Gegner visuell lesbar? Sind vorhandene Spielfunktionen, CI, Chromium und **echtes** Android unabhängig geprüft?

## Umsetzungsreihenfolge

1. Referenz-Materialbibliothek: Kopfsteinpflaster, Natursteinplatten, Kirchen-Bruchstein, Gras/Herbstlaub.
2. Kirchen-Fenster, Portal, Reliefplatten als zusammengehörige Fassadenmodule; Kamera und Pivot abgleichen.
3. Löwendenkmal isoliert freistellen und gegen Fotos 173/174 prüfen; keine bestehende Grafik vor erfolgreicher Abnahme löschen.
4. Grabsteinvarianten, Baumkronen, Laternen, Randhäuser hinzufügen.
5. Side-by-side mit Gameplay-Screenshots und Fotos, Node-Tests, Chromium-Touch-Emulation, danach reales Android-Gerät mit 4 GB RAM.

## Verweise

- `docs/STYLE2_LEVEL4_REFERENCE.md` (Level 4: Ender Dorfkirche, Löwenanker)
- `docs/KIRCHENDE_PHOTO_TERRAIN.md` (separates Level 3)
- `ART-DIRECTION.md` (historischer Grafiksystemstand)
- Companion: `docs/KIRCHENDE_STYLE2_ASSET_PROMPTS_20261112.md` (Prompts, QA-Ablauf).
