# Denkmal TD2 – Grafik-Overhaul V4 (Style 2)

**Status:** Gesamtdesign vom Nutzer am 16. Oktober 2026 freigegeben

**Arbeitsbranch:** feature/v4-graphic-overhaul-style2

**Basis:** feature/v4-level4-church-lion

**Produktionsziel:** Browser, Android-Browser und spätere WebView/APK

**Geschützte Linie:** main und bestehende Live-Builds bleiben unverändert

## 1. Ziel

Denkmal TD2 erhält ein vollständiges, einheitliches Grafikpaket im Stil einer Graphic-Dark-Fantasy-Illustration. Die Darstellung kombiniert eine präzise Top-down-Spielgeometrie mit einer optischen 2.5D-Isometrie. Detaillierte Steinflächen, dunkle Wälder, warme Laternen und kontrollierte blaue Magie erzeugen Atmosphäre, ohne Gegnerwege, Bauplätze oder Treffer zu verdecken.

Die Überarbeitung umfasst vier Karten, separate Architektur- und Dekorationssprites, Bodentexturen, fünf Turmfamilien mit je drei Stufen, Projektile, Trefferanimationen, HUD, Icons und Hauptmenügrafiken.

## 2. Nicht-Ziele

- Keine echte isometrische Koordinatentransformation.
- Keine Änderung von Gegnerpfaden, Reichweiten, Schaden oder Balancing durch Grafiken.
- Keine Einführung der älteren Konzepte Äther-Säule, Chrono-Obelisk oder Portal-Bastion.
- Keine Zusammenführung ungetesteter Änderungen aus divergierten Feature-Branches.
- Keine Veröffentlichung auf dem bisherigen Live-Pfad.
- Keine Behauptung, künstlerisch ergänzte Wege oder Gebäudeansichten seien vermessen oder historisch belegt.

## 3. Technische Grundlage

Die Weltkoordinaten bleiben 3072 × 3072. levels.js bleibt die autoritative Quelle für:

- Tore und Spawnpunkte
- Gegnerpfade
- Bauplätze
- Zielkoordinaten
- Levelgrenzen und Freischaltungen

Grafiken folgen diesen Daten. Bauplätze, Pfeile und Wegmarkierungen werden nicht fest in Kartenhintergründe gemalt, sondern an den Laufzeitkoordinaten gerendert.

Der neue Grafik-Branch basiert auf feature/v4-level4-church-lion, da dort Level 4, Kirchengeometrie, Löwenziel und aktuelle Kirchende-Assets vorhanden sind. Änderungen aus feature/v4-boomerang-hero-aggro-monument werden erst in einem getrennten Integrationsschritt anhand der Tests geprüft.

## 4. Asset-Architektur

Jede Karte liegt unter dist/assets/maps/level-N/ und besitzt folgende logische Ebenen:

| Ebene | Aufgabe | Transparenz |
| --- | --- | --- |
| ground.webp | Gras, Erde, Pflaster, Gelände und festes Umgebungslicht | nein |
| paths.webp | exakt abgestimmte Wege und Übergänge | ja |
| decor-back.webp | niedrige Mauern, Hecken, Grabsteine, kleine Vegetation | ja |
| structures.webp oder Einzelsprites | Denkmal, Kirche, Löwe und große Objekte | ja |
| decor-front.webp | Baumkronen, Torbögen und Vordergrundüberdeckung | ja |
| map.json | Koordinaten, Anker, Varianten, Quellenstatus und Version | entfällt |

Gemeinsame Assets:

- dist/assets/environment/ für Boden-, Weg-, Mauer-, Tor-, Baum- und Laternenmodule
- dist/assets/towers/style2/ für Turmstufen und Waffenaufsätze
- dist/assets/projectiles/style2/ für Geschosse
- dist/assets/fx/style2/ für Treffer- und Mündungsanimationen
- dist/assets/ui/style2/ für HUD, Buttons, Rahmen und Icons
- dist/assets/menu/style2/ für Hauptmenühintergrund und Charakterdarstellung

## 5. Grafikmanifest

Ein Laufzeitmanifest ordnet Assets und Metadaten zu. Jeder Eintrag enthält:

- id und Version
- Levelnummer
- Desktop- und Androidquelle
- Weltposition
- Ankerpunkt
- Zeichnungsreihenfolge
- sichtbare und optionale Kollisionsgrenzen
- historische Einstufung: belegt, rekonstruiert oder künstlerisch
- Quellenhinweis
- Cache-Kennung

Das Manifest darf Pfade und Bauplätze referenzieren, aber nicht unabhängig neu definieren.

## 6. Verbindlicher Styleguide

### 6.1 Perspektive und Form

- Spielgeometrie: Top-down
- optischer Eindruck: 2.5D mit etwa 60 Grad Kamerahöhe
- senkrechte Bauteile bleiben parallel und gut lesbar
- sichtbare Seitenflächen erzeugen Tiefe
- einheitliche Kontaktschatten nach rechts unten
- identische Ankerkonvention für alle Türme und Bauwerke: Mitte der Bodenfläche

### 6.2 Farbwelt

| Funktion | Farbgruppe |
| --- | --- |
| Grundflächen | Anthrazit, Schiefergrau, dunkles Waldgrün |
| Vegetation | gedämpftes Moos, Tannengrün, dunkles Rotbraun |
| Licht | Bernstein, warmes Orange, zurückhaltendes Gold |
| Metall | Bronze, geschwärztes Eisen, verwitterter Stahl |
| Magie | kontrolliertes Ätherblau |
| Warnung/Gegner | gedämpftes Rot und glühendes Orange |

Blau bleibt Helden-, Magie- und Spezialeffekten vorbehalten. Wege müssen etwa 25 bis 35 Prozent heller als angrenzendes Gelände wirken.

### 6.3 Materialregeln

- Stein besitzt unregelmäßige Fugen und verwitterte Kanten.
- Moos darf keine Silhouette, Türöffnung oder Spielfläche verdecken.
- Holz zeigt klare Träger und Metallbeschläge.
- Bronze wird an Kanten heller und in Vertiefungen dunkel patiniert.
- Laternen erzeugen kleine, kontrollierte Lichtinseln.
- Nebel liegt überwiegend an Kartenrändern und nie deckend über Gegnerwegen.

### 6.4 Lesbarkeit

- Hauptwege erhalten eine durchgehende sichtbare Kontur.
- Baumkronen dürfen Hauptwege nur in einer separaten Vordergrundebene kurz überdecken.
- Bauplätze nutzen ein gemeinsames steinernes Plattform-Sprite mit Bronzeumrandung.
- Aktive Bauplätze werden zusätzlich über Laufzeitfarbe und Symbolstatus kenntlich gemacht.
- Architektur bleibt realistischer und weniger ornamental als die Fantasy-Umgebung.
- Texte, Richtungspfeile und Sterne sind UI-Ebenen, keine Bestandteile der Kartenbilder.

## 7. Karten

### 7.1 Level 1 – Einleitung

**Funktion:** übersichtliches Tutorial.

- freistehender zentraler Gedenkobelisk
- vier symmetrische Tore an Nord, Ost, Süd und West
- breite, gerade Pflasterwege zum Zentrum
- niedrige Mauern, kleine Zypressen und reduzierte Randvegetation
- geringere Nebeldichte als in späteren Karten
- paarweise Bauplatzgruppen entlang der vier Zugänge
- historische Einstufung des Denkmals: künstlerisch

Alle bestehenden Gate-, Pfad- und Slotkoordinaten bleiben erhalten.

### 7.2 Level 2 – Labyrinth

**Funktion:** taktische Wegkurven und Engstellen.

- ein sichtbarer Haupteingang passend zum bestehenden Maze-Pfad
- heller, verschlungener Weg
- dunkle Hecken und niedrige Bruchsteinmauern
- Laternen an wichtigen Richtungswechseln
- Bauplätze außerhalb der Kurven
- hohe Baumkronen nur am Rand
- historische Einstufung: künstlerisch

Das derzeit feste Labyrinth bleibt bestehen. Freie Blockaden und dynamisches Maze-Building sind nicht Teil dieses Overhauls.

### 7.3 Level 3 – Kriegerdenkmal Kirchende

**Funktion:** erster historisch orientierter Schauplatz.

- Denkmal als separates Sprite
- alter Friedhof, Einfriedung, Baumgruppen und Straßenlage als visuelle Grundlage
- vier spielbare Anmarschwege entsprechend der aktuellen Leveldefinition
- reale Geländeformen verbinden die spielbaren Routen
- nicht belegte Verbindungen unter Bäumen werden als Rekonstruktion markiert
- Häuser bleiben dunkle Randkulisse
- Sockel und Kontaktschatten verhindern einen schwebenden Eindruck

**Einstufung:**

- Denkmalform und wesentliche Ortsbezüge: belegt
- verdeckte oder spielerisch ergänzte Wege: rekonstruiert
- Laternen, Nebel und Fantasy-Effekte: künstlerisch

### 7.4 Level 4 – Ender Dorfkirche und Schlafender Löwe

**Funktion:** räumlich klarer historischer Kirchhof mit separatem Schutzziel.

- Dorfkirche im nordwestlichen Kartenbereich
- Schlafender Löwe südlich beziehungsweise südöstlich als eigenes Ziel
- freier Vorplatz zwischen Kirche und Löwe
- ungefähr 500 Weltpixel Trennung auf Basis der dokumentierten relativen Lage
- Gegnerpfade enden ausschließlich am Löwen
- Kirche ist Kulissenobjekt und kein Trefferziel
- Friedhofsmauer, Grabsteine und Bäume bilden den äußeren Spielraum
- getrennte Silhouetten ohne optische Verschmelzung

**Einstufung:**

- Kirche und Löwe: belegt
- exakte Spielwege und Teile der Vegetation: rekonstruiert
- Licht, Nebel und Fantasy-Verteidigungselemente: künstlerisch

## 8. Turmsystem

Der Grafik-Overhaul umfasst fünf aktive Familien.

| Familie | Stufe 1 | Stufe 2 | Stufe 3 |
| --- | --- | --- | --- |
| Bogenturm | Holzgerüst, einfacher Bogen | Steinbasis, verstärkter Bogen | monumentaler Präzisionsturm mit Bronze |
| Kanonenturm | kleine Kanone, Holzkugel | befestigte Lafette, Eisenkugel | schwere Stahlkanone, Explosivgeschoss |
| Magieturm | kleines blaues Flammenbecken | Runenfassung, größerer Fokus | schwebender Ätherkern |
| Rift-/Blitzturm | einzelne Steinsäule | Doppelspule mit Bronzeleitern | monumentale Blitzlanze |
| Bumerangturm | Holz-Bumerang | dunkler Verbund-/Kunststoff-Bumerang | rotierendes Sägeblatt |

Für jede Familie gelten:

- gleiche Grundfläche in allen Stufen
- identischer Bodenanker
- nachvollziehbare Material- und Größenprogression
- klare Silhouette bei Android-Zoom
- Sterne separat unter dem Turm
- keine eingebrannten Projektile

## 9. Projektile und Treffer-FX

- Pfeile drehen sich entlang ihrer Flugrichtung.
- Kanonengeschosse entwickeln sich von Holz über Eisen zum glühenden Explosivgeschoss.
- Magiegeschosse verwenden kompaktes Ätherblau und kurze Leuchtspuren.
- Riftangriffe zeigen einen starken Hauptblitz und dünnere Kettenblitze.
- Bumerangs besitzen erkennbare Rotation sowie Hin- und Rückflug.
- Mündungs- und Trefferanimationen umfassen in der Regel sechs bis acht kurze Frames.
- Eine einzelne Animation dauert höchstens etwa 0,4 Sekunden.
- Rauch, Funken, Splitter und Lichtblitze respektieren feste Partikelobergrenzen.
- Geschosse entstehen sichtbar am Waffenanker des Turms.
- Effekte dürfen Gegner, Lebensbalken und Zielvorschau nicht länger verdecken.

## 10. HUD und Hauptmenü

- hochauflösende Stein- und Bronzerahmen
- dünne bernsteinfarbene Lichtkanten
- keine grobe Pixeltypografie
- Marcel der Beschützer im Graphic-Dark-Fantasy-Stil als Hauptmenümotiv
- große Kampagnen- und Endloskarten
- eindeutige Turmicons mit Rollenfarbe
- mindestens 48 × 48 CSS-Pixel große Touchflächen
- Dropdown-Menü unter Modal- und Beuteansichten
- Versionsnummer nur unter Einstellungen oder Info
- getrennte Hochformatbereiche für Status, Arsenal und Steuerung
- kein dauerhaftes Verdecken von Weg, Ziel oder Gegnern

## 11. Export- und Leistungsbudgets

| Asset | Zielbudget |
| --- | --- |
| Desktopkarte 3072 × 3072 WebP | höchstens 3 MB |
| Androidkarte 2048 × 2048 WebP | höchstens 1,5 MB |
| Monument oder Kirche | höchstens 800 KB |
| einzelne Turmstufe | höchstens 250 KB |
| einzelnes FX-Sheet | höchstens 512 KB |
| initial geladene Spieldaten | höchstens 10 MB |
| Laufzeittextur auf Android | maximal 2048 px pro Kante |

Arbeitsmaster dürfen verlustfreie 3072 × 3072 PNG-Dateien sein. Laufzeitdateien verwenden bevorzugt WebP; Transparenzobjekte können PNG oder verlustfreies WebP verwenden.

Nur die aktuelle Karte und deren besondere Objekte werden geladen. Gemeinsame Türme, UI-Elemente und wiederverwendbare Dekorationen werden in Atlanten organisiert.

## 12. Historische Dokumentation

Für jedes reale Objekt wird eine Quellenliste geführt. Die Dokumentation unterscheidet:

- **Belegt:** Fotos, Denkmalliste, amtliche Beschreibung oder belastbare Geodaten
- **Rekonstruiert:** aus Referenzen abgeleitete, aber nicht vermessene Rückseiten, Wege oder Vegetation
- **Künstlerisch:** Beleuchtung, Nebel, Fantasy-Magie, Tore und taktische Plattformen

Bekannte Referenzen:

- Stadt Herdecke: Kunstobjekte im öffentlichen Raum, Schlafender Löwe, Standort Kirchender Dorfweg 42, Datierung 1879
- Wikimedia Commons: Dorfkirche Kirchende, Kriegerdenkmal Kirchende und alter evangelischer Friedhof
- öffentliche Geodaten zur relativen Lage von Kirche und Löwe
- vom Nutzer bereitgestellte Fotos und Grafikreferenzen

Quellen und Lizenzen werden in einem Asset-Manifest dokumentiert. Fremde Referenzen werden nicht ungeprüft als direkt weiterverwendbare Spielassets behandelt.

## 13. Integration

Die Rendering-Reihenfolge lautet:

1. Grundebene
2. Wege
3. niedrige Dekoration
4. Bauplätze
5. Figuren, Gegner, Türme und Projektile nach Welt-Y
6. Bauwerke und dynamische Objekte nach Welt-Y
7. Vordergrundüberdeckungen
8. Effekte
9. HUD

Bestehende APIs für Pfade, Türme, Projektile und Kampf bleiben erhalten. Notwendige Refactorings beschränken sich auf Assetladen, Ankerpunkte, Ebenen und Manifestzugriff.

## 14. Tests

### 14.1 Automatisch

- alle Manifestdateien sind gültig
- alle referenzierten Dateien existieren
- Dimensionen und Dateibudgets sind eingehalten
- Desktop- und Androidvarianten sind vorhanden
- Bauplätze besitzen ausreichenden Abstand zu Pfaden
- Bauplätze liegen nicht in definierten Bauwerksflächen
- alle vier Tore und Pfade von Level 1 bleiben erhalten
- Level 4 endet ausschließlich am Löwenziel
- Kirchen- und Löwenposition haben die spezifizierte Mindesttrennung
- Cache-Versionen werden konsistent aktualisiert
- vorhandene Kampf-, Speicher- und Kampagnentests bleiben grün

### 14.2 Visuell

Testansichten:

- 360 × 800
- 412 × 915
- 1366 × 768
- 1920 × 1080

Jede Karte wird zusätzlich mit Debug-Overlay für Tore, Pfade, Bauplätze, Bauwerksgrenzen und Zielpunkt geprüft.

### 14.3 Gerätetest

Ziel sind stabile mindestens 30 FPS auf einem mittelklassigen Android-Gerät bei einer repräsentativen Kampfszene mit Gegnern, Türmen und Effekten. Das Ergebnis wird als reale Messung dokumentiert und nicht aus Desktopwerten abgeleitet.

## 15. Abnahmekriterien

Der Grafik-Overhaul gilt als abnahmebereit, wenn:

1. alle vier Karten im selben Style-2-System vorliegen;
2. Wege, Tore, Zielpunkte und Bauplätze mit levels.js übereinstimmen;
3. Kirche und Löwe klar getrennt sind;
4. Denkmäler und Kirche als separate Assets verfügbar sind;
5. alle fünf Turmfamilien drei unterscheidbare Stufen besitzen;
6. Projektile und Trefferursprung visuell stimmen;
7. Android- und Desktopbudgets eingehalten werden;
8. HUD und Menüs auf den vier Zielauflösungen funktionieren;
9. historische und künstlerische Bestandteile dokumentiert sind;
10. automatische Tests grün sind;
11. ein separater Tester-Build bereitsteht;
12. main und der bestehende Live-Build unverändert geblieben sind.

## 16. Geplante Lieferreihenfolge

1. Styleguide-Dateien und Manifest-Schema
2. Debug-Overlays und Koordinatenprüfung
3. vier Kartenmaster
4. Monument-, Kirchen- und Löwensprites
5. Umweltmodule und Texturen
6. fünf Turmfamilien
7. Projektile und Treffer-FX
8. HUD, Icons und Hauptmenü
9. Androidexporte und Atlanten
10. Integration, Tests und isolierter Tester-Build
