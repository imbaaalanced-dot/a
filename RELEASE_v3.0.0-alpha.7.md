# Denkmal TD v3.0.0-alpha.7

Combat-FX- und Browser-Stabilitäts-Pass — 3. Oktober 2026.

## Combat FX

- Neuer leichter Projektil-FX-Atlas unter `dist/assets/projectile-fx-v3.svg`.
- Eigene Flug- und Trefferframes für Bogen, Kanone, Magie und Riftlanze.
- Trefferframes laufen über das bestehende begrenzte Partikelsystem statt über ein zweites unbegrenztes FX-System.
- Reduced-FX/Reduced-Motion bleibt berücksichtigt.
- Der bisherige prozedurale Projektil-Renderer bleibt als Fallback aktiv, falls der Atlas noch nicht geladen werden konnte.

## Browser-Auslieferung

- `game.js` und `combat-fx.js` verwenden Alpha-7-Cache-Busting.
- Wiederkehrende Tester erhalten dadurch nach dem Pages-Deploy zuverlässig die neue Projektil-Integration.
- Der Tester-Build wird weiterhin automatisch aus `dist/` auf den Branch `gh-pages` gespiegelt.

## Enthalten aus Alpha 6

- Portrait-first Android-/Mobile-Layout.
- Portrait-spezifischer Kamera-Zoom und vertikale Heldenpositionierung.
- Safe-Area-Unterstützung.
- Kompakte Touch-Steuerung und 2×2-Turmarsenal.
- Resize/Rotation ohne automatisches Pausieren des aktiven Runs.

## Regression

Vor der Veröffentlichung müssen bestehen:

1. Gameplay regression suite.
2. Combat FX regression suite.
3. Pages-Publish nach erfolgreicher Prüfung.

## Tester-Fokus

1. Bogen, Kanone, Magie und Rift auf echte sichtbare Projektil-/Impact-Sprites prüfen.
2. Wiederholtes Laden auf einem Gerät testen, das Alpha 6 bereits im Browser-Cache hatte.
3. Portrait 360×800, 390×844 und 412×915 testen.
4. Viele gleichzeitige Gegner/Schüsse mit FPS-Overlay beobachten.
5. Reduced-FX/Grafikmodus auf Android gegen den normalen Modus vergleichen.
