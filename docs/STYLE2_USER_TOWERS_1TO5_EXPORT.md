# TD2 V4 Alpha 9 – Nutzer-Turmset 1–5, Export und Übergabe

**Status:** Exportskript auf GitHub; die 30 binären Sprite-Dateien sind **noch nicht** in diesem Branch hinterlegt.
**Basis:** PR #50, `feature/td2-v4-alpha9-performance-style2`.
**Freigegebene lokale Quellen:** `86485.png` (2000×1200, 5 Spalten × 3 Reihen) und `86488.png` (720×432, ebenfalls 5×3).
**Chat-Export:** 15 PNG-Türme und 15 PNG-Projektile, dazu 30 verlustfreie WebP-Varianten im ZIP `TD2_Style2_Towers_1to5_Export_V1.zip` (aus dem Chat herunterladen).

## Turmauswahl

| Spalte | Interner Schlüssel | Motiv | Stufen |
|---|---|---|---|
| 1 | `bow` | Bogenturm | 1–3 |
| 2 | `cannon` | Kanonenturm | 1–3 |
| 3 | `mage` | Eis-/Magieturm (Slow) | 1–3 |
| 4 | `rift` | Riftlanze (Kettenblitz) | 1–3 |
| 5 | `boomerang` | Bumerangturm: Holz → Plastik → Sägeblatt | 1–3 |

## Import nach GitHub

1. Die 30 einzelnen PNGs aus dem ZIP unter `dist/assets/style2-user-towers-v1/towers/` und `projectiles/` ablegen.
2. Wahlweise auch `runtime-webp/` und `manifest.json` aus dem ZIP übernehmen, wenn der separate Preview-Renderer diese WebP-Dateien verwendet.
3. Alternativ die beiden Quellatlanten lokal aufbewahren und die Sprite-Dateien reproduzieren:

```bash
python tools/export_user_style2_towers.py 86485.png 86488.png --out dist/assets/style2-user-towers-v1
```

4. Erst danach ist der GitHub-Branch **grafisch vollständig**. Ohne Bilddateien darf kein neuer Runtime-Pfad aktiviert werden.

## Qualität / bekannte Grenzen

- Lokaler Export: 30 RGBA-PNGs mit `tower_* = 512×512`, `projectile_* = 256×256`; zusätzlich verlustfreie WebP-Versionen und Export-Manifest.
- Zu hohe Turmspitzen wurden durch pro Spalte angepasste Alpha-Schnittgrenzen geschützt. Teilweise berührt die Kunst trotzdem äußere Quellbildränder.
- Originalgrafiken können magentafarbene Teiltransparenz-Fransen enthalten; die Quellkunst wurde nicht unbemerkt retuschiert.
- `rift`- und `mage`-Geschosse auf ihre tatsächliche Funktion im Spiel prüfen. Visuelle Vorlage ist keine bereits erfolgte Laufzeitanimation.
- Noch keine Integration in `dist/game.js`, keine Änderung an Kampflogik oder Save-Keys. Vor Einbindung erst Sichtprüfung und Playtest im separaten Alpha-9-Testpfad.
- **Nicht veröffentlichen oder nach `main` mergen**, solange binäre Bilder fehlen und Android-Flackerprüfung offen ist.

## Zieldateien (bei vollständiger Übergabe)

```text
towers/tower_bow_lv1.png
projectiles/projectile_bow_lv1.png
runtime-webp/towers/tower_bow_lv1.webp
runtime-webp/projectiles/projectile_bow_lv1.webp
towers/tower_bow_lv2.png
projectiles/projectile_bow_lv2.png
runtime-webp/towers/tower_bow_lv2.webp
runtime-webp/projectiles/projectile_bow_lv2.webp
towers/tower_bow_lv3.png
projectiles/projectile_bow_lv3.png
runtime-webp/towers/tower_bow_lv3.webp
runtime-webp/projectiles/projectile_bow_lv3.webp
towers/tower_cannon_lv1.png
projectiles/projectile_cannon_lv1.png
runtime-webp/towers/tower_cannon_lv1.webp
runtime-webp/projectiles/projectile_cannon_lv1.webp
towers/tower_cannon_lv2.png
projectiles/projectile_cannon_lv2.png
runtime-webp/towers/tower_cannon_lv2.webp
runtime-webp/projectiles/projectile_cannon_lv2.webp
towers/tower_cannon_lv3.png
projectiles/projectile_cannon_lv3.png
runtime-webp/towers/tower_cannon_lv3.webp
runtime-webp/projectiles/projectile_cannon_lv3.webp
towers/tower_mage_lv1.png
projectiles/projectile_mage_lv1.png
runtime-webp/towers/tower_mage_lv1.webp
runtime-webp/projectiles/projectile_mage_lv1.webp
towers/tower_mage_lv2.png
projectiles/projectile_mage_lv2.png
runtime-webp/towers/tower_mage_lv2.webp
runtime-webp/projectiles/projectile_mage_lv2.webp
towers/tower_mage_lv3.png
projectiles/projectile_mage_lv3.png
runtime-webp/towers/tower_mage_lv3.webp
runtime-webp/projectiles/projectile_mage_lv3.webp
towers/tower_rift_lv1.png
projectiles/projectile_rift_lv1.png
runtime-webp/towers/tower_rift_lv1.webp
runtime-webp/projectiles/projectile_rift_lv1.webp
towers/tower_rift_lv2.png
projectiles/projectile_rift_lv2.png
runtime-webp/towers/tower_rift_lv2.webp
runtime-webp/projectiles/projectile_rift_lv2.webp
towers/tower_rift_lv3.png
projectiles/projectile_rift_lv3.png
runtime-webp/towers/tower_rift_lv3.webp
runtime-webp/projectiles/projectile_rift_lv3.webp
towers/tower_boomerang_lv1.png
projectiles/projectile_boomerang_lv1.png
runtime-webp/towers/tower_boomerang_lv1.webp
runtime-webp/projectiles/projectile_boomerang_lv1.webp
towers/tower_boomerang_lv2.png
projectiles/projectile_boomerang_lv2.png
runtime-webp/towers/tower_boomerang_lv2.webp
runtime-webp/projectiles/projectile_boomerang_lv2.webp
towers/tower_boomerang_lv3.png
projectiles/projectile_boomerang_lv3.png
runtime-webp/towers/tower_boomerang_lv3.webp
runtime-webp/projectiles/projectile_boomerang_lv3.webp
```
