# Welle 14–16: erste Sprite-Zuordnung

Basis: verifizierter `main` `0b958d323353e09e689d3b745d6afe0cf0469828`.

## Bestätigter Asset-Befund

Marcel, Angriff nach unten, Frame **4 nullbasiert** (fünftes Bild):

- Runtime: `dist/assets/hero/marcel-down-actions-v5b.webp`, 768×768 RGBA.
- Quellrechteck: x=512, y=256, Breite/Höhe=128; Angriffszeile 2.
- Originalframe: `source-art/hero/actions-v5/marcel/down/attack/04.png`.
- Die große violette Fläche innerhalb des cyanfarbenen Effektrings ist bereits im Original vorhanden. Alle vier Frameecken haben Alpha 0. Der Befund allein beweist keinen Fehler in Atlas-Koordinaten oder Animationswechseln.
- `TD2DirectionalActions.drawHeroSide` wählt dieses Rechteck bei Angriff nach unten mit Fortschritt 4/6 bis kleiner 5/6; reduzierte Darstellung verwendet Angriffsframe 3.

![Runtime-Frame 4, vierfach vergrößert](marcel-down-attack-frame4.png)

Die Fläche ist damit einem tatsächlich registrierten Heldenframe zugeordnet. Ob sie exakt das gemeldete Symptom in Welle 14–16 ist, bleibt ohne vergleichbare Spielreproduktion offen. Keine Grafikänderung und kein Nachher-Beleg vorhanden.

## Ausgeführte Prüfungen

- `python3 tests/active-hero-atlas-alpha.test.py`: bestanden, 96 Basisframes; zusätzliche Richtungsatlanten werden von diesem Test nicht geprüft.
- `python3 tests/enemy-animation-assets.test.py`: bestanden, 84 Bewegungsframes.
- `node tests/hero-direction-ready.test.cjs`: bestanden.
- `node tests/directional-actions-v410.test.cjs`: bestanden.
- Zusätzliche Pixelprüfung aller acht aktiven Helden-Aktionsatlanten (Zeilen 2, 4, 5): nur Marcel unten, Angriff Frame 4 überschritt den untersuchten Schwellenwert von 200 violetten Pixeln (815 Pixel: R/B>100, G<100, Alpha>100, min(R,B)>1,4×G). Farbschwelle ist ein Suchhilfsmittel, keine Freigabe zur automatischen Entfernung von Magie.

## Offen

Desktop-/Touch-Chromium-Reproduktion in Welle 14–16 mit protokolliertem Grafikmodus und Effekten, Bestätigung des gemeldeten Symptoms, anschließend gezielte Korrektur und Vorher-/Nachher-Beleg. FPS-Baseline und getrennte Bewegungs-/Kamera-/Effektmessungen sowie Bauhinweis, Vermächtnis und HUD folgen in der beauftragten Reihenfolge. Heldenleben unverändert lassen, bis ein Regelverstoß belegt ist. Physischer Android-Test mit 4 GB RAM und Veröffentlichung stehen aus.
