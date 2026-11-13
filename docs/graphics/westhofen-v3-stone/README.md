# Westhofen V3 – Stein, Altar und Relief-Kandidat

Status: **`source_only_visual_review_pending`**, kein eingebautes Laufzeitasset.

Fortsetzung von Issue #252 nach dem Bronze-Kandidaten in Draft-PR #254. Dieser Branch ist unabhängig von PR #254; er verwendet dessen V3-Bronzezeichnung nur als **Quellreferenzkopie** im neuen, separaten V3-Stein-Komposit.

Neue Dateien:
- `stone-weathering-v3.svg`: Risse, verwitterte Fugenkanten, Patina und Steinausbrüche an bestehenden Pfeilern und Querbalken.
- `altar-weathering-v3.svg`: konservative Kontur der Seitenvertiefung, Ausbrüche und gealterter Stufenkanten. **Keine** erfundene Reliefszene, Personen, Inschriften oder zusätzliche Statuen.
- `westhofen-composite-v3-stone.svg`: bestehender V2-Rahmen und Stufen + additive V3-Patina + V3-Bronzeemblem. Die transparente Grundfläche bleibt 768×512.

Die originale Seitenrelief-Fotografie aus den privaten Nutzerdateien zeigt plastische Formen, jedoch sind diese im 2.5D-Seitenwinkel und bei 64 px nicht mit gesicherter ikonografischer Zuordnung zu rekonstruieren. Diese V3-Stufe verbessert daher **nur die lesbare Relief-Tiefe**, ohne unbestätigte historische Figuren zu erfinden.

Zur Beurteilung:
`python tests/westhofen-v3-stone-source.test.py`
`python tools/export-westhofen-v3-stone.py --out build/westhofen-v3-stone`

Der Export prüft Komposit-RGBA, die 8-Pixel-Alpha-Inset-Grenze und ein Zielbudget unter 160 KB und erzeugt je 64/128 px helle/dunkle Vergleichsansichten. Nur die Exportbilder dürfen zur Sichtfreigabe dienen. Die bestehenden `dist/`-Laufzeitgrafiken, der World-Anker und Spielstände bleiben unverändert.

Freigabegates: visuelle Abnahme anhand der privaten Originalbilder, dann separater Runtime-Integrations-PR mit Chromium Desktop/Touch und einem realen 4-GB-Androidtest. Merge/Veröffentlichung nicht ohne gesonderte Freigabe.
