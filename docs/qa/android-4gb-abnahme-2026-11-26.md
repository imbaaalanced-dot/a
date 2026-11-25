# Geräte-Abnahme 2026-11-26: Wegweiser & Garderobe (4-GB-Android)

Zusammenfassende Abnahme auf dem physischen **4-GB-Android-Gerät** (Hochformat,
WebView/Chrome) über die Live-Site https://imbaaalanced-dot.github.io/a/ nach
Merge von PR #440 (Wegweiser, Squash `c73e8ce`) und PR #442 (Garderobe,
Squash `955de48`, Schema v5) und erfolgtem Publish
(`loot.js/loot-ui.js/loot.css?v=garderobe-20261125` live verifiziert
am 26.11.2026).

Katalog und Bewertungsrahmen: `docs/android-4gb-abnahme-2026-11-20.md`.
**Urteil diese Runde: BESTANDEN**, vom Eigentümer (Marcel Schneider) bestätigt;
diese Zusammenfassung ersetzt keine je-Szenario-Overlay-Aufzeichnung.

## Geprüfter Umfang (Eigentümer-Bestätigung)

| Bereich | Gegenstand | Urteil |
| --- | --- | --- |
| Wegweiser (PR #440) | Best-in-Slot-Panel im Ausrüstungs-Tab: Empfehlung je Held (echo/ash/bell-Vorrang, Caps), Ausrüsten per Knopfdruck, während des Laufs ausgeblendet | bestanden |
| Garderobe (PR #442) | Benannte Ausrüstungs-Sets je Held: SPEICHERN, ANLEGEN mit Bestätigung, LÖSCHEN mit Bestätigung, max. 10 Presets, Namens-/Limit-Guards, pro Held getrennt | bestanden |
| Reload-Sicherheit | App-Wechsel/Reload: Presets und Ausrüstung dauerhaft (Schema v5), keine Verluste | bestanden |
| Migration | Bestehender v4-Spielstand: Migration auf v5 ohne Datenverlust (PRE_V5-Backup-Fallback greift) | bestanden |
| Cache-Stand | Live liefert `garderobe-20261125` für loot.js/loot-ui.js/loot.css; keine v4-Reste | bestanden |

## Einordnung und Follow-up

- Gegenstand war die **Sprint-Linie „Loot Stufe 3 / Rucksack"**: Teil 1
  Wegweiser (`suggest/equipBest`, `betterSet/activePowersOf`) und Teil 2
  Garderobe (`savePreset/applyPreset/deletePreset`, `MAX_PRESETS=10`,
  Schema v5 mit v4-Migrationspfad, gesichert in
  `tests/loot-garderobe.test.cjs`, `tests/loot-ui.test.cjs`,
  `tests/equipment-migration.test.cjs` und Browser-QA
  `tools/verify-equipment-browser.cjs`).
- Overlay-Werte (FPS/P95/DRAW/Heap) wurden in dieser Runde nicht tabellarisch
  erfasst und werden nicht behauptet („Nur Belegtes behaupten“,
  AGENTS-Grundsatz).
- Offene Punkte aus dieser Runde: keine. Der Sprint „Loot Stufe 3 / Rucksack"
  ist mit dieser Abnahme vollständig abgeschlossen.

---
Protokolliert am 26.11.2026, Katalog-Referenz: docs/android-4gb-abnahme-2026-11-20.md
