# TD2 V5: Style-2 Asset-Audit und Westhofen-Produktionsplan (10.11.2026)

## Status und Quellen
Dokumentations-/Planungsstand, **keine neuen Runtime-Assets**. Basierend auf dem aktuellen `main`-Repository, `docs/STYLE2_V5_QUALITY_REVIEW_20261109.md`, `docs/WESTHOFEN_LEVEL.md` und der Projektübergabe zu sieben generierten Westhofen-Bildgruppen. Die sieben Bildgruppen liegen in dieser Ausführung **nicht als einzeln überprüfbare Quelldateien** vor. Transparenz, Maße und Freistellung dürfen deshalb nicht als bestanden markiert werden.

## Priorität P0: Westhofen (7 Gruppen)
| Gruppe | Eingangsstand | Nächster Produktionsschritt | Abnahme |
|---|---|---|---|
| Denkmal, Flügelhelm, Pergola, Treppen | Generierte Bildgruppe; Hintergrundrisiko bei Architektur | Quelle sichten, Objekte verlustfrei einzeln freistellen, Monument und Pergola separat | Echte RGBA-Alphakanäle, kein Hintergrundsaum bei 64/128 px |
| Mauern, Bänke, Laternen, Dekoration | Generierte Bildgruppe; Architektur-Freistellung offen | Einzelsprites, eindeutige Fußpunkte, Schatten getrennt prüfen | Perspektive und Maßstab konsistent |
| Bäume, Hecken, Bodenpflanzen | Generierte Bildgruppe | Einzelobjekte schneiden, Randtransparenz und Überlappung prüfen | Kein Farbhalo auf hell/dunkel, transparente Lücken |
| Sechs Bodenmaterialien | Generierte Bildgruppe | Tile-Grenzen, Wiederholung und Nahtfreiheit prüfen | Keine sichtbaren Nähte, bestehende Lane/Slots unverändert |
| Fünf Gegner und „Vergessener Hauptmann“ | Generierte Bildgruppe; vollständige Animationen fehlen | Je Figur Identität fixieren, Idle/Walk/Attack/Hit/Death, Boss zusätzlich Telegraph/Special; gleiche Projektion und Fußpunkte | Atlas-Zellen konsistent; jede Animation in Vorschau |
| Licht, Nebel, Laub, Treffer | Generierte Effektphasen; Hintergrundreste möglich | RGBA-Effektframes isolieren, additive/alpha-Komposition kontrollieren | Kein dunkler rechteckiger Rand, geringe Overdraw-Kosten |
| Levelmotiv Auswahl/Ladebildschirm | Generierte Bildgruppe | Bildausschnitt, Lesbarkeit und mobile Skalierung prüfen | 360–420 px Portrait, keine Verzerrung |

## Bestehender Code-/Grafikbefund aus Repository
- Qualitätsbericht vom 09.11.: Westhofen-Hauptdenkmal-Sprite bereits transparent ersetzt, mit Canvas-Fallback; Proportionen und Android-Komposition weiterhin offen. Der ältere Leveltext beschreibt noch einen prozeduralen Platzhalter und ist deshalb **kein zuverlässiger aktueller Runtime-Nachweis**.
- Kim/Marcel: Walk-Renderer und Aktionsmanifest bereits korrigiert; vorhandene Animationsatlanten zeigen teilweise ältere Figurenentwürfe. Referenz-Lock für Bewegung, Angriff, Treffer und Tod fehlt.
- Ansturm: drei problematische Bilder ersetzt; 46 weitere Randkandidaten müssen **visuell** geprüft werden, nicht pauschal beschnitten.
- Kampagnenlevel 3–6: gemeinsame Style-2-Materialpalette vorhanden; kein vollständiger 2.5D-Geländetausch.
- Turm-Projektil-Warmup verbessert; alte Fallback-Türme und Rift-L3 nicht ohne visuelle Prüfung löschen.

## Produktionskonvention
- Isometrische/orthografische 2.5D-Kamera, dunkel verwitterter Stein, Holz, Eisen, warmes Laternenlicht, kontrollierte Goldakzente.
- Echte Transparenz (RGBA), keine Schachbrett- oder Hintergrundflächen eingebrannt.
- Pivot für Figuren: Bodenkontakt in der Mitte; Gebäude: definierter Standflächen-Anker. Schatten nur nach explizitem Runtime-Vertrag eingebettet.
- Atlas-Zellgröße, Frame-Reihenfolge, Animationsgeschwindigkeit und Manifest-Einträge vor Export gegen Loader prüfen.
- Laufzeitspeicher überschlagen: `width × height × 4` Byte pro dekodierter RGBA-Textur; kleine Atlanten, bedarfsgerechtes Laden, keine Neuanlage pro Frame.
- Keine Änderungen an Save-Keys, Gegnerwerten, Wegfindung, Tower-Slots oder Level-Geometrie.

## Geprüfte und ungeprüfte Schritte dieser Runde
**Bestätigt:** GitHub-Repository erreichbar; `main` ist Default-Branch; Qualitätsbericht und Westhofen-Leveldokument gelesen; dieses Audit auf eigenem Branch erstellt.

**Nicht ausgeführt / nicht bestätigt:** Bildgenerierung, echte Freistellung, PNG/WebP-Export, Asset-Integration, Node-/Python-Tests, Chromium-Smoke-Test, physischer Android-4-GB-Test, CI, Merge, Deployment.

## Kleinster nächster Schritt
Die sieben tatsächlichen Westhofen-Quellbildgruppen aus dem Asset-Speicher als Dateien verfügbar machen. Zuerst **eine** Architekturgruppe (Denkmal/Pergola/Treppe) isoliert in RGBA-Einzelbilder zerlegen und in einer kleinen Android-Hochformat-Vorschau auf hellem und dunklem Hintergrund prüfen. Erst danach die sechs übrigen Gruppen bearbeiten und den Runtime-Loader anfassen.

## Merge-Gate
Dokumentation und Draft-PR dienen nur der Vorbereitung. **Kein Merge oder Deployment ohne ausdrückliche Freigabe.** Keine QA-Ergebnisse aus früheren Builds auf diesen Branch übertragen.
