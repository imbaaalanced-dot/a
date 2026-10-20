# Style 2 – gezielte Grafikbereinigung, Pass 2

20.10.2026 · Draft PR #51 · Basis `464de6f` · weiterhin ausschließlich `?td2UserTowers=1`.

## Ergebnis und Grenzen

Zwei modellbasiert bearbeitete Varianten ersetzen im Opt-in den Kanonenturm L1 und das Eisprojektil L2. Alle Originaldateien unter `style2-user-towers-v1` bleiben erhalten. Die Varianten sind keine byteidentische Pixelretusche: kleine Unterschiede der gemalten Oberflächen sind möglich. Identität, Blickrichtung, Materialfamilie, optische Grundfläche und Bodenanker wurden gegen die Originale geprüft.

| Variante | PNG-Master | Runtime | Pivot |
|---|---|---|---|
| Kanonenturm L1 | `dist/assets/style2-user-towers-v2/towers/tower_cannon_lv1.png`, 512×512 RGBA | `runtime-webp/towers/tower_cannon_lv1.webp` | 256, 488 |
| Eisprojektil L2 | `dist/assets/style2-user-towers-v2/projectiles/projectile_mage_lv2.png`, 256×256 RGBA | `runtime-webp/projectiles/projectile_mage_lv2.webp` | 128, 128 |

`dist/assets/style2-user-towers-v2/manifest.json` enthält genau zwei Overrides, Verweis auf den ursprünglichen 30er-Satz, Prüfsummen von Originalen, generierten Eingaben und Exportpaaren. Die restlichen 28 Runtime-Sprites werden weiterhin aus V1 geladen. Cache-Key der neuen Dateien: `cleanup-2`; geänderter Adapter: `user-towers-3`.

## Produktion und Prüfung

- Bearbeitung mit dem eingebauten Imagegen-Werkzeug, je ein Originalsprite als Edit-Ziel; echte RGBA-Transparenz angefordert und geprüft.
- `tools/export_style2_cleanup.py` führt danach nur technische Größenanpassung, transparente Platzierung und PNG-/verlustfreien WebP-Export aus. Proportionale Skalierung gegen die ursprüngliche Alpha>16-Bounding-Box; keine Farbfilterung, kein Herausschneiden legitimer Magiefarben.
- Kanone: 270 auffällige pinke Pixel im Original nach `R>180, B>120, G<90, Alpha>16`; in der bereinigten Variante 0. Sichtbare Bounding-Box unverändert `[105,272,417,487]`.
- Eisprojektil: im bisherigen Fremdpartikelbereich `[185,145,202,188]` nun Alpha 0. Die vier Bounding-Box-Koordinaten bei Alpha>16 liegen höchstens einen Pixel vom Original entfernt; dies ist kein Nachweis einer pixelgleichen Silhouette. Die blaue Aura bleibt erhalten.
- PNG und WebP je Variante pixelidentisch; transparente Außenränder, Abmessungen, Pivots und vier Datei-Prüfsummen geprüft. V1-PNG-/WebP-Prüfung weiterhin erfolgreich.
- Regressionen prüfen die neuen versionierten Ladepfade und den Kaltstart-Fallback. Keine Änderung an Kampfwerten, Stufen, Save-Keys, Level-Geometrie oder den übrigen Originalbildern.

Nachweise: [30 Varianten bei 64/128 px](qa/style2-cleanup-20261020/towers-64-128.png), [Desktop](qa/style2-cleanup-20261020/game-desktop.png), [Touch-Emulation](qa/style2-cleanup-20261020/game-touch-portrait.png), [Browserbericht](qa/style2-cleanup-20261020/report.json).

Die Browser-Fixture verwendet weiterhin eine synthetische 15-Turm-Anordnung. Sie ändert das Produktionslimit nicht. Ein echter Android-/WebView-Test, FPS-/GPU-Messungen und die Abnahme langer Spielrunden bleiben offen. Weitere Quellsäume anderer Sprites wurden in diesem Schritt nicht pauschal entfernt.

## Verwendete Produktionsprompts

**Kanonenturm L1 – precise-object-edit/background-extraction:** Entferne ausschließlich den dünnen hellen Magenta-Freistellungssaum. Bewahre das konkrete dunkle Rohr, Kugelstapel, verwitterte vierbeinige Holzplattform, Farbwelt, 2.5D-Handmalstil und bestehende Dreiviertelkamera. Erhalte die normalisierte Komposition des 512×512-Originals mit großem transparentem Oberbereich und Kontaktpunkt bei y488. Keine neue Perspektive, keine Aufwertung der Materialien, kein zusätzliches Geschoss, kein Boden, kein Glühen, keine Sterne, Schrift oder eingebranntes Schachbrett. Echte RGBA-Transparenz.

**Eisprojektil L2 – precise-object-edit:** Entferne ausschließlich das abgesetzte blau-violette Fragment rechts unten und offensichtliche Freistellungsreste außerhalb der Kristall-Aura. Bewahre den doppelseitigen blauen Eiskristall mit Bronzeeinfassung, Kontur, Licht und diagonaler Ausrichtung von links unten nach rechts oben; gleiche normalisierte Position und Größe auf 256×256, Zentrum nominell 128/128. Keine Neugestaltung des Kristalls, kein anderes Metall, keine Kamera-/Pivotverschiebung, kein zusätzlicher Trail, keine Partikel, Schrift, UI oder simulierte Transparenz. Echte RGBA-Transparenz.

Diese Prompts wurden englisch strukturiert an Imagegen übergeben. Die oben dokumentierten deutschen Fassungen bewahren die inhaltlichen Vorgaben. Exportbefehle benötigen die beiden erzeugten Originalausgaben als Eingabe; der Exporter führt keine eigene Bildgenerierung aus.

Status: **generierte und technisch geprüfte, im Opt-in integrierte Bereinigungsvarianten**. Kein Live-Release.
