# Portalreise-Pilot – Prüfstand

Implementiert: eigener Featurebranch feature/td2-portalreise-pilot-20261020 auf Basis 3503717. Drei Abschnitte mit zwei Wellen, zwölf Perks, nördlichem begehbarem Portal, Schutzpunkt, Turmrückzahlungen, speicherbaren Zwischenständen und idempotenter Bossbeute. Zusätzlicher Kampagnenpilot: acht Wellen und acht Bauplätze, über ?td2CampaignPilot=1 im Menü verfügbar. Das ist noch nicht die vollständige Überarbeitung aller sechs Kampagnenkarten.

## Verifikation
- Letzter Lauf: alle 42 tests/*.test.cjs bestanden, einschließlich neuer Prüfungen für beschädigte Portalstände.
- Mobile Gameplay- und Portalprüfungen bestanden; weitere bestehende mobile Menü-/Level-Prüfungen bestanden.
- Sieben Python-Assetprüfdateien bestanden vor der abschließenden Speichervalidierung; danach keine Grafikdateien geändert.
- Chromium 133 Desktop 1280x900 und Touch-Emulation 412x915: beide Helden, Perkauswahl, echter Portal-Kollisionsauslöser und Fortsetzen geprüft; keine beobachteten JS- oder Assetfehler. Kämpfe für den Smoke-Test gezielt verkürzt, keine Balanceabnahme.
- Abschließender Browser-Wiederholungslauf nicht ausführbar: zuvor genutzte temporäre Chromium-Binärdatei nicht mehr vorhanden. Node-Regressionsprüfung auf dem finalen Stand grün. Screenshot nach Reload zeigte noch Preloader und gilt ausdrücklich nicht als grafische Abnahme.
- Echtes Android-Gerät, FPS und vollständige Zieldauer nicht geprüft.

## Review und Grenzen
Unabhängiger Reviewer angefordert, aber durch Dienstlimit vor Beginn fehlgeschlagen. Zusätzliche Eigenprüfung: Angebote, unbekannte Perks und negative/beschädigte Checkpoints werden beim Laden abgewiesen; Regression zuerst fehlgeschlagen, danach bestanden. Dies ersetzt kein unabhängiges Review.

Portal-Pilot nutzt vorhandene Level-1-Geometrie mit wechselnden Angriffsrichtungen, keine drei neuen historischen Karten. Vollausbau auf zehn Abschnitte und restliche Kampagnenkarten folgen nach Spieltest. Bestehende Milestone-Verwaltungsfunktionen bleiben für Datenkompatibilität erhalten; automatische Nicht-Boss-Itemvergaben im Spiel entfernt.

## Veröffentlichung
Kein Merge nach main, keine Änderung an PR 51 und kein Live-Publishing. Push des eigenen Featurebranches durch automatische Freigabeprüfung abgelehnt, weil die bestehende Erlaubnis nicht als ausdrückliche GitHub-Upload-Erlaubnis anerkannt wurde. Deshalb noch kein Remote-Branch oder Draft-PR bestätigt. Lokale Commits und exportierter Patch sind verfügbar.
