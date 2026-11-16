# TD2 V6 tower sprites — draft integration

This branch adds an **opt-in** Canvas override after `style2-user-towers-v4.js`. Default behavior is identical to V4.

- Enable only after importing binaries: `?td2V6Towers=1`
- Disable / rollback: remove the flag (or use `?td2V6Towers=0`)
- Mappings: `bow→bogen`, `cannon→kanone`, `rift→riftlanze`, `mage→eis`; each uses tiers L1–L3
- All images are 256×256 RGBA WebP with foot pivot 0.9531; Canvas display size 112
- Existing projectile handling, hero canonical references and savegames unchanged
- Fallback to V4 during load or on errors, with bounded decode cache

## Blocker before merge

The 12 binary WebPs have been generated in the conversation artifact `TD2_V6_Turmpatch_20261116.zip`. They are **not yet present in this repository branch**. Import their exact paths before enabling the renderer or releasing this PR:

```text
dist/assets/style2-v6-candidates/tuerme/upgrade_stufen/
  bogen_l1.webp  bogen_l2.webp  bogen_l3.webp
  kanone_l1.webp kanone_l2.webp kanone_l3.webp
  riftlanze_l1.webp riftlanze_l2.webp riftlanze_l3.webp
  eis_l1.webp eis_l2.webp eis_l3.webp
```

The ZIP also contains `tools/install-into-repo.py`, a local installer that avoids overwriting existing files.

## Verification

- Local equivalent renderer: `node tests/v6-towers.test.cjs` — passed
- Local 12 WebP decode / alpha / size checks — passed
- Integration in actual browser build, CI and physical Android — not yet verified

Do not merge until all 12 files exist in this PR and browser gameplay has been checked with the URL flag.
