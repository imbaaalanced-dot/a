# Denkmal TD2 · Gegner-Balancing v3.6 Alpha.5 (Playtest)

## Befund
Der Start-Geist mit 38 LP starb nach zwei Treffern des Startstabs (22,5 Schaden pro Treffer). Welle 1 brachte nur 7 Gegner an vier Tore. Turm-Upgrades multiplizierten Schaden und Angriffstempo stark.

## Änderungen
- Geist: LP 38 → 54, Tempo 58 → 66, Schaden 11 → 13.
- Läufer: LP 25 → 38, Tempo 92 → 106, Schaden 8 → 10.
- Brecher: LP 92 → 125, Tempo 39 → 46, Schaden 23 → 27.
- Schütze: LP 46 → 64, Tempo 46 → 51, Schaden 10 → 13, Angriffspause 1,25 → 1,10 s.
- Wächter: LP 118 → 165, Tempo 34 → 38, Schaden 17 → 21, Rüstung bleibt 32 %.
- Sappeur: LP 62 → 88, Tempo 52 → 58, Schaden 32 → 38.
- Belagerer: LP 760 → 1040, Tempo 30 → 35, Schaden 46 → 52, Angriffspause 0,82 → 0,74 s.
- Wellen 1–8: **9 / 12 / 15 / 18 / 21 / 23 / 26 / 29** Gegner; danach +3 pro Welle bis zum Limit 48 (Welle 9: 33).
- LP-Skalierung pro Welle von 13 % auf 17 %, Schaden pro Welle von 5,5 % auf 7 %.
- Spawnabstand: bisher `max(0,32; 1,15 - 0,035 × Welle)`, neu `max(0,30; 1,02 - 0,045 × Welle)`.
- Türme: pro Upgrade +32 % statt +42 % Schaden, 8 % statt 14 % kürzeres Schussintervall. Reichweiten-Bonus unverändert.
- Helden-Perk `Kraft des Stabes` von +8 auf +6 Schaden; Heilung beim Wellenwechsel von +18 auf +12 LP.
- **Unverändert:** Start-Essenz (70/130), Baukosten, Beute, permanente Ausrüstung, Turmslots, Monument-LP.

## Playtest-Ziele
Frischer Spielstand soll die ersten Wellen bei sinnvoller Platzierung überstehen. Wellen 3–4 verlangen Entscheidungen bei Positionierung/Ausbau. Belagerer soll gezieltes Feuer erfordern. Danach mit voll ausgerüstetem Held gegenprüfen.

Die CI-Regressionsprüfungen testen Mechanik und Rechenwerte. Sie ersetzen weder reale Erfolgsquoten noch einen Android-Langzeittest.