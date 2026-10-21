# Denkmal TD2 – Ausrüstung als Mischsystem, Bossbeute V1

Stand: 20.10.2026. Status: Schriftfassung vom Nutzer mit
„Spezifikationen freigegeben“ bestätigt. Der Implementierungsplan ist separat
zu prüfen; Produktcode ist noch nicht geändert.

Repository: `imbaaalanced-dot/a`. Technische Ausgangsbasis:
`3503717a1c60bb98b17623d05c97c2205a2a4403` (Alpha 9 mit Style-2-Turmassets).
Separater Entwurfszweig: `design/equipment-hybrid-boss-loot-20261020`.

## 1. Auftrag und bestätigte Entscheidungen

Malle möchte das Ausrüstungssystem neu durchdenken. Bereits bestätigt sind:

- Mischsystem aus begrenzter Werteverbesserung und Gegenständen mit eigener Funktion.
- Weniger Funde und mehr funktionale Vielfalt.
- Alle Gegenstände sind für Marcel und Kim frei verwendbar.
- Neue Ausrüstung ausschließlich von echten Bossen.
- Gemeinsame Sammlung, acht Plätze und eigene Zusammenstellung je Held.
- Ein garantierter, automatisch eingesammelter Fund pro besiegtem Boss.
- Gezielte Boss-Fundlisten und Verbesserungen vorhandener Gegenstände beim Schmieden.
- Erhalt vorhandener Gegenstände, Startausrüstung und Fortschritte.
- Ausrüstungswechsel ausschließlich im Hauptmenü; eine Runde verwendet einen festen Snapshot.

Die Zustimmung zum Gesamtentwurf erfolgte am 20.10.2026 mit
„OK erlauben und Genehmigung“. Konkrete Zahlen, Katalog und Datenmodell in
dieser Schriftfassung wurden anschließend mit „Spezifikationen freigegeben“
bestätigt; sie sind noch nicht implementiert.

Erfolg bedeutet: Ein Bossfund bietet eine verständliche Ausrüstungsentscheidung;
große Horden erzeugen keine Itemflut; Heldenwechsel und Aktualisierung verlieren
keine Gegenstände. Türme, Gegner und vorhandene Grafikpfade funktionieren weiter.

## 2. Belegte Ausgangslage

`dist/loot.js` verwaltet derzeit acht Plätze, fünf Seltenheiten, acht Wertearten,
14 Spezialeffekte, 30 Rucksackplätze und einen Überlauf. Das gespeicherte Profil
hat Version 2; der Schlüssel heißt weiterhin `denkmal-loot-v1`. Primärspeicher,
Sicherung, JSON-Import/Export und Schutz gegen konkurrierende Tabs existieren.

`dist/game.js` vergibt derzeit bei normalen Gegnern mit 12 % Wahrscheinlichkeit
Ausrüstung, bei jedem Wellenabschluss ein Item und bei Bossen einen epischen oder
legendären Fund. Zusätzlich existieren Ausrüstungs-Meilensteine bei Welle 3/4/8
und der einmalige Hainkern als Kirchende-Belohnung. Alle diese Nicht-Boss-Quellen
müssen für künftige Erwerbungen entfallen. Bereits besessene Belohnungen bleiben.

`hero-saga.js` übernimmt zu Rundenbeginn einen Ausrüstungssnapshot. Beide Helden
verwenden derzeit dieselben gespeicherten Ausrüstungs-IDs. Effekte sind teilweise
direkt im Kampfcode und teilweise in der Heldenberechnung eingebunden.

Echte Bosse sind gegenwärtig die Gegnertypen `boss` und `uprooted`. Das Flag
`miniBoss` kennzeichnet verstärkte Wellengegner und qualifiziert allein nicht.
Level 1 hat einen Boss in Welle 5, Level 3 in Welle 12, Level 4 in Welle 16.
Level 5/6 verwenden Bossgegner an durch vier teilbaren Wellen. Level 2 hat beim
regulären Einstieg in Welle 6 bis zum Abschluss in Welle 8 keinen echten Boss.
Level 1–4 haben nach ihren vorhandenen Bosswellen keinen regelmäßigen echten
Bossnachschub im Endlosmodus. Diese Spezifikation ändert keine Gegnerplanung:
Level 2 vergibt folglich keine Ausrüstung; andere Karten lassen sich für ihre
Bossbeute erneut spielen. Regelmäßige weitere Bosse wären ein eigener Auftrag.

## 3. Spielerablauf und Erwerbsregeln

1. Im Hauptmenü Held auswählen, dessen acht Plätze prüfen und eine Ausrüstung wählen.
2. Rundenbeginn kopiert ausschließlich dessen Zusammenstellung und berechnet Boni.
3. Normale Gegner erzeugen weiterhin Kampfessenz, aber niemals Ausrüstung.
4. Beim ersten Übergang eines echten Bosses von lebend zu tot wird genau ein Item
   erzeugt, der Sammlung hinzugefügt und unmittelbar ein Speicherversuch ausgelöst.
5. Eine kurze Meldung zeigt Name, Seltenheit und Bossquelle. Dafür ist kein
   aufgehobenes Bodenobjekt, Wellenabschluss oder Kartensieg erforderlich.
6. Neue Funde verändern die laufende Ausrüstung nicht. Verwaltung erfolgt im Menü.

Wellen- und Kartenabschlüsse vergeben keine zusätzlichen Gegenstände. Auch ein
erster Kartensieg erzeugt kein zusätzliches Relikt. Alte Ausrüstungs-Meilensteine
werden nicht nachträglich ausgezahlt. Kampagnenfreischaltungen bleiben von diesen
Änderungen getrennt; Kirchende-Abschluss und Level-Freigaben benötigen kein Item.
Die drei bisherigen Startgegenstände gehören nur zur erstmaligen Grundausstattung.
Migration, Import, Heldwechsel und Neuladen erzeugen keine neue Grundausstattung.

Ein erneuter Bosskill in einer neuen Runde darf erneut Beute geben. Mehrfachtreffer,
Ketteneffekte oder wiederholte Todes-/Abschlussaufrufe für denselben Boss nicht.
Jede Runde erhält eine neue Run-ID; jeder Spawn eine darin eindeutige ID. Die
Kombination identifiziert eine Belohnung. Rundenkontext hält bereits beanspruchte
Boss-IDs und noch nicht verbuchte, bereits ausgewürfelte Kandidaten fest.
Ein erneuter Versuch nutzt denselben Kandidaten, nie einen neuen Wurf.
Der Boss wird vor rekursiven Folgewirkungen als tot markiert. Keine unbegrenzt
wachsende Historie aller früheren Runden im Spielstand. Nach Reload wird keine
Runde wiederhergestellt; ein neuer Run bekommt eine neue ID.

## 4. Katalog: 21 feste Gegenstandstypen

V1 nutzt die 14 bereits existierenden Spezialeffekte; deren Funktion und Stärke
bleiben unverändert. Sie werden gezielt auf feste Gegenstandstypen verteilt,
anstatt nur drei zufällige legendäre Kräfte anzubieten. Sieben ergänzende Typen
haben zwei klar definierte Werte statt eines Spezialeffekts. Neue Kampfmechaniken
wie Zielmarkierungen oder Schutzfelder sind eine spätere Erweiterung; Beispiele
aus dem Gespräch waren Möglichkeiten, keine bereits vorhandenen Fähigkeiten.

Jeder neue Gegenstand besitzt genau zwei feste Wertearten. Nur deren Höhe wird
ausgewürfelt. Name, Platz, Wertearten und gegebenenfalls Effekt folgen `templateId`.
Es gibt keine zufälligen Namenszusätze oder zusätzlichen versteckten Affixe.

| ID | Gegenstand | Platz | Wertearten | Effekt-ID |
|---|---|---|---|---|
| ember-staff | Abendrot | Waffe | damage, health | ember |
| echo-staff | Nachhall | Waffe | damage, haste | echo |
| splinter-staff | Splitterstab | Waffe | damage, crit | splinter |
| watch-hood | Wächterkapuze | Kopf | health, defense | – |
| soul-hood | Seherkapuze | Kopf | health, crit | – |
| architect-hood | Baumeisterkapuze | Kopf | health, tower | – |
| oath-coat | Steinwacht | Rüstung | defense, health | oath |
| bark-coat | Rindenmantel | Rüstung | defense, speed | bark |
| light-coat | Leichte Wächterrüstung | Rüstung | health, haste | – |
| rune-gloves | Runenhandschuhe | Handschuhe | haste, crit | – |
| rift-gloves | Rissfunke | Handschuhe | haste, damage | chain |
| grove-gloves | Hainhände | Handschuhe | haste, health | grove |
| ash-boots | Aschenläufer | Stiefel | speed, crit | ash |
| root-boots | Wurzelstiefel | Stiefel | speed, health | roots |
| guard-boots | Wachtstiefel | Stiefel | speed, defense | – |
| memory-amulet | Erinnerungslicht | Amulett | health, defense | lantern |
| bell-amulet | Letzte Glocke | Amulett | damage, health | bell |
| ward-amulet | Laternenamulett | Amulett | damage, defense | wardlight |
| sustain-ring | Lebenslicht | Ring | leech, health | sustain |
| bastion-ring | Bollwerk | Ring | tower, defense | bastion |
| sight-ring | Siegel des Scharfblicks | Ring | crit, damage | – |

Ringe passen in beide Ringplätze. Dasselbe Item darf nicht zweimal in einer
Zusammenstellung stehen. Zwei verschiedene Instanzen desselben Typs sind erlaubt;
identische Spezialeffekte wirken weiterhin nur einmal. Stats summieren sich bis
zu den bestehenden Gesamtkappen. Die bestehenden Prioritäten echo vor ember,
ash vor oath und bell vor lantern bleiben auch bei ungewöhnlicher Alt-Ausrüstung
erhalten und müssen im Vergleich sichtbar sein.
Neue Ringinstanzen speichern wie bisher `slot: 'ring1'`; `fits` erlaubt beide
Ringplätze. Altinstanzen mit `slot: 'ring2'` behalten diese gültige Angabe.

Keine exklusiven Heldeneffekte, neuen aktiven Tasten, Setboni, Sockel oder separaten
Talentbäume in V1. Bestehende Icons werden wiederverwendet; ein fehlendes Spezialbild
verwendet das vorhandene Platzsymbol. Es werden keine Grafikassets vorausgesetzt.

## 5. Boss-Fundlisten und Qualität

Die Kartennummer bestimmt die Fundliste, da mehrere Karten denselben Gegnertyp
`boss` verwenden. Für jeden Fund wird zuerst mit 60 % aus der vierteiligen
Signaturliste der Karte gewählt, sonst mit 40 % aus allen 21 Typen. Innerhalb
der gewählten Liste gelten gleiche Chancen. Bereits vorhandene Typen bleiben
auswählbar: Duplikate und Qualitätsvarianten sind beabsichtigt. Keine zusätzliche
Garantie auf einen unbekannten Typ und kein wachsender Pechschutz-Zähler in V1.

| Karte | Vier Signaturtypen |
|---|---|
| 1 Einleitung | ember-staff, oath-coat, memory-amulet, watch-hood |
| 3 Kirchende | bark-coat, root-boots, splinter-staff, grove-gloves |
| 4 Dorfkirche | bell-amulet, ward-amulet, guard-boots, soul-hood |
| 5 Hohensyburg | bastion-ring, architect-hood, light-coat, rift-gloves |
| 6 Goethestraße | echo-staff, sustain-ring, ash-boots, rune-gloves |

Level 2 erhält keine unbenutzte Fundliste. Eine ungültige Karten-/Bosskennung
wird abgelehnt und erzeugt keine generische Ersatzbelohnung.

Wie bisher sind Bossfunde zu 80 % episch und zu 20 % legendär. Der Effekt ist an
den Typ gebunden, unabhängig von der Seltenheit. Alte andere Seltenheiten bleiben
darstellbar, verwendbar und recycelbar. Legendär erhält keinen zusätzlichen Proc.

Wellenstufe `L = clamp(floor(wave), 1, 30)`; Seltenheitsrang `R` ist 3 oder 4.
Für jede der zwei Wertearten wird einmal unabhängig `Q` im Intervall [0,7; 1]
gezogen. Anfangswert ist `min(M, M × (0,18 + 0,018 × L) × (1 + 0,12 × R) × Q)`.
`M` ist die bestehende Einzelitem-Kappe. damage/health werden auf ganze Zahlen,
Prozentwerte auf 0,001 gerundet. Keine Skalierung über Stufe 30 im Endlosmodus.

| Wert | Einzelitem-Kappe | Gesamtkappe vor bestehenden Spezialmultiplikatoren |
|---|---:|---:|
| damage | 40 | 160 |
| health | 100 | 400 |
| haste | 0,25 | 0,60 |
| speed | 0,20 | 0,50 |
| defense | 0,18 | 0,60 |
| crit | 0,12 | 0,35 |
| leech | 0,04 | 0,12 |
| tower | 0,15 | 0,60 |

Diese Kappen gelten wie bisher für Ausrüstungsboni, nicht als neue Kappen aller
Kampfwerte einschließlich Basiswerten, Perks und separater Multiplikatoren.

## 6. Gezieltes Schmieden und Recycling

Ein Gegenstand kann maximal dreimal verbessert werden. Die nächste Stufe kostet
50, 100 beziehungsweise 150 dauerhafte Schmiedessenz. Jede Stufe erhöht beide
Anfangswerte um weitere 5 % des ursprünglichen Werts, insgesamt höchstens 15 %.
Rundung und Einzelitem-Kappen entsprechen der Generierung; kein Wert darf sinken.
Die Zielwerte werden immer aus `baseStats × (1 + 0,05 × upgradeRank)` berechnet,
nicht aus bereits verbesserten Werten. Rang 0 erhält exakte Altwerte; in höheren
Rängen verhindert das Maximum mit dem bisherigen Wert einen Rundungsverlust.
Eine Aktion ohne Verbesserung irgendeines Werts ist deaktiviert und kostet nichts.
Name, ID, Seltenheit, Itemstufe, Wertearten und Spezialeffekt bleiben erhalten.
Die Vorschau zeigt exakte Vorher-/Nachherwerte und Kosten vor der Bestätigung.

Das bisherige Neuwürfeln entfällt in dieser Version vollständig. Die Schmiede
erzeugt keine Items, wandelt keine Typen um und erhöht keinen Seltenheitsgrad.
Altgegenstände dürfen mit ihren originalen Wertearten verbessert werden;
`baseStats` wird aus den unveränderten Altwerten übernommen. Bereits beim alten
Neuschmieden veränderte Werte sind der erhaltene Ausgangszustand.

Schmiedearbeit ist nur an Gegenständen erlaubt, die weder favorisiert noch in
irgendeiner der beiden Zusammenstellungen angelegt sind. Zum Schmieden zuerst
gezielt ablegen und gegebenenfalls Favorit lösen. Recycling verwendet weiter
`5 + rarityRank × 8 + itemLevel`. Einzel- und Sammelrecycling schützen Favoriten
und die Vereinigungsmenge beider Ausrüstungen. Kampfessenz bleibt separat.

## 7. Eigentum, zwei Zusammenstellungen und Inventar

Version 3 besitzt eine kanonische Liste `owned` mit jeder Iteminstanz genau einmal.
`loadouts.marcel` und `loadouts.kim` enthalten je acht Slot-zu-ID-Zuordnungen.
Die ID darf zwischen Helden geteilt sein; es entstehen keine Kopien. Ein Item ist
solange gegen Recycling geschützt, wie irgendein Held darauf verweist.

Rucksack und Überlauf werden aus den nicht bei einem Helden angelegten Items
in stabiler Erwerbsreihenfolge abgeleitet: die ersten 30 sind Rucksack, der Rest
Überlauf. Beide Helden zugewiesene Items liegen in der Ausrüstungsansicht, nicht
nochmals im Rucksack. Die Sammlung zeigt zusätzlich einen Filter „Alle“, damit
beim jeweils anderen Helden angelegte Gegenstände auffindbar und zuweisbar bleiben.

Anlegen ändert nur die Zuordnung des ausgewählten Helden. Ablegen entfernt nur
dessen Referenz. Eine beim anderen Helden bestehende Zuordnung bleibt bestehen.
Der Vergleich nutzt immer den ausgewählten Helden und den gewählten Ringplatz.
Angelegt-bei-Marcels/Kim-Kennzeichen erklären gesperrte Aktionen.

Stats und Spezialeffekte werden gemeinsam verglichen: Unterschiedliche Effekte
werden nebeneinander erklärt. Ein Verbesserungspfeil bleibt nur zulässig, wenn
kein Wert schlechter wird und kein anderer vorhandener Effekt verloren geht.
V1 führt keinen vereinfachenden Gesamtstärke-Score ein.

## 8. Speicherung und Migration

Der vorhandene Primärschlüssel `denkmal-loot-v1` und rotierende Backup-Schlüssel
bleiben. Das JSON-Format bleibt `denkmal-loot`, seine Envelope- und Profilversion
steigen auf 3. Lesbar sind weiterhin v1/v2; v1 wird zunächst mit der bestehenden
v1-zu-v2-Regel normalisiert. Ungültige und zukünftige Versionen werden nicht ersetzt.

V3 enthält `version`, `owned`, `loadouts`, `nextId`, `essence`, `level2`, `level3`,
`kirchendeCompleted` und `milestones`. Bestehende Items behalten mindestens ID,
Name, Platz, Seltenheit, Stufe, Werte, Effekt und Favoritenstatus. Neue Items führen
zusätzlich `templateId`, `baseStats`, `upgradeRank` und `source` (Karte/Boss/Welle).
Altitems erhalten `legacy: true`, `baseStats` als exakte Kopie ihrer Werte und
`upgradeRank: 0`; es wird kein passender Katalogtyp erfunden. Alte Zusatzfelder
werden erhalten, sofern sie als sichere JSON-Daten übernommen werden können.

Migration vereinigt `items`, `bag` und `overflow` in dieser Reihenfolge zu `owned`.
Beide Held-Zuordnungen beginnen mit einer unabhängigen Kopie der bisherigen
`equipped`-Zuordnung und verweisen auf dieselben erhaltenen Instanzen. Flags,
Milestones und Schmiedessenz werden nicht zurückgesetzt. Andere Spielstände,
Kampagnen-/Optionsschlüssel und `denkmal-character` werden nicht verändert.

Vor der ersten dauerhaften v3-Schreiboperation wird das originale, validierte
v1/v2-JSON einmalig unter `denkmal-loot-v1-pre-v3` gesichert. Diese Rückwegsicherung
wird nicht rotiert. Schlägt deren erstmaliges Schreiben fehl, bleibt der alte
Primärspeicher erhalten; Migration kann in der Sitzung laufen, mit Exporthinweis.
Ein vorhandenes Backup dieses Namens wird nicht ungeprüft überschrieben.
Ist es gültig, bleibt es erhalten. Ist es ungültig, wird die erste v3-Speicherung
abgebrochen und der Export beider Rohstände angeboten; kein stilles Ersetzen.

Alle Modelländerungen werden vor Übernahme vollständig validiert. Referenzen
müssen auf existierende, passende Items zeigen; jede Held-Zuordnung darf eine ID
nur einmal enthalten. Geteilte IDs zwischen Helden sind ausdrücklich gültig.
Zahlen bleiben endlich und begrenzt; Texte und IDs behalten die alten Längengrenzen.
Die kanonische Sammlung darf höchstens 100.046 Items enthalten (30 Rucksack,
bisherige 100.000 Überlaufgrenze und maximal 16 verschieden angelegte Items).
Das deckt jeden zuvor gültigen Bestand ab. JSON-Import bleibt auf 15 MB begrenzt;
ein solcher Import muss vor Migration bereits als altes/neues Profil gültig sein.

An der harten Sammlungsgrenze wird ein Bossfund nicht still verworfen oder in
Essenz umgewandelt. Der aktuelle Run hält seinen einmal ausgewürfelten Kandidaten
als ausstehend und meldet den blockierten Erwerb. Er bleibt beim Menüwechsel
als Sitzungskandidat erhalten; nach Recycling wird derselbe Kandidat erneut
verbucht. Ausstehende Kandidaten sind im Export mit separatem, validiertem Feld
enthalten, damit ein Neustart nicht als sichere Speicherung dargestellt wird.
Erst nach erfolgreicher Übernahme gilt der Boss als für diese Runde beansprucht.
Das optionale Envelope-Feld `pendingRewards` enthält diese Kandidaten mit Item,
Run-ID und Spawn-ID; bei alten Exporten bedeutet fehlend eine leere Liste.
Import validiert Itemgrenzen und eindeutige Erwerbstokens/IDs einschließlich
Abgleich gegen `owned`, stellt die Kandidaten als ausstehend wieder her und
versucht ihre Übernahme erst bei freiem Platz. Ein Export mit Kandidaten bleibt
an die bestehende 15-MB-Importgrenze gebunden; zu große Exporte werden als nicht
reimportierbar kenntlich gemacht. Dieser Extremfall ist kein Normalzustand.

Speicherfehler wie Quota/gesperrter Speicher verwerfen keine bereits in der
Sitzung erworbenen Items. Die Oberfläche meldet ausdrücklich Sitzungsstand statt
„gespeichert“ und bietet Export. Bei extern geändertem Primärspeicher bleiben
Schreibsperre und Recovery-Export erhalten; keine heimliche Zusammenführung.
Alte Builds erkennen Envelope v3 als fremde Zukunftsversion und dürfen sie nicht
überschreiben. Rückkehr zu alten Builds erfolgt über den ausdrücklich gewählten
pre-v3-Export; darin fehlt erwartungsgemäß später erworbener Fortschritt.

## 9. Technische Grenzen und Zuständigkeiten

- `dist/equipment-catalog.js`: unveränderliche Typdefinitionen, Fundlisten,
  begrenzte Würfel- und Verbesserungsvorschau. Kein DOM oder Speicherzugriff.
- `dist/loot.js`: Eigentum, zwei Zuordnungen, Validierung/Migration, Speichern,
  Erwerb, Schmieden, Recycling und Exporte. Menüschranke auch im Modell.
- `dist/loot-ui.js` / `loot.css`: ausgewählter Held, Besitz-/Nutzungskennzeichen,
  Vergleiche, Herkunft, Schmiedevorschau und Speicherstatus mit Touchbedienung.
- `dist/game.js`: qualifizierter Boss-Tod, eindeutige Erwerbstokens, Entfernung
  anderer Itemquellen und Rundenstart mit `snapshot(selectedCharacter)`.
- `dist/hero-saga.js`: bestehenden Snapshot auswerten; die 14 Effekte bleiben
  erhalten. Kein Zugriff auf veränderliche Inventarobjekte während des Kampfes.
- `dist/index.html`: Katalog vor Lootmodell laden und UI-Beschriftungen anpassen.

Die neue Modulgrenze ersetzt die Itemdefinitionen gezielt, ohne einen neuen
Kampf-Eventbus oder eine allgemeine Neustrukturierung des Spiels einzuführen.
Vorhandene Ladesysteme und Turm-/Heldenassets bleiben die Integrationsbasis.
Keine neuen Laufzeitabhängigkeiten. Öffentliche Modellaufrufe werden passend
aktualisiert; alle Aufrufer und Tests sind zusammen anzupassen.

## 10. Prüffähige Abnahme

1. Keine Itemvergabe durch normale Gegner, Mini-Boss-Flags, Wellenbelohnungen,
   Erstabschlüsse oder alte Milestones. Kampagnenflags funktionieren trotzdem.
2. Jeder echte Boss erzeugt genau einen Fund schon beim Tod, auch wenn die Runde
   danach verloren wird. Kein zweites Item durch Ende, Pickup oder Folgetreffer.
3. Ein späterer Boss derselben Art und ein Boss in einer neuen Runde dürfen
   erneut belohnen; ein fehlgeschlagener Erwerbsversuch würfelt nicht neu.
4. Deterministische RNG-Fälle decken Poolzweige, alle 21 Typen, beide Seltenheiten,
   alle Stats und Grenzen ab. Ein Simulationstest prüft die 60/40- und 80/20-
   Verteilungen mit festem Seed und geeigneter Toleranz, ohne flüchtige Zufallstests.
5. Zwei verschiedene Held-Zuordnungen, geteilte Instanzen, Ringe und Schutz von
   Ausrüstung des inaktiven Helden funktionieren ohne Kopien oder verlorene IDs.
6. v1/v2-Migration ist idempotent, ändert keine Altwerte und erstellt keine
   zusätzlichen Starter-/Meilensteinitems. Frischstart erhält genau drei Starter.
7. v3-Export/Import inklusive Überlauf, geteilter IDs, Legacy-Items und ausstehender
   Funde ist verlustfrei. Beschädigte, übergroße und zukünftige Daten werden
   atomar abgelehnt. Backup, Speicherfehler und konkurrierende Tabs sind abgedeckt.
8. Schmieden kostet exakt 50/100/150, verbessert monoton bis Rang 3 und hält alle
   Kappen ein. Kein Effekt-/Seltenheitswechsel, kein Zufallswurf, kein neues Item.
9. Alle bisherigen Spezialeffekte und Prioritäten bleiben wirksam; identische
   Kräfte stapeln nicht, Werte sind endlich und Runden-Snapshots unabhängig.
10. Browserprüfung mit Desktop- und Touchansicht: Held wechseln, beim anderen
    Helden verwendetes Item finden, vergleichen, ausrüsten, ablegen, schmieden,
    recyceln, Bossfund sichern und nach Reload wiederfinden. Keine Konsolen- oder
    Assetfehler. Eine echte Android-Prüfung wird separat als durchgeführt/offen
    ausgewiesen; Emulation ersetzt sie nicht.

Ein späterer Testbuild wird isoliert veröffentlicht, nach geeigneten bestehenden
und neuen Tests sowie Review. Die bisherige Grafik-Testversion wird erhalten.
Diese Spezifikation selbst veröffentlicht oder ändert noch kein Spiel.

## 11. Bewusste Abgrenzung und nächster Schritt

Nicht enthalten: neue Boss-Spawnregeln, stärkere Gegner, neue Karten, neue aktive
Heldenfähigkeiten, neue Grafikproduktion, mehrere Presets je Held, Crafting neuer
Items, Setboni, Talentbäume, Cloud-Sync oder Wiederaufnahme laufender Runden.

Nach Prüfung und Freigabe dieser Schriftfassung folgt der Implementierungsplan.
Der Plan legt konkrete Arbeitspakete, Testbefehle, Integrationsreihenfolge und
Ausführungsmethode fest. Erst dessen geprüfte Freigabe startet Produktcode.

Selbstprüfung dieser Fassung: bestätigt, dass Bossbeute die einzige neue
Erwerbsquelle ist; Erstabschluss- und Meilensteinitems entfallen; Altitems und
Starter sind ausdrücklich Erhalt/Grundausstattung; Katalog, Pools, Grenzwerte,
Migration und Zuständigkeiten sind definiert. Die fehlenden Bossgelegenheiten
in Level 2 und Endlos 1–4 sind ausdrücklich sichtbar statt stillschweigend geändert.
