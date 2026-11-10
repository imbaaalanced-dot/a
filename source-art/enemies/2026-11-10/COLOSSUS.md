# Koloss V3 · isolierter Style-2-Review-Kandidat (10.11.2026)

**Status: Art-Review / Runtime-Hold. Nicht als aktives Bossbild eingebunden.**

- Identitätsreferenz: `dist/ansturm/assets/boss_colossus.webp` auf `main`.
- Stil-/Regenerationsvorlage: ursprünglicher Koloss und der **verworfene** erste
  Vollkörperversuch (V2). V2 war im vorhandenen 173×280-Bildfeld zu gedrungen
  und wirkte kleiner als das aktive Bossbild; V2 wird nicht mitgeliefert.
- Erhaltene Erkennungsmerkmale: feuriger Zinnenhelm, glühende Augen,
  gepanzerte Asymmetrie, zwei wuchtige Fäuste, dunkelrote Stoffbahnen.
- Geprüfte Abweichungen: V3 ist schlanker/höher als V2 und hat einen stärker
  ausgearbeiteten oberen Turmaufbau. Turmdetails und Fußpunkt sind **noch nicht
  freigegeben**; die Originalfigur muss bei 64/128 px verglichen werden.

| Datei | Zweck | Auflösung | Sichtbarer Mindestrand (Alpha ≥ 32) |
|---|---|---:|---:|
| `boss-colossus-v3-lossless-master.webp` | Verlustfreie RGBA-Masterfassung | 986×1595 | 31 px |
| `boss-colossus-v3-master-review.webp` | Komprimierte hochauflösende Ansicht | 986×1595 | 31 px |
| `boss-colossus-v3-173x280-review.webp` | Verkleinerte Reviewansicht beim bisherigen Standbildmaß | 173×280 | 15 px |

Die verlustfreie WebP-Masterfassung stimmt bei sämtlichen **760.232 sichtbar
belegten Pixeln** und im Alphakanal exakt mit dem generierten PNG überein.
PNG-SHA256: `1de721a25537676a06eabc1f2db6bcf234d3070a9cd6659c13c30c204749a9d1`.
Das ursprüngliche PNG ist nur im lokalen Scratch-Arbeitsverzeichnis; die
verlustfreie WebP-Fassung ist für nachfolgende Nachbearbeitung im PR enthalten.

**Offen:** künstlerische Identität (insbesondere Turm/Schultern), Laufzeitgröße
im echten Canvas, Fußpunkt/Pivot, Überdeckung durch andere Gegner, Flammen-
Kontrast in dunklen Wegen, mobile Touch-/Android-Abnahme, 64/128-px-Silhouette.
Der vorhandene Ansturm-Boss verwendet weiterhin nur **ein Standbild**; aus
diesem Kandidaten dürfen keine Attack-/Hit-/Death-Frames abgeleitet werden.

Kein automatisches Ersetzen von `dist/ansturm/assets/boss_colossus.webp` und
keine Änderung an Save-Keys, Bossphasen, Angriffen, Cache oder Renderer.
