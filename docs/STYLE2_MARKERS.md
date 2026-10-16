# Style 2 building and entry markers

All four maps use the same cached stone/bronze build-pad art, centered on the existing slot positions. The previous baked Level1/2 pad decorations are skipped when this renderer is available. Pad art stays within the existing visibility margin. No placement geometry changes.

Historical-map entries show static arrows toward the actual first route segment, with an amber ring for the currently active entry. These do not add obstacles or change spawns. Level1/2 retain their existing gate structures.

Placement preview now paints a translucent Level1 tower using the actual tower renderer, at the same anchor as the intended placement. The range circle remains in ground/world coordinates; the ghost retains its upright projection. Cost and role are shown below it, with red range/marker styling and a blocked label if invalid or unaffordable (including tower-limit restrictions). This is a preview only: it never buys, places, upgrades or modifies a tower. Existing placementPreview/buildTower validation stays authoritative.

Three small 96px marker bitmaps are allocated lazily and reused. Tests check cache reuse, input immutability, range radius, cost and blocked state. The full gameplay harness loads the marker module and passes on desktop/mobile. Native Canvas output of normal pads, valid/blocked ghosts and entrance arrows has been inspected. Android FPS and full browser playthrough remain open.
