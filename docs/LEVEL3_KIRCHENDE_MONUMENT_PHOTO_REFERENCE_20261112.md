# Denkmal TD2 – Level 3 Kirchende: Kriegerdenkmal (Foto-/Videoreferenz)

Stand: 12.11.2026. Freigegebene Eingänge aus der Unterhaltung: **sieben Denkmalfotos und ein 10,9-Sekunden-Video**, deren Originaldateien als Gesprächsanhänge vorliegen, **nicht als GitHub-Binärdateien bestätigt**. Die Bezeichnung **„Denkmal Kirchende“** stammt vom Nutzer. Diese Referenz beschreibt **Level 3**; der liegende Steinlöwe an der Ender Dorfkirche ist **Level 4**, siehe `docs/KIRCHENDE_CHURCHYARD_PHOTO_REFERENCE_20261112.md` und `docs/STYLE2_LEVEL4_REFERENCE.md`.

## Gesicherte Foto-Beobachtungen

1. Hauptdenkmal: hoher, rechteckiger, rustizierter Natursteinpfeiler mit unterschiedlich großen graubraunen Bruchsteinquadern und kräftigen Mörtelfugen; stark verwitterter, stufenförmiger Sockel mit Moos/Flechten.
2. Bekrönung: **helmförmiger steinerner Aufsatz (Stahlhelm-Silhouette)** mit seitlich sichtbaren steinernen Ausformungen. Nicht als Löwe, Ritter, Flügelhelm oder Fantasiehelm ersetzen. Form anhand schräger Seitenansichten vergleichen.
3. Front: große rechteckige Steinplatte mit der lesbaren historischen Inschrift **„UNSERN HELDEN“**.
4. Darunter: zweite Tafel mit den Jahreszahlen **1914** und **1918**, mittig ein **Eisernes Kreuz** als Relief. Symbol und Jahreszahlen sind Teil des dokumentierten Denkmals, **keine hinzugefügte Fantasy-Ikonographie**.
5. Seiten: hochformatige, eingelassene Erinnerungstafeln. Aus den vorliegenden Fotos kann der vollständige kleine Text nicht zuverlässig transkribiert werden: **keine Personennamen ergänzen oder erfinden**.
6. Vor dem Denkmal liegt eine **separate flache rechteckige Steinplatte** mit Kreuz und sichtbarer Widmung **„Den Opfern von Krieg und Gewaltherrschaft“**. Sie gehört als eigenes Objekt vor den Pfeiler, nicht als Teil der Sockeltextur.
7. Gelände: niedrige scharfkantige Einfassungen/Platten, fragmentierter Steinbelag um den Sockel, teils lückiger Rasen, unbedeckte erdige Flächen, heruntergefallenes Laub, überhängende große Laubbaumkronen, dichter Gehölzhintergrund. Kein großflächiger Kirchhof-Kopfsteinpflasterplatz unmittelbar am Monument.
8. Die Bilder zeigen verschiedene Jahreszeiten und Beleuchtungen. **Baumarten, Geländeabmessungen, exakte Ausrichtung und steinerne Details im Aufsatz sind nicht vermessen**.

## Zuordnung der gelieferten Quellen

| Quelle | Sichtbares Hauptmerkmal | Verwendung |
| --- | --- | --- |
| `..._2348.jpg` | Weite Front-/Seitenansicht im grünen Baumhain | Landschaft, Maßbeziehungen |
| `..._2462.jpg` | Vorderer Pfeiler, Inschrift „UNSERN HELDEN“, Kreuz/Jahreszahlen | Fronttafel, Steinfugen |
| `..._2351.jpg` | Seitlicher Blick auf eingelassene Tafel und Bodenplatten | Seitenmaterialien, Sockel |
| `..._3634.jpg` | Front frontal mit freistehender Gedenkplatte | zwei getrennte Monumentobjekte |
| `..._7546.jpg` | Front und flacher Opfer-Gedenkstein bei wenig Laub | Widmung, Abstand, Silhouette |
| `..._7541.jpg` | Nahaufnahme Frontschriften in Schrägsicht | Reliefdetails, Oberflächen |
| `..._11213.jpg` | Frontansicht in wärmerem Licht, Helm und zusätzlicher Stein davor | Schatten und Stilabgleich |
| `..._2356.mp4` | Kurzes Video; überprüfter Frame etwa bei 4 s zeigt Front, Helm und separate vordere Platte unter Baumkronen | Perspektive, relative Anordnung |

Alle Quellen wurden in dieser Unterhaltung bereitgestellt; diese Dokumentation speichert die **Zuordnung und Auswertung**, nicht die Bilddateien selbst.

## Style-2-Asset-Lock für das Spiel

**Monument-Hauptsprite:** handgemalte hochwertige 2.5D-Game-Art, erhöhter orthografischer Dreiviertelblick, graubrauner grober Sand-/Bruchstein, alte Fugen, moosiger Steinsockel; oben **runde Stahlhelm-Silhouette** statt Figur oder Flügel; vorn zwei gut erkennbare Tafeln, seitlich unlesbar texturierte Namenstafeln. Schlichte, glaubwürdige Architektur, zurückhaltende Beleuchtung oben links, saubere RGBA-Transparenz, Bodenanker unter dem Pfeiler, keine Erd-/Grasfläche im Sprite.

**Separater Gedenkplatten-Sprite:** niedriger flacher massiver Steinblock mit schlichter Kreuzgravur und historischer Opferwidmung, in der Spielszene **vor** dem Monument verankert. Text nicht durch den Bildgenerator halluzinieren: bei lesbarer Vergrößerung exakte Transkription separat als Vektor-/Textoverlay oder präzise bearbeitete Textur, bei 64/128px reicht korrekt positionierte gravierte Fläche.

**Terrain:** wiederverwendbarer erdiger Wald-/Hainboden, Grasbüschel, Laub und moosiges Plattenumfeld; niedrige Einfassungen um den Denkmalbereich. Dichtes Laubdach als getrennter, ggf. bei Helden transparenter Layer. Verboten: Level-4-Kopfsteinpflaster oder Löwenmodell unbesehen übernehmen.

### Generationsprompt (Denkmal, transparent)

> A faithful, isolated, hand-painted dark-fantasy 2.5D game sprite of the actual Kirchende memorial shown in the supplied seven photographs. A tall rectangular rough natural-stone pillar made of uneven grey-brown blocks and visible pale mortar joints, broad stepped weathered mossy base. Its top bears a worn stone **German WWI-style steel helmet**, not a lion or winged helmet. The front has two original embedded plaques: a large rectangular upper inscription slab and a smaller lower slab with a historical cross relief; do not invent legible text or names. Two tall inset stone inscription panels on the sides. Raised orthographic three-quarter camera, unified light from upper-left, no full scenery, no figures, no foliage baked into the sprite, genuine alpha transparency, clean padded base pivot. Keep the correct silhouette at 64/128 pixel display size.

### Generationsprompt (Umgebung)

> Hand-painted 2.5D dark-fantasy Kirchende memorial woodland garden, natural uneven patchy grass mixed with compacted brown soil, low irregular paving and rectangular flat stone borders around the central monument, dried fallen leaves, mature deciduous trees forming a green and ochre canopy, dense shrubs behind. Low-contrast atmospheric depth but readable character paths and buildable sites. No cemetery gravestones or cobblestone church square, no second monument, no invented architecture, no fog that obscures combat. Construct as separate reusable terrain and foliage layers; do not bake gameplay routes into the artwork.

## Integration ohne Regression

- Vorrangig bestehende **Level-3**-Daten, Sprite-Loader, `docs/KIRCHENDE_PHOTO_TERRAIN.md`, Pivot-/Cache-Konvention und Bildbudget prüfen.
- Vorhandenen Level-3-Denkmalsprite **nur nach** Sichtprüfung gegen diese Quellen ersetzen; Originaldateien und Fallback behalten.
- Gegnerwege, Eingänge, Bauplätze, Heldenkollision, Wellen, Save-Keys und Level-4-Sprites unverändert lassen.
- QA: Front/Seite (helmförmiger Aufsatz, beide Tafeln), zweite Opferplatte und Materialnähe mit den Fotos abgleichen. Höhe/Abstand nur relativ, keine fotogrammetrische Vermessung behaupten.
- Browser-/Node-Regressionen ausführen; Chromium Touch/Portrait und reales Android-4-GB-Gerät getrennt prüfen. **Dokumentation allein ist keine Grafik- oder Android-Abnahme.**

## Nächste Arbeit

Zuerst einen **Monument-Sprite plus separate Opfer-Gedenkplatte** als Pilot produzieren, beide bei 64 und 128 Pixeln visuell freigeben und den Rest des Level-3-Geländes erst danach angleichen. Keine automatische Übernahme in `main`.
