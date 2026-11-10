# Style-2 tower art V4 · Integration candidate

Branch: `assets/style2-user-towers-v4-20261110`
Runtime files: `dist/assets/style2-user-towers-v4/runtime-webp/`
Full PNG masters and production source: the V4 candidate package in the project Library.

## Scope

Five existing families, each with L1–L3 towers, matching projectile graphics and one 6×3 hit atlas. The tier is encoded as atlas row; six frames run from contact through peak and fade. Every tower remains 512×512 with pivot `[256,488]`; each projectile remains 256×256. Runtime images are transparent WebP. The atlas manifest records path, byte count and SHA-256 for every runtime file.

The cannon progression remains wood → iron → explosive. No range, damage, attack timing, balance, or save data changed. Existing barracks L1–L3 and the sword militia, spearmen and halberdiers were reviewed in the candidate pass; no specific quality defect justified replacing those working assets.

## Miniature review

- [Tower families at 64 and 128 px](towers-64-128-overview.png)
- [Current versus V4 towers at 64 px](towers-before-after-64.png)
- [Current versus V4 towers at 128 px](towers-before-after-128.png)
- Projectile miniature sheets at 64 and 128 px are included separately.
- The five family impact sheets show all 18 chronological cells.

Miniature checks are visual asset checks. This branch still needs its required CI and Chromium smoke checks before any merge or publication; a real Android 4 GB test remains separate.