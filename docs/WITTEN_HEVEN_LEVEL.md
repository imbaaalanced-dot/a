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

**Lesbarkeit:** Waldring außen dicht für Stimmung, Zentrumslichtung um das
Denkmal offen und lesbar halten (Lesbarkeits-Review P1–P8 beachten); Platten
nur in der Lichtung, nie auf Pfaden/Slots.

## Wellen, Gegner, Drops (Wellenmodul `DenkmalWittenHeven`, Muster `westhofen.js`)

Kampagnen-Wellen 29–32 (4-Wellen-Kapitel wie L3–L7); Boss Welle 32, Index 0.

| Welle | Name | Komposition | Tuning + Modifikatoren (Kampagne) |
| --- | --- | --- | --- |
| 29 | NEBEL ÜBER HEVEN | Boden: `wraith,wraith,runner` | 40 × 0,58 s, Gates 0+1 (weicher Einstieg nach L7, das mit 38×0,62 s startet) |
| 30 | DIE VIER PFEILER | + `guardian`, Luft alle 8. (`shadowwing/gargoyle/stormwing`), Gates 0–2 | 50 × 0,48 s, `armorAll:.05` (Pfeiler-Panzer) |
| 31 | STURM AUS DEM WALD | + `archer`, + `brute` (thematisch: Steinpfeiler) | 56 × 0,42 s, `speedAll:1.06` |
| 32 | DIE LETZTE WACHT | + `sapper` (focusMonument), **Boss** Index 0 | 60 × 0,38 s, `damageAll:1.08` |

Modifikatoren pro Welle erfordern, dass der `wavePlan`-Dispatch für Level 8 die
Modifikatoren aus dem Modul übernimmt (aktuell nur `{name}`). Tuning-Option:
Boss W32 nur über Gates 0+1 (fokussierter Bossfight); Default wie L7 alle Gates.

Endlos: Boss jede 4. Welle Index 0, Luft ab lokaler Welle 2, Pool wächst wie
Westhofen-Endlos. Warnungen: Welle 29 „BODENANGRIFF: WEST- UND OSTWEG · LUFT
AB WELLE 30“, danach „LUFTANGRIFF AUS DEM NORDEN · BOGEN, MAGIE ODER
RIFTLANZE BEREITHALTEN“. Gegnerspecs siehe `game.js` (wraith 54/66, runner
38/106, archer 64/51/170, guardian 165/38/Rüstung .32, sapper 88/58/Schaden 38
auf Denkmal, Boss 1040/35/Schaden 52). `campaign-20-wave-plan.js` bleibt
unangetastet (`chapter()` nur bis Level 7; das Level-8-Modul liefert
`campaignWave` selbst).

### Tatsächliche Wellen-Mechanik (geprüft gegen `game.js`, Stand 26.11.2026)

- Globale Wellennummerierung, Kapitel je 4 Wellen: L1 1–5 (Boss 5), L2 6–8,
  L3 9–12 (Boss 12 = `uprooted`), L4 13–16, L5 17–20, L6 21–24, L7 25–28 →
  **L8 29–32, Boss 32 Index 0** (Boss-Label default „DER BELAGERER“).
- `waveSize`: Tabelle nur für Wellen 1–8; ab Welle 9 Default
  `min(48, 30+(wave-8)*3)` und Intervall `max(.30, 1.02-wave*.045)` — das
  Level-Modul überschreibt beides für 29–32 über `campaignWave` (wie L5/L7;
  Counts >48 sind dort üblich, z. B. L7 W28 = 52).
- `endWave()`-Abschlussbedingung ist pro Level hart kodiert
  (`level===7&&wave===28` …) → `level===8&&wave===32` ergänzen.
- `wavePlan(wave)` liefert Name + optionale Stat-Modifikatoren
  (`speedAll/hpAll/armorAll/cooldownAll/damageAll`, `miniBoss`); Wellen 1–8
  haben Modifikatoren in `wavePlans`, Endlos ab Welle 12 jede 4. Welle
  Mini-Boss (`miniBossPlans`). Für L8 kann das Modul optionale Modifikatoren
  je Welle mitgeben (Dispatch aktuell nur `{name}` → entsprechend erweitern).
- Zwischen den Wellen Perk-Auswahl (3 aus 6: u. a. „Steinmetzsegen“ +140
  Denkmal-LP, „Festungsplan“ +1 Turmplatz +20 Essenz). Der +35-Essenz-Bonus
  greift nur bei globaler Welle 4 bzw. 8 (`campaignWaveLabel`), **nicht** bei
  Welle 32 — `campaign20` deckt nur Level 1–7 ab, `campaignWaveLabel(32)=32`.
- Nach Kampagnen-Sieg: `writeRestoration(8)` → Key `td2.restoration.level8`,
  +10 % Denkmal-HP pro Stufe (max 3) auf dieser Karte — läuft über die
  Levelnummer automatisch. Endlos-Rekord-Key `td2.endless.level8.record` ebenso.

### Drops (Loot V2 —mechanik geprüft, zwei Stellen brauchen Level-8-Eintrag)

- Pro Kill: Bounty-Essenz sofort + **1 Loot-Orb** auf dem Boden
  (`lootFor()` = `{kind:'essence'}`, +4 Essenz beim Einsammeln); Boss: 9 Orbs.
- Item-Drop pro Kill über `lootModel.claimEnemy({mapId:8, wave, enemyType, …})`:
  Roll < 4 % oder Pity bei Drought ≥ 39 (40. erfolgloser Kill); 75 % magisch /
  25 % selten (selten trägt die Typ-Power). **Achtung:** `validEnemy` in
  `dist/equipment-catalog.js:55` hartkodiert `mapId<=7` → muss auf 8 erhöht
  werden, sonst wird jeder Level-8-Fund rejected.
- Boss Welle 32: `claimBoss({mapId:8, bossType:'boss', …})` — **braucht neuen
  Eintrag `bossPools[8]`** in `equipment-catalog.js:45` (sonst rejected).
  Vorschlag (Denkmal-/Glocken-Thema): `['bell-amulet','memory-amulet',
  'oath-coat','soul-hood']`. Roll: 60 % thematischer Pool / 40 % alle Templates,
  episch 80 % / legendär 20 %.

## Boss: DER PFEILERWÄCHTER VON HEVEN (Welle 32)

Eigener, einzigartiger Boss für Level 8 — generiert am 26.11.2026 und in
Cloudinary abgelegt:

- **Asset:** Ordner `Witten heven`, public_id `Meta_AI_boss_pfeilerwaechter_20261126_v1`
  (asset_id `e8baf281b694594bfaa6236620becdaf`), PNG 1184×896 RGBA, ~713 KB,
  Tags `td2-asset`, `witten-heven`, `boss`, `level8`, `ai_generated=true`.
- **Cutout:** 75 % transparent (Alpha geprüft), saubere Kanten, keine Halos.
- **Konzept:** kolossaler Steingolem, dessen Torso/Schultern aus den vier
  Basaltpfeilern des Heven-Denkmals geformt sind, bekrönt vom schmiedeeisernen
  Kreuz; glühende **rote** Risse/Runen (Gegner-Farbe), moosiger dunkler Stein,
  goldene Brusttafel mit authentischem Inschrift-Fragment („TREUE UM TREUE …
  DIE BÜRGER VON HEVEN“ — keine erfundenen Namen; auf Runtime-Größe 64/128 px
  unleserlich), dicke Steinäste mit Fäusten, Dreiviertelansicht, Bodenanker an
  den Füßen. Stil: 2.5D Dark Fantasy, warmes Licht von links oben — passend zu
  den übrigen Style-2-Assets. Generiert per Text-zu-Bild (Black Forest API);
  Cloudinary-Gen-Credits waren zu diesem Zeitpunkt erschöpft (50/50).
- **QA (visuell):** Silhouette, Risse, Kreuz, Material stimmen; keine
  verschmierten Gliedmaßen. Ergebnis: als Boss-Sprite für W32 brauchbar.
- **Runtime-Plan:** Standalone-Sprite über `DenkmalAssets` (Muster
  Westhofen-Monument), gezeichnet für `e.type==='boss'` auf Level 8;
  Fallback Atlas-Zeile 18 (Default-Boss). Später WebP nach
  `dist/assets/witten-heven/` + Budget-Tests. Boss-Specs bleiben die
  vorhandenen (`boss`: 1040 HP / 35 Speed / 52 Schaden / Bounty 35).

## Turmplatzierungen (Empfehlung)

Freigeschaltete Türme: `bow` (25, RW 300, auch Luft), `cannon` (35, Splash 64,
nur Boden), `mage` (46, Slow, RW 282), `rift` (58, Kette, RW 292), `barracks`
(55, Milizen). Ausbaustufen I–III, Verkauf 80 %.

- **Junction-Slots (±300,-90):** `cannon` — Splash deckt beide zusammenlaufenden
  Waldwege gleichzeitig (wie Westhofener Kreuzungstürme).
- **Lange West-/Ost-Flanken (-620,-160), (-560,120), (700,-160), (560,120):**
  `mage` (Slow stapelt sich mit `rift`-Kette) + `rift` gegen Luft ab Welle 30.
- **Süd-Treppe (0,660) bzw. (-260,660)/(260,660):** (0,660) ist der
  **Premium-Slot** — deckt Gate 2 und das Zentrum doppelt ab; erster `bow`
  (deckt Luftkorridor aus dem Norden und den Süddurchbruch), später `barracks`
  nahe Zentrum (±240,420) zum Tanken.
- Sinnvolle Build-Reihenfolge: bow (0,660) → mage (-620,-160) → cannon
  (300,-90) → rift (560,120) vor Welle 30 → barracks (240,420) → Upgrades.
  12 von ~14 Plätzen aktiv — die übrigen Plätze bleiben als Ausweichpositionen.

## Integration — umgesetzt (PR #447, Branch `vibe/witten-heven-fotoreferenz-30c8c6`)

Code-Stand: `levels.js` (Level 8 + Progress `level8`/Legacy-Key), `witten-heven.js`
(Wellenmodul), `witten-heven-art.js` (prozedurales Ground/Monument/AirLane),
`game.js` (alle Dispatch-Punkte), `index.html` (`level8Btn`/`endless8Btn` +
Script-Tags + Cache-Keys), `level-gallery.js` (Karte 8), `equipment-catalog.js`
(`mapId<=8`, `bossPools[8]`), Tests inkl. `tests/witten-heven.test.cjs`.
Offen: generierte Cutouts als WebP nach `dist/assets/witten-heven/` +
Boss-Sprite statt prozeduralem Fallback (Asset-Patch, Cloudinary-Quellen stehen bereit).

Ursprüngliche Checkliste:

1. `dist/levels.js`: `levels[8]` (Name „KRIEGERDENKMAL HEVEN · WITTEN“),
   `hevenPaths/hevenSlots/hevenPlatform`,
   `getWaveGates`-Fall für Level 8, Progress-Feld `level8` +
   `completeLevel8()` + Legacy-Key `denkmal-level8-completed-v1`.
2. `dist/witten-heven.js` (Wellenmodul) + `dist/witten-heven-art.js`
   (Ground-Bake, Monument-Sprite, Deko-Placement) + Script-Tags in
   `dist/index.html`.
3. `dist/game.js`: Dispatch für Level 8 bei `waveSize`/`enemyType`/`wavePlan`/
   `warning` (ggf. inkl. Modul-Modifikatoren), `endWave()`-Abschlussbedingung
   `level===8&&wave===32`, Render-Hooks
   (`drawGround`/`drawAirLane`/`drawMonument`/`release`),
   `setMapStatus('level8Btn', campaign.level7Completed …)`, Endlos-Gating,
   `startGame(8)`-Gating, `nextLevelBtn` (Level 8 = Kampagne abgeschlossen),
   Story-/Progress-Texte, Menü- und Abschluss-Texte („Kapitel … von 8“,
   `levelCompleteTitle`/`levelCompleteInfo`/`levelProgress` für L8),
   onclick-Handler.
4. `dist/equipment-catalog.js`: `validEnemy` von `mapId<=7` auf `<=8` und
   `bossPools[8]` ergänzen (4 Templates, s. o.) — sonst Boss-/Enemy-Drops
   rejected.
5. `dist/index.html`: `level8Btn`, `endless8Btn`; optional Level-Intro
   (`DenkmalLevelIntro.show(8)`, Muster siehe `docs/LEVEL3_INTRO_VIDEO.md`).
   `dist/level-gallery.js`:
   `levelMeta` um `{id:8, city:'Witten', name:'Heven', image:'level-08-witten-heven.webp'}`.
6. Assets nach `dist/assets/witten-heven/` (WebP) + Galerie-Karte; Budget-Tests.
7. Tests: `tests/witten-heven.test.cjs` (Geometrie, Slot-Clearance, Wave-Gates,
   Wellenmodul, Loot-`mapId` 8 / `bossPools[8]`, Save/Legacy-Envelope mit
   `level8`) + bestehende Suiten anpassen (`game.test.cjs` etc.). CI grün vor
   Preview.

**Regeln:** Denkmal zentral, Gegner von Kartenrändern (Ansturm-Regel); keine
Spawnportale, keine spielbaren Helden-Änderung; Wege/Slots/Save-Keys anderer
Level unverändert; Originale/Fotos bleiben unangetastet. Dokumentation allein
ist keine Grafik- oder Android-Abnahme.
