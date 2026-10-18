# Denkmal TD2 V4.0.0-alpha.5 – Grafikpatch (15.10.2026)

## Änderung
- **Kirchende-Boden:** Deterministische, einmalig generierte und wiederholbare Gras-/Erdkacheln mit Moos, Vegetationsflecken und feiner Körnung statt Vollflächenfarbe.
- **Fotoabgleich Kirchende:** Moosiger, lückig bewachsener Erdboden mit Herbstlaub; Plattenweg und flache Stufen am Kirchweg, sonst erdige Zugänge ohne Mittellinie. Verwitterte Steinfläche, separate flache Steinplatte, Bänke und dichtes Gebüsch am Denkmal. Bestehende Routenkoordinaten sind unverändert.
- **Bäume:** Fünf gecachte Kronenvarianten mit Licht-/Schattenlagen, Blattclustern und transparenter Überlagerung in Figurennähe.
- **Turmstufen:** Ein, zwei oder drei goldene Fünfzack-Sterne mit identischer Größe und Zentrierung unter dem Fundament; niedriger Effektaufwand bei reduziertem Grafikmodus.
- **Mobil:** Boden nur im sichtbaren Kamerabereich zeichnen; Gras-, Weg- und Baumflächen nicht pro Frame neu generieren.

## Bewusst unverändert
Wellen, Schadenswerte, Turmreichweiten, Gegner-KI, Speicherformat, Bauplätze, Spielersteuerung und Menü.

## Testplan
`node tests/terrain-polish.test.cjs`, `node tests/cache-busting.test.cjs`, `node tests/v4-alpha4.test.cjs` und die gesamte bestehende Suite im Pages-Workflow. Reale Android-Tests (FPS/Zoomen, Baum-Transparenz, Sternlesbarkeit bei Stufe 1 bis 3) bleiben erforderlich.

Testseite nach erfolgreichem CI-Deploy: https://imbaaalanced-dot.github.io/a/v4-alpha5/
