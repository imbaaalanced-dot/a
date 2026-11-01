# Heldenkunst V4.1 – Produktionsprüfung

Werkzeug: eingebauter Bildgenerator, Referenz jeweils das bereits integrierte gerichtete Laufblatt. Rohbilder sind im automatisch gespeicherten Bildbestand und lokal in source/ erhalten; der Git-Patch enthält normalisierte verlustfreie RGBA-WebP-Atlanten und die Quell-/Exporthashes im Laufzeitmanifest. Keine Rotation oder Spiegelung im Export.

| Held | Quelle | Aufbau | Beobachtung |
|---|---|---|---|
| Marcel | hero/marcel-walk-alpha9.webp |4×12,48Zellen | Sonnenbrille, dunkler Mantel, blaue Laterne erhalten; vier eigenständige Ansichten sichtbar. Dynamische Pose/Glut variiert. |
| Kim | hero/kim-walk-alpha8.webp |4×12,48Zellen | Roter Zopf, türkiser Mantel und warme Laterne erhalten; vier Ansichten sichtbar. Einzelne seitliche Treffer-/Erholungsposen drehen den Oberkörper Richtung Kamera. |

Die tatsächlichen Quelldateien haben ein1:3-Format. Vollständige isolierte Körper werden nach Zeile und Spalte geordnet; transparente Pixel außerhalb nomineller Rasterzellen bleiben erhalten. Der Export misst den unteren Körperbereich je Pose, verwendet einen gemeinsamen Laufzeitanker und dieselbe Skalierung für alle48Posen. Diese gemessenen Anker sind eine Produktionsnäherung und brauchen eine Sichtprüfung im Spiel. Browsernachweise werden getrennt protokolliert. Keine Android-Abnahme aus diesen Bildern ableiten.

Bekannte künstlerische Grenze: generierte Nebenposen können den Kopf oder Torso leicht drehen. Eindeutige ganze Richtungsduplikate werden bei Gegnern gesondert korrigiert/markiert. Historische Quellen werden durch Figurenkunst nicht ersetzt.
