# Marcel · Zauberstab-FX V2 – Runtime-Integration (13.11.2026)

## Freigegebener Umfang
- Marcel führt ausschließlich **Fernangriffe** aus; der bestehende Auto-Attack bleibt mechanisch unverändert.
- Das neue optische FX-Paket umfasst **3 × 6 Frames**: normaler Stabschuss, Seelenruf-Projektil, magischer Einschlag.
- Quellen aus der lokal geprüften Grafikproduktion: `td2_marcel_staff_fx_v2_20261113.zip` mit jeweils 128×128 RGBA. **Quellen und bisherige Hero-Atlanten bleiben unverändert.**
- Tatsächlich eingebundenes Runtime-Asset: `dist/assets/hero/marcel-staff-fx-v2-40.png`, **240×120**, 6 Spalten × 3 Reihen, je 40×40; 5.185 Byte, 32-Farben-PNG mit Alpha.
- Datei-SHA256: `8b6105b21c3612be264c334bf3d1b5f785248f9ef45bafb9e6773ad2b90c36fd`. Git-Blob: `840b865c5338b0b0358da3c3da4ad62f7897beed`.
- Der 40px-Runtime-Atlas ist bewusst gegenüber dem 128px-Quellmaster verkleinert, da Projektile im Spiel nur klein dargestellt werden. **Qualitätsgrenze:** diese Reduktion ist keine Freigabe für große Zoom-Stufen.

## Lade- und Renderingvertrag
- `dist/combat-fx.js` lädt die Grafik **erst nach Marcels erstem Schuss** per `Image`, prüft 240×120 und cached die dekodierte Textur.
- `dist/game.js` setzt `heroCharacter` ausschließlich als kosmetischen Marker am Projektil. **Kein Schaden, Schusstempo, Kollisionscode, Spielstand oder Save-Key geändert.**
- Nur `heroShot && heroCharacter==='marcel' && kind==='wand'` zeichnet den neuen Stab-Projektilatlas. Kim, Türme und Gegner behalten ihre bisherige Darstellung.
- Beim Treffer wird das dritte Blatt verwendet, innerhalb des bestehenden Partikelcaps. Bei fehlender oder beschädigter Textur greift die vorhandene prozedurale Darstellung.
- Die zweite Atlasreihe ist als `DenkmalCombatFX.drawStaffFrame(ctx,x,y,1,phase,angle,size)` für **den Seelenruf aus Draft-PR #250** vorbereitet. Ein grafisch integrierter Spezialangriff darf erst gemeldet werden, wenn die Wirkung an dessen tatsächlicher Flugbahn angeschlossen und im Spiel geprüft wurde.

## QA, Grenzen und Freigabe
- `tests/combat-fx.test.cjs` kontrolliert PNG-Signatur, Maße, Ladepfad, Cache, Figurentrennung, drei Atlasreihen und Fallback.
- `tools/verify-canonical-style2-browser.cjs` kontrolliert Desktop-Chromium und mobile Touch-Emulation: tatsächliche Canvas-Dekodierung und sichtbare Alpha-Pixel jeder FX-Reihe, genau eine Anfrage je Browserkontext und keine HTTP-/JS-Fehler.
- **CI-Ergebnisse erst nach tatsächlichem Workflow-Lauf dokumentieren.** Ein PR-Merge ist kein Pages-Deployment.
- Verbindliche Referenzen für die Charakteranimation selbst bleiben separat: das 12-Frame-Paket zeigt noch eine nicht vollständig abgenommene seitliche Ausrichtung. **Nur FX**, nicht die neuen Heldenanimationsatlanten, werden hier aktiviert.
- Physischer Android-4-GB-Test, Langzeitperformance und großformatige Art-Abnahme bleiben gesonderte QA-Kategorien.
