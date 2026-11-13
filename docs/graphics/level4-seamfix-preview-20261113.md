# TD2 Level 4 · Style-2 Seamfix Preview (13.11.2026)

## Status
**Draft / blocked on binary asset upload.** Opt-in renderer wiring exists on this branch,
but both WebP files have **not** been committed to GitHub. The default V3 terrain remains
unchanged. Do **not** merge or deploy the candidate until the exact two WebPs are
added and tested in Chromium desktop and touch emulation.

## Assets to stage from the locally prepared seamfix package
Copy, without altering source files, into `dist/assets/level4/`:

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

## Known limitation
This GitHub integration is currently **source-only** because the GitHub text-file
connector cannot transfer the two prepared local WebP binaries. Preview URL
will request missing files and fall back rather than break gameplay. This
is **not ready for publication** until the binaries are present.
