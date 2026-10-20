# TD2 Style 2 – Turmset 1–5: Asset- und Browser-QA

Stand: 20.10.2026. Branch `assets/style2-user-towers-1to5-20261020`, Draft PR #51 auf Alpha 9. Opt-in: `?td2UserTowers=1`. Kein Merge oder Live-Publishing.

## Geprüfter Bestand

- 15 Türme (5 Familien × 3 Stufen), 512×512 RGBA; 15 Projektile, 256×256 RGBA.
- 30 PNG-Master und 30 verlustfreie WebPs; alle Dateipfade vorhanden.
- `python tests/alpha9-user-towers.test.py`: alle 60 SHA-256-Werte, Abmessungen, Pivots, transparente Außenränder und PNG-/WebP-Pixelgleichheit bestanden.
- Bildpixel und Prüfsummen des freigegebenen Exports bleiben unverändert. Ein transparenter Außenrand beweist keine vollständige Ursprungssilhouette.
- Runtime-Dateien zusammen 1.476.344 Bytes. Alle 30 Bilder gleichzeitig entsprechen rechnerisch 18,75 MiB RGBA, ohne Browser-/GPU-Overhead. Der Spielrenderer hält nur besuchte Turm-/Stufenvarianten und ihre Projektile; der Sichttest lädt ausdrücklich alle Varianten.

## Aktuelle Fortsetzung: Pass 3

Bogen, Kanone, Eis/Magie und Bumerang verwenden inzwischen bereinigte Varianten in allen drei Stufen. Die drei Rift-Türme bleiben unverändert. Aktuelle Prüfungen und Vorschau: [Cleanup Pass 3](STYLE2_CLEANUP_PASS3.md). Die älteren Nachweise unten bleiben als historische Prüfstände erhalten.

## Ergänzung: Grafikbereinigung Pass 2

Die nachstehenden ursprünglichen Quellmängel bleiben im unveränderten V1-Export dokumentiert. Im aktiven Opt-in werden Kanone L1 und Eisprojektil L2 inzwischen durch zwei versionierte Bereinigungen ersetzt. Details, Prüfungen und aktuelle Vorschau: [Cleanup Pass 2](STYLE2_CLEANUP_PASS2.md). Die ursprünglichen Browsernachweise unten beziehen sich auf den vorherigen Rendererstand.

## Renderer-Korrekturen

1. Ein sichtbarer Turm lädt sein passendes Projektil bereits vor dem ersten Schuss. Kein pauschales Vorladen des ganzen Sets im Spiel.
2. Der Ausgangswinkel der Quellkunst wird vor der Flugrichtung abgezogen: Bogen L1–3 ungefähr +30°, längliche Magie-/Riftgeschosse L1–2 ungefähr −45°. Runde L3-Geschosse bleiben ohne zusätzliche Winkelkorrektur; Bumerangs behalten ihre Rotation.
3. Eine horizontale Geschwindigkeit von exakt null bleibt null (`??` statt `||`). Dadurch bleiben senkrechte Schüsse auch bei kleinen Geschwindigkeitswerten korrekt ausgerichtet.
4. Der Adapter gibt bei noch ladenden Bildern weiterhin `false` zurück, ohne Canvas-Operationen. `game.js` zeichnet dann über die vorhandenen Fallbacks weiter. Transformationszustand bleibt ausgeglichen.
5. JavaScript-Cache-Key `user-towers-2`; die unveränderten Bilddateien behalten ihren bisherigen Key. Bodenanker `[256, 488]`, Upgrade-Sterne und Spielstände bleiben erhalten.

## Tatsächlich ausgeführte Prüfungen

- **48 Projekt-Prüfkommandos aus `.github/workflows/test.yml`: 0 Fehler**, einschließlich der mobilen Gameplay-Variante und aller fünf Pillow-Prüfungen.
- Ergänzte Node-Regressionen wurden zunächst gegen die fehlende Korrektur rot, anschließend grün ausgeführt: Vorladen, vier Pfeilrichtungen, senkrechte Riftgeschosse und Eisprojektilausrichtung.
- **Chromium 133.0.6943.0**, lokal mit Software-Rendering: Desktop 1280×900 und Touch-Emulation 412×915. Kein realer Android-Browser.
- In beiden Browserfällen: Opt-out erzeugt keine Requests für dieses Runtime-Set; Kaltstart gibt an den alten Renderer zurück; **30/30 echte WebP-Decodes und 30/30 sichtbare Canvas-Ausgaben**; keine beobachteten JavaScript-Ausnahmen oder HTTP-Fehlerantworten.
- Alle sechs Level im Alpha-9-Testpfad geöffnet. Die Screenshots zeigen anschließend eine **synthetische Anordnung aller 15 Turmstufen in Kirchende**. Das höhere Turmlimit gilt ausschließlich in der Test-Fixture; Produktions-Balancing wird nicht geändert.
- Miniaturen bei 64 und 128 Pixeln visuell geprüft. Die 128-Pixel-Ansichten zeigen Holz/Metall/Eismagie/Rift und Stufenunterschiede klarer; schmale Türme verlieren bei 64 Pixeln erwartungsgemäß Mikrodetaillierung.

Nachweise:

- [Miniaturvergleich 64/128 px](qa/style2-towers-20261020/towers-64-128.png)
- [Desktop-Spielszene](qa/style2-towers-20261020/game-desktop.png)
- [Touch-Emulation im Hochformat](qa/style2-towers-20261020/game-touch-portrait.png)
- [Maschinenlesbarer Browserbericht mit Renderer-SHA-256](qa/style2-towers-20261020/report.json)

Optional reproduzieren, wenn Playwright mit Chromium installiert ist:

```bash
node tools/verify-user-style2-browser.cjs
```

`CHROMIUM_EXECUTABLE` setzt bei Bedarf den Browserpfad, `TD2_QA_OUT` den Ausgabeordner. Standardausgabe liegt unter `/tmp/td2-style2-browser-qa`. Playwright ist eine Prüfabhängigkeit, keine Spielabhängigkeit.

## Offene Grafikmängel und Abnahme

- Dünne magentafarbene Säume sind unter anderem an `tower_cannon_lv1` sichtbar. Rift-Violett darf nicht pauschal herausgefiltert werden.
- `projectile_mage_lv2` enthält rechts unten einen abgesetzten Fremdpartikel aus dem Quellzuschnitt. Er wurde dokumentiert und nicht unbemerkt retuschiert.
- Bereits im Original abgeschnittene Partikel/Glows können durch den Export nicht rekonstruiert werden.
- Die Eisoptik des `mage` passt zur vorhandenen Verlangsamung; eine darüber hinausgehende Änderung der Rolle ist nicht Teil dieses Patches.
- Echte Android-/WebView-Prüfung, lange Arcade-Runs, FPS-/Framezeitmessung und GPU-Speicher sind **offen bzw. nicht gemessen**. Dieser Browser-Smoke-Test beweist keine vollständige Flackerfreiheit.
- Bestehende Impact-Effekte werden weiterverwendet; neue Einschlaganimationen wurden nicht erzeugt. PR bleibt Draft.

## Nächster gezielter Produktionsprompt (noch nicht generiert)

Referenz: `projectile_mage_lv2.png`, PNG-Master 256×256. Entferne ausschließlich den abgesetzten Fremdpartikel rechts unten und offensichtlich magentafarbene Freistellungsreste. Erhalte den blau leuchtenden Eiskristall, die Bronzeeinfassung, die bestehende diagonale Ansicht, Silhouette, Größe, Lichtführung und das Zentrum bei `[128,128]`. Ausgabe: derselbe 256×256-RGBA-Canvas mit echter Transparenz; Lesbarkeit bei 64/128 px prüfen. **Nicht** den Kristall neu gestalten, **nicht** Ausrüstung oder Material ändern, **nicht** Zoom/Kamera/Pivot verschieben, **nicht** legitime blaue Magie entfernen. Erst nach eigenständiger Sichtprüfung PNG-/WebP-Paar und Prüfsummen versioniert ersetzen.

Ergebnisstufe dieses Schrittes: **integrierter, lokal im Browser geprüfter Rendererpatch**; Quellkunst mit dokumentierten Mängeln, reale Geräteabnahme ausstehend.
