# Denkmal TD2: Save & Portal Integrity

## Intent

Preserve campaign unlocks, user preferences, inventory and portal progress when localStorage is missing, malformed, blocked, stale, or written by a different version. Keep Android 4 GB behavior and the existing HTML/Canvas game unchanged.

## Boundaries

- PR A covers persistence and portal transitions only; runtime level cloning, art loading, and placement belong to PR B.
- Leave `dist/loot.js`'s v3 inventory schema, backups, imports and duplicate-boss identity intact. The loot store is already a separate migration subsystem.
- Never delete or silently replace a future-version or corrupt save. Fall back to safe session defaults and report save failure. Legacy keys remain readable but are not deleted.
- Do not modify `main`, PR #56 or deployment paths; work on `fix/td2-save-portal-integrity-20261024`.
- No device fingerprint / deviceId; it is unnecessary for a single-device local save.

## Approach

Considered (1) rewriting all persistence including the loot inventory, (2) a small new schema-aware store for legacy campaign/menu keys with the established inventory store left alone, and (3) keeping ad-hoc legacy keys indefinitely. **Choose (2)**: lower migration risk and incremental testability. Portal state keeps its domain validation and revision-based compare-and-swap, with a versioned envelope around the existing v1 run payload.

## Storage and transactional rules

- New progress key `denkmal-progress-v2`: `{schemaVersion:1,lastUpdated,data:{level2,level4,level5,level6}}`.
- New preference key `denkmal-preferences-v1`: `{schemaVersion:1,lastUpdated,data:{character,graphics,zoom,sound,telemetry,tutorialSeen}}`.
- A single helper reads, validates, and writes these envelopes, migrating legacy values only when the modern key is absent. A future/incompatible/malformed modern key is not overwritten; its legacy predecessor may still be read for session-only fallback.
- Portal state uses `denkmal-portal-run-v1` with an envelope `{schemaVersion:2,lastUpdated,run}`; migrate the bare `version:1` run in place on the next successful save, with the same revision CAS rules.
- Portal reducer transitions only become live when storage succeeds. To checkpoint, compute candidate state and snapshot, write once, then expose the candidate and related UI effects. A failure leaves the prior in-memory state and durable checkpoint intact.
- Boss rewards are saved in the separate inventory key, so true multi-key atomicity is not possible with localStorage. Use stable reward IDs and retry-safe sequencing: durable/duplicate reward before portal completion checkpoint. A failure must not advance the phase.

## Acceptance

- Missing/old/corrupt/partially written/newer saves never crash startup; old unlocks/preferences survive reload; invalid modern data remains intact.
- A duplicate boss claim never duplicates items, and quota failures do not advance portal phase/checkpoint.
- A failed perk/portal wave save does not leave the UI in a future state; retry/reload is safe.
- Existing JavaScript test suite remains green. Browser/Android smoke testing is a separate merge gate.
