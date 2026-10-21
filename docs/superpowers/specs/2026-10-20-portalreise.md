# Denkmal TD2 – Gameplay und Portalreise

Stand: 20.10.2026. Design zur Durchsicht; nicht implementiert. Werte sind Startwerte für Spieltests. Der aktuelle Repository-Code wurde für diesen Entwurf nicht geprüft.

## Ziel und Grundlagen
Held und Türme sind gleich wichtig. Kampagnenlevel werden länger und taktisch abwechslungsreicher. Der neue Modus Portalreise verbindet kurze Verteidigungsabschnitte mit Perks und einem begehbaren Ausgang im Norden. Endlos bleibt ein eigener Modus. Grundlage sind die vier bereitgestellten Konzepttexte und die im Gespräch vereinbarte Richtung. Historische Wege und Gebäudeanordnungen bleiben erhalten. Ausrüstung ist für Marcel und Kim frei verwendbar und fällt ausschließlich bei Bossen; Perks gelten nur im Durchlauf.

## Kampagne
Level 1: 8–10 Minuten und 8 Wellen. Level 2–6: 12–18 Minuten und zunächst 12 Wellen. Dauer bei normaler Geschwindigkeit einschließlich üblicher Baupausen, kein Wartezwang zum Erreichen der Zielzeit. Jede Karte erhält drei Phasen: Einführung ihrer Besonderheit, Kombination bekannter Bedrohungen, Abschlussprüfung. Zwischen Wellen ist die Baupause manuell überspringbar. Neue Angriffsrouten werden mindestens eine Bauphase vorher angezeigt. Keine unvorhersehbaren Spawns direkt am Schutzpunkt.

| Karte | Taktischer Schwerpunkt |
|---|---|
| Einleitung | Zuerst eine Route, später mehrere Tore; Held hilft an der schwächeren Seite |
| Labyrinth | Zwei alternative Laufwege und begrenzte Barrikaden; mindestens ein Weg bleibt offen |
| Kirchende | Historische Wege als Angriffsachsen; Außenverteidigung und Rückfallposition |
| Ender Dorfkirche | Getrennte Kirche und Löwendenkmal; Löwe bleibt Verteidigungsziel, Blickrichtung Süden |
| Hohensyburg | Vorplatz und Flanken; angekündigte schwere Angriffstrupps |
| Goethestraße | Boden- und Flugbedrohungen mit klarer Vorschau und geeigneten Gegenmitteln |

## Bauplätze
Jeder Platz bekommt eine Rolle: frühes Abfangen, Kreuzungsabdeckung, Engpass oder letzte Sicherung. Pro Karte zunächst 8–12 Kandidaten, davon sollen im typischen Durchlauf etwa 4–6 ausgebaut werden können. Tatsächliche Anzahl nach Reichweitenprüfung der Karte. Kein Platz deckt sämtliche Ein- und Ausgänge zugleich ab. Mindestens zwei brauchbare Eröffnungen pro Karte. Reichweite und kommende Laufwege sind vor dem Bau sichtbar. Fluggegner müssen mit den angebotenen Türmen oder dem Helden zuverlässig bekämpfbar sein. Historische Karten bekommen keine frei verschiebbaren Straßen. Barrikaden zunächst nur im Labyrinth; unerlaubte vollständige Sperren werden vor dem Bezahlen abgelehnt.

## Portalreise
Zehn Abschnitte, Zielzeit 20–30 Minuten. Abschnitte 1–4 und 6–9 enthalten zwei kurze Wellen; Abschnitt 1 darf für die Einführung eine Welle nutzen. Abschnitt 5 enthält Zwischenboss samt kleiner Eskorte, Abschnitt 10 Abschlussboss. Der erste Test bildet nur drei Abschnitte mit einem Testboss im dritten ab.

Ablauf: Eintritt unten → sichere Bauphase → manuell gestarteter Kampf → alle Pflichtgegner besiegt → pausierte Auswahl aus drei Perks → Ausgang oben aktiv → Held betritt bewusst das Portal → nächste Karte. Während der Auswahl und des Übergangs entstehen keine Angriffe. Vor Aktivierung ist das Portal passierbar, aber löst keinen Wechsel aus. Nach Aktivierung muss der Held die markierte Fläche erneut betreten; dortiges Stehen führt nicht zum versehentlichen Wechsel. Der Auslöser funktioniert ohne zusätzlichen kleinen Touch-Button.

Jeder Abschnitt hat einen örtlichen Schutzpunkt mit 100 Integrität. Er wird auf der neuen Karte erneuert. Heldenleben bleiben erhalten; nach regulärem Abschluss werden 10 Prozent der maximalen Heldenleben geheilt, maximal bis zum Maximum. Tod des Helden oder Verlust des Schutzpunkts beendet den Durchlauf. Wechsel des Helden und der Ausrüstung nur vor dem Start. Nach dem Abschlussboss folgt die Ergebnisansicht ohne weiteren spielrelevanten Perk.

## Wirtschaft
Bestehende Turmkosten bleiben Ausgangspunkt. Startbudget entspricht den Kosten von drei Basis-Bogentürmen; alle Beträge werden im späteren Codeabgleich aus realen Kosten abgeleitet. Keine Gegner-Goldbelohnungen in der ersten Portalversion. Stattdessen erhält jeder reguläre Abschnitt 25 Prozent des Startbudgets, der Zwischenboss 50 Prozent. Dadurch erzeugen Beschwörungen oder verlängerte Kämpfe kein zusätzliches Gold.

Beim Übergang gilt: neues Gold = ungenutztes Gold + tatsächlich bezahlte Kosten aller noch stehenden Türme einschließlich Upgrades + einmalige Abschnittsprämie. Verkäufe während des Kampfes erstatten 75 Prozent, in der sicheren Bauphase 100 Prozent. Bereits verkaufte Türme zählen beim Übergang nicht erneut. Rabatte werden anhand der bezahlten Kosten berücksichtigt. Türme werden auf der neuen Karte neu errichtet. Keine Zinsen und kein vorzeitiger Wellenbonus in der Portalreise.

## Perks
Zwölf Startperks, vier je Kategorie. Pro Auswahl drei verschiedene zulässige Perks, mindestens einer mit Nutzen für die aktuelle Ausstattung. Stufe höchstens drei pro Perk; Maximalstufen werden nicht angeboten. Keine Neuauswahl im ersten Test. Prozentwerte addieren sich innerhalb eines Effekts. Keine rekursiven Auslösungen: Perk-Schaden aktiviert keine weiteren Trefferperks.

| Kategorie | Perk | Startwert je Stufe |
|---|---|---|
| Held | Kraft | +8 Prozent Grundangriffsschaden |
| Held | Ausdauer | +10 Prozent maximale Leben, zusätzliche Kapazität wird einmal aufgefüllt |
| Held | Schneller Schritt | +5 Prozent Bewegungstempo |
| Held | Erholung | +3 Prozent maximale Leben zusätzlich nach Abschnittsabschluss |
| Türme | Präzision | +8 Prozent Turm-Grundschaden |
| Türme | Reichweite | +5 Prozent Reichweite |
| Türme | Taktung | +5 Prozent Angriffstempo |
| Türme | Engpass | Turmtreffer verlangsamen 1 Sekunde um 8/12/16 Prozent; stärkster Slow gilt, keine Multiplikation |
| Gemeinsam | Zielmarkierung | Helden-Grundtreffer markieren 2 Sekunden; nächster Turm-Grundtreffer +15/25/35 Prozent, verbraucht Markierung |
| Gemeinsam | Deckung | Held innerhalb einer Turmreichweite erleidet 5/8/11 Prozent weniger Schaden; nicht je Turm stapelbar |
| Gemeinsam | Gegenstoß | Turm-Grundtreffer laden nächsten Helden-Grundtreffer auf: +10/18/26 Prozent, höchstens alle 2 Sekunden |
| Gemeinsam | Wächterkreis | Ein Turm innerhalb eines Radius von 3 Helden-Körperdurchmessern erhält +5/8/11 Prozent Angriffstempo |

Spezielle Dash-, Bumerang- und Projektilveränderungen folgen nach dem Pilot. Der erste Pool benötigt keine bislang unbestätigten Heldenfähigkeiten. Kategorien erhalten erkennbare Symbole und kurze Beschreibung mit bisherigem und neuem Wert.

## Schwierigkeit und Leistung
Abschnitte 1–2 lehren Grundregeln, 3–4 kombinieren zwei Gegnertypen, 5 prüft Reaktion auf Bossangriffe, 6–9 verstärken Kombinationen und führen früh angekündigte zweite Routen ein. Testwerte normaler Gegner: Leben +8 Prozent und Schaden +5 Prozent je Abschnitt gegenüber Abschnitt 1, linear. Läufertempo wird nicht global erhöht. Bosswerte separat abstimmen. Keine perfekte Immunität gegen ganze Builds.

Zunächst höchstens 40 gleichzeitig aktive Gegner. Weitere Spawns warten in einer Warteschlange und bleiben Teil der Welle. Keine Pflichtgegner löschen, um das Limit einzuhalten. Schwierigkeit über Rollen und Timing erhöhen. Grafikqualität darf Effekte reduzieren, aber keine Trefferflächen, Warnungen oder Gegner verändern. Ziel auf dem Testgerät: überwiegend mindestens 30 FPS; reale Messung erforderlich.

## Speichern und Übergangssicherheit
Bestehende Inventar- und Kampagnendaten bleiben in ihren bisherigen Schlüsseln. Portalreise erhält getrennten, versionierten Speicher mit runId, Phase, Kartenkennung, Zufallszustand, Leben, Gold, Turminvestitionen, Perks und einmaligen Belohnungskennungen. Sichere Zwischenstände am Abschnittsanfang und nach bestätigter Auswahl; keine Wiederaufnahme mitten im Kampf im Pilot. Abbruch während eines Kampfes startet denselben Abschnitt mit demselben Anfangszustand und bereits festgelegten Belohnungen neu. Keine neue Bossbeute durch Wiederholung desselben Durchlaufabschnitts. Bossbeute und deren Vergabekennung müssen gemeinsam dauerhaft gespeichert werden, bevor Erfolg angezeigt wird. Scheitern der Speicherung zeigt Wiederholen an und verhindert den Übergang. Ein inkompatibler Portalstand darf nicht das dauerhafte Inventar zurücksetzen. Laden der nächsten Karte vor dem Portalwechsel abschließen; bei Ladefehler im sicheren Zustand bleiben und erneut versuchen.

## Pilot und Abnahme
Zuerst eine bestehende Kampagnenkarte nach Codeabgleich auswählen und drei Portalabschnitte auf vorhandenen Kartenvarianten umsetzen. Keine neuen Grafikpakete erforderlich. Pilot prüft Perks, Wirtschaft, Bossbeute und Portalübergang; er ist noch kein Nachweis der vollständigen Zielspieldauer.

Prüfungen: zehnmaliges Auslösen des Portals führt nur einmal weiter; Sparen, Upgraden, Rabatt und Verkauf ergeben korrekte Rückzahlung; Perkauswahl und Bossbelohnung duplizieren sich nach Neuladen nicht; alte Spielstände bleiben nutzbar; Marcel und Kim können abschließen; zwei unterschiedliche Turmeröffnungen funktionieren; Android-Touch und Leistung im Belastungsabschnitt werden real getestet. Vollständige Kampagnenüberarbeitung erst nach Auswertung des Piloten.

## Nächster Entscheidungspunkt
Dieser Entwurf konkretisiert die besprochene Richtung. Vor der technischen Planung: Durchsicht durch den Nutzer und read-only Abgleich mit aktuellem Repository zu Turmkosten, Heldenangriffen, Speicherständen und Gegnerrollen. Danach Implementierungsplan mit überprüfbarem Pilotumfang. Kein Code wurde geändert, kein Build veröffentlicht.
