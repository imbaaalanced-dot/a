"""Validate Style 2 map layers. Usage: python tests/map-assets.test.py --levels 1 2"""
from argparse import ArgumentParser
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "dist" / "assets" / "maps"
PASSES = ("ground", "paths", "decor-back", "decor-front")

parser = ArgumentParser()
parser.add_argument("--levels", nargs="+", type=int, default=[1, 2, 3, 4])
args = parser.parse_args()
aggregate = 0

for level in args.levels:
    folder = ROOT / f"level-{level}"
    for variant, expected, budget in (("desktop", (3072, 3072), 3_000_000), ("mobile", (2048, 2048), 1_500_000)):
        files = [folder / f"{layer}-{variant}.webp" for layer in PASSES]
        total = 0
        for layer, asset in zip(PASSES, files):
            assert asset.exists(), f"missing {asset.relative_to(ROOT.parent.parent)}"
            total += asset.stat().st_size
            aggregate += asset.stat().st_size
            with Image.open(asset) as image:
                image.load()
                assert image.format == "WEBP", asset
                assert image.size == expected, f"{asset}: {image.size} != {expected}"
                if layer != "ground":
                    assert image.mode == "RGBA", f"{asset} must preserve RGBA"
                    low, high = image.getchannel("A").getextrema()
                    assert low == 0 and high > 0, f"{asset} needs transparent and visible pixels"
        assert total <= budget, f"level {level} {variant}: {total} > {budget} bytes"
        print(f"Level {level} {variant}: four layers decoded at {expected[0]} px, {total} / {budget} bytes")

assert aggregate < 10_000_000, f"selected Style 2 asset set is {aggregate} bytes; must remain below 10 MB"
print(f"Style 2 aggregate: {aggregate} / 10000000 bytes")
