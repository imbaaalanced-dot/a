# Kriegerdenkmal Westhofen — Level 7

Playable reference-based memorial map for the Kriegerdenkmal in Schwerte-Westhofen (Reichshofstraße, opposite no. 141, near no. 142; roughly 51.41874, 7.52271). Layout is illustrative, not surveyed: rectangles, lanes and the bus stop are gameplay approximations derived from public aerial views and press photos, not measurements.

## Real memorial — research summary

- Dedicated **1928** for the 39 soldiers of Westhofen who fell in World War I; the central tablet read "UNSEREN HELDENSÖHNEN GEWEIHT 1914–1918". Side tablets remember civilian victims of World War II, fallen and missing soldiers, and refugees and expellees; a separate 1870/71 base stone stands nearby (names BRENNE, FRÄNZNER, URHAHN, WEIBERG, WESTERHOFF).
- Structure: stepped stone pedestal with an overlaying **winged bronze helmet**, sword and round shield; three tablets in the base.
- **Theft of 20.07.2026**: the central bronze tablet (WWI) and both copper fire bowls on the left and right pedestals were stolen; the memorial was uninsured. An attempt to steal the bronze helmet failed. Sources: Ruhrnachrichten 21.07.2026 and 31.07.2026, denkmalprojekt.org (Fallen soldiers of both world wars), schwerte.de monument list, no-nazis.bplaced.net (local documentation), Cylex (coordinates).
- Bus stop "Westhofen Denkmal" (Reichshofstraße 142) sits directly at the roadside next to the memorial green.

## Design decisions

- **The game shows the real state of November 2026**: the central tablet frame stands empty and both fire-bowl pedestals are bare. The theft is part of the documented design, not an oversight; the winged helmet remains as the surviving landmark.
- Three asymmetric ground approaches: Reichshofstraße from west and east plus the northern green corridor ("Grünzug"). The two street lanes **merge in front of the memorial** at a shared junction (+150) and run the final approach together — two streets, one hot spot. Wave 25 opens as a pure ground attack on both street corridors; the green corridor joins from wave 26. Street lanes measure ~1230 px, the direct green corridor ~1015 px.
- Air spawns at the street side and flies directly across the green; cyan corridor shown only in build pauses. Shadowwing arrives with wave 26, gargoyle with wave 27, stormwing with wave 28, which also carries the siege boss. Endless keeps aerial pressure from the start.
- Wave tuning accounts for the street merge: junction towers cover both lanes at once, so the opening runs 38 × .62 s (wave 25), 42 × .54 s (26), 46 × .46 s (27) and 52 × .40 s (28) — slightly above the Hohensyburg template (32 × .75 s) while staying the gentlest pure-ground chapter opening.
- Wave names: NEBEL AN DER REICHSHOFSTRASSE, SCHATTEN DES GEFLÜGELTEN HELMS, STURM AUF DAS EHRENMAL, DIE LETZTE WACHT. Air warnings name the anti-air tower roles (bow, ice, rift lance).
- Sixteen marked sites, up to twelve active towers, 340 starting essence, standard hero and monument rules. Cannon and boomerang stay ground-only.
- Normal campaign access follows Goethestraße (Level 6). A victory persists `denkmal-level7-completed-v1` and enables Westhofen endless. Saves written before Westhofen lack the `level7` field and remain valid; it defaults to locked.
- Ground (memorial green, street with centre lines, sidewalk, bus stop, gravel apron, hedges and trees) is baked once into a cached canvas that avoids all paths and build slots. The memorial renders fully procedurally — no image asset — so the map works without asset generation.

## Verification

`node tests/westhofen.test.cjs`: geometry, path endpoints, pad clearance, wave gates, wave module (ground-only chapter opening, air ramp, boss, endless composition), completion save, legacy envelope without `level7`, blocked storage, reload, renderer warm cache, HTML/game wiring and cache keys.

`node tests/game.test.cjs`: actual unlock gating (Level 7 locked before Goethestraße completion), chapter opening spawns on both street corridors, air-free wave 25, campaign victory at wave 28, endless unlock and aerial pressure in endless.

All Node test files and `python tests/assets.test.py` must pass before tester publication. These checks do not replace a full Android playthrough or device FPS measurement.

## Planned memorial sprite (later asset patch)

The current monument is procedural placeholder art. The planned generation prompt is documented for a later asset patch: stepped stone pedestal, overlaying winged bronze helmet, sword and round shield, three tablets — the central one empty, two bare fire-bowl pedestals flanking; elevated three-quarter orthographic 2.5D, hand-painted dark fantasy, gray-beige masonry, subtle moss, restrained upper-left light; transparent background, no scenery, UI or added writing.
