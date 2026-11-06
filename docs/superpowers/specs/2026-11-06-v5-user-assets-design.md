# TD2 V5 – User artwork integration design

## Purpose and constraints

Review all ten user-uploaded images (2026-11-06) and promote only usable artwork into the game. Preserve the original files, the existing `main` release and all PRs. Prioritize 4 GB Android startup speed, correct alpha, historical Westhofen geometry, readable touch controls and Style 2 consistency.

## Approaches

1. **Selected, versioned integration (chosen):** audit all ten; use newly transparent, optimized versions of Marcel and Kim in the existing portrait-menu decorator, retaining the old assets and its nonblocking failure behavior. Record the remaining images as reference-only until individually approved and appropriately cut out.
2. Directly replace all ten assets: faster visual coverage but unsafe (opaque magenta, baked UI labels, invented monument geometry, camera mismatch).
3. No integration, only an art gallery: safest but fails the request to integrate suitable artwork.

## Design

- Only the two hero portraits qualify for the current **menu** role. Their new transparent masters become new `v5b` WebP exports at or below 500 × 680 and 150 KiB each.
- Continue using `dist/portrait-avatars-v5.js` and the existing `is-ready` load gate. On any failure the decorator remains hidden, while menu buttons and save data are unchanged.
- Keep the current V5 `.webp` portraits for rollback; add fresh filenames and cache keys rather than silently overwriting them.
- Do **not** promote the JPEG-disguised-as-WebP props, a pre-rendered English inventory screen, or a nonmatching memorial into live Westhofen. A later pass needs matching alpha and documented camera/pivot; the historical monument is not replaceable by a generic pillar.
- Generated portrait images are menu illustrations, not 3×4 gameplay walk atlases or claims of device approval.

## Acceptance

- Reproducible 10-file audit: real formats, dimensions, transparency, classification and decision.
- Two genuine RGBA WebP runtime assets with transparent corners and no obvious hot-pink keying rims, each under 150 KiB.
- DOM/menu smoke test, asset-decode test, Westhofen regression, responsive/reduced-motion checks.
- No code changes to gameplay, saves, existing PRs, or `main`; no automatic merge or publication.
