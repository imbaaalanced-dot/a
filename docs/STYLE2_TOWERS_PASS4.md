# Denkmal TD2 – Style 2 Grafikpass 4: Bogenturm, Magieturm und Riftlanze

Stand: 16.10.2026. Entwicklung auf `feature/style2-towers-pass4-20261016`, basierend auf Style-2-Kanonenpatch #37.

## Gestaltungsprinzip
Alle Türme teilen die gleiche graubraune 2.5D-Steinbasis, aber haben eigenständige, auch im Android-Hochformat lesbare Silhouetten.

| Turm | Stufe I | Stufe II | Stufe III |
|---|---|---|---|
| Bogenturm | Einfache Holzgalerie, ein Bogen | Verstärkte Holzplattform, zwei Bögen | Befestigte Brüstung mit drei Bögen |
| Magieturm | Kleiner blau schimmernder Kristall | Zwei Kristalle und seitliche Energiekanäle | Hoher Dreifachkristall und arcane Lichtbrücke |
| Riftlanze | Einzelner Bruchstein-Obelisk | Zwei Rift-Spitzen und größerer Kern | Drei hohe Obelisken, violetter Riftbogen |

Dazu gehören 9 stufenspezifische Projektile (Pfeile/Kristallenergie/Riftbolzen) und 45 vorgerenderte Einschlagbilder (3 Türme × 3 Stufen × 5 Frames). Türme: 240×256 Canvas; Geschosse: 90×90; Einschläge: 120×120. Cache wird nur bei erstmaliger Verwendung einer Variante aufgebaut.

## Einbau
- `dist/style2-towers.js`: eigener Visual-Renderer `globalThis.Style2Towers`.
- `dist/game.js`: nutzt den Renderer mit Fallback zu bestehenden PNG-/Atlasgrafiken, unveränderte Sterne.
- `dist/combat-fx.js`: nutzt die stufenspezifischen Spriteeinschläge statt der bisherigen generischen Atlas-Explosionen für Bow/Mage/Rift. Die bisherigen Staub-, Ring- und Soundeffekte bleiben bestehen.
- `dist/index.html`: zusätzliche Ressource `style2-towers.js?v=v400a6s2t4`, neue Versionen für Game und Combat-FX.
- `tests/style2-towers.test.cjs`: neun eigenständige Turm- und Geschossvarianten, 45 Einschlagframes, keine neuen Canvas nach Cache-Warmup, Partikelobergrenze und Spielintegration.
- Testbuild nach erfolgreichem CI: `https://imbaaalanced-dot.github.io/a/v4-style2-towers/`. Level 3 und 4 nur im separaten Tester direkt anwählbar.

## Unverändert
Schaden, Angriffstempo, Reichweite, Zielpriorität, Slow-, Chain- und Pierce-Eigenschaften, Feind-/Heldenwerte, Freischaltregeln sowie Persistenz. Vorschau-Levelabschlüsse speichern keine reguläre Kampagnenfreischaltung (andere Loot-Aktionen bleiben wie bisher).

## Vor einer Übernahme
Android-Hochformat und Desktop auf echten Geräten überprüfen: Sichtbarkeit der Stufen, Trefferpartikel/Lesbarkeit, FPS bei vielen Türmen. Noch kein Merge in `main`. Der bestehende Main-Pages-Workflow muss den separaten Testpfad ebenfalls schützen, bevor dauerhaftes Deployment garantiert ist.
