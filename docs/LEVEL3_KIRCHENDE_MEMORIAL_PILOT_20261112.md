# Level 3 Kirchende – optional Style-2 monument pilot (2026-11-12)

Source: seven user-supplied memorial photographs and short video, documented in the companion reference PR #207. **This is an opt-in in-game asset test**, not historical architectural measurement or an Android release.

## Implemented
- `dist/assets/kirchende/monument-style2-pilot.webp`: 261 × 425 pixel, about 35 KiB. An isolated dark-fantasy stone memorial with helmet silhouette, moss and inscription plaques.
- `dist/assets/kirchende/opferplatte-style2-pilot.webp`: 470 × 248 Pixel, ca. 37 KiB. Das historische Vergleichsasset bleibt im Repository erhalten, wird aber **nicht mehr geladen oder dargestellt**, weil es unbelegte Kerzen und störende Alpha-Ränder enthält.
- `dist/kirchende-art.js`: Der Parameter `td2KirchendeMemorialPilot=1` wählt weiterhin das optionale Helmdenkmal. Die niedrige Gedenkplatte ist nun **einmal** in der gecachten Site-Ebene auf der Mittelachse ohne erfundene Schrift oder Kerzen gemalt. Die normale Ansicht behält `monument-photo-v2.webp`.
- No new path coordinates, tower slots, hero stats, save keys, wave logic or release defaults.

## How to review
Open the existing TD2 test build with `?td2KirchendeMemorialPilot=1`, enter Level 3, inspect monument at 64/128px and portrait zoom. Compare against a second session without the parameter. Confirm the original monument stays in the normal version, the opt-in monument loads without 404, and **no request** is sent for the candle-bearing `opferplatte-style2-pilot.webp`. Confirm the single unlettered low stone stays centered before the monument without occluding units.

## Quality limitations
The generated sprite sheets with extra foliage, lanterns and architectural collage were **concept sheets**, not sprite files. Only the previously cropped PNG-derived transparent WebPs were integrated. Current game scale is 235 pixels high for the monument; the source at 261 × 425 px does **not** contain high-quality detail suitable for aggressive zooming. The historic helmet outline and side plaques still need real photograph comparison. The unapproved candle-bearing slab is no longer requested by the runtime; the single centered unlettered Canvas stone remains a temporary, non-surveyed approximation. The image generation was not proof of architectural fidelity.

## Verification
- `node tests/kirchende-loading.test.cjs` (legacy path, retries)
- `node tests/kirchende-memorial-pilot.test.cjs` (pilot loads only under query, single centered baked slab, no candle sprite request and cached site)
- `python tests/kirchende-memorial-pilot.test.py` (WebP decode, alpha and transfer budget)
- Existing CI workflow runs these tests; **real Android 4GB device, actual FPS and touch are untested**.
- No merge until CI/Chromium passed and manual visual review of the new monument and plaque is complete.

## Nacharbeit zu Issue #211 (12.11.2026)

Dieser Patch ist eine gezielte **Code-Mitigation**, noch keine restauratorische Rekonstruktion. Die fotografisch nicht belegten Kerzen und doppelten Platten werden nicht mehr angezeigt. Position der handgemalten neutralen Steinplatte: **nahe der Denkmalachse** (relatives `x=-44 … +40`, `y=69 … 104`), innerhalb des vorhandenen einmalig gerenderten 384×384-Kirchhof-Canvas. Keine Pfad-/Save-/Gameplay-Änderung.

Die rote/gelbliche Alpha-Kante des **alternativen Helmdenkmal-Pilot-WebP** muss weiterhin visuell überprüft und gegebenenfalls in einem separaten Bildpass bereinigt werden. Visuelle Abnahme bei 64/128px, Desktop-/Touch-Chromium und echtes Android-Gerät sind getrennte Freigabestufen. **Kein Android-Test durch diese Dokumentation bestätigt.**


## Alpha-Kanten-Korrektur · 12.11.2026

- `monument-style2-pilot.webp` wurde aus dem vorhandenen freigestellten Helmdenkmal erzeugt, **ohne Silhouette oder Alphakanal zu ändern**.
- Ausgangsasset: Git-Blob `e831588e89af704558becdc8060c872bfcb3d25c`, 261 × 425 Pixel / 34.962 Bytes.
- Ersetztes WebP: Git-Blob `0f6584872f97e859a05c4236e451fb32026cd622`, 261 × 425 Pixel / 38.434 Bytes, WebP Qualität 85.
- Sichtbares RGB wurde nur geringfügig neu komprimiert; verborgene rote RGB-Werte bei Alpha 0 wurden durch benachbarte neutral-steinfarbene Werte ersetzt. Der 8-bit-Alphakanal ist über alle Pixel **identisch**.
- Lokale Prüfung (Pillow) vor Upload: 636 auffällige rote RGB-Pixel bei `alpha=0` zuvor, danach 0; mittlerer RGB-Unterschied auf dunklem/hellem Komposit ca. 1,26 pro Kanal bei 8-bit Skala.
- Pixelvergleich bei Ausgabegrößen 64/128/235 px angefertigt, nicht mit echtem Android-Hardwaretest gleichzusetzen.
- Runtime-Version `kirchende-memorial-pilot2`, HTML-Scriptversion `kirchende-helm-alpha2` verhindern veraltete Browser-Caches.
- Reproduzierbarer Test: `python tests/kirchende-memorial-pilot.test.py` prüft Bilddekodierung, Alpha, Transferbudget und unerwünschte rote RGB-Werte in vollständig transparenten Pixeln.

**Nicht geändert:** historische Denkmalform, Gedenktafel und deren neutrale Canvas-Variante, Level-Geometrie, Wegführung, Trefferboxen, Spielstände, Veröffentlichungsschalter. Der neue Denkmal-Sprite bleibt weiterhin **opt-in**; reale Android-4-GB-Abnahme ist offen.
