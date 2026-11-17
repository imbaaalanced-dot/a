# Marcel-Kristallstab · technische Alpha-QA · 17.11.2026

**Befund:** Review-Kandidat für Issue #330, keine finale Grafikfreigabe.

Aus den tatsächlich erzeugten Dateien mit PIL/NumPy gemessen; Alpha-Inhaltsgrenze: Kanalwert **größer als 16**.

| Datei | Pixel | Dateigröße | Inhalt-Bounding-Box (x0,y0,x1,y1) | Alpha-Pixel am oberen Rand |
|---|---:|---:|---|---:|
| `marcel-staff-v6-candidate-master.png` | 1024×1536 | 2.007.123 B | (164,0,891,1517) | **58** |
| `marcel-staff-v6-candidate.webp` | 640×960 | 147.584 B | (102,0,557,948) | **37** |

Die Alpha-Kanalwerte umfassen 0 bis 254 beim PNG bzw. 0 bis 255 beim WebP. Die Transparenz ist technisch vorhanden. Die Bildausdehnung reicht jedoch bis **y=0**; die blaue Kristallspitze berührt die obere Kante und könnte am Rand abgeschnitten sein. Ein vollständiges Staff-Motiv mit ausreichender Sicherheitsmarge ist für den finalen Export visuell zu belegen oder neu zu rendern. **Alpha-fähiges WebP ist nicht gleich geprüfte Freistellung.**

Technische Checks können keinen Schwert-/Schild-freien Charakter, keine referenztreuen Gesichtszüge und keine brauchbare 64/128px-Darstellung garantieren. Die manuelle Auswahl, die vollständigen PNG/WebP-Dateien (nicht in diesem Review-Branch) und die getrennte echte Android-4-GB-Abnahme fehlen.

Die genaue SHA-256 für PNG/WebP und die visuelle Checkliste stehen in [marcel-staff-v6-review-20261117.md](marcel-staff-v6-review-20261117.md).

**Ergebnis:** `art_approval=manual-required`, kein Runtime-Swap, keine Beta-Freigabe.
