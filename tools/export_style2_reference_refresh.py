#!/usr/bin/env python3
"""Deterministically slice the user-supplied projectile sheet and two new VFX sheets.

Only the twelve visually verified projectile objects are exported; the other
three atlas slots depict standing towers or a ground VFX, not flying objects.

Usage: python tools/export_style2_reference_refresh.py PROJECTILES ICE_VFX SAW_VFX
"""
import argparse
import hashlib
import io
import json
import os
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSET_ROOT = ROOT / 'dist/assets'
KINDS = ('bow', 'cannon', 'mage', 'rift', 'boomerang')
APPROVED = {
    'bow': (1, 2, 3),
    'cannon': (1, 2, 3),
    'mage': (1, 2),
    'rift': (1,),
    'boomerang': (1, 2, 3),
}
# This is NOT an evenly spaced sprite sheet. Bow tips cross the 400px
# column line, while the Rift L2 silhouette begins above row y=400.
X_CUTS = (0, 462, 800, 1200, 1600, 2000)
Y_CUTS = {'rift': (0, 300, 800, 1200)}
VFX_CUTS = {
    'mage': (0, 291, 651, 1023, 1474, 1840, 2172),
    'boomerang': (0, 319, 652, 1047, 1508, 1854, 2172),
}


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def alpha_bbox(image, threshold=8):
    return image.getchannel('A').point(lambda value: 255 if value > threshold else 0).getbbox()


def edge_max(image):
    a = image.getchannel('A')
    w, h = image.size
    return max(a.crop(rect).getextrema()[1] for rect in (
        (0, 0, w, 1), (0, h-1, w, h), (0, 0, 1, h), (w-1, 0, w, h)))


def save_atomic(image, path, format_name, **kwargs):
    payload = io.BytesIO()
    image.save(payload, format=format_name, **kwargs)
    data = payload.getvalue()
    assert len(data) > 100
    temporary = path.with_name(path.name+'.tmp')
    with temporary.open('wb') as stream:
        stream.write(data)
        stream.flush()
        os.fsync(stream.fileno())
    os.replace(temporary, path)


def save_pair(image, prefix, base, role):
    png = Path(role) / f'{prefix}.png'
    webp = Path('runtime-webp') / role / f'{prefix}.webp'
    for name in (png, webp):
        (base / name).parent.mkdir(parents=True, exist_ok=True)
    save_atomic(image, base / png, 'PNG', optimize=True)
    save_atomic(image, base / webp, 'WEBP', lossless=True, method=6, exact=True)
    assert Image.open(base / png).convert('RGBA').tobytes() == Image.open(base / webp).convert('RGBA').tobytes()
    assert edge_max(image) == 0, (prefix, 'clipped outer border')
    return {'master': str(png), 'runtime': str(webp), 'sha256_png': sha(base / png),
            'sha256_webp': sha(base / webp), 'canvas': [256, 256],
            'pivot': [128, 128], 'alpha_border_max': edge_max(image)}


def export_projectiles(source):
    sheet = Image.open(source).convert('RGBA')
    assert sheet.size == (2000, 1200)
    output = ASSET_ROOT / 'style2-reference-projectiles-v1'
    output.mkdir(parents=True, exist_ok=True)
    entries = []
    for col, kind in enumerate(KINDS):
        cuts = Y_CUTS.get(kind, (0, 400, 800, 1200))
        for level in APPROVED[kind]:
            rect = (X_CUTS[col], cuts[level-1], X_CUTS[col+1], cuts[level])
            src = sheet.crop(rect)
            bb = alpha_bbox(src)
            assert bb, (kind, level)
            # 3px extra source margin preserves soft genuine glow; no arbitrary
            # magenta chroma-key operation (important for Rift purple energy).
            bb = (max(0, bb[0]-3), max(0, bb[1]-3),
                  min(src.width, bb[2]+3), min(src.height, bb[3]+3))
            obj = src.crop(bb)
            obj.thumbnail((224, 224), Image.Resampling.LANCZOS)
            if kind != 'rift':
                # Original alpha contains a thin *visible* hot-pink matte from
                # the source sheet. This narrowly keys that chroma fringe on
                # non-purple projectiles only. Rift magic is intentionally
                # violet and must remain completely unchanged.
                pixels = []
                for r, g, b, a in obj.get_flattened_data():
                    if r > 130 and g < 95 and b > 125 and r > g*1.65 and b > g*1.5:
                        pixels.append((0, 0, 0, 0))
                    else:
                        pixels.append((r, g, b, a))
                obj.putdata(pixels)
            canvas = Image.new('RGBA', (256, 256))
            canvas.alpha_composite(obj, ((256-obj.width)//2, (256-obj.height)//2))
            prefix = f'projectile_{kind}_lv{level}'
            entry = {'id': prefix, 'kind': kind, 'level': level,
                     'source_rectangle': list(rect), 'source_object_bbox': list(bb),
                     **save_pair(canvas, prefix, output, 'projectiles')}
            entries.append(entry)
    assert len(entries) == 12
    manifest = {'version': 1, 'source_sha256': sha(source), 'source_size': [2000, 1200],
                'status': 'opt-in integrated; Android not verified',
                'excluded': {'mage:3': 'ground vortex, not a flying projectile',
                             'rift:2': 'standing Rift tower',
                             'rift:3': 'standing Tesla/Rift construction'},
                'assets': entries}
    (output / 'manifest.json').write_text(json.dumps(manifest, indent=2)+'\n', encoding='utf8')


def export_impacts(sources):
    output = ASSET_ROOT / 'style2-reference-impacts-v1'
    output.mkdir(parents=True, exist_ok=True)
    runtime = Image.new('RGBA', (768, 256))
    entries = []
    for row, kind in enumerate(('mage', 'boomerang')):
        source = sources[kind]
        sheet = Image.open(source).convert('RGBA')
        assert sheet.size == (2172, 724), (kind, sheet.size)
        cuts = VFX_CUTS[kind]
        for frame in range(6):
            left, right = cuts[frame:frame+2]
            # All visible ink is in the shared y=150..600 window. Keeping a
            # shared crop prevents the centre of gravity from jumping.
            source_rect = [left, 150, right, 600]
            crop = sheet.crop(tuple(source_rect))
            bb = alpha_bbox(crop, 16)
            assert bb, (kind, frame)
            # A single 0.48 scale and fixed y=555 ground origin preserves
            # frame-to-frame growth. The horizontal origin is each source cell
            # center; irregular gutters were manually audited before slicing.
            scale = .48
            scaled = crop.resize((round(crop.width*scale), round(crop.height*scale)), Image.Resampling.LANCZOS)
            dest_x = round(128 - crop.width*scale/2)
            dest_y = round(218 - (555-150)*scale)
            assert 0 <= dest_x and 0 <= dest_y
            assert dest_x+scaled.width <= 256 and dest_y+scaled.height <= 256
            canvas = Image.new('RGBA', (256, 256))
            canvas.alpha_composite(scaled, (dest_x, dest_y))
            assert edge_max(canvas) <= 12, (kind, frame, edge_max(canvas))
            # Clear only near-invisible fringe pixels at the canvas edge.
            # Crucially, preserve every visible ice/bronze/spark contour.
            prefix = f'impact_{kind}_{frame:02}'
            png = output / 'frames' / f'{prefix}.png'
            png.parent.mkdir(parents=True, exist_ok=True)
            save_atomic(canvas, png, 'PNG', optimize=True)
            cell = canvas.resize((128, 128), Image.Resampling.LANCZOS)
            runtime.alpha_composite(cell, (frame*128, row*128))
            entries.append({'kind': kind, 'frame': frame, 'source_rect': source_rect,
                            'master': str(png.relative_to(output)), 'sha256_png': sha(png),
                            'runtime_rect': [frame*128, row*128, 128, 128],
                            'pivot_master': [128, 218]})
    webp = output / 'runtime.webp'
    save_atomic(runtime, webp, 'WEBP', lossless=True, method=6, exact=True)
    manifest = {'version': 1, 'source_sha256': {kind: sha(path) for kind, path in sources.items()},
                'source_size': [2172, 724], 'rows': ['mage', 'boomerang'],
                'columns': 6, 'runtime_cell': [128, 128], 'pivot_master': [128, 218],
                'pivot_runtime': [64, 109], 'scale': .48,
                'tier_policy': 'mage all levels; boomerang level 3 only',
                'runtime_sha256': sha(webp), 'frames': entries}
    (output / 'manifest.json').write_text(json.dumps(manifest, indent=2)+'\n', encoding='utf8')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('projectiles', type=Path)
    parser.add_argument('ice_vfx', type=Path)
    parser.add_argument('saw_vfx', type=Path)
    args = parser.parse_args()
    export_projectiles(args.projectiles)
    export_impacts({'mage': args.ice_vfx, 'boomerang': args.saw_vfx})
    print('Exported 12 curated projectile PNG/WebP pairs and 12 transparent impact frames + one runtime atlas')
