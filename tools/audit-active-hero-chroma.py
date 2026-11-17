#!/usr/bin/env python3
"""Read-only audit of the actual active Kim/Marcel hero atlases.

Finds visible chroma-key-like magenta pixels and violet clusters per grid cell,
not by searching legacy files. This produces review candidates, not automatic
art approval or automatic pixel removal: some purple effects are intentional.
Run: python3 tools/audit-active-hero-chroma.py --out /tmp/hero-chroma.json
"""
import argparse
import json
import re
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "dist"


def active_assets():
    canonical = (ROOT / "canonical-hero-art-v5.js").read_text(encoding="utf-8")
    directional = (ROOT / "directional-hero-assets-v5.js").read_text(encoding="utf-8")
    entries = []
    for actor in ("marcel", "kim"):
        base = re.search(
            rf"\b{actor}:\{{\s*walk:'([^']+)',\s*actions:'([^']+)'",
            canonical,
        )
        if not base:
            raise ValueError(f"{actor}: cannot locate active walk/action manifest")
        entries.extend([
            (actor, "walk", base.group(1), 3, 4),
            (actor, "actions", base.group(2), 6, 6),
        ])
        marker = f"    {actor}:{{"
        if marker not in directional:
            raise ValueError(f"{actor}: missing directional actor")
        section = directional.split(marker, 1)[1].split("\n    }", 1)[0]
        directions = re.findall(r"\b(down|left|right|up):'([^']+)'", section)
        if len(directions) != 3:
            raise ValueError(f"{actor}: expected 3 active directional atlases; got {directions}")
        for facing, path in directions:
            entries.append((actor, f"{facing}-actions", path, 6, 6))
    return entries


def inspect(actor, kind, url, columns, rows):
    path = ROOT / url.split("?", 1)[0]
    if not path.is_file() or not path.resolve().is_relative_to(ROOT.resolve()):
        raise ValueError(f"Not an existing runtime asset: {path}")
    with Image.open(path) as source:
        source.load()
        if source.format != "WEBP" or source.mode != "RGBA":
            raise ValueError(f"{path}: requires active RGBA WebP atlas")
        width, height = source.size
        expected = (columns * (256 if kind == "walk" else 128),
                    rows * (256 if kind == "walk" else 128))
        if source.size != expected:
            raise ValueError(f"{path}: grid {source.size}, expected {expected}")
        cell_w, cell_h = width // columns, height // rows
        frames = []
        total_near_magenta = total_violet = 0
        for row in range(rows):
            for column in range(columns):
                image = source.crop((column * cell_w, row * cell_h,
                                     (column + 1) * cell_w, (row + 1) * cell_h))
                near = violet = 0
                coords = []
                # Local cell coordinates let reviewers identify an exact sprite frame.
                for index, (red, green, blue, alpha) in enumerate(image.getdata()):
                    if alpha < 96:
                        continue
                    is_near = red >= 220 and blue >= 200 and green <= 100
                    is_violet = (alpha >= 100 and red > 100 and blue > 100
                                 and green < 100 and min(red, blue) > green * 1.4)
                    near += is_near
                    violet += is_violet
                    if is_near:
                        coords.append((index % cell_w, index // cell_w))
                if near or violet:
                    frames.append({
                        "row": row, "column": column, "near_magenta": near,
                        "violet": violet,
                        "magenta_bounds": (
                            [min(p[0] for p in coords), min(p[1] for p in coords),
                             max(p[0] for p in coords) + 1, max(p[1] for p in coords) + 1]
                            if coords else None
                        ),
                    })
                total_near_magenta += near
                total_violet += violet
    frames.sort(key=lambda frame: (-frame["near_magenta"], -frame["violet"],
                                   frame["row"], frame["column"]))
    return {
        "actor": actor, "kind": kind, "active_asset": str(path.relative_to(ROOT)),
        "grid": [columns, rows], "near_magenta_total": total_near_magenta,
        "violet_total": total_violet, "review_candidates": frames[:12],
        "review_candidate_count": len(frames),
        "interpretation": "pixel-evidence-only; magic colors may be intentional",
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    entries = active_assets()
    results = [inspect(*entry) for entry in entries]
    report = {
        "scope": "currently registered hero runtime WebP atlases only",
        "assets_checked": len(results),
        "near_magenta_total": sum(item["near_magenta_total"] for item in results),
        "note": "No artwork is modified. Counts locate review candidates, not confirmed errors.",
        "assets": results,
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    for item in results:
        print(f'{item["actor"]:6} {item["kind"]:15} near-magenta='
              f'{item["near_magenta_total"]:6} violet={item["violet_total"]:6} '
              f'candidate-frames={item["review_candidate_count"]}')
        for frame in item["review_candidates"][:3]:
            print(f'  row={frame["row"]} col={frame["column"]}: '
                  f'near={frame["near_magenta"]} violet={frame["violet"]} '
                  f'bounds={frame["magenta_bounds"]}')
    print(f'Report: {args.out}')


if __name__ == "__main__":
    main()
