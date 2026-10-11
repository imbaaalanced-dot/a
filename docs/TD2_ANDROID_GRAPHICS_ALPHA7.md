# TD2 Android / Graphics Alpha.7 – Vorbereitung

## Implementiert in diesem Branch
- Android-Touch-Steuerung: aktiver Joystick erhält eine kontrastreiche visuelle Rückmeldung; Turm- und Aktionsbuttons mindestens 48px auf Geräten mit grobem Pointer.
- Animationseinstellungen: respektiert reduzierte Bewegung bei Interaktionen.
- Mobile Performance: bei `document.hidden` pausiert der Animationsloop Simulation und Renderarbeit; beim Zurückkehren wird der Zeitstempel aktualisiert, damit kein riesiger Delta-Sprung entsteht. Die bestehende 34-ms-Delta-Begrenzung bleibt.
- Bestehende Sprite-Atlanten, Projektil-FX, Menübilder und Low-FX-Modus bleiben erhalten. Keine neuen Pixel- oder Bildassets in diesem Patch; diese sollten nach Geräteprüfung separat als optimierte WebP-Atlanten ergänzt werden.
- Tests: `node tests/mobile-visual.test.cjs` + bestehende Gameplay-, Loot-, HUD-, Grafik- und Cache-Suiten.

## Android WebView / APK-Vorbereitung
Der aktuelle Build ist ein statisches Web-Spiel in `dist/`. Es wurde keine APK erzeugt.
1. Android Studio Projekt mit einer Activity und WebView anlegen, lokale Dateien über `WebViewAssetLoader` unter einer HTTPS-artigen lokalen URL bereitstellen. Dateien aus `dist/` als Assets übernehmen, relative CSS/JS/Bildpfade unverändert.
2. JavaScript und DOM Storage in der WebView aktivieren, damit Spiellogik und persistentes Loot funktionieren. Keine unsicheren universellen `file://`-Zugriffe einschalten.
3. Bildschirmorientierung für den vorgesehenen Portrait-Tester-Build einstellen; Status- und Navigationsleisten-Safe-Areas auf echten Geräten prüfen.
4. In der WebView Pause/Resume und Back-Navigation testen. Ein Android-Restart muss die gespeicherte Rüstkammer erhalten, App-Daten-Löschung hingegen nicht.
5. Android-Build signieren, Versionscodes vergeben, auf mindestens einem schwachen und einem mittleren Gerät Wellen 1–16, Joystick, UI-Überlagerung und Grafikmodi bei identischer Messmethode prüfen.
6. Vor einer Veröffentlichung Bildschirmaufnahmen, UI-Tests und manuelle Beutebackups erstellen; FPS sowie Frame-Spitzen dokumentieren.

## Nicht als nachgewiesen betrachten
- Browser-Akzeptanz, reale Touch-Latenz, niedrige FPS auf physischer Android-Hardware, Gerätespeicher-Verbrauch und fertige APK sind noch nicht gemessen.
- Dieser Patch verändert keine Gegnerwerte, Drop-Chancen, Speicherstruktur oder Leveldaten.
