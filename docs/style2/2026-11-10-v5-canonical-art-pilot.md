# Denkmal TD2 V5 — kanonische Helden und Atlas-Pilot (10.11.2026)

**Basis:** `main` bei `0cdf0970920f940ca4eb6d0cba57407a429ede9b`

**Entwicklung:** `feature/v5-style2-canonical-art-pilot-20261110`

**Reichweite:** Grafikreferenzen, technische Bildvalidierung und Fallback; keine Balance-, Level- oder Spielstandänderung.

## Schritt 1 — Marcel und Kim

`dist/canonical-hero-art-v5.js` ist die einzige aktive Referenztabelle für die bereits freigegebenen V5b-Laufatlanten, V5b-Seitenaktionen und V6-Menüporträts. Menü, HUD, Inventar, Story, Preloader und Heldenrenderer lesen dieselben Quellen. Bestehende Quelldateien bleiben erhalten. Isolierte Test-Harnesses behalten die bisherigen Pfade als Ausfallabsicherung.

| Held | Bewegung (3 × 4, 256 px) | Seitenaktion (6 × 6, 128 px) | Porträt |
| --- | --- | --- | --- |
| Marcel | `dist/assets/hero/marcel-walk-v5b.webp` | `dist/assets/hero/marcel-side-actions-v5b.webp` | `dist/assets/menu/v5-avatars/marcel-guardian-v6.webp` |
| Kim | `dist/assets/hero/kim-walk-v5b.webp` | `dist/assets/hero/kim-side-actions-v5b.webp` | `dist/assets/menu/v5-avatars/kim-marksman-v6.webp` |

**Visuelle Prüfung:** [Marcel/Kim bei 64 und 128 px](previews/v5-heroes-walk-actions-64-128.webp). Pro Aktion und Größe ein heller und dunkler Hintergrund. Walk und Seitenangriff sind separat sichtbar; Posen/Perspektiven unterscheiden sich absichtlich. Nicht gemalte Ausrichtungen nutzen weiter den V5b-Walk-Fallback.

## Schritt 2 — vorhandener Gegneratlas, begrenzte Abnahme

Die zur Laufzeit bereits genutzten Dateien `dist/assets/enemies/walk-v1.webp` (4 × 21 × 160 px, 84 Frames) und `dist/assets/directional-v410/enemy-00.webp` (4 × 12 × 128 px, 48 Frames) sind technisch decodierbar, mit Alpha-Rand und vollständig belegten Frames. Es wurden **keine neuen Gegnerbytes eingespielt und keine aktiven Verweise ersetzt**.

**Visuelle Prüfung:** [Gegner 00 (Untoter Hund) bei 64/128 px](previews/v5-enemy00-walk-action-64-128.webp). Die Angriffshaltung zeigt deutlich weniger gefüllte Fläche als die Laufhaltung. Vor einem Atlaswechsel sind einheitliche wahrgenommene Größe, Fußpunkt und Richtungsdarstellung im laufenden Spiel zu klären. Dieser Kandidat ist **technisch geprüft, aber visuell noch nicht als Ersatz freigegeben**.

## Schritt 3 — vorhandene Bogentürme L1–L3

Die drei bereits aktiven `style2-user-towers-v3/runtime-webp/towers/tower_bow_lv{1,2,3}.webp` erfüllen die im Repository dokumentierten WebP-Hashes, 512 × 512 px und Pivot `(256,488)`. Die zugehörigen bestehenden Projektile sind 256 × 256 px. Runtime prüft die tatsächlichen dekodierten Bilddimensionen vor dem Zeichnen und nutzt bei Fehlformat den unveränderten bisherigen Fallback. **Keine Dateien gelöscht und keine neuen Laufzeittexturen hinzugefügt.**

**Visuelle Prüfung:** [Bogentürme L1–L3 bei 64/128 px](previews/v5-bow-tiers-64-128.webp). Stufensilhouetten und Materialfortschritt sind unterscheidbar; definitive Ingame-Pivot-/Z-Order-Abnahme steht aus.

## Testprotokoll und Grenzen

- `node tests/canonical-hero-art-v5.test.cjs` — kanonische Referenzen, Dateipfade und Skriptreihenfolge.
- `python3 tests/style2-active-atlas-pilot-v5.test.py` — WebP-Dekodierung, RGBA, Pixelränder, Zellgrenzen, Manifest/Pivots, Hashes.
- `node tests/style2-user-towers.test.cjs` — Dimensions-Fallback zusätzlich zur bisherigen Turmlogik.
- Weitere Tests und CI-Ergebnisse: siehe PR-Checks und PR-Beschreibung.
- Vorschaubilder sind **offline erzeugte Kontaktbögen aus den tatsächlichen Bilddateien**, keine Gameplay-Screenshots, keine Chromium- oder Android-Belege.
- Der PR-CI-Browserlauf soll getrennte Desktop-/Touch-Emulations-Screenshots für beide Heldenmenüs und das Gameplay als Actions-Artefakt bereitstellen.
- Noch ausstehend: Chromium Desktop, mobile Touch-Emulation, tatsächliches Android 4-GB-Gerät und Ingame-Abnahme des Größenverhältnisses von Gegneraktionen.

**Nächster kleinster Schritt:** Gegner 00 Lauf-/Angriffs-Frame-Silhouetten auf denselben Fußpunkt und dieselbe wahrgenommene Größe bringen; erst danach als eigenen Atlas-PR zum Austausch vorschlagen. Turm-Familien nacheinander in gleicher Weise prüfen.
