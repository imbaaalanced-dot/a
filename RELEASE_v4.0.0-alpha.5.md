# Denkmal TD V4.0.0-alpha.5 — Bumerang, Bodenkontakt, Helden-Aggro

## Änderungen
- Dornenwerfer und Runenlaterne in UI, Spezifikationen, Kampflogik, Asset-Lader und Grafikdateien entfernt. Die Marcel-Heldenfigur behält ihre eigene Charaktergrafik.
- **Bumerangturm** für Herdecke Kirchende: pro Gegner ein Treffer beim Hinflug und ein Treffer beim Rückflug. Kein Schadensabfall bei durchdrungenen Gegnern; konstante 8/11/14 Punkte Basisschaden ohne kritische Treffer und ohne Rüstungsreduktion. Aktive Schilde absorbieren weiterhin Schaden.
- **Stufe I:** 48 Essenz; 8 Schaden pro Flugrichtung, 265 Reichweite, 1,75 s CD.
- **Stufe II:** 35 Essenz Upgrade; 11 Schaden, 285 Reichweite, 1,65 s CD.
- **Stufe III:** 50 Essenz Upgrade; 14 Schaden, 305 Reichweite, 1,55 s CD.
- Ein Projektil fliegt physisch bis zur maximalen Reichweite und kehrt zum Turm zurück (440 px/s); zwei getrennte Trefferlisten vermeiden Doppel-/Dauertreffer auf derselben Strecke.
- In Kirchende zeichnen Denkmal und Schatten auf derselben Fußpunkt-Höhe statt mit versetzter Kontaktschatten-Position.
- Feinde beginnen die Verfolgung des Helden innerhalb 135–195 px (Typ abhängig), sofern er sich nahe am aktuellen Wegsegment befindet; maximal 3 aktive Verfolger, Sappeure und Entwurzelte bleiben auf das Monument fokussiert. Treffer auf den Helden auf 72 % des bisherigen Werts reduziert, um den zusätzlichen Druck abzufangen.
- Ingame-Auswahl und Cache-Keys für Alpha.5 erneuert; mobile 5er-Auswahl erhält eigene vertikale Anordnung und Abstand zu Seelenruf/Ausweichen.

## Balancing (Startwerte, noch keine echten Playtest-Messungen)
- Einzelziel-DPS Bumerang I/II/III bei zwei idealen Treffern: 9,1 / 13,3 / 18,1; Bogen I: 24 DPS. Mehrere Gegner auf derselben Flugbahn steigern den Gesamtschaden, sodass der Bumerang eine Gruppen- statt Bossrolle bekommt.
- Bewusst **kein Schadensanstieg pro durchdrungenem Ziel**, **kein kritischer Bumerang-Treffer**. Rückweg nur dann weiterer Treffer, wenn der Gegner tatsächlich noch auf der Flugbahn steht.
- Aggro-Ziel: mehr gefährliche Nahkontakte ohne Komplettüberforderung durch ungebremste Gegnerhorden. Erst nach Android-Wellen 9–12 final justieren.

## Tests / Rollout
- Neue deterministische Node-Tests: drei Turmstufen, Mehrfachziele/Hin-/Rückflug, Schadensgleichheit, Rückkehr, Aggro-Korridor/Cap, Monument-Kontakt, Basis-DPS-Grenze.
- Vorhandene Alpha.4/Gameplay/Cache/FX-Suites bleiben Teil von CI; Alpha.5 wird Desktop und mobiler Simulationsmodus geprüft.
- `gh-pages/v4-alpha5/` entsteht bei grünem Pages-Workflow aus dem Feature-Branch (nicht Root-Release).
- Kein automatischer Merge auf `main`, solange Tests und echte Android-Tests nicht abgeschlossen sind.

## Offen
- Android-Porträtprüfung: mobile Menü-Überlagerungen, Hardware-FPS, Hit-Feedback, Bumerang-Sichtbarkeit und tatsächliche Lebenspunkteentwicklung in Wellen 9–12.
