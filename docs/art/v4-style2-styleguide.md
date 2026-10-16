# Denkmal TD2 – V4 Style 2 Production Guide

## Visual language

- Camera: readable top-down gameplay with a roughly 60-degree 2.5D visual elevation.
- Projection: parallel verticals and no perspective transform of world coordinates.
- Light: warm amber key light; contact shadows consistently fall down-right.
- Base palette: charcoal, slate, deep forest green and muted moss.
- Material accents: weathered bronze, blackened iron and worn steel.
- Magic accent: controlled aether blue, reserved for heroes, magic and special effects.
- Path contrast: each route reads 25–35 percent brighter than adjacent terrain.

## Materials

- Stone uses irregular joints, chipped edges and subtle moss outside gameplay silhouettes.
- Wood exposes readable beams and dark metal fittings.
- Bronze has bright worn edges and dark patina in recesses.
- Lantern light forms compact pools and never washes out route edges.
- Fog stays near map boundaries and never covers a full active lane.

## Geometry and anchors

- Runtime world remains exactly 3072 × 3072.
- Every structure and tower anchors at the center of its ground footprint.
- Build pads, arrows, text, actors and rank stars are runtime overlays, never baked art.
- Gates, paths, slots and objectives come only from `DenkmalLevels`.
- Foreground vegetation must be isolated from ground/back layers for actor-aware opacity.

## Layer contract

| Pass | Content | Alpha |
| --- | --- | --- |
| ground | grass, soil, paving base and ambient light | no |
| paths | authored route surface and shoulders | yes |
| decor-back | low walls, hedges, graves and low vegetation | yes |
| decor-front | tree crowns, arches and foreground occluders | yes |

## Export contract

- Desktop: exactly 3072 × 3072 WebP.
- Android: exactly 2048 × 2048 WebP.
- Filename: `{pass}-{desktop|mobile}.webp`.
- Combined per-map budget: desktop ≤ 3,000,000 bytes; mobile ≤ 1,500,000 bytes.
- Preserve common world alignment when downscaling; never crop individual passes differently.
- Overlay layers retain fully transparent pixels.

## Per-map export checklist

- [ ] Four layer passes share one canvas origin and dimensions.
- [ ] Routes match the debug overlay from `DenkmalLevels`.
- [ ] No pad, arrow, label, actor, tower or rank star is baked.
- [ ] Foreground crowns do not permanently hide a lane or objective.
- [ ] Contact shadows fall down-right.
- [ ] Desktop and Android dimensions and byte budgets pass.
- [ ] Level 3/4 metadata separates `belegt`, `rekonstruiert` and `kuenstlerisch`.
