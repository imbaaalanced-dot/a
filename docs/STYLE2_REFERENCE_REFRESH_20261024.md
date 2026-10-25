# TD2 Style 2 – Referenzgrafiken und neue Einschläge (24.10.2026)

**Branch:** `feature/style2-tower-atlases-20261024`, angelegt auf `feature/td2-consolidation-resume-20261024`.
**Status:** Lokal exportiert, opt-in in Canvas eingebunden und synthetisch getestet. Nutzer hat die Umsetzung und Veröffentlichung ausdrücklich freigegeben. Veröffentlichung ausschließlich in der isolierten TD2-Vorschau; kein Merge nach `main`. Android-Gerätefreigabe steht aus.

## Eingänge und geprüfte Zuordnung

- `394.png`, 2000×1200: alle sichtbaren Pixel und Alphawerte des ersten Bogenturms sind **identisch** mit der bereits vorhandenen V1-Datei. Der bestehende V1/V2/V3-Turmverbund bleibt bestehen; die neuere V3-Bereinigung wird nicht durch das alte Referenzbild ersetzt.
- `395.png`, 2000×1200: gemischtes Blatt aus Geschossen, Turmmotiven und einem Eiswirbel. Die folgenden **12** Zellen sind echte Projektile und liegen jetzt einzeln unter `dist/assets/style2-reference-projectiles-v1/`:

  | Familie | Übernommene Stufen | Nicht als Projektil übernommen |
  | --- | --- | --- |
  | Bogen | 1, 2, 3 | – |
  | Kanone | 1, 2, 3 | – |
  | Eis/Magie | 1, 2 | Stufe 3 ist ein Boden-Eiswirbel |
  | Rift | 1 | Stufe 2 und 3 zeigen stehende Turm-/Tesla-Konstruktionen |
  | Bumerang | 1, 2, 3 | – |

- Alle zwölf neuen PNG-Master: 256×256 RGBA, Flugmittelpunkt `[128,128]`, mit verlustfreien WebP-Runtimepaaren und SHA-256-Manifest. Ein kontrollierter Chroma-Fringefilter wird ausschließlich bei nichtvioletten Projektilelementen verwendet; Rift-Purpur bleibt erhalten.
- Die vorherigen Canvas- und Style-2-Türme, Upgrade-Sterne, Projektile und Save-Keys sind nicht überschrieben.

## Neue Grafiken

Zwei neue transparente sechsphasige Impact-Folgen: **Eissplitter** (`mage`) und **Stahl-/Bronze-Funken** (`boomerang`). Quellen und 12 exportierte Masterframes in `dist/assets/style2-reference-impacts-v1/`, Laufzeit-Atlas `runtime.webp` 768×256 mit 128×128 Zellen. Phase 0 = Kontakt; Phase 3 = Maximalimpuls; Phase 5 = Abklingen. Eis für alle drei Stufen; Stahl/Bumerang nur Stufe 3, die kleineren Bumerangs nutzen weiter ihre bestehenden Hits.

## Einbindung und Testparameter

Die beiden vorhandenen Adapter enthalten einen opt-in-Zweig; kein zusätzlicher dauerhafter Bildloader oder Vollset-Preload wurde eingeführt:

```
?td2ProjectileRefresh=1&td2ImpactRefresh=1
```

Ohne Parameter bleiben die bislang ausgewählten V1/V2/V3-Grafiken aktiv. Während Bilddownloads und Dekodierung weiterlaufen, zeichnet der bestehende Renderer seine bewährten Fallbacks. Im Sparmodus bleiben die günstigen Canvas-Treffer erhalten. Der neue WebP-Trefferatlas belegt im entpackten RGBA-Zustand rechnerisch 0,75 MiB (768×256×4), zuzüglich Browser-/GPU-Overhead.

## Reproduzierbarer Export

```
python tools/export_style2_reference_refresh.py \\
  dist/assets/style2-reference-projectiles-v1/sources/user-projectiles-395.png \\
  dist/assets/style2-reference-impacts-v1/sources/ice-shatter-6frames.png \\
  dist/assets/style2-reference-impacts-v1/sources/boomerang-impact-6frames.png
```

QA:

```
node tests/style2-reference-refresh.test.cjs
python tests/style2-reference-assets.test.py
node tests/style2-user-towers.test.cjs
node tests/style2-impact-atlas.test.cjs
```

## Veröffentlichungs- und Abnahmestatus

Die [statische 64/128-Pixel-Review-Tafel](qa/style2-reference-20261024/preview.png) wurde nach dem Zuschnitt visuell geprüft; die Stufen sind unterscheidbar und die zwei VFX-Folgen bleiben lesbar. Das ist **kein** Laufzeit- oder Gerätetest.

1. Die neue Variante wird im isolierten Vorschaupfad mit `?td2ProjectileRefresh=1&td2ImpactRefresh=1` veröffentlicht; sie ist damit kein Standard- oder Live-Build.
2. Browser-Canvas-Prüfung umfasst die existierende Cloud-Chrome-Vorschau; die Zusatzgrafiken werden vor Release in schmaler und Desktop-Ansicht geprüft.
3. Android mit 4 GB RAM bleibt offen: Wellen mit vielen Projektil- und Trefferanimationen, FPS und Speichernutzung messen; kein Flackern und kein Glitch beim Kaltstart/Wechsel in den Sparmodus.
4. Referenz-Eiswirbel aus `395.png` bleibt ein möglicher separater AoE-Effekt; das fliegende Magiegeschoss wird dadurch nicht ersetzt.
5. PR #57 bleibt Draft, bis Android-QA und Review abgeschlossen sind. Kein Merge nach `main` ist durch diese Vorschau-Freigabe autorisiert.
