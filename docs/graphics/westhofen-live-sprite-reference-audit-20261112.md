# TD2 V5 · Westhofen-L7: Referenzabgleich des tatsächlich eingebundenen Sprites

Stand: 12.11.2026. **Kontrollierte Sichtprüfung und Asset-Test, kein neuer Sprite, keine Veränderung am Spielrenderer.**

## Geprüfte Quellen

1. **Live-Asset auf `main`:** `dist/assets/westhofen/westhofen-memorial-style2-v1.webp`; Blob-SHA `d0b8e44f2bca65c4ed9de469b92fc9a261db83e7`, aus GitHub-API als Bild geladen und visuell bewertet.
2. **Live-Renderer auf `main`:** `dist/westhofen-art.js`, URL `assets/westhofen/westhofen-memorial-style2-v1.webp?v=westhofen-style2a1`. `DenkmalAssets.ready()` übernimmt Dekodierung, ein Canvas-Fallback bleibt verfügbar. `drawImage(sprite, m.x-225, m.y-265, 450, 300)`.
3. **Nutzerfotos:** WFH-REF-01 (`..._471.jpg`: Helm/Schwert/Schild) und WFH-REF-07 (`..._10845.jpg`: Front, Pfeiler, Mittel-/Seitentafeln) sowie WFH-REF-02/03/06 (Treppen und Umgebung), dokumentiert in [Westhofen-Fotoindex](westhofen-user-photo-references-20261112.md).
4. **Video:** vom Nutzer bereitgestellte MP4; Nine-Frame-Referenzanalyse und Status mit Container-Metadatum (kein gesichertes Aufnahmedatum) im [PR #217](https://github.com/imbaaalanced-dot/a/pull/217). Video-Protokoll liegt dort auf dem PR-Branch, sofern noch nicht gemergt.

**Quelle ist nicht gleich historischer Beweis:** Das fotografierte Schild-/Tafelensemble entspricht einem Zustand mit noch vorhandener zentraler Tafel; die TD2-Chronik nennt den Diebstahl der Tafel und beider Feuerschalen im Juli 2026. Der aktuelle Sprite ist deshalb **zeitlich korrekt als leere Mitteltafel/fehlende Schalen konzipiert**, die fotografische Vorlage ist für Geometrie und Materialien zu nutzen, nicht für einen stillschweigenden 2026-Zustandswechsel. [Historische Quellenprüfung #218](https://github.com/imbaaalanced-dot/a/issues/218).

## Objektiver technischer Befund

| Merkmal | Bestandsstand | Status |
| --- | --- | --- |
| Dateityp | WebP mit RIFF/WEBP/VP8X-Header | geprüft |
| Quellgröße | **768 × 512 px** | direkt aus VP8X-Metadaten gelesen |
| Transparenz | VP8X-Alpha-Flag `0x10` gesetzt | Header bestätigt; **8-px-Alpha-Ränder erst durch CI/Pillow-Test zu validieren** |
| Download | RIFF rund 111,9 KB, Assetbudget 160 KB | Dateigröße technisch abgeschätzt; Test prüft im CI |
| Darstellungsfläche | 450 × 300 Weltpixel, Anker `m.x-225/m.y-265` | Rendererquelltext geprüft |
| Bildverantwortung | zentraler Asset-Manager, ohne zweite `Image`-Allokation im Zeichnen | Quellcode + bestehender Test `tests/level67-single-image-owner.test.cjs` |
| Mobile 4 GB | nicht gemessen | offen |
| 64/128px | visuelle Lesbarkeitsabnahme steht aus | offen |

## Visueller Vergleich (beobachtet / geplant unterscheiden)

| Element | Aktueller Sprite | Nutzerreferenz | Korrektur-Kandidat |
| --- | --- | --- | --- |
| Flügelhelm | Beidseitig stark ausladende, flach aufgefächerte Federsilhouette, kleine zentrale Haube | hoch aufgerichtete, eher schmale Flügel mit klarer vertikaler Silhouette | **P0:** Flügel aufrechter, enger, Helmhaube kräftiger; Motiv nicht symmetrisch fantasieren |
| Schild | kleines heraldisch wirkendes Schild vor den Fächern | breite rundliche, dekorierte schildartige Fläche unter dem Helm | **P0:** Schild deutlich vergrößern, Reliefgliederung der vorhandenen Aufnahme folgen |
| Schwert | als kurze dünne Form unter den Flügeln angedeutet | breiter liegende/quer verlaufende Waffe, Griff sichtbar links | **P1:** Waffe mit realer Lage und sichtbarem Griff; kein zusätzliches Fantasy-Schwert |
| Steinrahmen | breite, geglättete Architektur in klassisch-strenger symmetrischer Form | verwitterte Quader mit stärkeren Fugen, unregelmäßigen Oberflächen und Efeuranken | **P1:** Steinquader, Kantenbrüche, unterschiedliche Lagen, weniger glatte Säulen |
| Bronze-Seitentafeln | relativ schmale Platten auf äußersten Stützen | auf der Ansicht größere längliche Tafelflächen näher an der inneren Pfeilerstellung | **P1:** Tafeln nach Fotoabgleich positionieren, keine Namen erfinden |
| Mittelblock | leerer verzierter Tafelrahmen auf sehr regelmäßiger Steinfront | Tafel und Block mit deutlichen Schichtfugen/Alterung; Foto zeigt **Tafel vorhanden** | **P0:** Leere Fassung für 2026 erhalten, Steinmaterial/Proportionen verbessern |
| Sockelrelief | im Sprite kaum zu erkennen | Video-Standbild bei ca. 30 s belegt seitliche plastische Formen | **P1:** eigenständige Quelldetail-Ebene für den Bildautor, Iconografie noch ungesichert |
| Stufen/Vorplatz | gleichmäßig breite, bildhaft in das Monument integrierte Stufen | gestaffelte Natursteinstufen, davor befestigte Wegfläche, seitliche Stützmauern | **P1:** Denkmalsprite vs. Boden-Canvas sauber trennen, ohne vorhandene Wege/Slots zu verschieben |
| Efeu und Bäume | stilisierter Efeu am Hauptbalken, keine Parkbäume im Sprite | Efeu auch an Pfeilern; hohe Laubbäume um den Platz | **P2:** Efeu im transparenten Atlas, Bäume in gecachter Geländeebene, kein Fotohintergrund |

Der Bestands-Sprite ist für eine erste Darstellung brauchbar, aber **kein freigegebener fotoreferenzieller Endstand**. Die Hauptabweichung liegt in Helm-/Schildproportionen, nicht darin, dass der Hintergrund unbedingt vollständig ausgetauscht werden müsste.

## Nächster möglichst risikoarmer Grafikpatch

**Assetproduktion als getrennte Quellen, zur Laufzeit möglichst ein compositetes WebP:**

- `bronze-emblem`: Flügelhelm, Schwert, Schild, getrennte 2.5D-RGBA-Quelle, korrektes Relief, 64/128-px-Abnahme.
- `stone-frame`: vier Pfeiler, horizontaler Querbalken, zwei seitliche Tafeln, Efeu getrennt, offene transparente Durchblicke. Keine erfundenen Inschriften.
- `altar-and-steps`: 2026-Variante mit leerer Mittelplattenfassung und leeren Feuerschalenpodesten, gestufter Sockel. Der obere Steinplattenplatz kann im Ground-Canvas bleiben, wenn es die Objekt-Tiefe verlangt.
- `vegetation-and-grounds`: gemeinsame Terrain-/Vegetations-Atlanten weiterverwenden; keine neuen Vollbild-Karten für jedes Level.

**Pipeline:** Source-Layer separat erzeugen und freistellen → Vollansicht als ein einziges 768×512-RGBA-WebP in einem **neuen** Dateinamen zusammensetzen → 8-px-Alpha-Abstand und Mobile-Kompressionsbudget prüfen → Source vs. V1 und Fotos bei 64/128 px nebeneinander prüfen → nur dann die `memorialUrl`-Referenz sowie den Cache-Key austauschen. **V1 und Fallback nicht löschen.**

Bestehender World-Anker, 450×300-Zeichnungsgröße, Kamerawinkel, Luft-Lane, `paths/slots/gates`, Freischaltungen und Save-Keys bleiben unverändert.

## QA-Gates

1. **Automatisch:** In `tests/assets.test.py` ist eine zusätzliche Prüfung für Dekodierung, 768×512, echtes RGBA, 8-px-Alpha-Inset und 160-KB-Budget ergänzt. Solange kein neuer Sprite vorhanden ist, prüft sie die V1-Baseline. Syntax/CI-Ausgabe separat protokollieren; nicht vorab als bestanden markieren.
2. **Automatisch bestehend:** `tests/westhofen-style2-art.test.cjs`, `tests/level67-single-image-owner.test.cjs`, `tests/westhofen.test.cjs`, `tests/assets.test.py`.
3. **Browser:** `node tools/verify-level7-style2-environment.cjs` muss Desktop und 412×915-Touch-Emulation ohne fehlende WebP-Requests abnehmen; 64/128px-Details per Screenshot **manuell** sichten.
4. **Echtes Android 4 GB:** FPS, RAM, Lade-/Cache-Verhalten, Touch-Bauplatzsichtbarkeit und längere Spielsitzung separat prüfen. Chromium ist kein Ersatz.
5. **Historische Abnahme:** Tafel-/Schalen-Zeitschnitt gegen datierte Aufnahmen verifizieren. Benutzerfotos und Videoframes sind nur Referenzdateien und dürfen ohne geklärte Rechte nicht veröffentlicht werden.

## Freigabeentscheidung dieses Patches

**Nur Dokumentations- und automatisierter Asset-QA-Schritt. Kein Sprite-Wechsel, kein Gameplay- oder Release-Eingriff.** Eine spätere Bildproduktion benötigt visuelle Einzelabnahme und anschließenden eigenen Integrations-PR.
