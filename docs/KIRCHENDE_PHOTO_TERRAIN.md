# Kirchende: Fotoabgleich der Umgebung

Build-Metadatum: `kirchende-photo-2`, Cache-Key: `v400a5photo2`.

## In den bereitgestellten Fotos und Videos sichtbar
- Moos, lückiges Gras, freiliegende braune Erde und trockenes Laub unter großen Laubbäumen.
- Schmaler Zugang aus rechteckigen dunklen Platten mit Fugen und flachen Stufen.
- Niedrig eingefasste, verwitterte Steinfläche um den Denkmalsockel; separate flache Steinplatte.
- Dichte, breitblättrige Sträucher am Zugang, seitliche Sitzbänke, Gebäudefassaden hinter dem Grün.

## Für das Spiel angenähert
Himmelsrichtung, Maße, genaue Baum-/Strauchpositionen und Geländehöhen sind aus den Aufnahmen nicht verlässlich vermessen. Die Hauptannäherung ist der bestehende Kirchweg (Route 4); die anderen Routen erhalten erdige Laufspuren. Stufen und Einfassungen sind rein visuell. Wellen, Kollisionsregeln, Gegnerwege, Bauplätze, Turmwerte und Speicherformat bleiben unverändert. Ein neuer, anhand der Referenzfotos generierter Denkmal-Sprite ersetzt die bisherige Grafik: graubraunes Bruchsteinmauerwerk, verwitterte Tafeln, Helmaufsatz und moosiger Sockel. Die Darstellung ist eine bildliche Annäherung, keine maßhaltige Rekonstruktion. Der Sprite ist als transparentes WebP (512 × 768, unter 160 kB) eingebunden. Die neue Moos-/Laubtextur liegt als 768 × 768 WebP unter 350 kB vor.

Die neue Steinfläche wird nach den Wegen und vor den Spielfiguren gezeichnet. Sträucher und Baumkronen behalten die Transparenz in Figurennähe. Boden-, Weg-, Denkmalplatz- und Vegetationsgrafiken werden wiederverwendet; nach dem Aufwärmen entstehen beim Zeichnen keine neuen Canvas-Objekte.

## Prüfen
- `node tests/terrain-polish.test.cjs` und `node tests/kirchende-loading.test.cjs`
- `node tests/game.test.cjs` und `TEST_MOBILE=1 node tests/game.test.cjs`
- Gesamte bestehende Suite einschließlich Cache-Busting und Asset-Dekodierung.
- Browser-Sichtprüfung von Denkmalplatz, Weganschluss, Bänken, Sträuchern und Figurenlesbarkeit.
- Reales Android-Gerät: Hoch-/Querformat, Bewegung, Zoom, Grafikmodi und FPS bleiben gesondert zu prüfen.

## Ladeverhalten
Das alte 2,15-MB-PNG ist weiter im Archivbestand, wird aber nicht mehr als Kirchende-Denkmal angefordert. Das neue Denkmal und die Bodentextur werden vorgeladen. Ein Level-3-Start wartet auf die Denkmalgrafik; ein Fehlschlag lässt das Menü bedienbar und kann erneut versucht werden. Verspätete Ladeabschlüsse überschreiben keinen später gewählten Level. Neue Fehlerpfade und Asset-Budgets sind automatisiert geprüft.

## Veröffentlichung
Dieser Folgebranch veröffentlicht nicht automatisch auf Pages. `/a/v4-alpha5/` war zuvor sowohl für den Bumerang- als auch den Grafik-Build belegt. Vor einer Veröffentlichung einen eigenen Pfad festlegen und ihn im tatsächlich auf `main` liegenden Pages-Workflow vor dem Aufräumen schützen. Auf nachträglichen Nutzerwunsch wurde der Stand manuell unter `https://imbaaalanced-dot.github.io/a/kirchende-foto/` zum Testen bereitgestellt; `main` bleibt unverändert. Der aktuelle main-Workflow schützt diesen zusätzlichen Ordner noch nicht bei späteren Root-Deploys.
