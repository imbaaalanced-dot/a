# Kirchende: Dekoration von den Häusern fernhalten

Basis: `main` @ `16d1abf48c23ee8605b743501c33dda2951283e6` mit den neuen Kirchende-/Kirchhof-Layouts aus PR #274.

## Befund und Korrektur

Die aktuelle Desktop-Spielaufnahme zeigte kleine Büsche auf den beiden Häusern. V2-Zusatzdekoration und gecachte Bodenflecken prüften Wege, Bauplätze und manche Gebäude, jedoch nicht die Kirchende-Haussprites. Gegen deren konservative vollständige Sprite-Rechtecke überschnitten sich fünf Bodenflecken, 13 Vegetationspunkte und acht Zusatzsprite-Platzierungen. Das sind Überlappungen mit den Sprite-Rechtecken einschließlich transparenter Ränder, keine Zählung sichtbarer Dachbüsche.

Die zwei unveränderten Hausdefinitionen werden jetzt zugleich zum Zeichnen und für ihre visuellen Freiflächen verwendet. Boden- und Zusatzdekoration bleiben mit ihrem Ausdehnungsradius außerhalb dieser Flächen. Die bestehenden Caches berücksichtigen nachträglich verfügbare Gebäudedaten; Folgeframes verwenden weiter dieselben Pläne. Die bewusst vor Häusern stehenden Bäume bleiben erhalten.

Keine neuen Bildassets, keine Änderung an Häuserpositionen, Wegen, Bauplätzen, Denkmälern, Kollisionen, Gegnerwellen oder Spielständen. Keine zusätzliche Speicher-/FPS-Verbesserung behauptet.

## Prüfung

- Neue Regression war vor der Korrektur reproduzierbar rot. Die geprüften Gebäudegrenzen werden aus den tatsächlichen `drawImage`-Aufrufen abgeleitet, nicht aus einer zweiten hartcodierten Hausliste.
- Nachher bestanden: sieben gezielte Testdateien, einschließlich Gebäudegrenzen, warmer/später Caches, unveränderter Levelgeometrie, Material-/Versionsprüfung, Standortlayout und V2-Zusatzgrafiken.
- Baseline: alle sieben Levels auf Desktop 1280×800 und in Touch-Emulation 412×915 geladen, insgesamt 14 Spielansichten ohne JavaScript-/HTTP-Assetfehler. Neun V3-Materialien pro Ansicht dekodiert.
- Gezielte Nachprüfung des geänderten Levels 3: Desktop und Touch-Emulation ohne JavaScript-/HTTP-Assetfehler. Die Desktop-Nachher-Aufnahme zeigt freie Dächer/Fassaden. Im mobilen Standardausschnitt liegen die Häuser am Rand bzw. außerhalb des sichtbaren Bereichs; diese Aufnahme allein ist keine vollständige Häuser-Sichtprüfung.
- Alle **117** Testbefehle des aktuellen Hauptworkflows lokal bestanden; [Einzelergebnisse](required-tests.json).
- Hauptworkflow enthält den neuen Regressionstest. Ausführbare Browserprüfung: `TD2_CHROMIUM_EXECUTABLE=/usr/bin/chromium TD2_ENVIRONMENT_LEVELS=3 node tools/verify-all-level-environments.cjs`.

[Desktop-Übersicht der Baseline](desktop-baseline.webp) · [Mobile Baseline](mobile-baseline.webp) · [Kirchende vorher/nachher](kirchende-comparison.webp)

[14 Baseline-Ergebnisse](baseline-seven-levels.json) · [Zwei Nachher-Ergebnisse](kirchende-after.json)

## Android-Nutzerrückmeldung

Der Nutzer meldete den Praxistest auf einem Redmi 15C mit **4 GB physischem RAM plus 4 GB Speichererweiterung** als bestanden und beschrieb die FPS als gut. Das wird als Nutzerabnahme dokumentiert, nicht als instrumentierte Messung durch den Agenten. Zusätzliche FPS-/P95-Werte wurden auf Nutzerwunsch übersprungen und werden nicht erneut eingefordert oder erfunden.

Der dabei getestete veröffentlichte Build und die exakte Testdauer sind nicht zweifelsfrei belegt. Die Rückmeldung bestätigt deshalb nicht gesondert die danach neu hinzugekommenen Standortänderungen oder diesen noch unveröffentlichten Hausdekorations-Patch. Keine automatische physische Android-Prüfung durchgeführt.

Eine historische Bildabnahme gegen die privaten Originalaufnahmen wird mit diesen technischen Screenshots nicht behauptet. Kein Merge oder Deployment dieses Folgepatches.


## Zusätzlicher CI-Befund

Der erste Referenzboden-Lauf dieses PRs bestand den neuen Hausflächen-Test sowie den verzögerten V3-Decode-Test. Danach scheiterte der vorhandene Menü-Kaltstarttest beim Screenshot mit `waiting for fonts to load` / 30-Sekunden-Timeout. Ursache der Testabhängigkeit: externe Google-Fonts-Schriften; keine gemeldete Haus-, Weg- oder Spielausnahme.

Der Menü-Kaltstarttest isoliert nun vor der Navigation die externe Fonts-CSS mit einer leeren CSS-Antwort und verwendet die bereits vorhandenen Ersatzschriften der App. Sämtliche lokalen Spielrequests und die absichtlich verzögerten/fehlschlagenden V3-Materialrequests bleiben unverändert real. Das ist eine deterministische Testkonfiguration, keine Änderung der veröffentlichten Schriftgestaltung. Der Ergebnisbericht kennzeichnet diese Schriftkonfiguration ausdrücklich.

Alle vier Menü-Kaltstarts mit der isolierten Schriftanfrage sind lokal bestanden: [Ergebnisse](cold-start-font-isolated.json). Die bestehende Spielsteuerung und beide Material-Fehlerfälle bleiben geprüft.
