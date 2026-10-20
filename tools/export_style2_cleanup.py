"""Normalize imagegen cleanup candidates to existing sprite bounds; never retouch pixels.

python tools/export_style2_cleanup.py --cannon clean-cannon.png --mage clean-mage.png
Only proportional resizing, transparent placement and lossless encoding are applied.
"""
from pathlib import Path
from hashlib import sha256
import argparse
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]


def visible_box(image):
    return image.getchannel('A').point(lambda a: 255 if a > 16 else 0).getbbox()


def export(source, original, output, role, kind, level):
    raw = Image.open(source).convert('RGBA')
    old = Image.open(original).convert('RGBA')
    target = visible_box(old)
    box = visible_box(raw)
    if not box:
        raise ValueError(f'Empty generated candidate: {source}')
    scale = min((target[2]-target[0])/(box[2]-box[0]), (target[3]-target[1])/(box[3]-box[1]))
    resized = raw.resize((round(raw.width*scale), round(raw.height*scale)), Image.Resampling.LANCZOS)
    actual = visible_box(resized)
    # Keep the old horizontal footprint and bottom contact, without stretching.
    x = round((target[0]+target[2]-actual[0]-actual[2])/2)
    y = target[3]-actual[3]
    result = Image.new('RGBA', old.size)
    result.paste(resized, (x, y))
    sprite_id = f'{role}_{kind}_lv{level}'
    png_path = f'{role}s/{sprite_id}.png'
    webp_path = f'runtime-webp/{role}s/{sprite_id}.webp'
    for relative in (png_path, webp_path):
        (output/relative).parent.mkdir(parents=True, exist_ok=True)
    result.save(output/png_path)
    result.save(output/webp_path, lossless=True, exact=True, method=6)
    return {
        'id': sprite_id, 'type': role, 'kind': kind, 'level': level,
        'master_size': list(old.size),
        'pivot': [256, 488] if role == 'tower' else [128, 128],
        'alpha_bbox_export': list(visible_box(result)),
        'png_path': png_path, 'webp_path': webp_path,
        'sha256_png': sha256((output/png_path).read_bytes()).hexdigest(),
        'sha256_webp': sha256((output/webp_path).read_bytes()).hexdigest(),
        'source_generated_sha256': sha256(Path(source).read_bytes()).hexdigest(),
        'original_sha256': sha256(Path(original).read_bytes()).hexdigest(),
        'export_note': 'Imagegen edit; proportional normalization to original alpha>16 footprint. No color-key filtering.',
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--cannon', required=True, type=Path)
    parser.add_argument('--mage', required=True, type=Path)
    parser.add_argument('--out', type=Path, default=ROOT/'dist/assets/style2-user-towers-v2')
    args = parser.parse_args()
    old = ROOT/'dist/assets/style2-user-towers-v1'
    assets = [
        export(args.cannon, old/'towers/tower_cannon_lv1.png', args.out, 'tower', 'cannon', 1),
        export(args.mage, old/'projectiles/projectile_mage_lv2.png', args.out, 'projectile', 'mage', 2),
    ]
    data = {'name': 'td2-style2-cleanup-pass2', 'version': '2.0.0',
            'inherits': '../style2-user-towers-v1/manifest.json',
            'runtime_cache_key': 'cleanup-2', 'assets': assets,
            'status': 'Versioned imagegen cleanup overrides; opt-in only. Android test pending.'}
    (args.out/'manifest.json').write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n')
    print(json.dumps(data, indent=2))


if __name__ == '__main__':
    main()
