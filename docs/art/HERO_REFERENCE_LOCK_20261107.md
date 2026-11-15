# Denkmal TD – verbindliche Heldenreferenzen

**Freigabe durch Malle:** 7. November 2026  
**Status (aktualisiert 15. November 2026):** Marcel-Referenz erneuert und freigegeben: **Zauberstab statt Schwert und Schild, keine Laterne** – `originals/marcel-der-beschuetzer-reference-20261115.png` ist ab jetzt die maßgebliche Marcel-Vorlage. Kim-Referenz unverändert. Abgeleitete V5b-Bewegungs-/Aktionsatlanten und V6-Menüportraits im Runtimebestand bleiben unangetastet, bis sie nach der neuen Referenz neu produziert und abgenommen sind.

Diese Originalbilder sind ab jetzt die **maßgeblichen visuellen Vorlagen** für die Haupthelden im gesamten Denkmal-TD-Projekt: TD2, Menüs, Heldenauswahl, Portraits, künftige Level, Trailer und alle Modi, **soweit die Helden dort auftreten**. Vorhandene Spielmechanik, Spielstände und aktuelle Animationen bleiben durch diesen Referenz-Lock unverändert.

## Kim – die Bewahrerin

**Datei:** `originals/kim-die-bewahrerin-reference-20261107.png` (ursprünglich `01-2556.png`)

- Rolle: Bogenschützin, Distanzkampf.
- Identität: blondes Haar mit hohem Pferdeschwanz, dunkle Sonnenbrille, entschlossene Seitenansicht.
- Outfit: eng anliegende schwarze, verwitterte Leder-/Taktikausrüstung, schwarze Handschuhe, dunkle Stiefel, Köcher am Oberschenkel/Rücken.
- Waffen/Akzente: ornamentierter dunkler Fantasybogen mit bronzenen Kanten und gespannter Sehne, Pfeil; dezenter türkis leuchtender Anhänger.
- Diese Details, insbesondere Brille, Frisur, Waffe und Silhouette, sind bei Portraits und künftigen Sprite-Varianten konsistent zu halten.

## Marcel – der Beschützer (Aktualisierung 15. November 2026)

**Datei:** `originals/marcel-der-beschuetzer-reference-20261115.png` (neue, freigegebene Referenz; die Schwert/Schild-Referenz `originals/marcel-der-beschuetzer-reference-20261107.png` bleibt als Historie unverändert beigelegt, ist aber **abgelöst**)

- Rolle: Beschützer, fortan mit dunklem Fantasy-Zauberstab (Nah- und Zauberangriffe; Gameplay-Werte werden dadurch nicht eigenmächtig verändert).
- Identität: kurze Bartstoppeln, ernsthafter Gesichtsausdruck, schwarze Kappe mit weißem Adidas-Zeichen.
- Outfit: dunkelblauer Adidas-Kapuzenpullover mit weißen Streifen, verwitterte braune Leder-/Metallrüstung mit Schnallen und Gürteltaschen, dunkle Hose und graue Sneaker.
- Waffen/Akzente: **ein einzelner ornater dunkler Fantasy-Zauberstab** in der rechten Hand – handgeschnitztes dunkles Holz, dezent leuchtend blaue Runengravuren, kleine strahlende Kristallspitze mit sanftem magischem Licht. **Kein Schwert, kein Schild, keine Laterne**, kein Umhang.
- Diese Details, insbesondere Kappe, Hoodie, Zauberstab und Silhouette, sind bei Portraits und künftigen Sprite-Varianten konsistent zu halten.

### Übergangsregel Marcel (15. November 2026)

- Bestehende Runtime-Assets mit Schwert/Löwenschild (`marcel-walk-v5b.webp`, `marcel-side-actions-v5b.webp`, Menüportrait `marcel-guardian-v6.webp`) bleiben solange aktiv, bis pro Richtung eigens produzierte Zauberstab-Fassungen vorliegen und abgenommen sind; sie werden nicht stillschweigend überschrieben.
- **Alle bereits produzierten oder laufenden Schwert/Schild-Kandidatensätze (Issue #205, u. a. Marcel „down" aus PR #242/#266 und Marcel „left"-Vorarbeiten) widersprechen der neuen Referenz** und gelten als Identitätskonflikt gemäß Regel 1. Sie sind neu zu produzieren oder zu verwerfen; keine Übernahme in Runtime.
- Neue Kandidaten (Attack/Hit/Death, alle Richtungen) sind ausschließlich gegen die Zauberstab-Referenz zu erzeugen: kein Spiegeln, keine umetikettierten Walk-Frames.

## Regeln für das gesamte Projekt

1. **Quelle:** Diese PNGs sind die oberste Charakter-Identitätsreferenz. Frühere Designs, zufällig generierte Alternativen und Art-Moodboards überschreiben sie nicht ohne erneute ausdrückliche Freigabe.
2. **Feste Rollen:** Kim = Bewahrerin/Bogenschützin; Marcel = Beschützer/Zauberstab (seit 15.11.2026; zuvor Schwert und Schild). Gameplay-Werte werden dadurch nicht eigenmächtig verändert.
3. **Stil:** In-Spiel-Assets dürfen an den freigegebenen TD2-Style-2-Look angepasst werden, aber Gesicht, Haare, Brille/Kappe, Kleidung, Farbwelt, Waffen und individuelle Silhouette müssen wiedererkennbar bleiben.
4. **Kamera:** Die Originale sind stehende Charakterillustrationen, **keine fertigen Gameplay-Atlanten**. Für Lauf-, Angriffs-, Treffer-, Idle- und Todesanimationen die aktuelle Renderer-Projektion, das gültige Richtungsraster und den unten mittigen Fuß-Pivot prüfen. Keine frei erfundene 3D-Isometrie.
5. **Bildqualität:** Keine fehlenden Gliedmaßen, veränderten Logos, wechselnde Ausrüstung, Spiegelungsfehler, angeschnittenen Waffen, groben grünen Kanten oder eingebrannten Hintergrundflächen. Wenn Transparenz genutzt wird, PNG-RGBA/Atlas-Alphakanal und Lesbarkeit bei 64/128 px prüfen.
6. **Android:** Grafik- und Performance-Abnahme separat auf einem Android-Gerät mit 4 GB RAM. Nicht ohne echten Test als mobil optimiert deklarieren.
7. **Integration:** Bestehende Assets niemals stillschweigend überschreiben. Neue Spielsprites über eigenständige Versionen/Entwicklungsbranch, Renderer- und Save-Kompatibilitätstests sowie Preview prüfen. Kein automatischer Merge nach `main`.

## Technischer Stand

| Referenz | Quelle | Auflösung | Format | SHA-256 |
| --- | --- | --- | --- | --- |
| Kim | `01-2556.png` | 1344 × 1792 | PNG RGBA | `eb666ea276c32e9809bf0ffafeafac371be06ce6d4344087c591d12763b24319` |
| Marcel (20261107, abgelöst) | `02-2555.png` | 1344 × 1792 | PNG RGBA | `158e3cad3939f37a16cd8dc30536b74ef4574365f2ffc9f0b600b0d69d7b07f5` |
| **Marcel (20261115, maßgeblich)** | `marcel-der-beschuetzer-reference-20261115.png` | 518 × 896 (Freistellung, 24-px-Rand) | PNG RGBA | `f8afed7cb6affc64ba9ddf5501a4eeeb9c5e103714f2a58b3e19abda353fee3f` |

Beide Originale sind unverändert beigelegt. Der Alphakanal ist vorhanden; dies allein ersetzt **keine** vollständige Freistellungs-/Konturprüfung. Die Zauberstab-Referenz wurde per Chroma-Key aus flachem Magenta (#FF00FF) freigestellt; Sichtprüfung: keine Säume, nichts Angeschnittenes, Zauberstab vollständig.

## Nächster Produktionsschritt (noch offen)

1. Marcel-Runtime-Assets (Walk, Side-Actions, Portrait) pro Richtung gegen die Zauberstab-Referenz neu produzieren; anschließend Kim-Richtungen vervollständigen.
2. Abgeleitete Gameplay-Master anhand der festgelegten Merkmale prüfen; danach Bewegungs-/Angriffs-/Treffer-/Todesblätter nach dem tatsächlichen Raster und den unterstützten Blickrichtungen produzieren.
3. Über einen separaten Branch integrieren und Vorschau, Regressionen und Android-Sichtprüfung absolvieren. Erst danach releasefähig nennen.


## Runtime-Abgleich (10. November 2026)

- **Kim:** `dist/assets/hero/kim-walk-v5b.webp` (768×1024, 3×4 Felder à 256 px); `kim-side-actions-v5b.webp` (768×768, 6×6 à 128 px; Aktion/Hit/Tod nach Manifest nur in Blickrichtung links); Menüportrait `dist/assets/menu/v5-avatars/kim-marksman-v6.webp`. Blondierter Pferdeschwanz, dunkle Brille, Bogen und dunkle Ausrüstung sind in den geprüften Varianten wiedererkennbar.
- **Marcel:** `dist/assets/hero/marcel-walk-v5b.webp` (768×1024, 3×4 Felder à 256 px); `marcel-side-actions-v5b.webp` (768×768, 6×6 à 128 px; Aktion/Hit/Tod nur in Blickrichtung rechts); Menüportrait `dist/assets/menu/v5-avatars/marcel-guardian-v6.webp`. Schwarze Kappe, blau gestreifter Hoodie, Schwert und Löwenschild sind in den geprüften Varianten wiedererkennbar. **Hinweis 15.11.2026:** Schwert/Löwenschild entsprechen nicht mehr der maßgeblichen Referenz; Neuproduktion siehe Übergangsregel.
- Manifest: `dist/directional-hero-assets-v5.js`. Die veralteten Kim-/Marcel-96×96-Einträge wurden aus `dist/directional-assets-v410.js` entfernt; ein expliziter Runtime-Guard hält alte Heldeneinträge auch bei künftigen Manifeständerungen deaktiviert. Unterstützte Action-Facings werden nicht gespiegelt. In den übrigen Blickrichtungen bleibt der Charakter sichtbar über das V5b-Walksheet; eine echte Kampfpose für diese Richtungen ist noch offen.
- Das vollständige Pfad-, Raster- und Statusmapping ist in `hero-reference-manifest-20261107.json` dokumentiert.
