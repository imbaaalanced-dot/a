# Kriegerdenkmal Heven (Witten) — Level 8 „Witten-Heven“: Leveldesign-Entwurf

Stand: 26.11.2026. Design-Phase (noch keine Code-Änderung). Realbasis:
Foto-Referenz `docs/WITTEN_HEVEN_PHOTO_REFERENCE_20261126.md` (12 Cloudinary-Fotos
`kdwupper423048-0..11`) und 40 verbleibende Cutout-Assets im Cloudinary-Ordner
`Witten heven` (`Meta_AI_*_cutout_*`; `monument_cutout` und 3 saisonale Assets
wurden bereits als unpassend gelöscht). Kampagnen-Position: nach Level 7
Westhofen, Wellen 29–32.

## Reales Denkmal — Designgrundlage

- Vier hohe, quadratische, sich verjüngende Steinpfeiler aus dunklem Stein, eng
  beieinander auf leicht erhöhter Steinplattform mit niedriger Einfassungsmauer.
- Schmiedeeisernes Kreuz auf dünnem Metallstab zwischen den mittleren Pfeilern.
- Zentrale Tafel mit Goldinschrift „TREUE UM TREUE / DEN UNVERGESSENEN IM
  WELTKRIEGE GEFALLENEN SÖHNEN DER HEIMAT! / DIE BÜRGER VON HEVEN“, Herz+Anker.
- Dahinter/seitlich: Bruchsteinwand mit eingelassenen Metall-Namenstafeln und
  Eisernem Kreuz (Fotos `-6`..`-11`); keine lesbaren Namen übernehmen.
- Gelände: grasbewachsener Hügel/Waldlichtung, kahle Laubbäume (Herbst/Winter),
  Laubboden, kleine Steintreppe zum Denkmal (Foto `-1`). Keine Straße, keine
  Bänke/Laternen in den Fotos.

## Karte: Spawns, Wege, Sperrflächen

Koordinaten wie üblich als Offsets vom Zentrumpunkt (0,0) = Denkmal
(Welt 3072×3072, `point()` in `dist/levels.js`).

**Sperrfläche Plattform** (Monument steht erhöht, Fotos `-3`): Block-Rechteck
plus Treppenstreifen im Süden, analog `syburgTerrace`:

```js
hevenPlatform = { left:-300, right:300, top:-300, bottom:300,
                  stair:{ x:0, top:300, bottom:540, width:150 } }
```

Slots werden mit 45 px Padding zur Plattform und 65 px zur Treppe ausgeschlossen;
Pfade dürfen die Treppe queren (wie Terrassenwege bei Hohensyburg).

**Deko-Sperrband Mauer** (Gedenkwand im Norden, Fotos `-6`..`-11`): gebogener
Mauerzug auf y≈-360 von x=-420..420 (`mauer_gebogen_links/mitte`, `mauer_L` an
den Enden); Slots zusätzlich ≥70 px zu diesem Band. Südeingang bleibt offen,
`mauer_efeu_bogen` als Bogen über der Treppe (rein visuell).

**Gates/Pfade** (3 Boden + 1 Luft, Muster wie Westhofen/Goethestraße):

| Gate | Label | Weg (Offsets) |
| --- | --- | --- |
| 0 | `WALDRAND WEST` | `(-1060,-430) → (-760,-330) → (-520,-210) → (-330,-90) → (0,0)` |
| 1 | `WALDRAND OST` | `(1040,-520) → (760,-380) → (520,-220) → (300,-90) → (0,0)` |
| 2 | `ZUGANG SÜD` | `(80,1060) → (40,700) → (0,540) → (0,0)` (quert die Treppe) |
| Luft | `HIMMEL NORD` | `airGate: point(0,-1020)` |

Beide Waldwege münden nahe dem Plattformrand zusammen (Junction bei ca.
(±300,-90)) — bewusstes Hot-Spot wie die Westhofener Straßenkreuzung.

**Turm-Bauplätze (Slots):** Kandidatenliste, gefiltert wie Westhofen
(≥90 px zu allen Pfaden, ≥190 px zum Zentrum, ≥115 px zueinander, außerhalb
Plattform/Mauer mit Padding):

```js
[[-620,-160],[-560,120],[-420,330],[-240,420],[-700,-60],
 [700,-160],[560,120],[420,330],[240,420],[700,60],
 [0,660],[-260,660],[260,660],[-860,-240],[860,-300]]
```

→ ca. 13–15 gültige Plätze; `maxTowers: 12`, `startEssence: 360`
(Progression 180/245/300/320/340 → 360), `approximate: true`,
`firstWave: 29, lastWave: 32`.

`getWaveGates(8)`: Welle 29 → Gates `[0,1]` (reiner Bodenangriff auf die beiden
Waldwege), Wellen 30–32 → `[0,1,2]` (Südk corridor dazu), Endlos alle Gates.

## Umgebung: Asset → Position (aus den Cloudinary-Cutouts)

Clearance-Regeln wie Kirchende/Westhofen: Deko ≥150 px von Pfaden, ≥140 px von
Slots, ≥320 px vom Zentrum (Lampen-Regel); Boden wird einmal in die gecachte
Ground-Canvas gebacken und meidet Pfade/Slots.

| Asset (Cloudinary public_id, Rest `…_20261126_…`) | Verwendung | Position |
| --- | --- | --- |
| `denkmal_2-5d_soft_shading_cutout_…172834` | Monument-Sprite (Style-2-Variante), Fallback `denkmal_original_cutout_…172705` | Zentrum (0,0), Bodenanker unten |
| `platte1/2` | Steinplatten-Ring der Plattform | in `hevenPlatform`, um (0,0) |
| `treppe` | Treppe am Südeingang | Streifen x=0, y 300..540 |
| `mauer_gebogen_links`, `mauer_gebogen_mitte`, `mauer_L` | gebogener Mauerzug Norden | y≈-360, x -420..420 |
| `gedenkwand_neutral` + `rest_plakette` | Gedenkwand mit (platzhalterfreien) Namenstafeln | Mitte Nordwand (0,-360) |
| `mauer_efeu_bogen` | Efeubogen über Südeingang | (0,540) |
| `mauer_felsen`, `rest_felsen_gross/klein` | Felsen am Waldrand/Hügelfuß | Ränder, ≥150 px zu Pfaden |
| `platte3`–`platte8` | Bodenpflaster-Flecken in der Lichtung | gebacken, meidet Pfade/Slots |
| `baum1_herbst`, `baum3_tanne`, `baum4_tanne_klein`, `baum5_birke` | Waldkulisse (Ring/Konturen) | |x| oder |y| ≳ 700 |
| `busch_efeu/farn/gras/kugel`, `rest_efeu`, `rest_laub` | Unterholz, Laub | Lichtung, Clearance-Regeln |
| `rest_kreuz`, `rest_saeule` | Reserve: Kreuz/Pfeiler-Deko | nur wenn im Sprite nicht enthalten |
| `bank`, `rest_bank_holz/stein`, `rest_laterne`, `rest_pflanzkasten`, `rest_kranz` | optional, in Fotos nicht belegt → default aus | nur an freigegebenen Stellen ≥155 px zu Pfaden/Slots |

**Asset-Pipeline:** die 40 PNGs (69 MB) sind nicht ship-fähig → Downscale
(max ~1024 px) + WebP (Alpha, q≈80) nach `dist/assets/witten-heven/*.webp`;
Budget-/Header-Prüfung über `tests/assets.test.py` / `assets-headers.test.py`.
Galerie-Karte `level-08-witten-heven.webp` im Menu-v4-Stil aus Referenzfoto
`-5` (wie die anderen Galerie-Karten aus Referenzfotos).

## Wellen, Gegner, Drops (Wellenmodul `DenkmalWittenHeven`, Muster `westhofen.js`)

Kampagnen-Wellen 29–32 (4-Wellen-Kapitel wie L3–L7); Boss Welle 32, Index 0.

| Welle | Name | Komposition | Tuning (Kampagne) |
| --- | --- | --- | --- |
| 29 | NEBEL ÜBER HEVEN | Boden: `wraith,wraith,runner` | 44 × 0,56 s, Gates 0+1 |
| 30 | DIE VIER PFEILER | + `guardian`, Luft alle 8. (`shadowwing/gargoyle/stormwing`), Gates 0–2 | 50 × 0,48 s |
| 31 | STURM AUS DEM WALD | + `archer` | 56 × 0,42 s |
| 32 | DIE LETZTE WACHT | + `sapper` (fokusMonument), **Boss** Index 0 | 62 × 0,36 s |

Endlos: Boss jede 4. Welle Index 0, Luft ab lokaler Welle 2, Pool wächst wie
Westhofen-Endlos. Warnungen: Welle 29 „BODENANGRIFF: WEST- UND OSTWEG · LUFT
AB WELLE 30“, danach „LUFTANGRIFF AUS DEM NORDEN · BOGEN, MAGIE ODER
RIFTLANZE BEREITHALTEN“. Gegnerspecs siehe `game.js` (wraith 54/66, runner
38/106, archer 64/51/170, guardian 165/38/Rüstung .32, sapper 88/58/Schaden 38
auf Denkmal, Boss). `campaign-20-wave-plan.js` bleibt unangetastet
(`chapter()` nur bis Level 7; Level-8-Modul liefert `campaignWave` selbst).

**Drops (Loot V2, keine level-spezifische Änderung nötig):** normale Kills 4 %
Item-Chance mit Pity beim 40. erfolglosen Kill; 75 % magisch / 25 % selten;
aufgesammelte Loot-Orbs +4 Essenz; Boss Welle 32: 9 Orbs + garantiertes episches
(80 %) bzw. legendäres (20 %) Item (`claimBoss`). Kapitelabschluss-Bonus
+35 Essenz greift über `campaignWaveLabel(32)=4`.

## Turmplatzierungen (Empfehlung)

Freigeschaltete Türme: `bow` (25, RW 300, auch Luft), `cannon` (35, Splash 64,
nur Boden), `mage` (46, Slow, RW 282), `rift` (58, Kette, RW 292), `barracks`
(55, Milizen). Ausbaustufen I–III, Verkauf 80 %.

- **Junction-Slots (±300,-90):** `cannon` — Splash deckt beide zusammenlaufenden
  Waldwege gleichzeitig (wie Westhofener Kreuzungstürme).
- **Lange West-/Ost-Flanken (-620,-160), (-560,120), (700,-160), (560,120):**
  `mage` (Slow stapelt sich mit `rift`-Kette) + `rift` gegen Luft ab Welle 30.
- **Süd-Treppe (0,660) bzw. (-260,660)/(260,660):** erster `bow` (deckte
  Luftkorridor aus dem Norden und den Süddurchbruch), später `barracks` nahe
  Zentrum (±240,420) zum Tanken.
- Sinnvolle Build-Reihenfolge: bow (0,660) → mage (-620,-160) → cannon
  (300,-90) → rift (560,120) vor Welle 30 → barracks (240,420) → Upgrades.
  12 von ~14 Plätzen aktiv — die übrigen Plätze bleiben als Ausweichpositionen.

## Integration (nächster Schritt, noch nicht umgesetzt)

1. `dist/levels.js`: `levels[8]` (Name „KRIEGERDENKMAL HEVEN · WITTEN“),
   `hevenPaths/hevenSlots/hevenPlatform`,
   `getWaveGates`-Fall für Level 8, Progress-Feld `level8` +
   `completeLevel8()` + Legacy-Key `denkmal-level8-completed-v1`.
2. `dist/witten-heven.js` (Wellenmodul) + `dist/witten-heven-art.js`
   (Ground-Bake, Monument-Sprite, Deko-Placement) + Script-Tags in
   `dist/index.html`.
3. `dist/game.js`: Dispatch für Level 8 bei `waveSize`/`enemyType`/`wavePlan`/
   `warning`, Render-Hooks (`drawGround`/`drawAirLane`/`drawMonument`/`release`),
   `setMapStatus('level8Btn', campaign.level7Completed …)`, Endlos-Gating,
   `startGame(8)`-Gating, `nextLevelBtn`, Story-/Progress-Texte, onclick-Handler.
4. `dist/index.html`: `level8Btn`, `endless8Btn`. `dist/level-gallery.js`:
   `levelMeta` um `{id:8, city:'Witten', name:'Heven', image:'level-08-witten-heven.webp'}`.
5. Assets nach `dist/assets/witten-heven/` (WebP) + Galerie-Karte; Budget-Tests.
6. Tests: `tests/witten-heven.test.cjs` (Geometrie, Slot-Clearance, Wave-Gates,
   Wellenmodul, Save/Legacy-Envelope mit `level8`) + bestehende Suiten anpassen
   (`game.test.cjs` etc.). CI grün vor Preview.

**Regeln:** Denkmal zentral, Gegner von Kartenrändern (Ansturm-Regel); keine
Spawnportale, keine spielbaren Helden-Änderung; Wege/Slots/Save-Keys anderer
Level unverändert; Originale/Fotos bleiben unangetastet. Dokumentation allein
ist keine Grafik- oder Android-Abnahme.
