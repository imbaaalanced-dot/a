# TD2 Level 4 · Style-2 Seamfix Preview (13.11.2026)

## Status
**Actual GitHub status (13.11.2026):** PR #240 was already merged into `main`
at 16:29:24 UTC, merge commit `a36e6474913f78a7937be664cff0afb3f0b60288`.
The two WebP sources were previously committed as verified Git blobs at
`cf971759b572c7ac9c28e2756961cc0c21dc726c`.
The default V3 terrain remains unchanged. A completed merge is **not** evidence
of Level 4 seamfix visual acceptance, physical Android QA, or deployment.
Remaining QA is pursued in a separate follow-up development PR.

## Verified binary assets in GitHub
Both WebPs now exist in `dist/assets/level4/`, with expected Git blob SHA and SHA256 verified. Original source files are retained:

| Filename | Dimensions | Byte size | SHA256 |
| --- | --- | ---: | --- |
| `level4-cobblestone-512-seamfix.webp` | 512×512 RGB WebP | 94760 | `66d305a7b687e898171945b0c18a0a408b8d000125104ed7147a1200935f4628` |
| `level4-flagstone-512-seamfix.webp` | 512×512 RGB WebP | 55006 | `e467d9a9cab3cad715fa84dbc74a603027d6e747605ef29668aa9cd95dae4e05` |

Neither source photograph nor the historical site footprint is modified.
Images are AI-generated material candidates; reference fidelity needs visual review.
The 64px seam feather is a **technical preparation**, not proof of seamless tiling.

## Integration
- Open `index.html?td2Level4Seamfix=1` to opt into the preview.
- The 3 original approach lanes retain cobblestones, existing lane index 3
  (`KIRCHHOF WEST`) previews flagstones. Existing path geometry is unchanged.
- `DenkmalTerrain.load()` asynchronously loads the two images only in preview mode.
  The loader rejects unexpected dimensions and retains painted / V3 fallback.
- Without the flag, the game remains on the current default Ground V3.
- This is strictly visual: no edits to `levels.js`, slots, gates, saves or combat.

## Validation checklist
1. Stage exactly these binary assets and validate SHA256 + dimensions + color mode.
2. Run `node tests/level4-seamfix-preview.test.cjs`,
   `node tests/terrain-polish.test.cjs`,
   `node tests/reference-ground-v3.test.cjs`,
   `node tests/style2-environment-coherence.test.cjs`.
3. Run `node tools/verify-level4-style2-environment.cjs` on desktop and touch;
   compare default vs preview with identical zoom, crop, and lighting.
   Check no JS errors, no 404s, no hidden paths or build slots.
4. Inspect 2×2 tiling, especially at 64/128px. If discontinuities remain,
   keep this draft and revise the source textures.
5. Check required CI checks; physical Android with 4 GB RAM separately.
   No merge or deployment until actual review and approval.

## Remaining release blockers
- Compare default V3 and opt-in seamfix in identical Chromium desktop and touch screenshots.
- Review visible texture seams and path/build-slot contrast at 64/128 px.
- Validate required CI after this binary-asset commit; no test result is inferred from a completed upload.
- Perform physical Android 4 GB FPS/RAM/touch/runtime QA separately.
- PR #240 is already merged. Keep the focused screenshot-QA follow-up unmerged until actual test evidence and approval.

## Focused Chromium follow-up (13.11.2026)
- Branch `test/td2-level4-seamfix-chromium-20261113` introduces a dedicated
  `tools/verify-level4-seamfix-browser.cjs` comparison for standard V3 vs
  `?td2Level4Seamfix=1` using desktop and mobile-touch emulation.
- The CI job checks successful WebP fetch/decode, unchanged route-material count,
  no 4xx responses/JS exceptions, and nonempty gameplay screenshots.
- Screenshots are uploaded as `td2-level4-seamfix-desktop-touch` for subsequent
  human visual assessment of seams, 64/128px clarity and build pads.
- Chromium emulation is not a physical 4-GB-Android test; do not claim one.
