# Kasernen: kontrollierte Kampagnendurchläufe · 23.11.2026

Nachmessung der dokumentierten Messreihe vom 10.11.2026
(`docs/BARRACKS_CAMPAIGN_RUNS_20261110.md`) auf aktuellem `main`
(`bbc5d74`, nach gameplay-feel #420/#421/#423/#425). Methode unverändert:

`node tests/barracks-campaign-runs.test.cjs`

21 reproduzierbare Durchläufe: 7 Kapitel × 3 feste Turmgruppen. Konstanter
Zufall 0.5, stationärer Held, 600 Essenz als Testbudget, die ersten vier
legalen Bauplätze und vier Türme auf Stufe 3, echte Spawnverwaltung,
Gegnerbewegung, Heldenschaden, Rekrutierung, Turmschaden, Belohnungen,
Story-/Perkwechsel und reguläres Kapitelende oder Niederlage. Kein
erzwungenes Überleben, keine übersprungenen Wellen, der erste angebotene
Perk wird gewählt. Kontrollierter Verteidigungsvergleich, kein normal
erspielter Start und keine optimale menschliche Steuerung.

| Gruppe | Türme |
|---|---|
| Fernkampf | Bogen, Kanone, Magie, Rift |
| Eine Kaserne | Bogen, Kaserne, Magie, Rift |
| Zwei Kasernen | Bogen, Kaserne, Kaserne, Rift |

## Tatsächliche Ergebnisse (23.11.2026)

| Kapitel | Gruppe | Ergebnis | Letzte lokale Welle | Simulierte Sekunden | Kills | Helden-HP | Denkmal-HP | Bosswellen erreicht |
|---|---|---|---:|---:|---:|---:|---:|---|
| 1 | ranged-control | gameover | 8 | 193,38 | 105 | -11,26 | 485,42 | keine |
| 1 | one-barracks | gameover | 8 | 192,05 | 105 | -11,26 | 485,42 | keine |
| 1 | two-barracks | gameover | 7 | 167,68 | 87 | 185,54 | -31,76 | keine |
| 2 | ranged-control | levelcomplete | 20 | 807,19 | 447 | 575,00 | 500,00 | 10, 20 |
| 2 | one-barracks | gameover | 20 | 1119,65 | 443 | -27,21 | 500,00 | 10, 20 |
| 2 | two-barracks | gameover | 20 | 1329,42 | 444 | -28,98 | 500,00 | 10, 20 |
| 3 | ranged-control | gameover | 4 | 119,83 | 47 | -5,34 | 485,48 | keine |
| 3 | one-barracks | gameover | 4 | 119,83 | 48 | -2,99 | 500,00 | keine |
| 3 | two-barracks | gameover | 4 | 119,83 | 48 | -2,99 | 500,00 | keine |
| 4 | ranged-control | gameover | 5 | 164,85 | 65 | 165,26 | -13,59 | keine |
| 4 | one-barracks | gameover | 5 | 164,85 | 65 | 165,26 | -13,59 | keine |
| 4 | two-barracks | gameover | 5 | 164,85 | 65 | 165,26 | -13,59 | keine |
| 5 | ranged-control | gameover | 4 | 132,49 | 51 | 145,36 | -15,79 | keine |
| 5 | one-barracks | gameover | 4 | 132,48 | 51 | 145,36 | -15,79 | keine |
| 5 | two-barracks | gameover | 4 | 132,48 | 51 | 145,36 | -15,79 | keine |
| 6 | ranged-control | gameover | 6 | 254,33 | 102 | 225,00 | -6,98 | keine |
| 6 | one-barracks | gameover | 6 | 254,33 | 102 | 225,00 | -6,98 | keine |
| 6 | two-barracks | gameover | 5 | 210,57 | 78 | 200,00 | -18,99 | keine |
| 7 | ranged-control | gameover | 1 | 27,42 | 8 | -2,64 | 500,00 | keine |
| 7 | one-barracks | gameover | 1 | 27,42 | 8 | -2,64 | 500,00 | keine |
| 7 | two-barracks | gameover | 1 | 27,42 | 8 | -2,64 | 500,00 | keine |

## Vergleich zur Baseline vom 10.11.2026

- Kapitel 1, 4, 5, 6, 7: identische Endwellen (8/5/4/6/1), identische
  Kills, keine Kurvenänderung. Kapitel 7 verliert das feste Setup
  unverändert in Welle 1 – das ist der bekannte Fixture-Befund
  (Luftdruck-Welle benötigt Luftabwehr-/Beute-Loadout, kein
  Balance-Rückfall).
- Kapitel 2: Fernkampf beendet das Kapitel weiterhin regulär (20 Wellen,
  Bosswellen 10 + 20 erreicht); Laufzeiten marginal kürzer.
- **Kapitel 3: Endwelle 6 → 4, Kills 80 → 47–48** – die signifikante
  Kurvenänderung dieses Messfensters.

## Ursachenanalyse Kapitel 3 (Bisektion, reproduzierbar)

Vergleichslauf desselben Fixtures über die Historie (nur Kapitel 3,
je 3 Szenarien, Kriterium Endwelle):

| Commit | Datum | Endwelle Kapitel 3 |
|---|---|---:|
| `dbe2fd2` (Baseline-Dokumentation) | 10.11. | 6 |
| `4001666`, `5b12633`, `a1e7f2d` | 10.–12.11. | 6 |
| **`0edbee8` (Kirchende-Sitelayout angleichen)** | **14.11.** | **4** |
| `4924dc0` … `bbc5d74` (HEAD) | 14.–23.11. | 4 |

`git bisect` identifiziert `0edbee8` „Align Kirchende memorial street
and churchyard with user site references" als ersten abweichenden Commit.
Er verschiebt die Straßenwege in `dist/levels.js` auf einen gemeinsamen
Korridor bei x≈20 (Zugänge vereinigen sich am zentralen Zugang), analog
zu Nutzer-Sitereferenzen; Bauplätze, Wellen und Freischaltungen blieben
unverändert (Originaldokumentation:
`docs/graphics/kirchende-site-layout-20261114.md`).

Einordnung: Die vier für das Fixture genutzten ersten Bauplätze liegen
nordwestlich; der neue Straßenkorridor läuft außerhalb der
Reichweite dieser festen Stufe-3-Gruppe. Menschliche Spieler bauen
adaptiv (8 Bauplätze erlaubt, u. a. `(20,-250)` direkt am Korridor).
Es ist eine messbare Nebenwirkung der freigegebenen Geometrie auf das
künstliche Fixture – kein Gameplay-Blocker. Eine echte Aussage zur
Kapitel-3-Spielbarkeit braucht adaptive Platzierung oder
Spieler-Abnahme, nicht dieses Setup.

Nebenbefund (Harness, kein Spielfehler): In drei Niederlagen verzeichnet
das Fixture negative Denkmal-HP (−31,76 … −5,34) als Endwert – der
Simulations-Zähler wird nicht an 0 geklemmt, bevor gameover endgültig
ist. Optisch im Spiel unerheblich; für künftige Messreihen als
Bekannter Stand vermerkt.

## Fazit

- Keine ungeklärte Schwierigkeitsveränderung: die einzige messbare
  Kurvenverschiebung (Kapitel 3) ist durch die freigegebene
  Sitelayout-Anpassung vom 14.11. vollständig erklärt und seitdem
  stabil.
- Keine Änderungen an Spielwerten, Geometrie oder Wellen in diesem
  Mess-Durchgang. Empfehlung: Kapitel 3 mit adaptiver Platzierung
  (korridornahe Türme) als separater Folgeschritt prüfen oder in der
  nächsten physischen Abnahme gezielt nachspielen.
