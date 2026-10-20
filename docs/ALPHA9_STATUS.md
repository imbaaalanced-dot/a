# Denkmal TD2 V4 Alpha 9 – überprüfbarer Stand

Basis: PR #47, Commit `8408f47`. Der noch offene Gegner-Patch PR #49 (`61b6158`) wurde in den separaten Alpha-9-Branch übernommen. PR #48 ist bereits Bestandteil von #47. `main` und `/v4-alpha8/` werden nicht verändert.

## Technik

| Aufgabe | Status | Beleg / Grenze |
|---|---|---|
| Gemeinsame Bildanforderungen | Fertig, getestet | `asset-manager.js` bündelt identische URLs und hält Levelgruppen; `tests/asset-manager.test.cjs` prüft Deduplizierung, fehlgeschlagenes Bild, Freigabe und Folgestufe. Bestehende unabhängige Renderer sind noch nicht vollständig migriert. |
| Menüstart entlasten | Fertig, getestet | `preloader.js` lädt drei Ladebilder und vier Menübilder statt der bisherigen Kampf- und Levelatlanten. Andere bestehende Skripte laden einige Bilder weiterhin beim Einlesen. |
| Level nachladen und vorausladen | Fertig, getestet | Beim Start wird die aktuelle Gruppe angefordert, nach 1,8 s die nächste; beim Wechsel werden alte Gruppe und große Kartenpuffer freigegeben. Das Modell akzeptiert weitere Levelnummern. |
| Kurzzeitiges Canvas-Löschen | Übernommen, getestet | Fix aus PR #49: Resize setzt `canvas.width/height` nur bei tatsächlich geänderter Pixelgröße. Atomarer Menübannerwechsel wartet zusätzlich auf Laden und Decodieren. Echter visueller Langzeittest offen. |
| 20/50/100/200 Gegner | Teilweise getestet | Deterministischer Zielwahltest mit künstlichen aktiven Gegnerobjekten. Kein FPS- oder vollständiger Wellen-/Bosslasttest. |
| Grafikmodi | Fertig, getestet | Hoch / Standard / Sparmodus bleiben intern auf den bisherigen Speicherschlüsseln `high` / `auto` / `low`. Ein Android-Video vom 20.10. zeigt in Welle 2–3 etwa 8–23 FPS laut eingeblendeter Anzeige; dies ist ein Nutzergerät, kein reproduzierbarer Benchmark. Als gezielte Reaktion begrenzt Alpha 9a2 den mobilen Canvas-Puffer auf 2,0 / 0,9 / 0,55 Mio. Pixel für Hoch / Standard / Sparmodus und lässt in der reduzierten Darstellung die mehrfachen Torlicht-Überlagerungen aus. Die Auflösung wird nur bei Größen- oder Moduswechsel gesetzt. Ein neuer Android-Vergleich ist offen. FPS-Anzeige kann vorhandenen JS-Heapwert aus Chromium ergänzen; GPU-Speicher wird nicht gemessen. |
| Bestehende Profile | Unverändert, Regressionstest | Keine Änderung am Loot-/Inventarformat oder Speicherschlüssel. Bestehende Tests für Import, Recycling, Heldenwahl, 2× und Level laufen. Echte Altprofile wurden nicht auf Android importiert. |

## Asset-Inventar

Vollständige Dateiliste: [`ALPHA9_ASSET_INVENTORY.csv`](ALPHA9_ASSET_INVENTORY.csv). Sie enthält Format, Bytes, Abmessungen, Alpha, SHA-256 und **wörtliche** Referenzen; dynamische Pfade sind damit nicht als ungenutzt bewiesen.

| Messung | Vorher (PR #49 Head) | Alpha 9 |
|---|---:|---:|
| `dist/assets/`, alle Dateien | 73.991.886 B | 66.266.089 B |
| Differenz | | −7.725.797 B (−10,44 %) |
| Verlustfrei umgestellte PNGs | 14 Dateien | 14 WebP-Dateien mit gleichem RGBA-Pixelinhalt bei lokaler Konvertierungsprüfung |

Die 14 Umstellungen betreffen `asset-atlas`, `guardian-atlas`, drei ältere Turm-Fallbacks und neun Stufengrafiken für Bogen, Kanone und Rift. Die alten PNGs werden im Alpha-9-Paket nicht mehr referenziert. Originaldateien bleiben im Alpha-8-Branch erhalten. Keine bytegenauen FPS- oder Laufzeitspeichermessungen liegen vor. Der Dateiumfang ist nicht der dekodierte GPU-Speicher.

## Style-2-Prüfung

Dies ist ein Dateiabgleich mit visueller Sichtung ausgewählter Original-Assets und vorhandenen Renderer-Tests. Ein vollständiger Screenshot-Durchgang auf Desktop und Android steht aus.

| Inhalt | Stand | Konkrete Lücke |
|---|---|---|
| Level 1 Tutorial und Level 2 Labyrinth | Teilweise Style 2 | Wege und Boden sind gecachte Canvas-Illustration; Perspektive bleibt 2.5D-Projektion, keine vollständig handgemalte Levelkarte. |
| Level 3 Kirchende | Teilweise Style 2 | Fotobezogenes Monument und Gelände; Vegetation und Übergänge sind teils prozedural. Historische Maße nicht eingemessen. |
| Level 4 Ender Kirche und Löwe | Style-2-Sprites vorhanden | Kirche und separater Löwe sichtbar. Südorientierung und Spielanker bleiben im Code unverändert. Fotoabgleich von Wegverlauf/Entfernung auf Gerät steht aus. |
| Level 5 Hohensyburg | Style-2-Denkmal vorhanden | Terrasse/Wald sind gemalte Canvas-Interpretation. Maßstab und aktuelle Denkmalform benötigen Sichtabnahme. |
| Level 6 Goethestraße | Teilweise Style 2 | Denkmal-Sprite und Luftweg vorhanden; Gelände und Details weiter illustrativ. |
| 21 Gegnerdesigns aus PR #49 | Teilweise Style 2 | Vier Laufphasen und prozedurale Treffer-/Todreaktion; keine separaten handgemalten Angriffs-/Todeszyklen. Sichtprüfung des Atlas zeigt stellenweise farbige Artefaktflächen in Zellen. Android-Lesbarkeit offen. |
| Marcel / Kim | Teilweise vereinheitlicht | Neu erzeugt und integriert: Marcel-Laufsheet, Porträt und Banner ohne Cap mit Sonnenbrille. Kim-Laufsheet und Banner bleiben erhalten. Separater Angriffssatz für beide fehlt; Kim-Referenzabgleich ist nicht vollständig. |
| Türme / Projektile | Teilweise Style 2 | Bogen, Kanone, Magie, Rift und Bumerang besitzen verschiedene Stufen und Effekte. `Eissturm` ist weiterhin keine eigenständige sechste Turmmechanik; weitere Legacy-Türme dienen als Fallback und sind nicht durchgängig im gleichen Stil. Sterne bleiben unverändert. |
| Menü, Inventar, HUD | Teilweise Style 2 | Heldenbanner und Inventar bleiben funktionsfähig. Einzelne UI- und Item-Icons sind noch Code-/Altgrafiken; vollständiger Touch- und Layoutabgleich offen. |

Neue Bilddateien wurden mit dem eingebauten Bildwerkzeug aus dem jeweiligen Alpha-8-Asset bearbeitet und als `marcel-walk-alpha9.webp`, `marcel-portrait-alpha9.webp` und `marcel-banner-alpha9.webp` ins Spiel eingebunden. Der Walk-Atlas wurde als 3×4-Zellenraster mit transparentem Rand und 1152×1536 px geprüft. Die bearbeiteten PNG-Arbeitsausgaben liegen nicht im Build.

## Offen für die Abnahme

- Echte Android-Browser- und WebView-Playtests einschließlich Touch, Welle 50, 2× und 4-GB-Gerät; FPS und Speicher messen.
- Alle sechs Karten in Desktop- und Mobilansicht gegen Referenz und Laufzeitbild prüfen; insbesondere Löwenrichtung, Straßenverlauf und Gegnerartefakte.
- Weitere Renderer auf den gemeinsamen Asset-Manager umstellen und ihre Bild-/Canvas-Referenzen beim Levelwechsel gezielt freigeben.
- Angriff-/Treffer-/Tod-Frames, weitere Turmidentitäten und UI-Restgrafiken als echte Dateien erzeugen, einzeln abnehmen und integrieren.

Die begleitenden Node- und Pillow-Tests prüfen Logik, Decodierbarkeit und Rastergrenzen. Sie ersetzen weder einen sichtbaren Browser-Langzeittest noch reale Android-FPS-Messungen.
