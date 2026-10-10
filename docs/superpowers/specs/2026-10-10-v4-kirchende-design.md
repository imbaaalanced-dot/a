# V4 – Kriegerdenkmal Kirchende
Datum: 10.10.2026
Status: Schriftliche Spezifikation zur Prüfung; noch kein spielbarer Patch.
Basis: imbaaalanced-dot/a, main, 273bf3a20ee8ad5ccf22bae1c967e6dc637e8c05.
Entwicklungsbranch: v4-kirchende.

## Ziel und bestätigte Vorgaben
Level 3 bildet den Denkmalpark am Kirchender Dorfweg in Herdecke anhand der vom Nutzer gelieferten Denkmalfotos, Google-Earth-Ansichten und roten Wegmarkierungen nach. Vier Gegner-Zuläufe werden auf drei angenommene Parkzugänge zusammengeführt. Das reale Denkmal und die Umgebung sollen wiedererkennbar sein. Neue Grafiken, Gegner, Items und Türme ergänzen das bestehende Android-/Browser-Spiel. Der Name lautet „Kriegerdenkmal Kirchende“.

## Referenztreue und offene Geometrie
Denkmal: grobes Natursteinmauerwerk, eingelassene Tafeln, abgestufter Sockel, steinerner Helm. Keine erfundenen lesbaren Inschriften. Umgebung: Laubbäume, Sträucher, Laubboden, niedrige Steineinfassung, Bänke und Gebäude nach den Bildern.
Die vier Zuläufe folgen der Nutzermarkierung: Fußweg aus Richtung Kallenberger Weg; Kirchender Dorfweg von links; Kirchender Dorfweg von rechts; unten aus Richtung Kirche.
Die genaue Einmündung und Wegführung unter Baumkronen ist nicht belegt. Drei Parkzugänge sind eine bisherige Entwurfsannahme, keine vermessene Tatsache. Vor finaler Grafikabnahme wird eine beschriftete Draufsicht zur Ortsprüfung vorgelegt. Kartenrotation richtet sich nach den Referenzen; Himmelsrichtungen werden erst mit gesicherter Orientierung beschriftet.

## Kampagnenablauf
Level 1 und 2 erhalten ihre bisherigen Inhalte. Nach Abschluss von Welle 8 wird Level 3 freigeschaltet; der Spieler kann Level 3 oder den bisherigen Endlosmodus wählen. Ein eigenständiger Start von Level 3 beginnt mit Welle 9. Welle 12 beendet das reguläre Level, danach ist dessen Endlosfortsetzung wählbar.
Startbudget-Vorschlag: 180 Essenz, maximal acht Türme, zwölf feste Bauplätze. Budget und Plätze sind erste Playtestwerte.
Welle 9: zwei aktive Zuläufe, Wurzelläufer.
Welle 10: drei aktive Zuläufe, zusätzliche Steinpanzer.
Welle 11: vier aktive Zuläufe, zusätzliche Nebelrufer.
Welle 12: vier aktive Zuläufe, Boss „Der Entwurzelte“ und begrenzte Begleitgruppen. Er ersetzt in dieser Kampagnenwelle den generischen Mini-Boss-Modifikator; Endlosvarianten behalten ihre bisherigen Regeln.
Wellenvorschau zeigt Typen und aktive Zuläufe. Zusammenführungen bleiben passierbar und dürfen nicht bebaut werden.

## Gegner und Gegenmittel
Wurzelläufer: schneller, schwacher Gruppenangreifer; Gegenmittel Durchschuss und Flächenschaden.
Steinpanzer: langsam, hoher Rüstungsschutz; Gegenmittel bestehende Rüstungsbruch-Synergien und konzentriertes Feuer.
Nebelrufer: gewährt dem nächsten ungeschützten Verbündeten im Umkreis einen zeitlich begrenzten Schild; Schilde stapeln nicht. Der Rufer ist durch Held oder Zielmodus „nearest“ angreifbar. Schild hat eigene sichtbare Trefferpunkte.
Der Entwurzelte: Wurzel-/Steinboss mit gut sichtbarem Ladeangriff auf das Denkmal. Ausreichender Schaden während der Ladezeit unterbricht diesen. Drei sichtbare Phasen, keine sofortigen unsichtbaren Angriffe. Keine realen Personen als Gegner.
Konkrete Schadens-, Lebens- und Geschwindigkeitswerte werden aus den bestehenden enemySpecs abgeleitet und vor Integration in einer Balance-Tabelle festgehalten.

## Türme
Dornenwerfer: durchschlägt maximal drei Gegner entlang einer Schusslinie; Folgetreffer verursachen 70 % des vorherigen Trefferschadens. Kein zusätzlicher Kettensprung. Drei Ausbaustufen.
Runenlaterne: kleiner Bereich, langsame Impulse beschädigen Schilde und verursachen geringen Lebenspunktschaden. Keine dauerhafte globale Schwächung. Drei Ausbaustufen.
Freischaltung: Dornenwerfer beim Levelstart, Runenlaterne vor Welle 11. Bestehende Türme bleiben verfügbar. Kosten und DPS werden gegen bestehende Türme abgestimmt, nicht pauschal erhöht.

## Items und Speicher
Fünf neue benannte Items: Rindenmantel (armor), Wurzelstiefel (boots), Splitterstab (weapon), Laternenamulett (amulet), Hainkern (ring).
Jedes nutzt die vorhandenen Slot-, Seltenheits- und Statgrenzen. Zusätzliche Kräfte werden in der bestehenden powers-Registrierung und Spielauswertung ergänzt. Hainkern ist die garantierte benannte Bossbelohnung beim ersten regulären Abschluss, danach normaler seltener Drop.
Ausgerüstete und favorisierte Items bleiben beim Recycling geschützt. Existierende Speicher dürfen nicht zurückgesetzt werden.
Level-3-Freischaltung und Erstabschluss werden mit expliziter Migration der Loot-Speicherversion gespeichert. Version-1-Importe bleiben unterstützt; unbekannte neuere Versionen bleiben schreibgeschützt. Milestone 12 und neue Power-IDs werden validiert.
Sammel-Recycling ist ein separates bestehendes Vorhaben; sein vorhandener Stand muss vor Übernahme geprüft werden.

## Grafiklieferumfang
Denkmal: drei Zustände, identischer Ankerpunkt und Fußabdruck.
Karte: Bodenebene und separate Baum-/Gebäude-/Dekorationsebenen, damit verdeckende Kronen transparent werden können.
Gegner: vier Typen mit Lauf-, Angriffs-, Treffer- und Todesdarstellung; Boss zusätzlich Lade- und Phasenanzeige.
Türme: je drei Stufen, Geschosse und Treffer-/Schild-Effekte.
Items: fünf Icons. Zusätzlich Levelauswahlbild und Ladebild.
Einheitliche erhöhte Topdown-Perspektive passend zum vorhandenen Renderer, konsistente Schattenrichtung. Konzeptbilder sind keine ungeprüften fertigen Spriteatlanten.
Neue Assets werden verzögert geladen und mit vorhandenen Preloader-/Cachemechanismen versioniert. Bei Ladefehlern bleibt eine lesbare Ersatzdarstellung.

## Integration im geprüften Projekt
dist/levels.js: Leveldefinition und beliebige pfadbezogene Gegnerbewegung. advance() nutzt aktuell fest maze; jeder Gegner benötigt seinen eigenen Pfad bzw. laneIndex.
dist/game.js: Reset, Startbudget, Freischaltung, Wellenende, Auswahl, Spawns, Vorschau, Gegner-/Turm-/Itemkräfte und Levelrendering. Harte level===2-Abfragen gezielt ersetzen.
dist/loot.js: validierte Migration, Kräfte, Freischaltung und Erstbelohnung.
dist/loot-ui.js und dist/index.html: neue Inhalte in bestehenden getrennten Menüs, Level-3-/Endlos-Auswahl.
dist/visuals.js sowie vorhandene Asset-/Preloader-Dateien: neue Bilder und ressourcenschonende Ebenen.
Kein Engine-Neubau und keine Änderung an unbeteiligten Systemen.

## Abnahme
Automatisiert: alle vier Zuläufe erreichen das richtige Denkmal; keine Wegpunkte werden übersprungen; Bauplätze blockieren weder Wege noch Denkmal; Freischaltung nach Welle 8; Bossabschluss und Belohnung genau einmal; alter Save/Import migriert; neue Saves validieren; geschützte Items überleben Recycling; Level 1/2 und bisheriger Endlosmodus behalten ihre Regeln.
Bestehende Startup-, Portrait-HUD-, Loot-, Combat- und Assetprüfungen laufen zusätzlich.
Manuell: Draufsicht mit Referenzen abgleichen; Android-Hochformat mit Touch testen; keine verdeckten Gegner; Baumtransparenz; verständliche Bosswarnung; Wellen 9–12 vollständig spielbar; Performance mit denselben Bedingungen wie dem bisherigen Android-Playtest vergleichen.
Erster spielbarer Stand: v4.0.0-alpha.1. Keine Behauptung eines Releases ohne tatsächlich ausgeführte Tests und veröffentlichten Build.

## Entwicklungsetappen
1. Referenz-Draufsicht und Level-/Speichergrundlage.
2. Spielbare Karte und Wellen mit Ersatzgrafiken.
3. Gegner, Türme und Items.
4. Finale Grafikproduktion und Einbau.
5. Regressionen, Android-Playtest und Testrelease.
