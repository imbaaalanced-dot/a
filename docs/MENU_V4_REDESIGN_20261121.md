# Hauptmenü v4 „Herbstwacht“ (2026-11-21)

Vollständiges grafisches Redesign des Hauptmenüs in einem einheitlichen,
handgemalten Dark-Fantasy-Herbststil auf Basis der realen Denkmal-Referenzfotos.
Alle Menüebenen (Startszene, Wappen, Kampagnen-Galerie) benutzen jetzt dieselbe
Licht- und Materialsprache; die spielbaren Helden-Assets (Marcel/Kim) bleiben
unangetastet (RESOURCE LOCK).

## Stilanker

Handgemalter Herbstabend: tiefblaugrauer Abendhimmel, warmes Gold-Seitenlicht von
links, Bodennebel, nass-dunkler Schieferboden mit Bernsteinlaub, türkises Runenlicht
als Verbündeten-Akzent. Palette und Regeln siehe `ART-DIRECTION.md`, Abschnitt
„Hauptmenü v4 ‚Herbstwacht’“.

## Neue bzw. ersetzte Assets (alle in `dist/assets/menu/` bzw. `.../level-gallery/`)

| Datei | Inhalt | Foto-Grundlage / Begründung |
|---|---|---|
| `memorial-yard-v4.webp` (1536×1194) | Denkmalhof-Startszene: Obelisk mit Runenlicht, Steinbogen, Laterne | Denkmäler-Ikonografie des Kanals; generiert, kein Foto-Edit |
| `memorial-yard-mobile-v4.webp` (768×1194) | Hochformat-Variante für ≤700px | wie oben |
| `crest-v4.webp` (512×512, RGBA) | Rundwappen mit Bronzering, echte Transparenz | ersetzt crest-v3 |
| `level-gallery/level-01-einleitung.webp` | Vier Tore mit türkisem Runenlicht (exakt vier, gegengeprüft) | Leveldesign Einleitung |
| `level-gallery/level-02-labyrinth.webp` | Hecken-Wegkreuzung mit Obelisk | Leveldesign Labyrinth |
| `level-gallery/level-03-kirchende.webp` | Kriegerdenkmal Kirchende (Heldendenkmal) | verkleinert aus dem freigegebenen 1920×1080-Level-Vorschaugemälde (Level-3-Workflow) |
| `level-gallery/level-04-ender-dorfkirche.webp` | Bruchstein-Kirche mit Westturm/Schieferhelm, schlafender Löwe auf hohem Sockel mit Bronzetafel | Referenzfoto Ender Dorfkirche |
| `level-gallery/level-05-hohensyburg.webp` | Kaiser-Wilhelm-Turm mit Reiterstandbild in Nische, „18. JANUAR 1871“ | Referenzfoto Kaiser-Wilhelm-Denkmal Hohensyburg |
| `level-gallery/level-06-goethestrasse.webp` | Zwei Kalkstein-Pfeiler mit Kreuzkappen, verbindende Wand mit Dreiecksgiebel, sitzender Soldat (Kopf in Hand) | Referenzfoto Ehrenmal Herdecker Goethestraße |
| `level-gallery/level-07-westhofen.webp` | Geflügelter Bronze-Helm, Schild+Schwert als Relief, LEERE zentrale Tafel, bare Flankierpfeiler | Referenzfoto Kriegerdenkmal Westhofen; leere Tafel dokumentiert den bronze-Diebstahl 07/2026 |
| `level-gallery/card-unlocked.webp`, `card-locked.webp` (740×795) | Bronze- bzw. kalter Slate-Kartenrahmen | Rahmen-Design v4 |
| `level-gallery/menu-background.webp` (1024×768) | stark abgedunkelte Parktextur (Kampagnen-Panel) | ersetzt v3 inhaltlich |

Alle Assets wurden per Vision-Gegenprüfung gegen die Referenzfotos abgenommen
(4 Tore, Löwe, Reiter/Widmungstext im Turm, Soldatenpose, leere Westhofen-Tafel).

## Code-Änderungen

- `dist/menu-v4.css` (NEU): komplette Optik-Schicht „Herbstwacht“ als letztes
  Stylesheet; überschreibt die letzten v3-Bildreferenzen aus `menu.css`
  (Ansturm-Plakette, Hero-Platte) und restyled Masthead, Plaketten, Sektionen,
  Galerie und Footer. `menu.css` bleibt unverändert (dessen Quelltext ist von
  Tests per Regex geprüft). Fokus-Ringe bleiben türkis (`#9ce9ee`).
- `dist/index.html`: v4-Szenen-/Wappen-Bilder mit `?v=menu-v4a1`,
  `menu-v4.css` als letzte CSS-Referenz, neue Cache-Keys für `preloader.js`
  (`menu-v4-20261121`) und `level-gallery.js` (`menu-v4a1`).
- `dist/preloader.js`: essential-Set auf `memorial-yard(-mobile)-v4.webp` und
  `crest-v4.webp` umgestellt (jeweils mit `?v=menu-v4a1`).
- `dist/level-gallery.js`: Galeriebilder laden mit `?v=menu-v4a1`.
- `dist/ansturm/index.html` und `ansturm-alpha1-5/index.html` (identisch):
  Ansturm-Intro auf v4-Hof und v4-Wappen umgestellt; v4-Assets zusätzlich nach
  `dist/ansturm/assets/menu/` kopiert (Quelle-Deploy-Parität bleibt grün).

## Tests (alle grün, 2026-11-21)

Vollständige Node-Suite (142 Dateien) sowie `tests/assets.test.py` (inkl. neuer
v4-Budget-/Alpha-Checks für Denkmalhof, Mobile-Variante, Wappen) und
`tests/assets-headers.test.py` (29 Assets) bestanden lokal.
Angepasst: `preloader.test.cjs`, `menu-v3b-preload.test.cjs`,
`cache-busting.test.cjs` (Map-Stand: + `menu-v4.css`, neue Keys),
`assets.test.py`, `assets-headers.test.py`.

## v3-Altlasten (Aufräum-Patch nach Merge)

Die v3-Dateien (`memorial-yard-v3.webp`, `memorial-yard-mobile-v3.webp`,
`crest-v3.webp`) bleiben zunächst im Repo, weil `menu.css` und einige Tests sie weiterhin referenzieren; geladen werden sie durch die v4-Overrides nicht mehr.
Ein separater Cleanup-Patch kann nach Abnahme v3 aus `menu.css` und den Tests
entfernen. `level-…-webp`-Galeriedateien heißen bewusst gleich wie zuvor
(In-Place-Ersetzung, Cache über `?v=…` gebrochen).

## Update 2026-11-21 (Abend): Westhofen-Karte v2, näher am Original

Die Kampagnen-Karte VII (Westhofen) wurde neu gerendert und ersetzt die erste
v4-Fassung, die erfundene Details enthielt (Kreuzschwert-Relief auf der Front,
fehlender Querbalken, steinern statt bronzenener Block). Basis der neuen Karte
ist die freigegebene Westhofen-Level-Vorschau vom 05.11.2026 (Drive
„Denk-mal Branding“): geflügelter Wikingerhelm als Skulptur auf dem zentralen
Bronzeblock (mit Patina/Goldglanz, glatte LEERE Front ohne Reliefs), zwei
Efeu-Pfeiler mit sichtbarem Querbalken darüber, Herbstabend-Stilanker. Erzeugt
als Landschaftsgenerierung mit Struktur-Beschreibung aus der offiziellen
Referenz + 8/9-Punkte-Vision-Check + gezieltem Bronze-Fix per Bildbearbeitung;
640×360 WebP (34 KB). Galerie-Cache-Key auf `?v=menu-v4a2` gebumpt
(`level-gallery.js` + Ladevariable in `index.html`, Map im Cache-Busting-Test).
