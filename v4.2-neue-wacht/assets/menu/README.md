# Menügrafiken menu-v3 (Hauptmenü-Redesign)

- `memorial-yard-v3.webp` (1536×1194) und `memorial-yard-mobile-v3.webp` (768×1194): neu generierte nächtliche Denkmalhof-Szenerie (verwitterte Steinbögen, Obelisk mit Bronzekranz und türkisem Runenlicht, Nebel, warmes Laternenlicht von links oben; linke Seite dunkel für das HTML-Menü). Über integriertes ImageGen erstellt; im Hauptmenü per `srcset`/`sizes` responsiv geladen, im Ansturm-Intro als lokale Kopie unter `dist/ansturm/assets/menu/`.
- `hero-banner-marcel-v3.webp` / `hero-banner-kim-v3.webp` (1440×720, 2:1): generierte Heldenplatten; Figur rechts, linke Fläche ruhig für die Beschriftung. Ersetzen die SVG-Auswahlbanner `heroes-*-selected-v2.svg`; die Heldenwahl in `game.js` lädt je nach gespeicherter Wahl eines der beiden Banner.
- `crest-v3.webp` (512×512, RGBA): generiertes Siegel-Wappen (steinerner Obelisk mit Lorbeerkranz und Runen auf transparentem Grund, runder Alpha-Cut). Ersetzt `crest-v2.webp` im Hauptmenü und im Ansturm-Intro.

Keine Texte, Buchstaben oder UI-Elemente in den Bildern; das Menü bleibt HTML/CSS und auch ohne Grafiken vollständig bedienbar.

## Bisherige Stände (historisch)

# Menügrafiken v3.6.0-alpha.2

- `warden-desktop-v2.webp`: neu generiertes Panorama; Referenzen: vom Nutzer bereitgestelltes Marcel-Portrait (834392760_1442213927344088_3014541429294144140_n.webp) und Menüentwurf (836918978_2407149409693980_8922459360205257372_n.webp).
- `warden-mobile-v2.webp`: komprimierte 640px-Variante des bereitgestellten Marcel-Portraits.
- `crest-v2.webp`: komprimiertes Wappen aus dem vorhandenen TD2-Grafikpaket (`logo.png`).

Generierung über integriertes ImageGen. Brief: breites dunkles Fantasy-Menüpanorama; derselbe Marcel mit schwarzer Cap, kurzem Bart, dunklem Umhang und blau leuchtender Laterne rechts; verfallener Denkmalhof mit Steinbögen, Nebel und warmem Abendlicht; links ruhige dunkle Fläche für HTML-Menü. Keine Schrift, Logos oder eingebrannten Schaltflächen. WebP-Ausgaben für kurze Ladezeiten. Das Menü selbst ist HTML/CSS und bleibt unabhängig von der Grafik bedienbar.

## Hero menu navigation (19 October 2026)

`kim-menu-banner-v1.webp` is the generated Kim banner, encoded as WebP for the game. `marcel-reference-banner-v1.webp` remains the existing Marcel reference banner. The saved `denkmal-character` choice selects both the top banner and the next gameplay character.

The four `button-*-v1.webp` assets are individual 1024×264 crops from the approved four-button sheet (top coordinates 190, 489, 784 and 1074). They are displayed inside native buttons with accessible labels; each opens its own submenu. All six campaign and endless map controls retain their existing unlock behavior. Settings use the existing sound, graphics, camera and FPS handlers.

## Menu and inventory polish

`churchyard-quiet-v1.webp` (768×1152) is the previous illustrated, character-free menu background (superseded by `memorial-yard-v3.webp` in menu-v3; kept for historical previews). `../hero/kim-inventory-portrait-v1.webp` (640×960) provides Kim's matching equipment portrait. Both were generated specifically for this pass and encoded to WebP. The banner caption tracks the selected hero. The four original button images use a flatter 5:1 display and subdued saturation; source labels remain legible and accessible through native buttons.

On phones, inventory equipment/backpack tabs and a bottom comparison sheet share the same persistent model as the desktop's three panels. Comparison lists both items, both values, signed gains/losses and any removed special power. Action ordering is equip, favorite, recycle. Destructive operations retain confirmation, favorite protection and main-menu guards.
