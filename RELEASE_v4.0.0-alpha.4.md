# Release v4.0.0-alpha.4 — Kampfsystem, FX und Menü-Überarbeitung

Ziel dieses Releases ist ein **stabiler V4 Alpha 4 Tester-Build** auf Basis des exakten Alpha-3-Stands. Basis ist der Branch `v4-kirchende` @ `069a67f` (identisch mit dem zuletzt veröffentlichten Tester `v4-alpha3/` auf `gh-pages`), entwickelt auf dem separaten Branch `feature/td2-v4-alpha4-combat`.

## Ausgangslage

- Der veröffentlichte Alpha-3-Build (`https://imbaaalanced-dot.github.io/a/v4-alpha3/`) entspricht `v4-kirchende` @ `069a67f` **plus zwei Hotfixes, die nur auf `gh-pages` existieren**:
  1. `monumentImage.src='assets/monument-level1-v2.webp'` (statt `…-v1.webp`) in `dist/game.js`,
  2. Guard in `drawMonument`: das `DenkmalArt`-Overlay wird nur für `game.level!==1` gezeichnet, damit Level 1 weiterhin das Monument-Bild rendert.
- Beide Hotfixes sind in Alpha 4 **zurückportiert**; damit ist der Quellcode wieder die einzige Quelle der Wahrheit.
- **Wichtig:** `assets/monument-level1-v2.webp` liegt bisher nur auf `gh-pages` vor. Der Pages-Workflow kopiert das Asset beim manuellen Deploy aus `v4-alpha3/` in `v4-alpha4/` (Fallback). Empfehlung: das Asset zeitnah auf einen Branch einchecken.

## Kampfsystem: Warum Türme bewegte Gegner verfehlt haben

**Ursachenanalyse (Alpha 3):**

1. **Keine Zielvorhersage:** `shoot()` zielte auf die *aktuelle* Gegnerposition. Bei 520 px/s Geschoss und einem Läufer mit 106 px/s war das Geschoss beim Einschlag deutlich veraltet — bei kurzer Reichweite und hohem Gegnertempo systematisches Daneben.
2. **Uneinheitliche Projektilgeschwindigkeiten:** Die Tower-Loop nutzte hart kodierte, inkonsistente Geschwindigkeiten (`ballista 610 / cannon 350 / mortar 275 / sonst 460`), die nicht zur Reichweite und Feuerrate passten.
3. **Keine Bewegungsinformation:** Gegner hatten kein Geschwindigkeitsmaß; eine Vorhersage war gar nicht möglich.
4. **Treffererkennung:** Die Segment-Kollision (`segmentDistance` zwischen `prevX/prevY` und `x/y`) war bereits korrekt; sie blieb unverändert. Verfehlt wurde *vor* der Kollision — beim Zielen.

**Lösung (Alpha 4):**

- `interceptPoint(from,target,speed)` löst iterativ (3 Schritte, Deckel 1,05 s) den Vorhaltepunkt: `aim = target.pos + target.vel * t`. Stehende Ziele werden exakt getroffen (kein Vorhalten, keine Einbußen für Boss-Stationärziele).
- **Velocity-Messung pro Frame:** Nach der Gegner-Bewegung (und vor der Tower-Loop) wird `velX/velY` aus der tatsächlichen Positionsänderung gemessen (`prevX/prevY`). Es wird nichts „fabriziert“: stehende Gegner behalten exakt `(0,0)`; Slow-Faktoren und Rutenwege fließen automatisch ein.
- **Update-Reihenfolge umgebaut:** Hero → Spawn → Kirchende-Support → Gegner-Bewegung → Cleanup → Velocity-Pass → Türme → Projektile. Damit feuert jeder Turm mit der *frischen* Geschwindigkeit des Ziels — nicht mit der vom Vorframe.
- **Vereinheitlichte Geschwindigkeiten** über `projectileSpeed(kind)`: Bogen 520, Kanone 430, Mörser 350, Balliste 660, Magie/Rift/Schrein/Laterne 520, Dorn 560, Held 560 px/s. Langsame, weitreichende Mörser führen jetzt sichtbar stärker vor.
- Kollisionsprüfung (`segmentDistance`/`segmentProjection`) und Treffererkennung blieben unverändert — ein Geschoss, das die Radius-Schwelle verpasst, trifft weiterhin nicht.

## Schussgrafiken, Partikeleffekte und Trefferanimationen

`dist/combat-fx.js` wurde überarbeitet, mit unveränderten Verträgen (Partikel-Cap 240, `life===max` für alle Partikel, Schadenszahlen-Cap, 55-ms-Sound-Drossel, 8-Stimmen-Limit, kein Sound vor der ersten Geste, `reduced` spart Partikel):

- **Einschlag:** expandierender Schockring am Trefferpunkt, gerichtete Trümmer entgegen der Flugrichtung, weißer Kernblitz; Kanonen/Mörser zusätzlich Rauch.
- **Schuss:** Mündungsfeuer entlang der Abschussrichtung plus Blitz.
- **Rift-Kette:** `fx.bolt()` zeichnet sichtbare Blitzbögen zwischen den Kettenzielen (in `game.js` nach jedem Ketten-Treffer aufgerufen).
- **Projektile:** Motion-Streaks skalieren mit der Geschwindigkeit; der SVG-Atlas `assets/projectile-fx-v3.svg` bleibt erster Renderer, der prozedurale Fallback erhalten.
- **Schadenszahlen:** Pop-Scale beim Erscheinen.

## Überlappendes Ingame-Menü und Android-Touch

- Ursache: `.hud-menu-panel` hatte `z-index:30` (polish.css) bzw. `25` (portrait-patch.css) und lag damit **über** Pausen-/Story-/LevelComplete-Overlays (z-index 10+).
- Fix: Panel auf `z-index:8` — unter allen Modal-Overlays, über dem Spielfeld.
- Das Menü ist jetzt adressierbar (`id="hudMenu"`) und wird deterministisch geschlossen: bei jedem Bildschirmwechsel (`closeScreens()`), beim Öffnen des Inventars, bei Tap/Click auf das Spielfeld außerhalb des Menüs und über `closeHudMenu()`.
- Neuer **PAUSE-Button im Menü** (`menuPauseBtn`), der wie der HUD-PAUSE-Button nur während des Spiels aktiv ist.
- Touch-Polish (portrait): `touch-action:manipulation` (kein Doppel-Tap-Zoom), `-webkit-tap-highlight-color:transparent`, `overscroll-behavior:contain`, mindest. 48px-Tap-Flächen, Schatten für das Panel.
- `contextmenu` auf dem Canvas wird unterdrückt (kein Android-Long-Press-Menü über dem Spielfeld).

## Erhaltene Systeme

Kampagne (Einleitung → Labyrinth → Kirchende), Endlosmodus, Level-Freischaltungen (`denkmal-level2-unlocked-v1`, Kirchende-Reward), Beute-Inventar und Rüstkammer (loot.js), Spielstände (localStorage-Keys unverändert, inkl. `td2-v4-intro-tutorial`), Intro-Tutorial, alle Turm-/Gegnerrollen, Synergien, Zielprioritäten und die Alpha-3-Hotfixes sind vollständig erhalten und durch Tests abgesichert.

## Regressionstests

Neu: **`tests/v4-alpha4.test.cjs`** — 10 Checks:

1. Intercept-Prädiktion: exakt für stehende Ziele, gedeckte und adaptive Vorhaltung für Läufer.
2. Geschwindigkeitstabelle aller Türme + Held 560.
3. Bogen-Turm trifft Läufer: Schuss zielt exakt auf den Vorhaltepunkt (`cosLead>cosNow`), Treffer nach 60 Frames.
4. Velocity-Tracking: Messung ab dem ersten echten Schritt, stabil über Frames, stehende Gegner exakt 0.
5. Verlangsamte Gegner werden entlang ihres verlangsamten Pfads vor gehalten.
6. Einschlag-Bursts: Schockring, gerichtete Trümmer, `life===max`.
7. Rift-Kettenblitz zeichnet sichtbare Partikel zwischen Zielen (FX + Game-Verkabelung).
8. Menü-Routing: PAUSE, `closeHudMenu()`, Schließen bei jedem Bildschirmwechsel.
9. Shell-Verträge: alpha.4-Badge, 15× Cache-Bust `v400a4a1`, `id="hudMenu"`, `menuPauseBtn`, z-index 8, Touch-Regeln.
10. Persistenz: Freischalt- und Tutorial-Keys, Loot-Modell, Kollisions-Grenzfall (Radius+1 verfehlt).

Alle 5 Suiten (main-menu, intro-tutorial, game × Desktop/Mobile, combat-fx, v4-alpha4) sind grün — lokal (Desktop + `TEST_MOBILE=1`) und via CI. `tests/game.test.cjs` wurde minimal angepasst (Monument-Sprite-Assertion v1→v2, Hotfix-Backport).

## CI & Deployment

- `test.yml`: Suite läuft jetzt auch bei Push auf `feature/td2-v4-alpha4-combat` und bei PRs gegen `v4-kirchende`; neuer Schritt `node tests/v4-alpha4.test.cjs`.
- `pages.yml`: Verifikation um die Alpha-4-Suite erweitert. **Alpha 4 wird nicht automatisch deployt**: Der neue Schritt „Publish isolated V4 alpha 4 tester path“ veröffentlicht `v4-alpha4/` ausschließlich per **manuellem `workflow_dispatch`** (Branch `feature/td2-v4-alpha4-combat` oder `v4-kirchende`), mit Fallback-Kopie des Monument-Assets aus `v4-alpha3/`. Der Root-Publish schließt `v4-alpha4/` aus.
- **Kein Merge auf `main`, kein automatisches Deployment** — nur nach ausdrücklicher Freigabe.

## Bekannte Einschränkungen

- `assets/monument-level1-v2.webp` existiert nur auf `gh-pages` (Workflow-Fallback greift); sollte auf einen Branch eingecheckt werden.
- Long-Press-Kontextmenüs auf älteren Android-WebViews sind unterdrückt, aber nicht auf allen Geräten getestet.
- Ein Langzeit-Test auf echten Android-Geräten bleibt Teil des Testings.
