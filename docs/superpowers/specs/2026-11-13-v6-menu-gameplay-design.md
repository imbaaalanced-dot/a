# Denkmal TD2 V6 — Hauptmenü und Gameplay-Ablauf

**Status:** Designentwurf zur Freigabe; noch keine Umsetzung autorisiert.  
**Projektbasis:** `imbaaalanced-dot/a`, aktueller `main` am 13.11.2026.  
**Ziel:** V6 soll den Einstieg ins Spiel und den vorhandenen Kampfablauf klarer, verlässlicher und auf Mobilgeräten angenehmer machen.

## 1. Absicht und Erfolg

V6 konzentriert sich auf den Weg vom Hauptmenü in die laufende Partie sowie auf die Lesbarkeit und Bedienung der vorhandenen Kampfschleife. Das Spiel bleibt ein Canvas-2D-Tower-Defense für mobile Browser und Android. Die sieben vorhandenen Kampagnenkarten, Denkmal-Ansturm, Helden, Türme, Spielstände und Style-2-Ausrichtung bleiben die Basis.

Der Patch ist erfolgreich, wenn neue und wiederkehrende Spieler die passende Spielart und Karte ohne Umwege finden, eine Partie sicher starten oder fortsetzen, während des Kampfes Welle, Denkmalzustand und verfügbare Aktionen schnell verstehen und Türme per Touch gezielt bauen oder verwalten können. V6 fügt keine umfassenden neuen Fortschritts- oder Wirtschaftssysteme hinzu.

## 2. Verifizierter Ist-Zustand

- `dist/index.html` führt bereits vier Hauptaktionen: Kampagne, Denkmal-Ansturm, Helden & Ausrüstung und Optionen. Die Kampagne hat sieben Schauplätze; Endlosspiel ist an freigeschaltete Karten gebunden.
- Hauptmenü, Versionsanzeige, Hero-Banner und Style-2-Menüassets existieren. Der aktuelle HTML-Stand bezeichnet die Version an mehreren Stellen als „V5 Alpha“ und enthält zusätzliche versteckte Pilot-/Portalaktionen.
- Das laufende Spiel hat ein Canvas-2D-Kampffeld, einen kompakten mobilen Statusbereich, Wellenstart, Pause, Bossanzeige und ein Touch-Kontextmenü zum Bauen und Verwalten von Türmen.
- Die mobile Turmauswahl prüft Bauplatz, Kosten und Turmlimit; bestehende Tests decken gezielte Upgrades, Zielwahl, Verkauf, Abbruch, Pause und Touch-Schwellen ab.
- Ein wichtiger Projektvorgaben-Konflikt ist bestätigt: `AGENTS.md` sagt, den Developer-Modus nicht erneut einzuführen und die Kampagne auf 2× zu begrenzen. `dist/game.js` aktiviert ihn derzeit standardmäßig, bietet drei Geschwindigkeitsstufen und kann gesperrte Karten testweise freigeben; `tests/main-menu.test.cjs` erwartet den aktiven Schalter. V6 muss Laufzeit, Einstellungen und Tests an die verbindliche Projektregel angleichen.
- Die Gegnerlogik enthält bereits situationsabhängige Angriffe auf Helden, Miliz und Denkmal. Der bekannte Eindruck, Gegner griffen Helden nicht an, wird als reproduzierbare Gameplay-Prüfung behandelt; die Ziellogik wird nur geändert, wenn ein Fehler bestätigt ist.

## 3. Ziele

1. Hauptmenü-Hierarchie und Navigation auf Telefon und Desktop vereinheitlichen. Die vier vorhandenen Hauptaktionen bleiben klar unterscheidbar; sekundäre/technische Aktionen dominieren die Startansicht nicht.
2. Versionsanzeige an einer ruhigen, eindeutigen Stelle führen und den Versionsstand nicht an mehreren widersprüchlichen UI-Texten festschreiben.
3. Kampagnenauswahl, Freischaltstatus, Rückkehr und Spielstart konsistent machen. „Fortsetzen“ nur anbieten, wenn ein gültiger, unterstützter Spielstand tatsächlich fortsetzbar ist.
4. Den bestehenden Kampfablauf verständlich machen: Bauphase, laufende Welle, Pause, Wellenabschluss und Niederlage/Sieg müssen klar unterscheidbare Zustände und sichere Aktionen haben.
5. Touch-Interaktionen für Bauplätze und bestehende Türme zuverlässig, zielgenau und ohne unbeabsichtigte Ausgaben halten. Desktop-Tastatur-/Mausbedienung bleibt erhalten.
6. Die vorhandenen Kämpfe besser lesbar machen, besonders Heldenbedrohung, Wellenhinweise und Bosszustände. Bekannte Fehler zuerst reproduzieren, danach eng begrenzt korrigieren.
7. Den Spieler-Developer-Modus aus der normalen Laufzeitoberfläche entfernen; keine Testfreischaltung gesperrter Karten. Kampagnentempo ist höchstens 2×.

## 4. Nichtziele und Anti-Ziele

- Kein Talentbaum, keine neuen Ressourcen, Set-Boni, Meta-Progression, neue Spielmodi oder neues Speicherschema.
- Keine umfassende Neubalance von Gegnern, Türmen, Loot, Wellen oder Freischaltungen. Gezielte Balanceänderungen nur für bestätigte Fehler und mit eigener Abnahme.
- Keine Entfernung bestehender Grafikdateien oder pauschale Neugenerierung aller Menügrafiken. Geeignete Style-2-Assets und verbindliche Kim-/Marcel-Referenzen zuerst wiederverwenden.
- Keine Änderung an Ansturm-Grundregeln: Denkmal zentral, Gegner erscheinen am Kartenrand, keine spielbaren Helden und keine Spawnportale.
- Keine Umstellung der Rendertechnik, kein großes Framework und keine neue Laufzeitabhängigkeit.
- Kein direkter Commit auf `main`, kein Merge und keine Produktionsveröffentlichung im Rahmen dieses Designentwurfs.
- Fehlerbild wäre ein dekorativ besseres Menü, das Spielmodi oder Fortschritt falsch darstellt, Touch-Aktionen unsicher macht, Spielstände verändert oder die Kampfschleife mit zusätzlichen Anzeigen überlädt.

## 5. Ansätze und Auswahl

| Ansatz | Vorteile | Nachteile |
| --- | --- | --- |
| **A. Gemeinsames V6-Ziel in kleinen, prüfbaren Etappen** | Menü, Spielstart und Kampfablauf werden als durchgehende Spielerreise geprüft; jede Etappe bleibt einzeln reviewbar. | Mehrere Teilbereiche liegen in einer V6-Entwicklungsrunde und brauchen abgestimmte Regressionstests. |
| B. Menü und Gameplay in getrennte Versionen aufteilen | Kleinere Releases und einfachere Änderungsabgrenzung. | Der Menüfluss kann in V6 verbessert sein, während die Partie selbst unverändert bleibt; der gewünschte Gesamtablauf wird verzögert. |

**Auswahl:** Ansatz A, vom Nutzer bestätigt. V6 bleibt ein zusammenhängendes Ziel; Umsetzung und Abnahme erfolgen in getrennten, funktionsfähigen Schritten. Große neue Spielsysteme bleiben späteren Versionen vorbehalten.

## 6. Geplanter Funktionsumfang

### 6.1 Hauptmenü und Spielstart

- Die vorhandenen vier Ziele bleiben die Hauptnavigation: Kampagne, Denkmal-Ansturm, Helden & Ausrüstung, Optionen.
- Informationshierarchie, Abstände, Beschriftungen, Fokus-/Pressed-Zustände, Responsive-Regeln und Zurück-Navigation werden anhand des aktuellen Renderings geprüft und gezielt vereinfacht. Die Spielversion erscheint einmal gut auffindbar, aber nachrangig.
- Kampagnenkarten zeigen tatsächlichen Freischalt- und Abschlussstatus. Test- und versteckte Pilotaktionen dürfen keine normale Spielauswahl oder falschen Fortschritt vortäuschen.
- Es wird **keine neue Kampagnen-Zwischenspeicherung oder Fortsetzen-Funktion für laufende Partien** ergänzt. Die Kampagne zeigt vorhandene Freischaltungen und den letzten belegten Fortschritt; eine Fortsetzen-Aktion erscheint nur für einen Modus, der bereits einen gültigen, unterstützten Spielstand laden kann. Bestehende Portal-/Ansturm-Speicherfunktionen bleiben unverändert.
- Vorhandene Style-2-Menü- und Heldenassets haben Vorrang. Neue Grafik wird nur für eine konkret belegte Lücke erwogen.

### 6.2 Gameplay und Bedienung

- Bestehende Zustände Bauphase, Kampf, Pause, Abschluss und Game Over werden auf klare Statusanzeige und zulässige Aktionen abgeglichen.
- Das kompakte mobile HUD zeigt nur die für die aktuelle Phase nötigen Werte; Welle, Heldenleben, Denkmal, Essenz, Turmlimit, Bosszustand und nächste sinnvolle Aktion bleiben im Kampf auffindbar.
- Das bestehende Touch-Kontextmenü bleibt der mobile Weg zum Bauen und Verwalten eines angetippten Bauplatzes/Turms. Baukosten und Turmlimit werden zum Ausführungszeitpunkt erneut geprüft. Ein Tap baut nicht ohne Auswahl; Drag, Pause, offene Dialoge und Menüzustände verändern die Welt nicht.
- Die Gegner-zu-Held-Interaktion wird mit gezielten Szenarien geprüft: Gegner in Aggro-Reichweite auf dem Weg, Gegner außerhalb des Pfads, Fernkämpfer, Denkmal-fokussierte Gegner, Bosse und Verteidiger aus der Kaserne. Bestehende Rollenkonflikte werden anhand der implementierten Spezialisierungen erhalten.
- Wellen- und Bosswarnungen werden auf rechtzeitige, verständliche Signale geprüft; Animationen oder Effekte dürfen keine zentrale Bedienfläche verdecken.
- Kampagnentempo bleibt auf 1×/2× begrenzt. Der Developer-Schalter und die dadurch bewirkten Freischaltungen/3×-Geschwindigkeit entfallen aus Spieleroptionen und normaler Laufzeit. Interne Tests dürfen isolierte Hooks nutzen, ohne Spielstände oder regulären Fortschritt zu verändern.

## 7. Technische Leitplanken

- Bestehende Architektur: Vanilla JavaScript, HTML/CSS und Canvas 2D; vorhandene IDs, Spielzustände und Modulschnittstellen nur bei konkretem Bedarf ändern.
- Keine Änderungen am persistierten Kampagnen-/Loot-Format und an Speicher-Keys. Keine erzwungene Migration.
- Test- oder Preview-Funktionen dürfen reguläre Freischaltungen und Spielstände nicht verändern.
- Animationen und zusätzliche UI-Aktualisierung nicht pro Frame erzeugen, sofern der bestehende UI-Takt genügt. Keine dauerhaft laufende Menüanimation.
- Neue oder ersetzte Assets nur nach Style-2-, Alpha-/Format-, Größen- und Ladewegprüfung; mobile Speicher-/Ladebudgets beachten.
- Projektregel: Änderungen auf neuem Entwicklungsbranch ab aktuellem `main`; bestehende PRs nicht ungefragt verändern. Kein Merge und keine Veröffentlichung ohne gesonderte Freigabe.

## 8. Abnahme und Erfolgskriterien

- Vorhandene Menü-, Navigations-, Touch-Bau-, Kampagnen-, Save-/Loot- und Ansturmtests laufen; Tests für Developer-Modus werden auf die verbindliche V6-Regel aktualisiert.
- Neue gezielte Tests sichern: Hauptmenü-Einstiege und Zurückpfade, Freischaltstatus, echte Fortsetzen-Bedingung, 1×/2×-Grenze, verbotene Developer-Freischaltung, Baukontext-Gültigkeit und Gegner-Aggro-Szenarien.
- Desktop-Chromium sowie mobile Hoch-/Querformat-Viewports ohne horizontalen Überlauf, verdeckte zentrale Aktionen oder unbedienbare Touch-Ziele prüfen.
- Auf dem echten 4-GB-Android-Gerät gezielte Regression der geänderten Menüs und Kampfbedienung durchführen. Frühere Android-Abnahmen bleiben als V5-Basis dokumentiert; sie ersetzen nicht die Prüfung neuer V6-Änderungen.
- Ergebnisse getrennt kennzeichnen: lokale Tests, CI/Chromium, veröffentlichter Preview-Build und physische Android-Abnahme. Keine Leistungs- oder Releasebehauptung ohne Messung.

## 9. Was dem Builder überlassen bleibt

Nach Freigabe des Designs bestimmt der Builder anhand des aktuellen Branches die kleinsten passenden Teilpakete und betroffenen Dateien. Bestehende Tests und UI-Module werden wiederverwendet. Ungeklärte Verhaltensfehler werden zunächst reproduziert; Änderungen an Balance, Save-Daten oder grundlegender Spielarchitektur brauchen eine eigene Freigabe.
