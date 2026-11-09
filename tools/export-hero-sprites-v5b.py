#!/usr/bin/env python3
"""Repeatable, non-generative WebP export of the 2026-11-09 hero masters.

Run from repository root: python tools/export-hero-sprites-v5b.py
Original artwork stays unchanged in source-art/hero/2026-11-09/.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
MASTER = ROOT / 'source-art/hero/2026-11-09'
RUNTIME = ROOT / 'dist/assets/hero'
SHEETS = (
    ('kim-walk-source-4459.png', 'kim-walk-v5b.webp', (1086, 1448), (768, 1024)),
    ('marcel-walk-source-4458.png', 'marcel-walk-v5b.webp', (1086, 1448), (768, 1024)),
    ('kim-side-actions-source-4342.png', 'kim-side-actions-v5b.webp', (1536, 1536), (768, 768)),
    ('marcel-side-actions-source-4344.png', 'marcel-side-actions-v5b.webp', (1536, 1536), (768, 768)),
)


def main():
    for source_name, runtime_name, expected, output_size in SHEETS:
        with Image.open(MASTER / source_name) as source:
            if source.size != expected or source.mode != 'RGBA':
                raise ValueError(f'{source_name}: expected {expected} RGBA, got {source.size} {source.mode}')
            # Transparent red/green AI matting debris is confined to tiny alpha
            # values. Clear only near-invisible pixels; leave the painted edges.
            rgba = source.copy()
            channel = rgba.getchannel('A').point(lambda value: 0 if value < 16 else value)
            rgba.putalpha(channel)
            rgba = rgba.resize(output_size, Image.Resampling.LANCZOS)
            # Eliminate RGB from fully transparent pixels after resampling.
            # Some WebP decoders expose hidden neon/matte RGB in a bad alpha path.
            rgba = Image.alpha_composite(Image.new('RGBA', output_size), rgba)
            target = RUNTIME / runtime_name
            rgba.save(target, 'WEBP', lossless=True, method=6, exact=True)
            print(f'{source_name} -> {runtime_name}: {rgba.size} ({target.stat().st_size} bytes)')


if __name__ == '__main__':
    main()
