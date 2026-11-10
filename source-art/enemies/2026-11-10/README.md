# Schildwächter V2 · isolierter Art-Kandidat (10.11.2026)

**Status: Review-Kandidat, nicht als Runtime-Asset freigegeben.**

Ausgangsreferenz: `dist/ansturm/assets/boss_shieldwarden.webp` auf `main` @ `604a534`.
Unterstützende reine Stilreferenz: `dist/ansturm/assets/boss_stonebreaker.webp`.
Erstellt mit der integrierten Bildgenerierung als gezielte Rekonstruktion der
links/rechts randberührenden Schildwächter-Silhouette. Die Referenzidentität,
das Mace-/Schild-Layout und die Kamera wurden im Prompt fixiert, aber eine
vollständige künstlerische Identitätsabnahme steht **noch aus**.

| Datei | Zweck | Größe | Transparenz / QA |
|---|---|---|---|
| `boss-shieldwarden-v2-master-review.webp` | Hochauflösendes, optimiertes Referenzbild | 1008×1561 | WebP RGBA, mindestens 73 px sichtbarer Rand |
| `boss-shieldwarden-v2-lossless-master.webp` | Verlustfrei gespeicherte RGBA-Masterfassung für spätere Nachbearbeitung | 1008×1561 | Lossless WebP RGBA, mindestens 73 px sichtbarer Rand |
| `boss-shieldwarden-v2-174x280-review.webp` | Vorschau im bestehenden Ansturm-Rendermaß | 174×280 | WebP RGBA, mindestens 12 px sichtbarer Rand |

Die ursprüngliche generierte RGBA-PNG-Quelle (1008×1561; SHA-256
`d23582cc1914fc201390c84b821b7b093609efba7a503cf6764c615fa95fe827`)
liegt bislang **nur im lokalen Arbeitsverzeichnis** als
`boss-shieldwarden-v2-source.png`. Die große verlustfreie WebP-Masterfassung
ist dagegen Bestandteil dieses PRs. Die WebP-Varianten sind technische
Exporte und keine neuen Animationsframes. Das ursprüngliche PNG muss für die
eigentliche Laufzeitintegration nicht verwendet werden.

**Noch prüfen:** Ist der zusätzliche Turmaufsatz am Helm mit dem alten Boss
identisch genug? Bleiben Helm, linke Armrüstung, Schild und Morgenstern bei
64/128 px klar unterscheidbar? Sind Füße/Bodenanker im Vergleich zum alten
174×280-Standbild korrekt? Ingame-Browser-Screenshots und Android-Abnahme fehlen.

Kein automatisches Ersetzen von `boss_shieldwarden.webp`, keine Animation,
kein neues Gameplay und kein Cache-Key-Wechsel ohne diese Abnahme.
