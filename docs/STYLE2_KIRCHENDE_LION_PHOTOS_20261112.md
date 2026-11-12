# Kirchende, Level 4: Löwendenkmal von 1879 (Fotoreferenz, 12.11.2026)

## Beobachtungen anhand der vom Projektinhaber bereitgestellten Fotos
- Ein liegender Steinlöwe krönt einen hohen, mehrstufigen Denkmalsockel.
- Der Sockel trägt eine dunkle, eingelassene Inschrifttafel, Adlerreliefs an beiden vorderen Seiten, florale Steinarbeiten und einen Kranz an der Seitenfläche.
- Verwitterung, Flechten und Moos betreffen Löwe, Gesims und Sockel.
- Der Kirchhof besitzt alte Grabsteine, Rasen mit Laub und gebogene Kopfsteinpflasterwege; im Hintergrund stehen die Dorfkirche und ein Fachwerkgebäude.

Inschrift, zeilenweise gemäß Fotos transkribiert (historische Schreibweise und Jahreszahlen bewahren):

> Zum Andenken  
> der gefallenen Krieger von Ende  
> in den Feldzügen 1864, 66, 70-71.  
> Sie ruhen sanft in fremdem  
> Lande!  
> Gewidmet von der dankbaren  
> Gemeinde im Jahre  
> 1879

## Abgleich mit vorhandener Spielimplementierung
- Es handelt sich um **Level 4, Ender Dorfkirche und Schlafender Löwe**; das andere Kirchender Kriegerdenkmal gehört zu Level 3.
- Die primäre Renderfunktion für das Löwendenkmal liegt in `dist/church-art.js`; sie nutzt einen einmalig aufgebauten, gecachten Canvas statt des nicht freigegebenen Löwen-Placeholder-WebP.
- Dieser Patch ersetzt die verkürzte Inschrift durch den nach Fotos transkribierten Wortlaut und ergänzt zwei kleine Adlerreliefs im vorhandenen Canvas.
- Aus der Foto-Perspektive sind keine exakten geodätischen Maße ableitbar. Der Style-2-Render ist eine spielerische Illustration, keine vermessene Rekonstruktion.

## QA und offene Aufgaben
- `node tests/level4.test.cjs` muss die Inschrift nach dem Aufbauen der Grafik nachweisen.
- Anschließend: Sichtprüfung des Renderings mit derselben Kamera/Zoom-Stufe bei 64/128 Pixeln; Inschrift bei normalem Kampfzoom nur als Textur behandeln.
- Die korrekte Kopfform des liegenden Löwen, die Kranzreliefs, Mauertexturen und die Wege sind als **separate** Artwork-/Umgebungsschritte offen.
- Keinerlei Änderungen an Wegen, Bauplätzen, Kollision, Speicherständen oder Wellen.
- Kein echter Android-4GB-Test durch diesen Patch.
