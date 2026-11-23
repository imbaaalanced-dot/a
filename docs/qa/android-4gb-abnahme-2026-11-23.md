# Geräte-Abnahme 2026-11-23: Loot Labyrinth & Westhofen (4-GB-Android)

Zusammenfassende Abnahme auf dem physischen **4-GB-Android-Gerät** (Hochformat,
WebView/Chrome) über die Live-Site https://imbaaalanced-dot.github.io/a/ nach
Merge von PR #417 (Squash `d4ddf3e`, Bossbeute für Labyrinth und Westhofen)
und erfolgtem Publish (`equipment-catalog.js?v=loot-v3-20261122` live
verifiziert am 23.11.2026).

Katalog und Bewertungsrahmen: `docs/android-4gb-abnahme-2026-11-20.md`.
**Urteil diese Runde: BESTANDEN**, vom Eigentümer (Marcel Schneider) bestätigt;
diese Zusammenfassung ersetzt keine je-Szenario-Overlay-Aufzeichnung.

## Geprüfter Umfang (Eigentümer-Bestätigung)

| Bereich | Gegenstand | Urteil |
| --- | --- | --- |
| Labyrinth-Boss (Kapitel 2, mapId 2) | Bosskampf Welle 5: Bossbeute-Pool (Wachtmütze, Leichtmantel, Zirkelring, Gardistenstiefel), „BOSSBEUTE GESICHERT“-Toast, Beute im Rucksack | bestanden |
| Westhofen-Boss (Level 7, mapId 7) | Bosskampf Welle 34: Bossbeute-Pool (Sichterring, Bastionring, Schutzamulett, Aschenstiefel), Toast, Beute im Rucksack | bestanden |
| Reload-Sicherheit | App-Wechsel/Reload nach beiden Bosskills: Beute dauerhaft im Inventar, kein Verlust | bestanden |
| Cache-Stand | Live liefert `loot-v3-20261122`; keine alten v2-Reste in `equipment-catalog.js` | bestanden |

## Einordnung und Follow-up

- Gegenstand war die **Loot-Abnahme der Sprint-Linie „Inventar/Loot“
  (Level 2/7)**: Boss-Pools `bossPools[2]/[7]`, `validEnemy` bis mapId 7
  und Gegner-Drops auf Westhofen (PR #417, Tests in
  `tests/loot-level7-westhofen.test.cjs` gesichert).
- Overlay-Werte (FPS/P95/DRAW/Heap) wurden in dieser Runde nicht tabellarisch
  erfasst und werden nicht behauptet („Nur Belegtes behaupten“, AGENTS-Grundsatz).
- Offene Punkte aus dieser Runde: keine. Die Bosskampf-Performance selbst
  (Overlay-Beleg je Katalog-Szenario C/E) bleibt der numerisch belegten
  Release-Abnahme vorbehalten.

---
Protokolliert am 23.11.2026, Katalog-Referenz: docs/android-4gb-abnahme-2026-11-20.md
