# Straßen-Detailpass (P1 #330 §2: Straßen nach realem Vorbild)

Stand: 2026-11-23. Rein visuell in den gecachten Böden bzw. der Site-Ebene —
keine Weg-, Slot-, Gate- oder Save-Änderung. Basis: Branch auf dem Traffic-Prototyp
(#424), damit Markierungen und `streetRoutes()` dieselben Polylines nutzen.

## Änderungen

- **L7 Westhofen** (`dist/westhofen-art.js`): dunkler Bordstein-Rand (165 px,
  `#3f443f66`) unter dem Schulterband der Reichshofstraße; Mittellinie über
  `laneMarks()` (bisher Inline-Schleife, jetzt als Funktion, unveränderte
  Strichführung); Gehweg-Kante (58 px, `#4a4f4a`) unter dem Bürgersteig.
- **L6 Goethestraße** (`dist/goethestrasse-art.js`): Bordstein-Rand + Mittellinie
  (`laneMarks`) auf **beiden** exportierten Straßen-Routen
  (`streetRoute`, `frontRoute`).
- **L3 Kirchende** (`dist/kirchende-art.js` `drawStreet`): abgenutzte
  Mittellinie (`#d8d3ba66`, 30×4 px, Raster 64 px) auf der Asphaltdecke;
  die axiale Zufahrt bleibt wie beim Mauerband offen (Lücke bei x ∈ (−80, 90)).
  Bestehende Kantenbänder (`#555b53`/`#8e8c7a`/`#50574e`) unverändert.
- L4-Kirchhofwege bleiben bewusst **ohne** Markierungen (historisch korrekt,
  siehe `ROAD_SHOULDERS`/`CHURCH_SHOULDERS` in `terrain-polish.js`).

## Tests

- `tests/street-details.test.cjs` (neu): Bordstein-/Asphalt-Strokes pro Level,
  Mittellinien vorhanden und folgen den exportierten Routen, Gehweg-Kante L7,
  L3-Dash-Anzahl und offene Zufahrt, Layout-JSON vor/nach `draw` identisch,
  Cache-Keys in `index.html` gebumpt.
- Cache-Keys: `kirchende-art.js`, `westhofen-art.js`, `goethestrasse-art.js` →
  `*-streets-20261123` (index.html + `cache-busting.test.cjs` + Pin-Tests in
  `westhofen.test.cjs`, `level4.test.cjs`, `style2-kirchende.test.cjs`).
- Vollsuite lokal: alle Node-Tests grün.

## Noch offen (bewusst)

- „Anschlüsse“: gepflasterte Übergangsplatten an den Lane-/Straßen-Kreuzungen
  (L3-Zufahrten, L7-Fußwege) — als nächster Schritt geplant, bewusst nicht in
  diesem Pass, um die Kreuzungsgeometrie erst gegen Referenzen zu prüfen.
- Oberflächen-Feinschliff (Markierungen auf L6/L7 per Fotoabgleich, Bordstein-
  Höhe) wartet auf Marcels Sichtung; L4-Pflaster-Entscheidung (`?td2PavementV4=1`)
  ebenfalls offen.
- Kein Android-4-GB-Test in diesem Pass (rein gepixelte Boden-Canvas, keine
  neuen Allokationen pro Frame); physische Abnahme bleibt separat offen.
