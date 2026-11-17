"""Re-render Ansturm assets from imagegen output into the existing WebP cells.

Usage: python tools/render_ansturm_style2.py spec.json --report report.json
spec.json: [{"target":"assets/enemy_normal.webp","source":"/tmp/gen.png","mode":"cutout"}, ...]

cutout: magenta-key the source (border flood fill), crop to the alpha box,
contain into 88% of the existing cell (centered, like pack_ansturm_gutters.py)
and encode lossless RGBA WebP. full: cover-resize to the existing cell and
encode lossy WebP q82 in the target's original mode. Identical bytes are
written to dist/ansturm and the ansturm-alpha1-5 mirror.
"""
from collections import deque
from pathlib import Path
import argparse
import json
import numpy as np
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
DEPLOY = ROOT / 'dist' / 'ansturm'
MIRROR = ROOT / 'ansturm-alpha1-5'


def magenta_key(image):
    """Return (RGBA image, keyed fraction, residue) with the connected magenta background removed."""
    arr = np.array(image.convert('RGB')).astype(int)
    h, w = arr.shape[:2]
    border = np.concatenate([arr[0, :, :], arr[-1, :, :], arr[:, 0, :], arr[:, -1, :]])
    key_color = np.median(border, axis=0)
    if not (key_color[0] > 150 and key_color[2] > 90 and key_color[1] < 80 and key_color[0] - key_color[2] < 150):
        raise ValueError(f'border color {key_color.tolist()} is not a magenta key; re-generate with a #FF00FF background')
    dist = np.sqrt(((arr - key_color) ** 2).sum(axis=2))
    key = dist < 70
    bg = np.zeros((h, w), bool)
    edge = [(x, y) for x in range(w) for y in (0, h - 1)] + [(x, y) for y in range(h) for x in (0, w - 1)]
    for x, y in edge:
        if key[y, x]:
            bg[y, x] = True
    queue = deque(zip(*np.where(bg)))
    while queue:
        y, x = queue.popleft()
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < h and 0 <= nx < w and key[ny, nx] and not bg[ny, nx]:
                bg[ny, nx] = True
                queue.append((ny, nx))
    # second pass: any remaining key-colored pixel is fringe, never art
    fringe = dist < 45
    alpha = np.where(bg | fringe, 0, 255).astype('uint8')
    out = np.dstack([arr.astype('uint8'), alpha])
    visible = arr[~(bg | fringe)]
    residue = float((np.sqrt(((visible - key_color) ** 2).sum(axis=1)) < 30).mean()) if len(visible) else 0.0
    return Image.fromarray(out, 'RGBA'), float(bg.mean()), residue


def pack_cutout(source, cell):
    keyed, keyed_fraction, residue = magenta_key(Image.open(source))
    box = keyed.getchannel('A').point(lambda a: 255 if a > 16 else 0).getbbox()
    if not box:
        raise ValueError(f'{source}: keying removed everything')
    cropped = keyed.crop(box)
    canvas = Image.new('RGBA', cell, (0, 0, 0, 0))
    fitted = ImageOps.contain(cropped, (int(cell[0] * .88), int(cell[1] * .88)), Image.Resampling.LANCZOS)
    canvas.alpha_composite(fitted, ((cell[0] - fitted.width) // 2, (cell[1] - fitted.height) // 2))
    return canvas, keyed_fraction, residue, box


def pack_full(source, cell, mode):
    image = Image.open(source).convert('RGB')
    fitted = ImageOps.fit(image, cell, Image.Resampling.LANCZOS)
    if mode == 'RGBA':
        fitted = fitted.convert('RGBA')
    return fitted


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('spec', type=Path)
    parser.add_argument('--report', type=Path, required=True)
    args = parser.parse_args()
    report = []
    for item in json.loads(args.spec.read_text()):
        target = Path(item['target'])
        source = Path(item['source'])
        mode = item['mode']
        deploy_target = DEPLOY / target
        if not deploy_target.exists() or not source.is_file():
            raise SystemExit(f'missing source or existing target: {source} / {deploy_target}')
        with Image.open(deploy_target) as previous:
            cell, previous_mode = previous.size, previous.mode
        if mode == 'cutout':
            packed, keyed_fraction, residue, box = pack_cutout(source, cell)
            if residue > 0.005:
                raise SystemExit(f'{target}: magenta residue {residue:.4f} after keying')
            lossless = True
        else:
            packed = pack_full(source, cell, previous_mode)
            keyed_fraction = residue = box = None
            lossless = False
        destinations = [deploy_target, MIRROR / target]
        for destination in destinations:
            destination.parent.mkdir(parents=True, exist_ok=True)
            if lossless:
                packed.save(destination, 'WEBP', lossless=True, exact=True, method=6)
            else:
                packed.save(destination, 'WEBP', lossless=False, quality=82, method=6)
        with Image.open(deploy_target) as check:
            alpha = check.getchannel('A') if 'A' in check.getbands() else None
            bbox = alpha.point(lambda a: 255 if a >= 128 else 0).getbbox() if alpha else None
            margins = None
            if bbox:
                margins = [bbox[0], bbox[1], check.width - bbox[2], check.height - bbox[3]]
        entry = {'target': str(target), 'mode': mode, 'cell': list(cell), 'out_mode': packed.mode,
                 'keyed_fraction': round(keyed_fraction, 4) if keyed_fraction is not None else None,
                 'magenta_residue': residue, 'alpha_bbox': list(box) if box else None,
                 'cell_margins': margins, 'bytes': deploy_target.stat().st_size,
                 'lossless': lossless}
        report.append(entry)
        print(json.dumps(entry, ensure_ascii=False))
    args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')


if __name__ == '__main__':
    main()
