# Denkmal TD2 · v3.6.0-alpha.6

## Testbuild und Änderungen
- Seit PR #21: `ALLES RECYCELN` für Rucksack und Überlauf mit Vorschau und Bestätigung; Ausrüstung und Favoriten bleiben geschützt.
- Seit PR #20: das härtere Alpha.5-Gegnerbalancing bleibt unverändert.
- Hauptmenü-Badge auf `v3.6.0-alpha.6 · BEUTE` korrigiert.

## Cache und Auslieferung
- Die 15 lokalen JS/CSS-Referenzen aus `dist/index.html` werden in `tests/cache-busting.test.cjs` auf lokale Existenz, eindeutiges Laden und explizite Cache-Schlüssel geprüft.
- Beute-Skripte verwenden `v360a6bulk1`, Kampf `v360a5balance1`, unveränderte Basiskomponenten weiterhin `v360a5`. Unterschiedliche Versionen sind bewusst dateispezifisch.
- Der Publish-Workflow führt Preloader-, Cache-, HUD-, Beute-, Gameplay-, Mobile-Mechanik-, Combat-FX- und Feature-Tests vor dem Kopieren nach `gh-pages` aus. CI-Erfolg ist kein Beleg für reale Android-Touch- oder Browser-Cache-Messungen.

## Freigabe
Die Release-Notiz dokumentiert einen **Tester-Build**, nicht einen GitHub-Release-Tag und nicht eine fertige APK. GitHub Actions und Pages-Deploy müssen nach Integration des Fixes erneut erfolgreich abschließen. Level 3 Kirchende bleibt im separaten Branch.
