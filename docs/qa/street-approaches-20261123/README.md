# Anschlussplatten an Lane-/Straßen-Kreuzungen (P1 #330 §2 „Anschlüsse")

Stand: 2026-11-23. Gestackt auf #427 (Straßen-Detailpass). Rein visuell auf den
gecachten Böden bzw. der Site-Ebene — keine Weg-, Slot-, Gate- oder Save-Änderung.

## Änderungen

- `dist/ground-v3.js`: neuer Export `TD2GroundV3.approachPlates(q, lanes, route, reach)` —
  zeichnet gepflasterte Übergangsplatten (30×22, Stein `#83876f` mit dunklem Rand)
  entlang jedes Lane-Segments, das der Straßen-Polyline näher als `reach` kommt.
  Deterministische 18-px-Abtastung; Lanes/Routen werden nur gelesen.
- **L7 Westhofen**: Platten an Kreuzungen mit `streetRoute` (reach 88) und
  `walkRoute` (reach 42, Bürgersteig-Querung) — nach dem Lane-Loop, damit die
  Platten sichtbar aufliegen.
- **L6 Goethestraße**: Platten an Kreuzungen mit beiden Straßen-Routen
  (`streetRoute`, `frontRoute`, reach 84).
- **L3 Kirchende** (`drawStreet`): Anschlussplatten (76×28) an den Lane-Eckpunkten
  auf der Straße (x = −700, −340, 350, 700 relativ zum Zentrum); die axiale
  Zufahrt (x ∈ (−50, 90)) bleibt wie bei Mauer- und Dash-Lücke offen.

## Tests

- `tests/street-approaches.test.cjs` (neu): Helper-Einheit (nah vs. fern),
  L7-Platten nur an Straßen-/Gehweg-Kreuzung, L3-Platten an den vier Eckpunkten
  und axial offen, Layout-JSON unverändert.
- Cache-Keys gebumpt: `ground-v3.js`, `kirchende-art.js`, `westhofen-art.js`,
  `goethestrasse-art.js` → `*-approaches-20261123` (index.html, cache-busting,
  Pin-Tests). Vollsuite lokal: 151/151 Node-Tests grün.

## Offen

- Visuelle Abnahme durch Marcel (Platten-Größe/Abstand gegen Fotos), dann
  Entscheidung über Default-Sichtbarkeit.
- Kein Android-4-GB-Test in diesem Pass (Boden wird einmalig gecacht; keine
  pro-Frame-Allokation). Physische Abnahme bleibt separat offen.
