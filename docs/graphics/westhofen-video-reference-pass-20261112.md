# Westhofen · Videoreferenz-Pass 01 (12.11.2026)

## Quelle und Status

- **Quelle:** Nutzer-Upload `a8527f98-e487-4ef0-ab3c-68edde17f0e3-1_all_10843.mp4`, im TD2-Chat zur Verfügung gestellt.
- **Analyse:** Videometadaten mit `ffprobe`, neun bei festen Zeitpunkten mit `ffmpeg` extrahierte Frames und manuelle Bildsichtung. **Kein** vollständiges frameweises Videoaudit, kein Audiotranskript.
- **Dauer:** 81,399 Sekunden; **Auflösung:** 3840 × 2160; Video H.264, Audio AAC; nominell 30 fps, 2373 Frames.
- **Container-Metadatum `creation_time`:** `2025-05-01T14:49:00Z`. Der Wert stammt aus dem MP4-Container und ist **kein unabhängig verifiziertes Kamera-Aufnahmedatum**. Er ist mit einem Vor-Diebstahl-Zustand vereinbar, kann jedoch auch vom Export/Dateiworkflow stammen.
- **JPGs:** Bei den sieben zusätzlich eingereichten Fotos wurden in den hier verfügbaren JPG-Kopien keine auslesbaren EXIF-DateTime-/DateTimeOriginal-Felder gefunden. Sie bleiben einzeln **undatiert**, auch wenn sie offenbar denselben erhaltenen Tafel-/Schalen-Zustand zeigen.
- **Quellenrechte:** Urheber und Lizenz der eingereichten Dateien sind nicht geklärt. Keine Video-/Foto-Originale und keine extrahierten Frames öffentlich im Repository speichern. Technische Timestamps und textliche Beobachtungen sind dokumentierbar.
- **Veröffentlichung:** Diese Datei ist nur Referenzanalyse. Keine neuen WebP-/Canvas-Assets und kein Playtest werden dadurch bestätigt.

## Sichtprotokoll (neun ausgewählte Standbilder)

| Zeit | Kamerablick / belegte Beobachtung | Bedeutung für Art Direction | Sichere Abgrenzung |
| --- | --- | --- | --- |
| `00:00` | Weitblick über offene Rasenfläche zum von Bäumen gerahmten Denkmal, dahinter angrenzende Wohnhäuser | Separate Rasenfläche, verschattete Waldrandzone und optischer Wegkorridor | Kein vermessener Geländeplan oder gesicherte Himmelsrichtung |
| `00:10` | Von Bäumen gerahmte Sicht auf die offene steinerne Denkmalrahmung, Stamm als Vordergrundelement | Starke Tiefenstaffelung; Kronen als Randkulisse, Denkmal im Blickfenster | Baumart nicht allein aus dem Frame verbindlich bestimmen |
| `00:20` | Naher Blick auf rückwärtigen/seitlichen Block und Natursteinplatten mit unregelmäßigen Fugen | Sockelseite von vorn getrennt modellieren; Fugen und Steinversatz als Referenz | Auf dem Block sichtbare moderne Markierungen nicht als historische Ornamentik übernehmen |
| `00:30` | Seitliches Flachrelief mit helm-/gerätartigen Formen und geschwungenen Elementen auf dem Block | Verbindliche **Relief-Fläche** als eigene zusätzliche Objektdetailreferenz, nicht als glatte Steinfläche ersetzen | Exakte Symbolzuordnung bleibt offen; nicht als eindeutig identifiziertes Wappen o. Ä. ausgeben |
| `00:40` | Nahansicht von Flügelhelm, Schwert/Schild-Zone und stark verwitterten Metall-/Steinoberflächen | Primäre Helm-Silhouette, Patina, Material- und Kontaktkanten | Perspektivische Verzerrung aus Nahaufnahme |
| `00:50` | Mittelfront mit zentraler Metalltafel, breitem Steinsockel, seitlichen Tafeln und offenem Steinrahmen | Form des Altars, Tafelformat, Abstand der Architekturteile | Zeigt fotografierten **Tafel-vorhanden**-Zustand, nicht gesicherte Gegenwart |
| `01:00` | Untersicht der verwitterten Balken, Pfeiler, Efeu und einfallende Sonne | Balkenstöße, Kantenausbrüche und Efeu als getrennte Ebene | Starker Lens-Flare ist Kameraphänomen, kein Denkmalmaterial |
| `01:10` | Detail unter/seitlich des Helmrandes, reliefartige geschwungene Formen, Blatt-/Rankenornamente | Zusätzliche Nahreferenz für rück-/seitliche Ornamente und oxidierte Bronze | Die genaue Bedeutung der geformten Teile ist nicht belegt |
| `01:20` | Frontaler Ausschnitt der rechteckigen Gedenktafel mit dicht angeordneten Namen | Tafelfläche/Patina als getrennte Zustandsvariante, keine synthetischen Fantasienamen | Inschriften nicht ungeprüft transkribieren; fotografierter Zustand nicht zeitlos |

## Konsequenzen für die Level-7-Grafikproduktion

### A. Denkmalsprite

**Foto-/Video-Belege:** Flügelhelm mit zwei hochstehenden Flügeln, ausladender Stirnreif, darunter schildartiger reliefierter Körper, horizontal liegendes Schwert. Textur: graugrün oxidiertes Metall, hellgrauer verwitterter Sockel mit deutlichen Stein-/Metall-Grenzen. Seitliches Flachrelief aus `00:30` und dekorierte Unter-/Rückzone aus `01:10` im Referenzblatt dokumentieren.

**Zeitvarianten:** `WESTHOFEN_TABLET_PRESENT_SOURCE` (im Video/Tafelfoto sichtbar, Aufnahmedatum nicht unabhängig gesichert) und `WESTHOFEN_TABLET_MISSING_2026_DOCUMENTED` (laut Projektchronik nach Juli 2026). Dasselbe für die Feuerschalen. Kein automatisches Umschalten zur fotografierten Variante für den aktuellen Spielstand.

### B. Steinrahmen und Sockel

Unregelmäßige, helle/quaderförmige Pfeiler mit horizontalen Deckbalken, offenen Zwischenräumen, großen metallenen Seitentafeln, Efeubewuchs oben und an Pfeilern. Bodenplatten und Stufen **nicht** in die Silhouette des aufrechten Sprites backen. Vorplatz und Baumüberdeckung als andere Canvas-Schichten führen.

### C. Terrain

Für die illustrative Karte: Rasenfläche / beschattete Gehölzränder (00:00), offene Steinplatten mit Fugen und Unebenheiten (00:20–01:00), niedrige Stützmauern und Stufen aus den Fotos, Kies-/Parkweg als Verbindung. **Keine neue Weggeometrie:** die drei `westhofenPaths` aus `dist/levels.js` behalten ihre Start-/Zwischen-/Zielpunkte, Tower-Slots und AirGate bleiben unangetastet.

### D. Technischer Einbauvertrag (Ist und Soll unterscheiden)

**Code-Ist laut `dist/westhofen-art.js` auf `main` beim Audit:** `memorialUrl = assets/westhofen/westhofen-memorial-style2-v1.webp?v=westhofen-style2a1`; `drawMonument` zeichnet bei geladenem Bild an `m.x - 225, m.y - 265` mit `450 × 300` Zeichengröße, sonst Canvas-Fallback. `createGround` cached eine 1536er Canvas-Basis. **Diese Zahlen sind aktuelle Rendererparameter, keine Vorgabe für eine neu erfundene Bildabmessung oder geprüfte Geräteperformance.**

**Soll:** Ziel-Sprite ohne Personen, Tafelfantasietext oder eingebrannten Fotohintergrund; transparenter Alphakanal, Fußpunkt passend zum vorhandenen Objective-Anker, klare Form bei 64/128 px sowie im tatsächlich genutzten Hochformat-Zoom. Steinrahmen, Efeu, Schalen und Stufen möglichst getrennt freigeben. Keine `Image`-/Canvas-Neuanlage pro Frame, bestehendes Fallback behalten.

### E. QA und offene Aufgaben

- [x] MP4-Metadaten über `ffprobe` geprüft.
- [x] Neun zeitlich verteilte Video-Standbilder aus tatsächlich verfügbarer Datei extrahiert und gesichtet.
- [x] Foto-Zeitstatus mit MP4-Containerzeitstempel eingegrenzt, **ohne** das Kameradatum als bewiesen zu kennzeichnen.
- [ ] Kameraaufnahmezeit und Urheber der Medien über originale Dateien/Quelle verifizieren.
- [ ] Seitenrelief und untere Ornamentform ikonografisch/historisch über unabhängige Quellen bestimmen.
- [ ] Ein verlässliches datiertes Foto des Denkmalzustands **nach** Juli 2026 beschaffen.
- [ ] Aktuelles Spielbild bei 64/128 px direkt mit den Video-/Fotovorlagen vergleichen.
- [ ] Desktop-Chromium-Sichttest und mobile Touch-Emulation dokumentieren; separat physisches Android-4-GB-Gerät.
- [ ] Bildrechte klären, bevor Bilder/Frames öffentlich gespeichert oder veröffentlicht werden.

## Internes Quellenprotokoll

Die zur Sichtung verwendeten Timestamps: `0,10,20,30,40,50,60,70,80` Sekunden. Eine lokale 3×3-Kontaktbogenansicht wurde erstellt, sie ist **nicht** Bestandteil des öffentlichen Repositories. Originalvideodatei und Kontaktbogen können aus der jeweiligen Chat-Konversation verfügbar sein, sind aber kein verlässlicher öffentlicher Asset-Pfad.

**Referenzen:** `docs/graphics/LEVELDESIGN_REFERENCES_V5.md`, `docs/graphics/westhofen-user-photo-references-20261112.md`, `docs/WESTHOFEN_LEVEL.md`, `dist/levels.js`, `dist/westhofen-art.js`, `ART-DIRECTION.md`.
