# Denkmal TD2 V4 – Style-2 Kartenreview

Stand: 16. Oktober 2026

Branch: `feature/v4-graphic-overhaul-style2`
Testerziel nach manueller Freigabe: `https://imbaaalanced-dot.github.io/a/v4-style2/`

## Abnahmeumfang

Dieses Review deckt Phase 1 ab: Styleguide, vier Kartenumgebungen, vier Laufzeit-Layer je Karte, 3072-px-Desktop- und 2048-px-Android-Varianten, Loader/Fallback, Debug-Geometrie und isolierten Veröffentlichungsworkflow. Wege, Tore, Bauplätze und Ziele bleiben unverändert in `dist/levels.js`.

| Karte | Desktop gesamt | Mobil gesamt | Sichtprüfung | Ergebnis |
|---|---:|---:|---|---|
| 1 · Einleitung | 718.288 B | 719.826 B | Vier symmetrische, helle Zufahrten; Mitte für separates Monument frei | Bestanden |
| 2 · Labyrinth | 628.982 B | 471.168 B | Vollständiger, zusammenhängender Irrgartenweg; Hecken/Steinbegrenzungen außerhalb der Laufspur | Bestanden |
| 3 · Kriegerdenkmal Kirchende | 874.852 B | 833.368 B | Vier Zuläufe; Friedhofsrahmen; Mitte für separates Denkmal frei | Bestanden |
| 4 · Dorfkirche / Schlafender Löwe | 833.318 B | 819.884 B | Vier Wege enden am Löwen; Kirchenfläche und Vorplatz bleiben frei | Bestanden |

Gesamtgröße aller 32 Laufzeitbilder: 5.899.686 Byte. Damit bleiben sowohl die Einzelkartenbudgets als auch das 10-MB-Gesamtlimit eingehalten.

## Geometrie und Lesbarkeit

- Weltmaß jeder Karte: exakt 3072 × 3072.
- Android-Texturen: exakt 2048 × 2048; keine einzelne Textur überschreitet die GPU-Grenze.
- `ground`, `paths`, `decor-back`, `decor-front` liegen in fester Reihenfolge vor.
- Pfade, Bauplätze, Tore, Pfeile, Beschriftungen, Einheiten, Türme und Ziele sind nicht in die Bilder eingebrannt.
- Der Vordergrund wird in Akteursnähe mit mindestens 0,22 Opazität gezeichnet; die Laufwege bleiben erkennbar.
- Fehlende, beschädigte, übergroße oder zu langsam ladende Assets aktivieren das vorhandene prozedurale Rendering.
- `?debug=maps` zeigt Pfade, Tore, Bauplätze, Strukturgrenzen und Zielpunkt; ohne Query ist der Debugmodus aus.

## Historische Einordnung

| Element | Status | Umsetzung |
|---|---|---|
| Kriegerdenkmal Kirchende | `belegt` | Separates Ziel-Sprite; Commons-Quelle im Level-3-Manifest |
| Alter evangelischer Friedhof Kirchende | `belegt` | Räumlicher Kontext; Commons-Quelle im Manifest |
| Verdeckte/ergänzte Wegverbindungen | `rekonstruiert` | Nur zur Verbindung der belegten Ansichten; als solche markiert |
| Ender Dorfkirche | `belegt` | Separates Runtime-Objekt nordwestlich des Löwen |
| Schlafender Löwe von 1879 | `belegt` | Separates Verteidigungsziel am Weltzentrum |
| Vegetation, Nebel und Laternenlicht | `kuenstlerisch` | Atmosphärische Style-2-Ebene ohne historischen Tatsachenanspruch |

Level 4 hält Kirche und Löwe räumlich getrennt: Mittelpunktabstand über 450 Weltpixel, Kirchenbegrenzung nördlich des Vorplatzes, alle Gegnerwege enden am Löwen. Die Kirche bleibt auch bei vollständig geladenen Style-2-Layern als separates Objekt sichtbar.

## Geräte- und Viewport-QA

| Ziel | Prüfung | Status |
|---|---|---|
| 360 × 800 | Mobile Renderpfad, 2048-Auswahl, Geometrie-/Kamera-Regression | Automatisiert bestanden |
| 412 × 915 | Mobile Renderpfad, 2048-Auswahl, Level-4-Geometrie | Automatisiert bestanden |
| 1366 × 768 | Desktop Renderpfad, 3072-Auswahl, alle vier Kartenkomposite | Bestanden |
| 1920 × 1080 | Desktop Renderpfad, 3072-Auswahl, alle vier Kartenkomposite | Bestanden |
| Android-Browser | Dekodierung, Größenlimit und mobiles Gameplay | Automatisiert bestanden |
| Reales Android-Gerät | HUD-Überlagerung, Wellen 1–16, thermische FPS | Vor manueller Veröffentlichung noch offen |

Die Umgebung enthält keinen installierten Playwright-Browser. Deshalb wurden die Zielgrößen über Renderer-/Geometrie-Tests und Kartenkomposite geprüft; echte Geräte-Screenshots und belastbare FPS-Werte dürfen erst nach manueller Tester-Veröffentlichung ergänzt werden.

## Bekannte Grenzen

- Die Karten sind hochauflösende Phase-1-Umgebungen. Finale Ersatz-Sprites für Kriegerdenkmal, Kirche und Löwe folgen in Phase 2.
- Baumkronen werden als global gedimmte Vordergrundebene behandelt; eine lokale Occlusion-Maske ist noch nicht enthalten.
- Historische Quellen belegen die benannten Bauwerke und den Friedhofskontext, nicht jeden Baum, jede Mauer oder jede verdeckte Wegkante.
- Der Workflow veröffentlicht ausschließlich nach manuellem Dispatch aus dem Grafik-Branch. Dieser Review löst keine Veröffentlichung aus.

## Phase-1-Freigabe

- Technische Kartenverträge: bestanden.
- Desktop-/Mobile-Dekodierung und Budgets: bestanden.
- Gameplay-Geometrie und Level-4-Zieltrennung: bestanden.
- Prozeduraler Fallback: bestanden.
- Reale Android-Performanceabnahme: ausstehend; als Gate vor öffentlicher Testfreigabe dokumentiert.

Nicht Bestandteil dieses Commits: finale Struktur-Sprites, komplette Turmfamilien in drei Stufen, Projektile/VFX, HUD/Icons und Hauptmenü-Redesign.
