# Denkmal TD2 · Style-2-Art-Abnahme in verbindlicher Reihenfolge

Stand: 12.11.2026. Dies ist ein QA- und Produktionsplan, **keine Grafikfreigabe**.

## 1. Helden Kim und Marcel (Sperre für nachfolgende Stufen)

Aktiv auf `main`: `dist/canonical-hero-art-v5.js` verweist auf vier V5b-WebP-Atlanten.
- Bewegung: je 3 × 4 Frames zu 256 × 256 Pixeln (`*-walk-v5b.webp`).
- Aktionen: je 6 × 6 Frames zu 128 × 128 Pixeln (`*-side-actions-v5b.webp`).
- Aktiv verwendete Aktionstypen: `attack` Reihe 2, `hit` Reihe 4, `death` Reihe 5. Sechs Frames je Typ.
- Bodenpivots: Marcel `[64,116]` bei `height:95` / Blickrichtung **rechts**; Kim `[64,117]` bei `height:100` / Blickrichtung **links**.
- Nicht vorhandene Richtungen sind ausdrücklich kein fertiger Action-Atlas. Die Laufgrafik ist der vorgesehene Fallback; keine gespiegelten Waffen oder erfundenen Angriffsframes.

**Abnahmekriterien:** Authentische Kim-/Marcel-Identität anhand freigegebener Referenzen; 128er Zellmaß, echte RGBA-Transparenz, keine Hintergrundreste, mindestens zwei Pixel Abstand zum Frame-Rand; identischer Pivot je Aktionsart und Richtung; eigenständig gezeichnete erforderliche Richtungen; WebP-Dekodierung, konsistentes Einzeichnen im Canvas und Speicherbudget für Android mit 4 GB RAM. Pixeltests ersetzen keine manuelle Stilabnahme.

Die neu im Chat erzeugten Animationskonzepte vom 12.11. sind wegen unregelmäßiger Zellstruktur und abweichender Charakterdarstellung **nicht** für den Runtime-Einsatz freigegeben. Vorhandene V5b-Atlanten bleiben unangetastet. `tests/hero-action-pivot-contract.test.cjs` sichert die aktuellen festen Renderer-Anker, 36 tatsächlich adressierte Aktionsframes, Canvas-Zustand und den ungeflippten Richtungs-Fallback ab.

## 2. Gegner- und Bossatlanten

Erst nach abgenommenen Helden die **im Runtime-Manifest tatsächlich registrierten** Gegnertypen prüfen: Idle, Walk, Attack, Hit, Death, Spezial nur wenn implementiert. Einheitliche erhöhte Spielkamera, Silhouetten, Lichteinfall links oben, Pivots, sichere Zellränder, echte Alphafreistellung. Bosse mit Angriffstelegraph und Hit-/Death-Timing gegenüber Spielcode abgleichen. Kampagne und Ansturm separat auf Framezeiten und Cachelast prüfen.

## 3. Materialien, Effekte und UI einzeln

Reihenfolge: (a) Boden und Wegmaterial; (b) Wegränder, Bäume, Mauern, Landmarken; (c) Licht, Nebel, Laub, Projektile, Treffer; (d) Hauptmenü, HUD, Inventar und Touch-Icons. Prüfen auf historische Referenztreue, Projektion, Edge-Bleeding, Kontrast, Draw-Order, Ladefehler und Android-RAM-Budget. Jede Klasse erhält einen eigenen QA-Nachweis.

## Merge- und Release-Sperre

Neue Assets nur auf Entwicklungsbranch. Merge nach `main` erst nach verpflichtender CI, Desktop- und Touch-Chromium-Smoke, visueller Abnahme und Einhaltung des Schutzregelwerks. Realer Android-4-GB-Test separat; Chromium ist **kein** Android-Gerätetest. Ein erfolgreicher Merge ist **kein** bestätigtes Pages-Deployment.


### Fortsetzung: technische Vorbereitung pro Blickrichtung

- `dist/directional-actions-v410.js` kann künftig `sheets:{down:'...',left:'...',right:'...',up:'...'}` pro Held verwenden. Nicht vorhandene Richtungen werden **nicht** vorgetäuscht und bleiben Fallback auf den bestehenden V5b-Laufatlas.
- Jede zusätzlich registrierte Atlasdatei erbt Framegröße `128`, sechs Frames, die Zeilen `attack:2, hit:4, death:5` und den bisherigen festen Bodenanker. Eine Aliasdatei auf das bestehende Seitenbild wird nicht als neue Richtung akzeptiert.
- `tools/verify-hero-direction-candidate.py` prüft vor der Registrierung jedes vorgeschlagene WebP auf 768 × 768, RGBA, 18 aktiv adressierte Frames, transparente Flächen, freie Zellecken, Zellränder und Dekodierung. `pixel_gate=pass` bedeutet **nicht** künstlerisch abgenommen.
- Der neu erzeugte Konzeptbogen für beide Helden vom 12.11.2026 besitzt keinen echten transparenten Hintergrund (Alpha-Werte 214 bis 251, keine vollständig transparenten Pixel). **Eingangsprüfung abgelehnt; nicht eingebaut.**
- Status zum Zeitpunkt dieser Dokumentation: neue Richtungsdateien **fehlen** weiterhin. Aktive V5b-WebPs und deren Runtime-Verweise wurden nicht ersetzt.

