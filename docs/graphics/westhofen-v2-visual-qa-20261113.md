# Westhofen V2 — Sichtprüfung nach echtem Chromium-Test (13.11.2026)

**Befund: technisch bestanden, visuell NICHT freigegeben.** Quelle: tatsächlich erzeugte Screenshots von [Chromium-Run #43452298337](https://github.com/imbaaalanced-dot/a/actions/runs/43452298337), mit visuell geöffneten Review-Kontaktbögen aus [diesem CI-Review](https://github.com/imbaaalanced-dot/a/actions/runs/43496803180). Kein Vergleich mit bloßen Design-Mockups als Spielfehlernachweis.

## Nachweise und Grenzen

- **Desktop**: 1280×800, Level 7/Welle 121 intern, `memorialDrawCalls=4`, SVG 768×512, kein JavaScript-/HTTP-Fehler.
- **Touch-Emulation**: 412×915, Spiel-Canvas 288×641, `memorialDrawCalls=5`, kein JavaScript-/HTTP-Fehler.
- In beiden tatsächlichen Spielbildern steht das Denkmal sichtbar an der erwarteten Position im Level; historische Detailtreue ist *kein* Bestandteil dieses automatischen Checks.
- V2-Quelle: `dist/assets/westhofen/westhofen-memorial-style2-v2.svg`, Render-URL in `dist/westhofen-art.js`. Alte V1-WebP-Datei bleibt als Rollback.
- Fotovergleiche: vom Nutzer bereitgestellte Originalfotos `..._471.jpg` (Flügelhelm, Schild, Schwert), `..._10845.jpg` (Vorderseite), `..._10842.jpg` (Pfeiler und Stufen), `..._10813.jpg` (Außenanlage) und Video-Stills `frame-30.jpg` (Seitenrelief) / `frame-70.jpg` (Details). Diese privaten Bilder wurden **nicht** ins öffentliche GitHub-Repo kopiert. Aufnahmedaten nicht gesichert.
- Historische Zustandsdifferenz: In manchen Originalfotos sind eine beschriftete Mitteltafel und eine Feuerschale sichtbar; das aktuelle 2026-Referenzkonzept enthält eine leere Mitteltafelfassung und leere Schalenpodeste. **Keine Rückübernahme historisch früherer Teile ohne datierte Zustandsgenehmigung.**

## Visuelle Abweichungen — anhand der tatsächlichen 64-/128-px- und Ingame-Bilder

| Prio | Bauteil | Beobachtung | Erwartete Korrektur |
|---|---|---|---|
| P0 | Bronze-Flügelhelm | V2 zeigt zwei überlange, steile V-förmige Flügel mit wenig natürlicher Federkontur; die fotografierten Flügel sind plastisch gebogen und mit einzelnen Federrippen ausgebildet | Flügelproportionen, Krümmung, Oberkante, Metallpatina und Helmöffnung anhand Referenz genauer nachbilden; Silhouette bei 64 px lesbar |
| P0 | Schild/Schwert | V2-Schild wirkt klein/ornamental und stark zum Helm verschmolzen; breite ovale Schildplatte sowie deutlich horizontal ausgerichtetes Schwert aus den Fotos nicht klar erkennbar | Größeres, querovales Schild mit reliefartiger Struktur und sichtbarer horizontaler Schwertkontur, v. a. Griff auf der linken Seite |
| P1 | Steinrahmen | V2 vier nahezu gleichartige, regelmäßig quaderförmige Pfeiler; Original zeigt massive unregelmäßig verwitterte Steinblöcke, einen rauen breiten Träger, stärkere Tiefenstaffelung und dichten Bewuchs | Bruchkanten, Fugenversatz, Schatten, Steintiefe, authentische Querbalken-Silhouette; keine gotischen Torbögen |
| P1 | Altar-Seitenrelief | Auf dem V2-Altar keine fotografisch erkennbare Reliefszene; Original-Videostill zeigt ein plastisches Seitenmotiv | Relief als separat prüfbares Modul nach Video-/Fotoreferenz, keine erfundenen Figuren oder Bezeichnungen |
| P1 | Sockel/Podest | Stufen und monumentale Sockelelemente wirken im Spiel stark aufgehellt und geometrisch glatt; ein helles kantiges Rechteck unter dem Denkmal hebt sich gegenüber Gelände und Wegen deutlich ab | Materialkontrast, Erd-/Steinanschluss und Schlagschatten prüfen; Levelpfade/Bauplätze/Weltanker nicht verändern |
| P2 | Seitentafeln/Patina | V2 zeigt weitgehend dunkle, flache Platten; Fotografien zeigen großflächige patinierte Metalltafeln mit dichtem, flachem Schriftrelief | Keine frei erfundenen lesbaren Namen; reliefierte Oberflächenstruktur und Position verbessern, ohne Textlesbarkeit in 64 px vorzutäuschen |

## Produktions-Gates

1. **Nachbesserung nur in neuem Branch / separatem PR**, existierende V2 auf `main` als Rückfalloption erhalten.
2. Ein aktualisiertes, perspektivisch passendes transparentes 768×512-Komposit liefern; Module für Bronze, Steinrahmen, Altar/Relief getrennt behalten.
3. Pixelvergleich bei **64 und 128 px** auf dunklem und hellem Hintergrund sowie im echten Level-7-Screenshot. Dabei historische Bauform wichtiger als erfundene Dekoration.
4. Technische Kontrolle: visibler Alpha-Saum ≥8 px; keine opake rechteckige Hintergrundfläche; ein zentral decodiertes Asset statt duplizierter Einzelbilder; WebP möglichst unter 160 KB; unveränderter World-Anker 450×300.
5. Preflight und dedizierten Chromium-Desktop-/Touch-Test erneut laufen lassen. **Ein echter Android-4-GB-Test bleibt separat offen.**
6. Keine historische Freigabe, keine Behauptung neuer FPS- oder RAM-Verbesserungen ohne reale Messung; Merge und Deployment nur mit ausdrücklicher Freigabe.

**Fazit:** Das V2-SVG ist als Spielgrafik korrekt geladen, aber die Silhouette des zentralen Helms/Schilds und die Stein-/Reliefmaterialien verfehlen noch den verbindlichen Referenzstandard. Nicht als visuell abgenommen markieren.
