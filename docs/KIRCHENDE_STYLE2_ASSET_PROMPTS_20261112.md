# Denkmal TD2 · Kirchende / Ender Dorfkirche · Style-2-Asset-Prompts

Stand: 12.11.2026 · Ziel: fotoorientierte Umgebung und Architektur für **Level 4**. Referenzinventar: `docs/KIRCHENDE_CHURCHYARD_PHOTO_REFERENCE_20261112.md`. Hier genannte Dateien 165–178.jpg liegen als Nutzeranhänge vor; **nicht als im Repository verfügbare Dateipfade behandeln**.

## Codex-Masterauftrag (für Repo-Analyse und späteren Einbau)

Du arbeitest als Lead Art Director, Rendering-Entwickler und QA-Verantwortlicher in `imbaaalanced-dot/a`. Starte auf dem aktuellen `main`; erstelle einen Entwicklungsbranch. Prüfe den realen Level-4-Renderer, vorhandene Style-2-Dateien, Asset-Manifest, Canvas-Kameraperspektive, Caching und Tests, bevor du Dateien erzeugst oder ersetzt. Die Kirchhof-Fotos vom 23.10.2026 mit den Namen 165, 166, 167, 168, 169, 170, 172, 173, 174 und 178.jpg sind visuelle Originalreferenzen für die Ender Dorfkirche und das liegende Löwendenkmal. Verwende sie nur, wenn sie in der Arbeitsumgebung tatsächlich verfügbar sind; andernfalls nutze den präzisen Referenzbrief und kennzeichne fehlende Bildbelege.

**Ziel:** hochwertige handgemalte Graphic-Dark-Fantasy-2.5D-Kirchhofwelt, aber real erkennbare Geometrie und Materialien. **Unverändert:** Wellen, Turmwerte, Save-Keys, Gegnerwege, Bauplätze, Kirchen-/Löwen-Anker und Kollisionsregeln. Der alte Grafikbestand bleibt erhalten, bis neue Sprites dokumentiert, optisch bestätigt, geladen und getestet sind.

Umsetzung in kleinen Patches:
1. Fotoabgleich zwischen Fassade, Löwensockel, Grabfeld, Pflaster, Grün, Bäumen und Fachwerk.
2. Materialproben und modular getrennte transparente Architektur-/Deko-Sprites vorbereiten. Angeforderte Grafiken dürfen keine vollständigen Wege, zusätzliche Objekte, Schrift-Overlays oder UI enthalten.
3. Perspektive/Pivots/Alpha, einheitliches Licht links oben, Bounding Boxes und mobile WebP-Dateigrößen prüfen.
4. Im bereits vorhandenen Canvas-Terrain-/Sprite-System einbinden; Cache einmal pro Szene aufbauen, keine neue Bildinstanz pro Frame. Canvas-Fallback bei Ladefehler.
5. Vorher-/Nachher-Screenshots mit Fotoreferenzen vergleichen; vorgeschriebene Node-Tests und Desktop/Touch-Chromium durchführen, reale Android-Prüfung nicht behaupten.
6. PR mit Dateiliste, Beobachtungen, Tests, offenen Abnahmen, Messwerten, Screenshotnachweis anlegen. Nicht ohne positive CI und Branchregeln mergen. Bei Bildfehlern die Änderung offenlassen.

## Bildgenerator-Prompts

### A – Kopfsteinpflaster, Materialprobe (165, 166, 173, 174, 178)

Erzeuge eine **quadratische seamless Game-Terrain-Textur** als 2.5D orthographic ground material. Historische kleine hellgraue Natursteinpflaster, leicht unterschiedlich große rechteckig-unregelmäßige Steine, tiefgraue sandige Fugen, vereinzeltes dunkles Moos und sparsam verteiltes rostbraunes Herbstlaub. Zielreferenz ist Kirchende/Ender Dorfkirche am 23.10.2026. Realistisch handgemalter düsterer Style 2, scharf lesbar bei mobiler Ansicht, keine Straße, keine Gebäude, keine Schattenwürfe von fremden Objekten, keine Figuren, keine eingebrannten Path-Linien, keine perspektivische Flucht, keine Schrift. Die **Bogenverlegung** des echten Pflasters muss bei der Levelwegerzeugung aus der tatsächlichen Route und lokalen Materialausrichtung entstehen; nicht behaupten, eine beliebig gekachelte quadratische Textur allein bilde die gesamte Bogenstruktur ab.

### B – Naturstein-Plattenweg (168, 165)

Seamless orthografische Bodenmaterial-Textur mit unregelmäßigen großen graubraunen Natursteinplatten, schmalen dunklen Fugen mit Moos, leichten Ausbrüchen und fleckigen Gebrauchsspuren. Gedämpftes Licht links oben, kein zusätzlicher Gehwegverlauf oder Randstein in der Datei. Hand-painted dark fantasy 2.5D, neutraler Albedo-Charakter, keine Figuren, Kirche, Grabsteine oder Schrift.

### C – Bruchsteinmauer und Buntglas (169, 170, 178)

Ein zusammenpassendes **modulares Kirchen-Fassaden-Assetset** mit rauem grau- und sandbraunem Bruchstein, unterschiedlich großen Steinen, mineralischem Mörtel, schmalen hohen Rundbogenfenstern mit dunkler Bleiverglasung und helleren sorgfältig gesetzten Sandsteingewänden. Authentisch gealtert, nicht symmetrische sterile Burgmauer. Orthografische erhöhte 2.5D-Kamera, einheitlich beleuchtet, separate Wandmodule und Fenster/Portal-Elemente, saubere Transparenz für freistehende Module, kein kompletter Hintergrund, keine erfundenen Schriftzüge.

### D – Kirchenportal (169, 172)

Freigestelltes Architekturmodul: dunkles zweiflügeliges Holztor, rundbogige helle Natursteinfassung, profilierte seitliche Steinpilaster, dezenter metallener Ringgriff, genietetes Holz. Oberhalb des Bogens Platzhalter für die **fotografisch belegte** Inschriftform, aber **keine generierten lesbaren Buchstaben**; Text nur nach gesonderter exakter Transkription einfügen. Stil: hochwertige 2.5D Dark Fantasy Game Art, nicht Horrorportal, keine Runen, kein Leuchteffekt, transparentes Umfeld, passende Fassadenperspektive.

### E – Löwendenkmal (173, 174)

Ein **freigestelltes historisches Löwendenkmal-Sprite** nach Kirchende-Fotos: liegender steinerner Löwe auf einer flachen oberen Plattform, verwitterte moosige Oberflächen; darunter massiver rechteckiger Steinkörper mit eingerahmter dunkler Tafel und floralen Steinornamenten, mehrere gestufte Sockelplatten. Material: beigegrauer Sandstein mit dunklen Feuchte- und Moosspuren. 2.5D orthografische erhöhte Spielperspektive, Bodenanker unter dem Sockel, glaubwürdige Silhouette auch bei 64 und 128 px, keine neue Richtung erfinden: die aus dem Spielcode bestimmte Löwenausrichtung erhalten. Keine Umgebung, kein Pflaster, kein Himmel, keine Fantasie-Inschrift, transparenter Rand.

### F – Grabsteine (165, 166, 173)

Modularer Atlas mit getrennten historischen Grabsteinen: verschiedene Höhen, ungleichmäßige abgerundete oder wellige Kopfkonturen, einige schmale Stelen, verwitterter graubrauner Stein, Moos und Flechten. Keine identischen Kopien, keine modernen Grabkreuze, keine lesbaren erfundenen Namen oder Daten. Gemeinsame orthografische 2.5D-Perspektive und Alpha-Padding, eindeutig getrennte Zellen mit gemeinsamen Bodenankern, kein Boden in den Sprites.

### G – Vegetation und Laternen (165, 166, 168)

Ein Set aus unterschiedlich großen mitteleuropäischen Laubbäumen, spät-herbstlichen braun-ocker-grünen Kronen, einzelnen Strauchgruppen, niedriger Rasenbepflanzung, Laubhäufchen und historisch wirkenden gebogenen Laternen. Dunkle, elegante 2.5D-Illustration, dezente Schatten, klarer Umriss. **Getrennte Layer:** Baumstamm/untere Äste, Krone, Bodendeko, Laterne; die Krone soll Spielfiguren nicht dauerhaft verdecken. Keine vollständige Kirchhoflandschaft, keine zusätzlichen Wege oder Gebäude.

### H – Hintergrundhäuser (165, 166, 173, 174)

Kleine modulare Hintergrundkulissen nach dem örtlichen Kirchhofumfeld: weiße Putzflächen mit dunklen Fachwerkstreben, graue Ziegel-/Schieferdächer, ein benachbartes steinernes Wohnhaus, sparsam farbige grün-türkise Holzelemente. Gleiche erhöhte Spielperspektive wie die Kirche; niedrige Detailpriorität, keine frei erfundenen Monumente oder Straßen. Als entfernte Kulisse, nicht als neue Spielfeldgrenze.

## Grafikabnahme: verpflichtende Bedingungen

- **Quellentreue:** Bei A–H dokumentieren, auf welche Fotos und welche sichtbaren Objekte sich jede Grafik stützt. Keine exakte Vermessung behaupten.
- **Technik:** transparente WebP-Sprites mit sauberem Rand, wiederverwendete Canvas-Caches, keine unnötigen großen Dekodierflächen, Manifest und Fallback konsistent. Finale Zell- und Atlasgröße nach Prüfung der aktuellen Sprite-Pipeline festlegen.
- **Lesbarkeit:** 64px/128px-Prüfung, keine falsch laufenden Wege, keine neuen Hindernisse, keine verdeckten Bauplätze.
- **Sicherheit:** keine Löschung historischer Assets; Änderungen isoliert; JS-Syntax und bestehende Level-Regressionen ausführen.
- **Gerätetest:** Chromium Desktop und Touch gesondert dokumentieren; Android 4-GB-Gerät bleibt **offen**, bis echte Messungen (FPS, RAM, Asset-Kaltstart, Wellen, Wechsel) vorliegen.
- **Release:** ein erfolgreich angelegter PR, Merge und GitHub-Pages-Deployment sind drei verschiedene Zustände.

## Nächster kleinster Schritt

Erst **A–B** als abnahmefähiges Material-Sample herstellen und mit Screenshots von Level 4 vergleichen; erst danach Kirchen- und Monument-Sprites austauschen. Der Auftrag erzeugt **keinen automatischen Merge**.
