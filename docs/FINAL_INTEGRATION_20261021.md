# TD2 V4 Alpha 9 – gemeinsame Version vom 21.10.2026

Zusammenführung der vorhandenen Patches, keine Zusicherung einer abgeschlossenen Vollversion.

## Enthalten

- Alpha 8/9: sechs Karten, Marcel/Kim, Hauptmenü, Heldenbanner, Gegneranimationen, Asset-Manager und Cachekorrekturen.
- Style-2-Türme und Projektile mit allen drei Stufen, Grafikbereinigung und bestehenden Impacts; standardmäßig aktiv. `?td2UserTowers=0` aktiviert die bisherigen Turmgrafiken als Rückfalloption.
- Gemeinsame Ausrüstungssammlung, getrennte Helden-Loadouts, gezielte Schmiede, reine Bossbeute und V1/V2→V3-Migration einschließlich Rückwegsicherung.
- Portalreise-Pilot: drei Abschnitte mit je zwei Wellen, zwölf Perks, nördliches Ausgangsportal, Turmrückerstattung und separater Fortsetzungsstand.
- Kampagnenpilot mit acht Wellen bleibt über `?td2CampaignPilot=1` erreichbar. Die normale Kampagne bleibt spielbar.

## Konfliktauflösung

Das neuere Equipment-Schema aus #53 bleibt maßgeblich. Portalbosse verwenden dieselbe Bossvergabe und eine über Neuladen stabile Kennung pro Portalabschnitt. Ein erneut gespielter Boss vergibt kein zweites Item. Ein nicht dauerhaft gespeicherter Bossfund blockiert den Abschluss, bis das Speichern gelingt; Sitzungsdaten bleiben exportierbar. Portal-Perks, Wellenökonomie und Turmrückerstattung aus #52 bleiben erhalten. Beide Helden erhalten ihr eigenes Loadout beim Start.

Neue Cachekennungen für den gemeinsamen Spielcode und die jetzt regulären Style-2-Türme. Die Veröffentlichung führt sämtliche Node- und Assetprüfungen vor dem Kopieren nach gh-pages aus und erhält bestehende Vorschaupfade einschließlich Portalreise.

## Herkunft

Die offenen PRs #32–42, #47, #49–51 und #53 sind bereits als Vorgänger im Equipment-Zweig enthalten (ausgenommen #43, siehe unten). #52 wird mit Konfliktauflösung hinzugefügt.

#30 ist durch die integrierte Umsetzung aus #33 ersetzt: Bumerang-Atlas bytegleich, Helden-Aggro und Kirchende-Integration vorhanden. #43 ergänzt gegenüber dem gemeinsamen Vorgänger nur Dokumentation, CI und inzwischen durch Alpha 8 weiterentwickelte Kirchenprüfungen; der aktuelle Kirchensprite und seine Tests bleiben maßgeblich. Die alten Köpfe werden als bereits ersetzte Historie mit aufgenommen, ohne ältere Produktdateien zurückzuholen.

## Validierung und Grenzen

66 lokale Prüfkommandos erfolgreich: alle 52 Node-Dateien, sieben Python-Assetprüfungen und sieben zusätzliche mobile Läufe. Browsernachweise unter `docs/qa/final-integration-20261021/`.

Chromium 153: Portalreise mit Marcel und Kim auf Desktop 1280×900 und Touch-Emulation 412×915; tatsächlicher Portal-Kollisionswechsel, Perkauswahl und Fortsetzung nach Neuladen. Equipment-Browserprüfung: Migration, beide Loadouts mit gemeinsamem Item, Schmiede, echter Bosskill, Reload, alle sechs Karten, 30 WebP-Decodes und Sitzungs-Export bei Speicherfehler bestanden. Keine beobachteten JS-Ausnahmen oder HTTP-Fehler. Touch-Emulation ersetzt keine physische Android-/WebView-Abnahme.

Offen bleiben echtes Android-FPS-/Flackertesting, lange Arcade-Läufe und Balancing. Die Portalreise hat drei Pilotabschnitte; zehn Abschnitte und die Verlängerung aller Kampagnenkarten sind weiterhin Folgearbeit. Rift-Randsäume sind nicht als vollständig bereinigt erklärt.
