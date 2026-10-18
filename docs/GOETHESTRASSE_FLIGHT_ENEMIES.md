# Goethestraße: flight enemy foundation

Three coded enemy types, pending the new level's wave integration:

| Type | HP | Speed | Damage | Armor |
|---|---:|---:|---:|---:|
| Schattenflügler (`shadowwing`) | 44 | 94 | 11 | 0 |
| Gargoyle (`gargoyle`) | 138 | 43 | 24 | 25% |
| Sturmgeist (`stormwing`) | 88 | 65 | 17 | 0 |

These are base values before existing wave scaling, provisional until map playtesting. All fly directly from their spawn position to the monument, ignore ground waypoints, respect slowing, stop at attack reach and use existing attack cooldowns. Existing campaign compositions remain unchanged.

Bows, mage, rift and hero projectiles can hit airborne targets. Cannon, mortar and boomerang cannot target or collide with them, including splash spillover. Chain propagation uses the attack's target class. Existing ground targets retain the previous rules.

`flight-enemies.js` provides provisional animated Canvas wing silhouettes, reduced-motion support, enemy specs, movement and targeting rules. They retain ground contact shadows and existing health/damage overlays. Final generated sprites and Goethestraße wave warnings remain future integration work; no special enemy powers are implied by the names.

Verification: 23 Node test files pass, including full-game spawn, tower target selection, cannon collision exclusion and direct approach to the monument. Coarse-pointer gameplay also passes. Existing `DenkmalTestHooks.spawnEnemy(type)` can spawn a named type for development; normal scheduled spawns use the unchanged wave selection.
