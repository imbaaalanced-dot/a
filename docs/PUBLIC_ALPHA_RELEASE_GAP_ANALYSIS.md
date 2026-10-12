# Public-Alpha-Release-Gap-Analyse

Stand: 12. Oktober 2026  
Repository: `imbaaalanced-dot/a`  
Gepruefter Ausgangspunkt: `main` @ `dc420c3480799cc00658cde544e237751c01de56`

## Kurzurteil

P0 - Keine Public Alpha ohne neuen Freigabeentscheid.

Der oeffentliche Tester-Stand ist weiterhin Alpha.6 mit einzelnen spaeteren Main-Fixes. Ein freigegebener V4-Alpha.3-Build ist im Repository nicht belegt. PR #23 und PR #24 sind geschlossene Draft-PRs, nicht gemergt, und beide wurden von GitHub als konfliktbehaftet gemeldet (`mergeable_state: dirty`). `v4-kirchende` ist ein separater, divergenter Branch und kein Public-Alpha-Release.

## Belegte Befunde

| Bereich | Befund | Release-Risiko |
| --- | --- | --- |
| `main` | Aktueller Head `dc420c3480799cc00658cde544e237751c01de56`; sichtbares Hauptmenue-Badge bleibt `v3.6.0-alpha.6 · BEUTE`. | Nutzer wuerden V4-Funktionen erwarten, die nicht im freigegebenen Tester-Build stecken. |
| PR #23 | `TD2 Alpha.7: Android-Touch-Polish und energiesparender Grafikloop`; geschlossen, Draft, nicht gemergt, `mergeable_state: dirty`, Head `dbdc9a3b5b9a4b87b8dce34b23e9afcda4a9be47`. | Mobile-Performance- und Touch-Verbesserungen sind nicht Teil von `main`; reale Android-Pruefung laut PR offen. |
| PR #24 | `TD2 v4: Kampagnenmenue und freischaltbare Endloskarten`; geschlossen, Draft, nicht gemergt, `mergeable_state: dirty`, Head `02582ae5576125e21cc049f73e2d3d77ad69f3ad`. | V4-Menue-/Endloslogik darf nicht als gemergt oder freigegeben kommuniziert werden. |
| `v4-kirchende` | Branch `069a67f3bb0acd5adc12c3751cdd080c4e73808a`; divergiert von `main` und enthaelt Level-3-/Kirchende-Arbeit. | Level 3 ist nicht im regulären Tester-Build; ein Merge ohne Rebase/Test wuerde Konflikt- und Regressionsrisiko tragen. |
| Automatisierte Checks | Lokale Baseline fuer `preloader`, `cache-busting` und `game` ist gruen; vollstaendige Android-/Browser-Geraetepruefung wurde nicht erbracht. | Automatisierte Node-Tests ersetzen keine fremde Testerfreigabe, Touch-Latenz- oder Langzeittests. |

## Priorisierte Release-Gaps

1. P0 - Freigabestatus korrigieren: README und Gap-Dokument muessen klar sagen, dass V4-Alpha.3/Public Alpha nicht freigegeben ist.
2. P0 - Keine ungeprueften Merges: #23, #24 und `v4-kirchende` erst nach Rebase/Conflict-Review, CI und manueller Android-/Browserpruefung integrieren.
3. P1 - V4-Kandidat konsolidieren: entscheiden, ob V4 aus #24, `v4-kirchende` oder einem neuen Integrationsbranch entsteht; keine parallelen Wahrheiten in `main`, PR-Bodies und README.
4. P1 - Testmatrix erweitern: die in #23/#24 ergaenzten Tests vor einer V4-Freigabe wieder auf aktuellen `main` bringen und in Publish-Workflow aufnehmen.
5. P2 - Testerkommunikation: Public-Alpha-Notizen erst schreiben, wenn Build-URL, Commit, CI-Ergebnis und offene Geraetetests konkret benannt sind.

## Kleinste umgesetzte Korrektur

- README-Status auf den aktuellen Main-Head und den nicht freigegebenen V4-Stand aktualisiert.
- Diese Gap-Analyse hinzugefuegt.
- `tests/public-alpha-readiness.test.cjs` als Regressionstest ergaenzt, damit README/Gapanalyse den Freigabestatus von #23/#24, `v4-kirchende` und `main` nicht wieder verwischen.
