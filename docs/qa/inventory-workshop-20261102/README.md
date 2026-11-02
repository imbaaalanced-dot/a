# Rüstkammer – 2. November 2026

Basis: d01af2371e33e3a3f7c88460d045be8839cab805. Eigenständige Verbesserung im Auftrag des Nutzers.

## Designentscheidung

Das bestehende Mischsystem bleibt: gemeinsame Sammlung, getrennte Ausrüstung für Marcel und Kim, acht Plätze, vorhandene Kräfte und drei Schmiedestufen. Ein vollständiger Wechsel auf wenige Reliktplätze würde vorhandene Gegenstände und Balance unnötig entwerten. Zusätzliche zufällige Werte oder weitere Währungen würden die Verwaltung erschweren. Diese Änderung konzentriert sich auf vorhandene Entscheidungen und sichere Bedienung.

- Heldenausrüstung direkt in der Rüstkammer ansehen und bearbeiten. Die für den Kampf gewählte Figur wird nicht verändert. Beim erneuten Öffnen folgt die Ansicht wieder dem Kampfhelden.
- Suche nach Namen, Ausrüstungsplatz oder Name der besonderen Kraft; kombinierbar mit bestehenden Filtern. Trefferzahl umfasst auch noch nicht eingeblendete Gegenstände.
- Recycling umfasst nur die aktuelle Filterauswahl. Bestätigung nennt Anzahl und Essenz; Favoriten sowie Ausrüstung beider Helden bleiben geschützt. Die bestätigte Auswahl wird als IDs festgehalten.
- Angelegte und favorisierte Gegenstände können im Hauptmenü verbessert werden. Gemeinsame Gegenstände bleiben einzelne Objekte; ihre Verbesserung wirkt bei beiden Helden. Favoritenschutz betrifft Recycling. Kosten, Obergrenzen und Kampfsperre bleiben unverändert.
- Speicherversion, Fundraten, Kampfbalance und Ansturm werden nicht geändert. Bestehende Spielstände brauchen keine neue Migration.

## Prüfung

Neue Regressionstests decken gemeinsames/favorisiertes Schmieden, gezieltes Recycling, doppelte und unbekannte IDs, Kampfsperre und Neuladen ab. UI-Tests prüfen Suche, Trefferzahl, gefiltertes Recycling und Heldenansicht. Cachekennungen wurden für die geänderten Ressourcen erneuert.

Browser- und Android-Abnahme sind gesondert nötig: 360-px-Hochformat, Suchfeld mit Bildschirmtastatur, Heldenwechsel, Schmieden und Bestätigung beim Recycling. Ein echter Android-Gerätetest wurde hier nicht durchgeführt.

Ergebnis dieses Durchlaufs: Alle 69 `tests/*.test.cjs` liefen erfolgreich; `git diff --check` ist sauber. Der vorhandene Browserprüfer konnte nicht starten, weil Chromium nicht installiert war. Der Installationsversuch scheiterte beim Entpacken des Downloads. Deshalb keine Behauptung einer Browser-/Touch-Abnahme und kein neuer veröffentlichter Testbuild.
