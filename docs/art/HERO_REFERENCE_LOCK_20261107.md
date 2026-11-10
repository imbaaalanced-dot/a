# Denkmal TD – verbindliche Heldenreferenzen

**Freigabe durch Malle:** 7. November 2026  
**Status (aktualisiert 10.11.2026):** Original-Charakterreferenzen freigegeben. Abgeleitete V5b-Bewegungs-/Aktionsatlanten und V6-Menüportraits sind im Runtimebestand und visuell gegen die Identitätsmerkmale geprüft. Das Original-PNG selbst bleibt Referenzquelle; Aktionsansichten sind noch nicht für alle Richtungen vollständig.

Diese beiden Originalbilder sind ab jetzt die **maßgeblichen visuellen Vorlagen** für die Haupthelden im gesamten Denkmal-TD-Projekt: TD2, Menüs, Heldenauswahl, Portraits, künftige Level, Trailer und alle Modi, **soweit die Helden dort auftreten**. Vorhandene Spielmechanik, Spielstände und aktuelle Animationen bleiben durch diesen Referenz-Lock unverändert.

## Kim – die Bewahrerin

**Datei:** `originals/kim-die-bewahrerin-reference-20261107.png` (ursprünglich `01-2556.png`)

- Rolle: Bogenschützin, Distanzkampf.
- Identität: blondes Haar mit hohem Pferdeschwanz, dunkle Sonnenbrille, entschlossene Seitenansicht.
- Outfit: eng anliegende schwarze, verwitterte Leder-/Taktikausrüstung, schwarze Handschuhe, dunkle Stiefel, Köcher am Oberschenkel/Rücken.
- Waffen/Akzente: ornamentierter dunkler Fantasybogen mit bronzenen Kanten und gespannter Sehne, Pfeil; dezenter türkis leuchtender Anhänger.
- Diese Details, insbesondere Brille, Frisur, Waffe und Silhouette, sind bei Portraits und künftigen Sprite-Varianten konsistent zu halten.

## Marcel – der Beschützer

**Datei:** `originals/marcel-der-beschuetzer-reference-20261107.png` (ursprünglich `02-2555.png`)

- Rolle: Nahkämpfer, Tank/Verteidiger.
- Identität: kurze Bartstoppeln, ernsthafter Gesichtsausdruck, schwarze Kappe mit weißem Adidas-Zeichen.
- Outfit: dunkelblauer Adidas-Kapuzenpullover mit weißen Streifen, verwitterte braune Leder-/Metallrüstung, dunkle Hose und graue Sneaker.
- Waffen/Akzente: reich verziertes leuchtendes Schwert und großer, metallverstärkter Schild mit plastischem Löwenwappen.
- Diese Details, insbesondere Kappe, Hoodie, Löwenschild und Schwert, sind bei Portraits und künftigen Sprite-Varianten konsistent zu halten.

## Regeln für das gesamte Projekt

1. **Quelle:** Diese PNGs sind die oberste Charakter-Identitätsreferenz. Frühere Designs, zufällig generierte Alternativen und Art-Moodboards überschreiben sie nicht ohne erneute ausdrückliche Freigabe.
2. **Feste Rollen:** Kim = Bewahrerin/Bogenschützin; Marcel = Beschützer/Schwert und Schild. Gameplay-Werte werden dadurch nicht eigenmächtig verändert.
3. **Stil:** In-Spiel-Assets dürfen an den freigegebenen TD2-Style-2-Look angepasst werden, aber Gesicht, Haare, Brille/Kappe, Kleidung, Farbwelt, Waffen und individuelle Silhouette müssen wiedererkennbar bleiben.
4. **Kamera:** Die Originale sind stehende Charakterillustrationen, **keine fertigen Gameplay-Atlanten**. Für Lauf-, Angriffs-, Treffer-, Idle- und Todesanimationen die aktuelle Renderer-Projektion, das gültige Richtungsraster und den unten mittigen Fuß-Pivot prüfen. Keine frei erfundene 3D-Isometrie.
5. **Bildqualität:** Keine fehlenden Gliedmaßen, veränderten Logos, wechselnde Ausrüstung, Spiegelungsfehler, angeschnittenen Waffen, groben grünen Kanten oder eingebrannten Hintergrundflächen. Wenn Transparenz genutzt wird, PNG-RGBA/Atlas-Alphakanal und Lesbarkeit bei 64/128 px prüfen.
6. **Android:** Grafik- und Performance-Abnahme separat auf einem Android-Gerät mit 4 GB RAM. Nicht ohne echten Test als mobil optimiert deklarieren.
7. **Integration:** Bestehende Assets niemals stillschweigend überschreiben. Neue Spielsprites über eigenständige Versionen/Entwicklungsbranch, Renderer- und Save-Kompatibilitätstests sowie Preview prüfen. Kein automatischer Merge nach `main`.

## Technischer Stand

| Referenz | Quelle | Auflösung | Format | SHA-256 |
| --- | --- | --- | --- | --- |
| Kim | `01-2556.png` | 1344 × 1792 | PNG RGBA | `eb466ea276c32e9809bf0ffafeafac371be06ce6d4344087c591d12763b24319` |
| Marcel | `02-2555.png` | 1344 × 1792 | PNG RGBA | `158e3cad3939f37a16cd8dc30536b74ef4574365f2ffc9f0b600b0d69d7b07f5` |

Beide Originale sind unverändert beigelegt. Der Alphakanal ist vorhanden; dies allein ersetzt **keine** vollständige Freistellungs-/Konturprüfung.

## Nächster Produktionsschritt (noch offen)

1. In der aktiven TD2-Version bisherige Marcel-/Kim-Referenzen, Portraits, Animationen und Loader vergleichen.
2. Abgeleitete Gameplay-Master anhand der festgelegten Merkmale prüfen; danach Bewegungs-/Angriffs-/Treffer-/Todesblätter nach dem tatsächlichen Raster und den unterstützten Blickrichtungen produzieren.
3. Über einen separaten Branch integrieren und Vorschau, Regressionen und Android-Sichtprüfung absolvieren. Erst danach releasefähig nennen.


## Runtime-Abgleich (10. November 2026)

- **Kim:** `dist/assets/hero/kim-walk-v5b.webp` (768×1024, 3×4 Felder à 256 px); `kim-side-actions-v5b.webp` (768×768, 6×6 à 128 px; Aktion/Hit/Tod nach Manifest nur in Blickrichtung links); Menüportrait `dist/assets/menu/v5-avatars/kim-marksman-v6.webp`. Blondierter Pferdeschwanz, dunkle Brille, Bogen und dunkle Ausrüstung sind in den geprüften Varianten wiedererkennbar.
- **Marcel:** `dist/assets/hero/marcel-walk-v5b.webp` (768×1024, 3×4 Felder à 256 px); `marcel-side-actions-v5b.webp` (768×768, 6×6 à 128 px; Aktion/Hit/Tod nur in Blickrichtung rechts); Menüportrait `dist/assets/menu/v5-avatars/marcel-guardian-v6.webp`. Schwarze Kappe, blau gestreifter Hoodie, Schwert und Löwenschild sind in den geprüften Varianten wiedererkennbar.
- Manifest: `dist/directional-hero-assets-v5.js`. Die veralteten Kim-/Marcel-96×96-Einträge wurden aus `dist/directional-assets-v410.js` entfernt; ein expliziter Runtime-Guard hält alte Heldeneinträge auch bei künftigen Manifeständerungen deaktiviert. Unterstützte Action-Facings werden nicht gespiegelt. In den übrigen Blickrichtungen bleibt der Charakter sichtbar über das V5b-Walksheet; eine echte Kampfpose für diese Richtungen ist noch offen.
- Das vollständige Pfad-, Raster- und Statusmapping ist in `hero-reference-manifest-20261107.json` dokumentiert.
