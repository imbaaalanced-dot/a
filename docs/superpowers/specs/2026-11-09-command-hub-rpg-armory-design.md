# Denkmal TD2 V5 — Command Hub und RPG-Rüstkammer

**Stand:** Variante A vom Nutzer freigegeben am 09.11.2026; Umsetzung im separaten Entwicklungsbranch.
**Basis:** `main` @ `af2e768f13c08d148f35907474169f35dce2a57c`.
**Zielbranch:** `feature/td2-command-hub-armory-20261109`.
**Status:** UI-Code lokal implementiert, automatisierte Tests erfolgreich; kein veröffentlichter Preview-Build und keine echte Android-Abnahme.

## 1. Ziel und Anlass

Das Hauptmenü soll sich wie der Einstieg in ein hochwertiges Graphic-Dark-Fantasy-Spiel anfühlen; die Rüstkammer soll tiefgehende RPG-Informationen anbieten, auf dem Telefon aber schnell und fehlerfrei bedienbar bleiben. Marcel und Kim bleiben als wiedererkennbare Charaktere im Mittelpunkt. Das Design baut auf den vorhandenen Spielmodi, Loot-Daten und Speichermodellen auf und vermeidet Änderungen an Beutechancen, Helden-Balance oder Kampfsimulation.

**Erfolg:** Ein neuer Spieler findet Kampagne/Ansturm unmittelbar; ein erfahrener Spieler kann bei maximal drei zielgerichteten Interaktionen aus dem Inventar ein Item auswählen, seinen Effekt beurteilen und ausrüsten. Details sind zugänglich, ohne den Startbildschirm oder die mobile Erstansicht mit Zahlen zu überfrachten.

## 2. Belegter Ist-Zustand

- `dist/index.html`: Hauptmenü mit drei Schaltflächen (Spielen, Helden & Ausrüstung, Optionen); Kampagne und Ansturm liegen unter „Spielen“. Kampagne bietet sieben Level und darin den Endlosmodus.
- `dist/menu.css`: mehrere übereinanderliegende Layoutgenerationen und Media-Query-Overrides; bereits vorhandenes dunkles Style-2-Bildmaterial.
- `dist/loot.js`: versioniertes Inventarprofil **v4**, ein gemeinsamer Besitzpool, getrennte Acht-Slot-Ausrüstung für Marcel und Kim, Favoriten, Schmiedessenz, Verbesserung bis Rang 3, Recycling, Import/Export, Recovery/Backup und Migrationsschutz.
- `dist/loot-ui.js`: Ausrüstung/Rucksack-Tabs mobil, Itemvergleich und Werte-Deltas, Schutz vor Recycling angelegter/favorisierter Items, Suche aber **noch nicht** vorhanden; auf Mobilgeräten ein Vergleichs-Bottom-Sheet.
- `dist/loot.css`: drei Paneele auf Desktop; auf Telefon hohe Portrait-/Slot-Blöcke, mehrere Select-Filter, Dreispalten-Rucksack und große Recycling-Aktion in der Filterleiste.
- Tests existieren unter anderem in `tests/main-menu.test.cjs`, `tests/menu-navigation.test.cjs`, `tests/loot.test.cjs`, `tests/loot-ui.test.cjs`, `tests/equipment-migration.test.cjs`.

## 3. Herangehensweisen und Entscheidung

| Ansatz | Vorteil | Nachteil | Entscheidung |
| --- | --- | --- | --- |
| **A. Umfangreiche RPG-Oberfläche, bestehende Spielregeln** | Sofort besseres Menü/Inventar; gespeicherte Ausrüstung und Balance bleiben stabil | Noch keine zusätzlichen Set-Boni oder Talente | **Vom Nutzer gewählt** |
| B. RPG-Erweiterung inklusive Sets, Talenten, neuen Loot- und Schmiederegeln | Mehr neue Progression | Neues Balancing, neue Persistenz-/Migrationsrisiken, längere Android-Abnahme | Späterer, gesonderter Designzyklus |

**Umsetzungsvorgabe:** Zuerst Hauptmenü und Rüstkammer als ein einheitlicher UI-Schritt. Keine neue Item-Kategorie, keine zusätzlichen Ausrüstungsslots, keine zusätzlichen Währungen, keine Änderung an Drop-Raten oder Stat-Limits und keine Änderung an der gespeicherten Profilstruktur in diesem Paket.

## 4. Hauptmenü — „Dark Fantasy Command Hub“

### 4.1 Informationsarchitektur

Startseite mit vier großen, klar getrennten Kacheln:

1. **Kampagne** — Levelauswahl, Sperrstatus, Fortschritt und Endlosmodus auf freigeschalteten Karten.
2. **Denkmal-Ansturm** — direkter Sprung zum eigenständigen Ansturm-Modus; kein Portal und keine spielbaren Helden suggerieren.
3. **Helden & Rüstkammer** — aktive Heldenwahl, Heldendetails, Acht-Slot-Ausrüstung, Inventar und Schmiede.
4. **Optionen** — Ton, Grafik, Kamera, FPS-Anzeige, Sicherungsinformation, Hilfe und ein dezenter Link zum Kanal.

**Wichtig:** „Fortsetzen“ darf nur angeboten werden, wenn der vorhandene Speicherstand wirklich eine fortsetzbare Sitzung liefert. Andernfalls wird nur ein klarer „Kampagne wählen“-Einstieg und der belegbare Freischaltstand gezeigt. Keine erfundenen Speicherslots oder Kapitelabschlüsse.

### 4.2 Layout und Hierarchie

- Eine schmale Kopfleiste mit DENKMAL TD2, aktiver Heldenidentität und sichtbarer, zurückhaltender Versionsanzeige.
- Ein atmosphärisches Hauptmotiv mit dem tatsächlich ausgewählten Marcel-/Kim-Referenzmotiv und monumentaler Umgebung. Bildtexte sind **HTML**, nicht ins Bild gebrannt.
- Auf Desktop/Tablet eine **2×2-Kachelmatrix** mit Illustration, Titel, einer kurzen Erklärung und eindeutigem Pfeil/Interaktionszustand.
- Ab ca. 360 CSS-Pixel Breite zwei lesbare Spalten, wenn der verfügbare Platz ausreicht; auf schmaleren Geräten oder bei großen Schriftgrößen geordnete einspaltige Kacheln. Vertikales Scrollen ist erlaubt, horizontales nicht.
- Primäre Kacheln touchfreundlich (Ziel: mindestens 48×48 CSS-Pixel Bedienfläche), visuell deutlich größer; Hover darf keine Voraussetzung für Information sein.
- Level-/Options-Unterseiten verwenden dieselbe Navigation, dieselben Abstände und eine eindeutig benannte Zurück-Funktion; Fokus wird beim Zurückkehren sinnvoll wiederhergestellt.
- Sekundäre Links (YouTube, Hilfe, Debug) erscheinen **nicht** als gleichgewichtige Hauptkacheln; technische Infos bleiben bei Bedarf erreichbar.

### 4.3 Style-2-Kunst

- Farbwelt: dunkler Schiefer/Stein, abgenutztes Metall, moosige Schatten, dezente Messing-/Goldkanten, kontrolliertes türkisfarbenes Zauberlicht.
- Portraits: Referenzidentität von Marcel und Kim beibehalten; keine neue Gesichts- oder Kleidungsinterpretation. Für neue UI-Texte gilt Malles jüngster Rollenname **„Kim die Treffsichere“**, auch wenn ältere Laufzeittexte noch „die Bewahrerin“ nennen; die eigentliche Kampfrolle bleibt unverändert.
- Bestehende geeignete Assets zunächst wiederverwenden. Falls nötig, **gezielte** neue textfreie Kachel-Illustrationen für Kampagne/Ansturm/Rüstkammer/Optionen erzeugen, komprimieren und auf 64/128px-Lesbarkeit prüfen.
- Kein flackernder Shader, Video-Hintergrund, Autoplay-Ton oder dauerhaft animierter Canvas im Menü; kleine CSS-Zustandsübergänge nur bei nicht reduzierter Bewegung.
- Produktgrafiken sind klar von Werbe-/Moodboardillustrationen getrennt: Die Menüperspektive darf keine falschen Gameplay-Sprites ersetzen.

## 5. RPG-Rüstkammer — „Halle der Wächter“

### 5.1 Bereiche

Eine einheitliche Rüstkammer mit drei Ansichten:

1. **Wächter & Ausrüstung:** Umschalter Marcel/Kim, kompakte Figurenansicht, acht beschriftete Slots, aktuelle Summenwerte, aktive Fähigkeiten und Synergien.
2. **Rucksack:** Sammlung, Suchfeld, Filter für Typ/Seltenheit/Favoriten/garantierte Verbesserung, Sortierung, Ladefortschritt bzw. Anzahl sichtbarer Funde.
3. **Schmiede:** ausgewähltes Item, Verbesserungsstufe/Kosten, Vorher-Nachher-Werte, Recycling einzelner Items und geschützte Sammelrecycling-Aktion.

Alle drei nutzen dieselbe **Item-Detailansicht**, damit ein Wechsel nicht ständig neue Dialoge und Scrollpositionen erzwingt. Auf Desktop können Ausrüstung, Sammlung und Details nebeneinander erscheinen; auf Telefon wird jeweils eine Primäransicht mit einem klar schließbaren Detail-Sheet angezeigt.

### 5.2 Charakterblatt

- In der Spielmenü-Rüstkammer zwischen Marcel und Kim wechseln, über die bereits vorhandene Charakterauswahl-Logik; keine zweite unabhängige Heldenvariable einführen. Während eines Laufs ist dieser Wechsel deaktiviert.
- Sichtbares Portrait plus Name/Rolle, aber kein 330px hoher Pflichtblock im Hochformat.
- Acht unveränderte Slots: Waffe, Kopf, Rüstung, Handschuhe, Stiefel, Amulett und zwei Ringe.
- Slotzustände: leer / belegt / ausgewählt. Rarität über Farbe **plus** Bezeichnung/Form kenntlich machen.
- Werteblöcke gruppiert nach Angriff, Überleben, Bewegung und Unterstützung. Gezeigte Summen basieren auf `DenkmalLoot.totals` statt einer separaten Formel; existierende Wertobergrenzen und Effektprioritäten berücksichtigen.
- Sonderfähigkeiten samt Beschreibung und ggf. Verdrängung durch stärkere Effekte anzeigen. Keine nicht implementierten Set-Boni erfinden.

### 5.3 Rucksack und Gegenstandsdetails

- Ein Suchfeld filtert sichtbare Items nach ihrem vorhandenen Namen (kein neuer Speicherwert). Suche und Filter kombinieren sich; „Zurücksetzen“ löscht sie. Bei sehr großen Sammlungen wird die Suche kurz verzögert (ca. 150 ms), sodass nicht bei jedem Tastendruck sofort tausende Items neu sortiert werden.
- Die bisherige strenge Upgrade-Erkennung bleibt bestehen: Ein Pfeil markiert nur ein garantiertes Plus **ohne** Verlust anderer Werte/Effekte. Andere interessante Gegenstände können „Abwägung“ heißen, aber nie als garantiert besser markiert werden.
- Karten zeigen Icon, Name, Seltenheit, Stufe und Anlegestatus bei Kim/Marcel. Favoriten bleiben deutlich erkennbar.
- Detailvergleich: Angelegt vs. ausgewählt, Werte-Differenzen (positiv/negativ/neutral), Herkunft und Welle soweit im Modell vorhanden, aktive Spezialfähigkeit und verlorene Effekte.
- Ringe bleiben explizit dem ersten oder zweiten Ringplatz zuweisbar.
- Große Primäraktion „Anlegen“ bzw. „Ablegen“; „Favorit“ und „Verbessern“ getrennt; Recycling nie gleichrangig neben Anlegen, insbesondere auf Touch.
- Bestehende Begrenzung des sichtbaren Rucksacks (60 Items pro Nachladeblock) erhalten oder effizienter umsetzen; keine gleichzeitige Erstellung tausender DOM-Elemente.
- Leere Filterergebnisse erklären Ursache und bieten einen Rücksetzknopf; Überlauf wird korrekt in der Suche/Anzeige berücksichtigt.

### 5.4 Schmiede und Gefahrenschutz

- Verbesserungen ausschließlich mit bereits vorhandener Schmiedessenz und Rängen 0–3; Kosten/Prognose kommen aus `upgradePreview`.
- Bestehender Schutz angelegter und favorisierten Items bleibt verbindlich; deaktivierte Aktion zeigt den **wirklichen** Grund.
- „Alles recyceln“ wechselt aus der allgegenwärtigen Filterleiste in einen bewusst geöffneten Recyclingbereich mit Anzahl und Essenzvorschau, zweimaligem bewusstem Handeln und klarer Benennung der geschützten Gegenstände.
- Export, Import und Wiederherstellung bleiben verfügbar, aber in einer einklappbaren „Sicherung & Transfer“-Sektion am Ende, statt dauerhaft die Hauptbedienung zu dominieren.
- Das Modell steuert jede Mutation; UI-Filter und ein bloßes ausgeblendetes Element gelten niemals als Berechtigungsprüfung.

## 6. Navigations-/Interaktionsabläufe

**Beispiel Schnellwechsel:** `Hauptmenü → Helden & Rüstkammer → Rucksack → Item antippen → Vergleich lesen → Anlegen`. Bei bereits geöffneter Rüstkammer: `Item → Vergleich → Anlegen`.

**Mobile Detail-Sheet:** Hintergrund wird unbedienbar, Fokus landet beim Sheet, Escape/Schließen/Backdrop schließen es, Fokus kehrt zur auslösenden Item-Karte zurück. Körper und Dialog dürfen nicht gleichzeitig scrollen. Bestätigungen liegen oberhalb des Sheets und sind verständlich.

**Während eines Laufs:** Der vorhandene Loot-Bildschirm darf gelesen werden; Ausrüsten/Schmieden/Recycling bleiben nach bisheriger `canManage`-Regel gesperrt. Keine spielentscheidende Ausrüstungsänderung mitten in der Welle.

**Eingabe:** Touch, Tastatur, Screenreader, große Schrift und Hoch-/Querformat. Sichtbare Fokus-Indikatoren, sprechende Labels, keine reine Farbcodierung; `prefers-reduced-motion` beachten.

## 7. Technische Architektur und Datenintegrität

- Hauptsächlich `dist/index.html`, `dist/menu.css`, `dist/loot.css` und `dist/loot-ui.js` ändern. Nur minimal notwendige Menüverkabelung in `dist/game.js`, ohne Kampflogik zu berühren.
- Bestehende `id`- und `aria-controls`-Referenzen nach Möglichkeit erhalten, damit Handler und Tests erhalten bleiben.
- **`dist/loot.js` v4-Format, Speicher-Keys, Migrationen, Gegenstandskatalog und Balance unverändert.** Neue Suche, Ansichten und Sortierung existieren nur als UI-Zustand und verändern den persistierten Bestand nicht.
- Renderauslöser nur bei Zustandsänderungen, nicht pro Frame. Lazy Loading und angemessene Maße/Kompression für Bilder. Kein großes Framework, keine neue Runtime-Abhängigkeit.
- Schon vorhandene Nutzeränderungen und andere offene PRs nicht überschreiben.
- Keine erzwungenen Exporte/Imports als Teil eines UI-Upgrades. Backup-/Recovery-Pfade bleiben erreichbar und testbar.

## 8. Android- und Regressionstests vor Freigabe

**Lokale/automatisierte Zielprüfungen** (erst nach Umsetzung auszuführen):

- Bestehende Menü-, Inventar-, Migration-, Save-/Recovery- und Kampagnen-/Ansturm-Tests unverändert grün; gezielte Tests für Suche+Filter, Hero-Umschalter, Detail-Sheet-Fokus, Schmiede-Dialog und Bulk-Salvage-Guard ergänzen.
- Browser-Sichtprüfung bei 320, 360, 393, 420, 760 und Desktop-CSS-Pixeln; Hoch- und Querformat; große Schrift sowie Scroll-/Safe-Area-Verhalten.
- Keine abgeschnittenen Schaltflächen, überlappenden Panels, horizontalen Scrollbalken oder unlesbaren Gegenstandsnamen; alle interaktiven Ziele mindestens 48px hoch/breit soweit möglich.
- Kaltstart/Reload, vorhandenen v4-Spielstand laden, Marcel/Kim wechseln, Ausrüstung ändern, Export/Import testen; Diff der gespeicherten Datenfelder prüfen.
- Dark-Fantasy-Assets gegen bestehende Style-2-Referenzen, Transparenz, 64/128px-Skalierung und Android-Cache prüfen.
- Chromium Touch-Viewport-Smoke-Test und veröffentlichter Preview-Build gesondert verifizieren. Physische Android-4-GB-Abnahme (15–30 Minuten, Beutebestand, Touch, RAM/FPS) bleibt **offen**, bis Malle sie tatsächlich durchführt.

## 9. Geplante Entwicklung in kontrollierten Paketen

1. Bestehende Menü- und Inventartests als Ausgangsbasis ausführen; UI-Zustände und Screen-Hierarchie stabilisieren.
2. Command-Hub-Kacheln inkl. Navigation, Responsive-Regeln und Version/Fortschritt umsetzen.
3. Rüstkammer-Layout mit kompakter Heldenansicht, Such-/Filterlogik, verständlicher Item-Detailsicht und Schmiede-Schutz umsetzen.
4. Grafikassets nur bei konkret festgestellter Lücke erzeugen und nach QA in optimiertem Format integrieren.
5. Tests, Desktop-/Touch-Chromium-Abnahme, Draft-PR und verifizierten Preview-Link liefern.

**Freigabegrenze:** Keine Änderung an `main`, kein automatischer Merge und keine Veröffentlichung auf der Produktionsadresse ohne eigene ausdrückliche Freigabe. Die endgültige Freigabe des vorliegenden Designs wird vor der Produktimplementierung eingeholt.

## 10. Bewusst nicht enthalten

Neue Set-Gegenstände und Set-Boni, zusätzliche Attributtypen, Talentbäume, Transmog, frei konfigurierbare Build-Presets, alternative Beutewährungen, neue Drop-Tabellen, Gameplay-Stat-Neubalancing und gemeinsames Ansturm-Inventar. Solche Mechaniken wären ein separates, testbares Paket der späteren Variante B.
