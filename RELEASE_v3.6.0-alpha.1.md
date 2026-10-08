# Denkmal TD v3.6.0-alpha.1 — Die Rüstkammer

Permanent loot and main-menu-only loadout management, based on beed611 (v3.5.0-alpha.2).

## Player changes
- Eight equipment slots; 30 backpack spaces plus lossless overflow.
- Common, magic, rare, epic and legendary items; bounded wave-scaled stats and legendary chain/sustain/tower effects.
- One item per completed wave; guaranteed epic-or-better boss drop. Prior equipment alternatives become permanent milestone rewards.
- Equipment is locked for a run. I/H pauses and shows a read-only inventory; all writes enforce the main-menu rule in the model.
- Comparison, ring-slot selection, rarity/favorite filter, sort, favorite protection, salvage and reforge.
- Immediate local save, previous-save backup, strict import validation, conflict/failure warnings, JSON export/import including level unlock.
- Existing level unlock/preferences remain intact; prior run-only loot was never persisted and cannot be recovered. Three starter powers preserve original combat defaults.
- Camera stabilization and removal of walking sprite bob from beed611 retained. Idle breathing remains.

## Verification
Run before publication:
```
node tests/loot.test.cjs
node tests/game.test.cjs
TEST_MOBILE=1 node tests/game.test.cjs
node tests/combat-fx.test.cjs
node tests/v3.1-features.test.cjs
python tests/assets.test.py
```
All CSS/JS cache keys: v360a1. Existing superpowers-alpha3/ deployment preserved.

## Testing limits
Real Android long-session testing, browser storage quota behavior on specific devices and balance across many runs remain alpha testing tasks. Existing FPS overlay counts RAF callbacks, not drawn frames; it is not a reliable benchmark while paused.
