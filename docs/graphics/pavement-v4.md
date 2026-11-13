# Level 4 pavement V4 preview

AI-generated Style-2 material candidate, created with native image generation
on 2026-11-13; artistic material interpretation, not historical photographic evidence.
Source: exec-1892e98b-a49a-413b-b629-07b5ffbda852.png, 1254×1254 RGB.
Derived with Pillow Lanczos resize to 512×512, WebP quality 86, method 6.
Runtime size: 20,480 bytes; decoded RGBA estimate: 1 MiB, excluding browser overhead.

Enable with `?td2PavementV4=1`. Only level 4 road material selects the new
image after successful loading and dimension validation. Default V3 and its
opt-out remain intact; failed preview loading retains the original material.
Pattern scales by 0.5 to preserve the existing 256-world-unit tile scale.
Original graphics are preserved. No path, save, combat or monument changes.

Visual source QA: larger irregular stones remain readable at 64/128px.
Repeated tile landmarks remain possible; no guarantee of exact seamlessness.
Node loader, cache-busting, terrain and level-4 tests passed locally.
Local Chromium blocked by socket permission restrictions; CI browser workflow
captures default/preview on desktop and mobile-touch emulation.
Physical Android 4 GB validation remains open. No merge/release approval.
