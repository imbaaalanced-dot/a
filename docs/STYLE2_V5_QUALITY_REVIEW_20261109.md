# Denkmal TD2: Style-2 V5 Grafik-Qualitätspass — 09.11.2026

## Scope und Sicherheit

Eigener Feature-Branch; keine Änderungen an `main`, Save-Keys, Gegnerwerten,
Wegfindung oder Build-Slots. Grafikperspektive und UI werden weiterhin auf
Android mit 4 GB RAM abgenommen; Desktop-/Node-Checks sind **keine** physische
Android-Freigabe. Neue Kunst ist künstlerisch angenähert und nicht als
millimetergenaue Denkmalsrekonstruktion belegt.

## 1. Helden (P0)

- **Repariert:** Beide Standard-Walk-Renderer verwenden echte 3x4-Sheets;
  die fälschlichen 4x1-Zuschnitte werden nicht mehr als 3x4 interpretiert.
- **Repariert:** Richtungsaktions-Manifest für Kim und Marcel zeigt auf die
  vollständigen 768x2304-Atlanten, nicht auf 96x96-Icons. Treffer-/Angriff-
  und Todesaktionen werden vor der Laufanimation angefragt.
- **Repariert:** V6-Szenenfreisteller für Marcel und Kim in Menü, Inventar,
  Charakterbild, Storyfenster und HUD; neuer Titel **Kim die Bewahrerin**. Beide zusammen
  benötigen als komprimiertes WebP etwa 260 KiB Übertragungsvolumen.
- **Repariert nach Fremdprüfung:** Walk-Sheets werden nicht mehr beide am
  Hauptmenü-Start geladen. Nur die gerade gezeichnete Figur bekommt ein
  3x4-Atlas-Bild; beim Figurenwechsel wird die alte Referenz freigegeben.
- **Offen:** Die vorhandenen 3x4-Lauf- und 4x12-Aktionsatlanten stellen noch
  ältere Charakterentwürfe dar (Marcel mit Laterne statt Schild/Schwert).
  Ein vollständiges Referenz-Lock-Movement-Sheet ist weiterhin erforderlich.
  V6-Freisteller haben kleinere warme Randfransen, die vor finaler Abnahme
  auf dunklem und hellem Hintergrund betrachtet werden müssen.

## 2. Schwerte-Westhofen (P0/P1)

- **Repariert:** Neues transparentes Hauptdenkmal-Sprite mit vier Pfeilern,
  geradem Steinbalken, Efeu, Flügelhelm, Schwert/Schild, Stufen, leerer
  Bronzetafel und zwei leeren Beckenpodesten. Falls die Bilddatei fehlt oder
  noch lädt, bleibt die bisherige Canvas-Darstellung aktiv.
- **Repariert:** Unlock-abhängige Level-7-Vorschau in der 2x2-Galerie;
  gesperrte Karten zeigen weiterhin nur Stadt und Schloss.
- **Offen:** Gebäudeproportionen und Bronzeformen benötigen einen Abgleich
  gegen sichere Fotos/Archivbelege; die Wege/Slots wurden bewusst nicht
  verändert. Android-Performance und Flächenkomposition noch abnehmen.

## 3. Ansturm-Gegner, Boss und Icons (P1)

- **Ersetzt:** `enemy_gargoyle.webp` (fremdes Felsfragment),
  `boss_stormlord.webp` (fremde Randobjekte), `icon_tesla.webp` (offener Rand).
  Die visuellen Quellen sind eigenständig bereinigte Style-2-Neufassungen,
  im bisherigen Zellmaß mit transparentem Sicherheitsrand. Die Quelle
  `ansturm-alpha1-5` und die Web-Distribution sind bytegleich. Die drei
  Assets besitzen neue Cache-URLs in beiden Manifests, bis hin zur
  versionierten Modulkette der Standalone-Ansturm-App.
- **Geprüft:** 52 Ansturm-Bilder in den Kategorien Gegner, Boss, Waffen,
  Icons und Effekte. Davon sind nach den Reparaturen 46 Randrisiken markiert
  (3 weitere Bosse, 7 Gegner, 12 Icons, 21 Waffen, 3 Effekte). Randkontakt
  allein ist *kein* bewiesener Bildfehler; beispielsweise können VFX-Trails
  absichtlich bis zur Kante laufen. Diagnose in
  `tests/ansturm-asset-edges.test.py`.
- **Offen:** 46 Einzelgrafiken bildlich unterscheiden in gewollte Trails,
  schlecht gecroppte Ornamente und Fremdpixel. Nicht massenhaft abschneiden.

## 4. Kampagnenlevel 3–6 (P1)

- **Repariert:** Shared Style-2-Material-Farben für Wald, Gras, Stein und
  warmes Kantenlicht; Level 3 (Kirchende), 4 (Dorfkirche), 5 (Hohensyburg),
  6 (Goethestraße) greifen auf dieselbe Palette zurück, wenn verfügbar.
  Bestehende Cache-Canvas, Platzierungen und historische Einzelgrafiken
  bleiben erhalten; keine zusätzlichen Allokationen je Frame.
- **Offen:** Materialpalette ist ein erster Gleichstellungs-Pass, **kein**
  vollständiger Austausch der flachen Geländegeometrie durch neue 2.5D-Art.
  Side-by-side-Screenshots und Übergänge bei Levelwechsel müssen folgen.

## 5. Effekte, Altbestände, Speicher (P1/P2)

- **Repariert:** Turm-Varianten wärmen passende Projektile nur einmal vor,
  statt bei jedem `drawTower`-Aufruf den Projektile-Cache erneut zu berühren.
  Der erste Schuss behält so den warmen WebP-Pfad, der Canvas-Fallback bleibt.
- **Belassen:** Rift-L3-Projektil V1 (violette Kante) und alte Fallback-Türme:
  keine ausreichend geprüfte Ersatzgrafik, und legitimer Magieglanz darf
  nicht mit Chroma-Key-Resten verwechselt werden. Portale für Ansturm nicht
  in Gameplay eingeführt; alte Gate-Dateien sind nicht aktiv referenziert.
- **Offen:** Referenz-Lock-Sprites, Rift-L3-Transparenz und alle 46 offenen
  Ansturm-Randkandidaten visuell freigeben. Keine pauschale Löschung von
  grafischen Legacy-Fallbacks.

## Abnahmekriterien vor `main`

1. Referenzvergleich Marcel/Kim **in Bewegung** und bei Angriff/Treffer.
2. Westhofen Hauptsprite im laufenden Spiel bei 64/128 px und Galerie-Thumbnail.
3. 46 Ansturm-Randkandidaten zumindest nach objektiver Bildprüfung triagieren.
4. Physisches Android (4 GB RAM), viele Gegner, 30 FPS als Minimalziel,
   Touch- und Ladepfade, keine unerklärte JS-Schleifenpause.
5. Altstabile Tests/CI und Preview-Veröffentlichung auf eigenem Branch.

Bis dahin: **Feature-Branch-Teststand, nicht produktionsfreigegeben.**

## Automatische Tests und bekannte Altfehler

- 89 Node-Tests, davon **83 bestanden** und sechs fehlgeschlagen.
  Die sechs Fehler sind schon auf unverändertem `bf7fe98` vorhanden:
  `menu-patch-a`, `style2-kirchende`, `touch-build`, `v4-alpha4`,
  `v4-alpha5`, `westhofen` (überwiegend veraltete Cache-Key-Assertions).
- 13 Python-Tests **alle bestanden**, einschließlich der Ansturm-Rand- und
  Paritätsprüfung.
- Syntaxprüfung der geänderten JS-Quelldateien bestanden.
- Chromium/Android 4 GB: **nicht getestet**, weil in der aktuellen Arbeits-
  umgebung kein lauffähiger Chromium-Build / physisches Zielgerät verfügbar ist.
