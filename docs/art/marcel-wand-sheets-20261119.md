# Marcel · Zauberstab-Ersatz der Runtime-Blätter side/left/up + Walk (19.11.2026)

Produktionsprotokoll und Abnahmestand für die Nachproduktion der bis dahin noch
Schwert/Schild-zeigen­den Marcel-Runtime-Blätter gemaß
`docs/art/HERO_REFERENCE_LOCK_20261107.md` (Referenz 20261115, Zauberstab).
Der „down"-Satz (Issue #301) blieb unverändert.

## Produzierte Blätter

| Zieldatei (Runtime) | Inhalt | SHA-256 |
| --- | --- | --- |
| `dist/assets/hero/marcel-side-actions-v5b.webp` | side/rechts (Basisblatt), Zeilen attack/hit/death neu produziert, Zeilen 0/1/3 transparent (Packer-Kontrakt) | `b3144dce8403bbdda1977af9486248e1976f7a14fb7214501667e35735d54113` |
| `dist/assets/hero/marcel-left-actions-v5b.webp` | komplett neu produziert via `tools/pack-hero-action-directions.py` (+ JSON-Manifest) | `8a234277edaee6cce369224e3cc7f78bd57d2dcaf027f027f8b1df571907fdca` |
| `dist/assets/hero/marcel-up-actions-v5b.webp` | komplett neu produziert via `tools/pack-hero-action-directions.py` (+ JSON-Manifest) | `4af2ba73ebc4de9be8e9a94fa677ec09810d95042be6cef2fd40367c5e229c3d` |
| `dist/assets/hero/marcel-walk-v5b.webp` | 3 Frames je Richtung (down/up/left/right), 256er-Zellen | `0aeeddb045db09fa99bfe5f24253ca8d03fb02583101ccbf76c92ef1a2d975c8` |

Frame-Quellen (jeweils `00..05.png`, 128 bzw. 256 px RGBA):
`source-art/hero/actions-v5/marcel/{right,left,up}/{attack,hit,death}/`,
`source-art/hero/walk-v5/marcel/{down,up,left,right}/`.

## Verfahren

1. Pro Frame: Bestandsframe des Schwert/Schild-Blatts auf flachem Magenta
   (#FF00FF) hochskaliert, verkettete Bildgenerierung (nur Ausrüstungstausch
   Schwert+Schild → ein Zauberstab, gleiche Pose/Silhouette/Pivot).
2. Chroma-Key-Freistellung mit Kantenumrechnung und Spill-Unterdrückung;
   Nachreinigung verbleibender Magenta-Kantenpixel.
3. Pivot-Normalisierung auf die Fuß-Referenzmaße des jeweiligen Bestandsframes
   (Höhen-Snap, Bodenanker), Zellen-Randreserve ≥2 px.
4. left/up: Packer-Gate `tools/pack-hero-action-directions.py` (6 unique Frames,
   ≥3 Alpha-Silhouetten, Anker-Drift ≤15 px, Höhenverlauf, WebP-Verifikation).
   side + walk: `tools/export-marcel-wand-hero-v5.py` (staged encode + verify).
5. Registry-Refresh: `?v=v5b-wand-20261119` bzw. `?v=hero-dir-v5b-wand-20261119`.
   Nitreinigung: Chroma-Key-Reste auf 0-alpha gesetzt (HOT-PINK-Gate-Deckung),
   Transparent-Black-Matte in allen erzeugten Blättern.

## QA

- Packer-Gates für left/up: bestanden (Manifeste `status: candidate-unapproved`).
- Neue Pixel-Gate `tests/marcel-wand-sheets-pixels.test.py`: alle 78 Live-Frames
  der vier Combat-Blätter + 12 Walk-Frames rand­sicher, magenta-frei,
  Attack-/Hit-Frames mit blaubleibender Kristall-Glow-Signatur: bestanden.
- `tests/active-hero-atlas-alpha.test.py` (Marcel-Version + transparente
  Nicht-Aktionszeilen des Basisblatts), `tests/marcel-wand-ingame-gate.test.cjs`
  und die übrige CI-Node-Suite: bestanden.
- Sichtprüfung (Vision-Modell): alle vier Combat-Blätter Zeile für Zeile
  (side/left/up attack+hit+death) und der komplette Walk-Atlas mit „nur
  Zauberstab, kein Schwert/Schild, keine Anatomiefehler" bestätigt. Nach der
  Erstproduktion nachgebessert: up death 05/06 (editierte Finalposen zeigten
  noch Schild/Schwert) und left death 06 (Schild) einzeln neu produziert;

## Offen / Abnahme

- Manuelle Sichtabnahme aller vier Blätter (Pflicht laut Referenz-Lock),
  Modellerkennung ist keine Freigabe, @Marcel.
- Android-Sichtprüfung (4 GB) gemäß Regel 6 im Referenz-Lock.
- Danach Übergangsregel in `HERO_REFERENCE_LOCK_20261107.md` als abgeschlossen
  vermerken („Nächster Produktionsschritt", Punkt 1: Walk, Side-Actions ✓).
