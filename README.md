# Denkmal TD / TD2 · v3.6.0-alpha.6

Browser-Testbuild mit Marcel dem Denkmalschützer. Die spielbaren Dateien liegen in `dist/`; kein Build-Schritt und keine zusätzliche Laufzeit-Abhängigkeit sind erforderlich.

## Welcher Stand ist aktuell?

Stand der Prüfung: 11. Oktober 2026.

| Bereich | Stand |
| --- | --- |
| Hauptprojekt | `imbaaalanced-dot/a`, Branch `main` |
| Aktueller geprüfter Spielcode | `273bf3a20ee8ad5ccf22bae1c967e6dc637e8c05` – Alpha.6, Sammel-Recycling |
| Veröffentlichung | `gh-pages`; Publish- und Pages-Workflow für diesen Spielstand erfolgreich |
| Anzeige im Hauptmenü | `v3.6.0-alpha.6 · BEUTE` (nach Integration dieses Fixes) |
| Kirchende / Level 3 | Separater Entwicklungsbranch `v4-kirchende`, noch nicht in `main` oder dem regulären Tester-Build |
| Optionale KI | Draft-PR #15, nicht in `main`; laut PR nicht produktiv bereitgestellt |
| GitHub Releases | Zum Prüfzeitpunkt keine veröffentlichten GitHub Releases; Pages-Testbuild und GitHub Release sind getrennte Dinge |

Das ursprüngliche Repository `imbaaalanced-dot/denkmal-3d-ultimate-historical` bleibt erhalten. Neue TD2-Arbeit gehört in dieses Repository (`a`). `main`, `gh-pages`, `v4-kirchende`, der KI-Branch und Archivstände sind keine pauschalen Löschkandidaten.

## Im aktuellen Tester-Build enthalten

- Level 1 „Vier Tore“, Wellen 1–5; anschließend dauerhaft freischaltbares Level 2 „Das Labyrinth“ ab Welle 6 und weiterer Wellenfortschritt.
- Steuerbarer Held mit automatischem Runenstab, Ausweichen und Seelenruf.
- Bogen, Kanone, Magie und Riftlanze; feste Bauplätze, Aufwertungen bis Stufe 3, Verkauf und Zielprioritäten.
- Gegnerrollen, Bossphasen, Mini-Boss-Modifikatoren, Wellenvorschau und Kampfsynergien.
- Dauerhafte Beute mit Seltenheiten, acht Ausrüstungsslots, 30 Rucksackplätzen, Überlauf, Favoriten, Export/Import und Schmiedessenz.
- Hauptmenü mit Laternenhüter-Grafiken, Heldenportrait, Ausrüstungsicons, Bronze-Upgradehinweisen und 9:16-Ladebildern.
- Getrennte Menüs: **HELD / H** zeigt Heldenprofil und Chronik; **BEUTE / I** öffnet Rucksack und Ausrüstung.
- Portrait-HUD, Touch-Joystick, kontextuelle Bauaktionen und optionale Tester-Telemetrie.
- Alpha.5: robustere Gegner, stärkerer Wellendruck, flachere Turm-Skalierung und weniger Zwischenwellenheilung. Details: [Balance-Dokument](BALANCE_v3.6.0-alpha.5.md).
- Alpha.6: **ALLES RECYCELN** zeigt Anzahl und Essenz vor einer Bestätigung. Rucksack und Überlauf werden berücksichtigt; Favoriten und angelegte Gegenstände bleiben geschützt. Diese Änderung ändert das Gegnerbalancing nicht.

Ausrüstung und Recycling sind nur im Hauptmenü bearbeitbar. Während des Kampfes ist die Beuteansicht schreibgeschützt. Beute bleibt nach Niederlagen und Neuladen erhalten; der laufende Durchgang wird nicht gespeichert. Browserdaten löschen entfernt auch den lokalen Spielstand: vorher über den JSON-Export sichern.

## Steuerung und lokaler Start

WASD/Pfeile oder Touch-Joystick bewegen Marcel. `E` baut, `Q` wertet auf, `X` verkauft, Leertaste weicht aus, `F` löst den Seelenruf aus, `H` öffnet das Heldenprofil und `I` die Beute.

```bash
python -m http.server 8777 --directory dist
```

## Verifikation und offene Punkte

Am 11. Oktober 2026 am oben genannten Spielcode erfolgreich ausgeführt:

```bash
node tests/preloader.test.cjs
node tests/cache-busting.test.cjs
node tests/portrait-hud.test.cjs
node tests/loot.test.cjs
node tests/game.test.cjs
TEST_MOBILE=1 node tests/game.test.cjs
node tests/combat-fx.test.cjs
node tests/v3.1-features.test.cjs
python tests/assets.test.py
```

Die Bildprüfung benötigt Pillow. Diese Prüfungen ersetzen keine echten Android-Touch-, Layout- und Langzeittests.

Die Dateien aus `main:dist/` stimmen mit dem veröffentlichten `gh-pages`-Stand überein; dort liegen zusätzlich `.nojekyll` und der ältere separate Testpfad `superpowers-alpha3/`.

Noch aufzuräumen bzw. zu prüfen:

- Alpha.6-Hauptmenü-Badge aktualisiert; Einzelheiten: [Release-Notizen](RELEASE_v3.6.0-alpha.6.md).
- `tests/cache-busting.test.cjs` prüft den Release-Badge, Existenz und eindeutige Zuordnung aller 15 lokalen JS/CSS-Dateien sowie deren explizite Cache-Schlüssel. Die versionsabhängigen Assertions wurden aus dem Portrait-HUD-Test entfernt.
- Publish-Workflow prüft nun zusätzlich den Preloader und die Cache-Versionen **vor** dem Spiegeln nach `gh-pages`. Die Publish-Pipeline wiederholt diese Prüfungen unabhängig vom separaten Test-Workflow.
- Cache-Schlüssel bleiben dateispezifisch: Basis `v360a5`, Kampf `v360a5balance1`, Beute `v360a6bulk1`. Bei jeder JS/CSS-Inhaltsänderung sind `index.html` und die Cache-Test-Erwartungen gemeinsam zu aktualisieren.
- Den Kirchende-Branch vor V4-Integration mit diesem aktualisierten Teststand abgleichen; dessen frühere Cache-Test-Annahme kann so ohne HUD-Funktionsänderung entfallen.
- Kirchende enthält Level-3-Code und neue Grafiken, aber die im V4-Plan vorgesehenen zusätzlichen Kirchende-Tests, Workflow-Erweiterungen und Release-/Balance-Dokumente fehlen im Vergleich zu `main`. Vor einem Merge separat prüfen.
- KI-Draft #15 bleibt unfertig und deaktiviert; die dort dokumentierten Zugangs-, Missbrauchs- und Kostenkontrollen sind Voraussetzungen für einen öffentlichen Dienst.

Historische `RELEASE_*.md`-Dateien beschreiben ihren jeweiligen Stand und gelten nicht automatisch als Nachweis des aktuellen Veröffentlichungsstatus.
