# Kirchende: Fotoabgleich der Umgebung

Build-Metadatum: `kirchende-photo-1`, Cache-Key: `v400a5photo1`.

## In den bereitgestellten Fotos und Videos sichtbar
- Moos, lückiges Gras, freiliegende braune Erde und trockenes Laub unter großen Laubbäumen.
- Schmaler Zugang aus rechteckigen dunklen Platten mit Fugen und flachen Stufen.
- Niedrig eingefasste, verwitterte Steinfläche um den Denkmalsockel; separate flache Steinplatte.
- Dichte, breitblättrige Sträucher am Zugang, seitliche Sitzbänke, Gebäudefassaden hinter dem Grün.

## Für das Spiel angenähert
Himmelsrichtung, Maße, genaue Baum-/Strauchpositionen und Geländehöhen sind aus den Aufnahmen nicht verlässlich vermessen. Die Hauptannäherung ist der bestehende Kirchweg (Route 4); die anderen Routen erhalten erdige Laufspuren. Stufen und Einfassungen sind rein visuell. Wellen, Kollisionsregeln, Gegnerwege, Bauplätze, Turmwerte und Speicherformat bleiben unverändert. Der bestehende Denkmal-Sprite bleibt erhalten.

Die neue Steinfläche wird nach den Wegen und vor den Spielfiguren gezeichnet. Sträucher und Baumkronen behalten die Transparenz in Figurennähe. Boden-, Weg-, Denkmalplatz- und Vegetationsgrafiken werden wiederverwendet; nach dem Aufwärmen entstehen beim Zeichnen keine neuen Canvas-Objekte.

## Prüfen
- `node tests/terrain-polish.test.cjs`
- `node tests/game.test.cjs` und `TEST_MOBILE=1 node tests/game.test.cjs`
- Gesamte bestehende Suite einschließlich Cache-Busting und Asset-Dekodierung.
- Browser-Sichtprüfung von Denkmalplatz, Weganschluss, Bänken, Sträuchern und Figurenlesbarkeit.
- Reales Android-Gerät: Hoch-/Querformat, Bewegung, Zoom, Grafikmodi und FPS bleiben gesondert zu prüfen.

## Veröffentlichung
Dieser Folgebranch veröffentlicht nicht automatisch auf Pages. `/a/v4-alpha5/` war zuvor sowohl für den Bumerang- als auch den Grafik-Build belegt. Vor einer Veröffentlichung einen eigenen Pfad festlegen und ihn im tatsächlich auf `main` liegenden Pages-Workflow vor dem Aufräumen schützen. Ein Merge oder Deploy gehört nicht zu diesem Fotoabgleich.
