# V5 Westhofen scenery integration (2026-11-07)

Target branch: feature/td2-v5-asset-qa-20261106 (never main).

Four transparent props from the prepared and color-key-cleaned source pack:
bench, warm lamp, low mossy wall, and four-stone paving texture. All four
are packed in a 320x320 alpha WebP (~21 KiB) at
dist/assets/scenery/v5/westhofen-props-atlas.webp.

The generic ivy-covered stone monument was intentionally excluded: its form
is not historically accurate for Westhofen's memorial.

Source crop coordinates refer to the original 512x512 packed design atlas and
are scaled at runtime to the 320px encoded file. The scenery loads lazily only
when Westhofen's art module is asked to draw. On load the existing cached
1536px terrain composition is invalidated once and baked again; no new
draws are added per simulation frame. On release, decoded sprite references
are dropped. Failure to load falls back to the existing procedural terrain.

Decorations are restricted to the existing map's decorative region with
distance tests against authored enemy paths, build pads, and the central
objective. No path geometry, collision, balance, hero/monster code, state
storage or other level is changed. Manual visual QA on Android Chrome is
still required, especially the bench silhouette and distant pavement clarity.

Automated regression: tests/v5-westhofen-atlas.test.cjs verifies file size,
cache-key update, lazy loading, procedural fallback, background rebuild,
zero per-frame prop draws, clearance and unload/reload.
