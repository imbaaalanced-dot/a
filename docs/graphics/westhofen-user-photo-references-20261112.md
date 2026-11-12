# Level 7 Westhofen – neue Nutzerfoto-Referenzen (12.11.2026 erfasst)

## Einordnung

Sieben vom Nutzer in der laufenden TD2-Konversation bereitgestellte JPG-Aufnahmen und ein MP4 wurden zur Leveldesign-Referenzsammlung hinzugefügt. **Die sieben Bilder wurden bildlich ausgewertet. Nachprüfung 12.11.2026: Das MP4 wurde technisch mit ffprobe sowie anhand neun extrahierter Frames untersucht; die vorhandenen JPG-Kopien enthalten keine auslesbaren EXIF-Aufnahmezeitfelder. Das tatsächliche Aufnahmedatum bleibt unbestätigt.** Die Bilder zeigen das Kriegerdenkmal Westhofen, den Zugang und die Parkumgebung. Datum/Ursprung/Nutzungsrechte sind nicht nachgewiesen. Diese Medien sind **nicht** in diesem Repository gespeichert; Dateinamen sind Gesprächsreferenzen, keine Runtime-Assets.

**Zeitschnitt beachten:** Sichtbar sind eine mittlere Inschriftentafel und mindestens eine Metallschale auf einem seitlichen Podest. Die ältere Repo-Dokumentation beschreibt für Juli/November 2026 hingegen die Entwendung der mittleren Bronzetafel und beider Feuerschalen. Das MP4-Containerfeld `creation_time` lautet `2025-05-01T14:49:00Z` und passt zeitlich zu einem Vor-Diebstahl-Zustand, ist aber **kein unabhängig bewiesenes Aufnahmedatum**. Für die sieben JPG-Kopien konnte kein EXIF-Aufnahmezeitfeld ausgelesen werden. Aus der sichtbaren Tafel/Schale folgt keine bestätigte Wiederherstellung nach dem Diebstahl. Für den Spielstand November 2026 bleibt die belegte Text-/Zeitabgrenzung erhalten, bis eine datierte Primärquelle den aktuellen Zustand bestätigt. Die Fotos sind als **Ansicht eines Zustands mit vorhandener Tafel/Schale** klassifiziert, nicht als Beleg für das Baujahr 1928 oder den aktuellen Zustand.

## Bildindex

| Kennung | Nutzer-Dateiname | Motiv | Nutzbarer Grafikbefund | Grenzen |
| --- | --- | --- | --- | --- |
| WFH-REF-01 | `a8527f98-e487-4ef0-ab3c-68edde17f0e3-1_all_471.jpg` | Helm, Schild und Schwert aus geringer Entfernung; Tafelrahmen | Flügelhelm mit zwei hochstehenden Flügeln, dunkle Metallpatina, rundlich-ovaler Schild, horizontal liegendes Schwert; Stein- und Efeudetails | Weitwinkel/naher Standpunkt, Teilverdeckung, keine Gesamtmaße |
| WFH-REF-02 | `a8527f98-e487-4ef0-ab3c-68edde17f0e3-1_all_10842.jpg` | Front, Steinsäulen, seitliches Schalenpodest, breite Treppen | Offene steinerne Rahmung mit Pfeilern und Querbalken, Steinpodest mit Metalltafel, übereinander liegende Stufen | Eine Person steht auf dem Denkmal: nicht in Asset übernehmen; Perspektive nicht maßstabstreu |
| WFH-REF-03 | `a8527f98-e487-4ef0-ab3c-68edde17f0e3-1_all_10820.jpg` | Vertikale Vorderansicht, Stufen, Baumkronen | Monumenthöhe gegenüber Treppen, seitlich hohe Baumkronen und gefleckter Lichteinfall | Person im Motiv, kein sicherer Maßstab |
| WFH-REF-04 | `a8527f98-e487-4ef0-ab3c-68edde17f0e3-1_all_10818.jpg` | Unterer Vorplatz mit Sitzbänken und Wegen | Vorplatz, niedrige Mauern/Steinpfosten, schmaler Mittelweg, Sträucher, Bänke beiderseits, zurückgesetztes Denkmal | Personen und moderne Ausstattung als Dokumentationsobjekte, nicht automatisch historische Details |
| WFH-REF-05 | `a8527f98-e487-4ef0-ab3c-68edde17f0e3-1_all_10816.jpg` | Weite Zugangsansicht mit Fahrrädern | Vorderer Treppenabsatz, breite befestigte Fläche, zwei seitliche Bankpositionen, Kontrast offener Fläche zu dichter Vegetation | Fahrräder/Person nicht als historische Darstellung nutzen |
| WFH-REF-06 | `a8527f98-e487-4ef0-ab3c-68edde17f0e3-1_all_10813.jpg` | Freie Übersicht des Parks und Denkmalzugangs | Beste Gesamtkomposition ohne Personen vor dem Denkmal: zentraler Eingang, gestaffelte Stufen, Hecken, Baumgruppen, gewachsener Wegbelag | Keine exakten Grundrisse, Himmelsrichtung nicht bestimmt |
| WFH-REF-07 | `a8527f98-e487-4ef0-ab3c-68edde17f0e3-1_all_10845.jpg` | Frontdetail von Tafel, Helm und Pfeilern | Rechteckige mittlere Metalltafel, umgebende Steinblöcke, zwei seitliche Metalltafeln an den Pfeilern, Efeubogen, Plattenfugen | Inschrift nicht als generierbaren Fantasietext nachbilden; zeitlicher Zustand ungeklärt |
| WFH-VID-01 | `a8527f98-e487-4ef0-ab3c-68edde17f0e3-1_all_10843.mp4` | 81,4-s-4K-Video mit Rasen- und Park-Weitblick, seitlichem Relief, Flügelhelm und mittlerer Tafel | **Neun bei 0–80 s extrahierte Frames gesichtet**; erstmals Seitenrelief, rück-/seitliche Ornamentdetails und Wegkontext sichtbar | Container-`creation_time` 2025-05-01 14:49 UTC, nicht gesichertes Kameradatum; kompletter Film nicht frameweise geprüft; [Timecode-Protokoll](westhofen-video-reference-pass-20261112.md) |

## Feste Bildmerkmale für die Style-2-Umsetzung

### Monument-Silhouette (aus den Nutzermotiven)
- Unmittelbar vor der steinernen offenen Rahmung sitzt auf einem separaten, gestuften Block das monumentale Helmsymbol.
- Graugrüne/dunkel oxidierte metallische Helmoberfläche, zwei flügelähnliche Aufsätze, breiter Stirnreif und seitlich herabführende Ränder.
- Schwert längs/horizontal hinter dem Helm, großer abgeflachter Schild unterhalb; Form und Relief anhand Nahaufnahme prüfen.
- Mittelblock aus hellgrauem, unregelmäßig verwittertem Naturstein; vorne rechteckige Tafel in **diesem undatierten fotografierten Zustand**.
- Rahmung aus mehrteiligen groben Steinpfeilern mit horizontalen Deckbalken und kräftigem Efeubewuchs; seitliche hochrechteckige Metalltafeln.
- Freistehende seitliche niedrige Podeste mit schalenartigem Metallobjekt in mindestens einem Foto. Im Spielzustand November 2026 laut bestehender Chronik **nicht** automatisch darstellen.

### Gelände und Vegetation (aus den Nutzermotiven)
- Oberer Steinplattenplatz um den Sockel, dunkle unregelmäßige Fugen und Moos im Schatten.
- Mehrfach gestufte Treppen auf die Denkmalplattform; weitere niedrige Mauern/Pfeiler auf dem tieferen Zugangsplatz.
- Unterschiedlicher Belag: Kies-/wassergebundene Wegfläche vor den Stufen, hellere Steinplatten oben, Rasen seitlich, moderne harte Fläche am äußeren Zugang.
- Gewachsene hohe Laubkronen mit Fleckenlicht, dichte immergrüne und laubige Hecken, Efeu an Balken und Pfeilern, vereinzelte Bodenpflanzen.
- Bänke seitlich zum zentralen Blickkorridor; moderne Fahrräder/Personen/Mülleimer nicht in ein historisierendes Spielasset übernehmen.
- **Baumarten nicht allein aus den Fotos sicher bestimmen** und keine exakten Standorte/Maße/Himmelsrichtung behaupten.

## Produktions- und Freigabeplan

1. Aus WFH-REF-01 und -07 Maß-/Silhouettenstudien ohne echte Maßstabsbehauptung: Helm, Schwert, Schild und Tafelsockel getrennt; zwei Zustandsvarianten für die mittlere Tafel (fotografierte Tafel **vs.** dokumentiert leer) als explizite Versionen.
2. Steinrahmen/Pergola mit drei erkennbaren Pfeilerachsen, offenen Durchblicken, seitlichen Tafeln und getrenntem Efeu-Overlay als RGBA-Objekt; kein Himmel, keine Personen, keine Bänke in das Architektur-Sprite einbacken.
3. Aus WFH-REF-06 einen **illustrativen** Überblick ableiten: unterer Vorplatz → Treppe → oberer Denkmalplatz, vorhandenes `dist/levels.js`-Wegenetz und Slots unverändert lassen.
4. Materialfamilien: raue Fugen-Steinplatten, Naturstein-Stufen/Stützmauer, Kies-/Sandweg, Waldrasen, Efeu-Laub. Keine Verwendung eines Fotos als unkontrollierte All-in-one-Leveltextur.
5. Licht: weiches Oberlicht und gefilterte Blatt-Schatten als **künstlerische** Dark-Fantasy-Variante. Warmes Licht von links oben gemäß `ART-DIRECTION.md`; ohne übertriebene Leuchtpfeiler.
6. QA auf 64/128 px mit transparenten Insets, Fußpunkten, 2.5D-Perspektive, Alpha-Kanten, Canvas-Cache und mobilem Hochformat; bestehende Straße/Busstop-/Grünzug-Gameplaygeometrie darf nicht überschrieben werden.

## Quellen- und Rechtehinweis

Quelle: Nutzerdateien in ChatGPT-Konversation, 12.11.2026 bereitgestellt. **Das Bereitstellungsdatum ist nicht das fotografische Aufnahmedatum.** Urheber/Lizenz unbekannt. Keine Veröffentlichung der Original-JPGs/Video in GitHub oder GitHub Pages ohne gesicherte Rechte. Diese Referenzdatei enthält nur Beobachtungen und Dateinamen.

Weiterhin offen: unabhängig bestätigte Kamera-Aufnahmezeiten, belegte heutige Situation nach Juli 2026, historische Originalfotos ca. 1928, vollständige Seiten-/Rückansichten und Symboldeutung, Freigabe der Originalmedien und tatsächliche physische Android-Abnahme. MP4-Metadaten und neun Frames wurden im [separaten Video-Pass](westhofen-video-reference-pass-20261112.md) dokumentiert.
