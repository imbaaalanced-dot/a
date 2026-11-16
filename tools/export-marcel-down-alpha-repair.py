"""Pack the imagegen transparency repair into one cell, preserving all others."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
original = ROOT / 'dist/assets/hero/marcel-down-actions-v5b.webp'
source = ROOT / 'source-art/hero/repairs/20261116/marcel-down-attack-frame4-generated.png'
target = ROOT / 'dist/assets/hero/marcel-down-actions-v5b-alpha-repair.webp'
with Image.open(original) as atlas, Image.open(source) as generated:
    atlas = atlas.convert('RGBA')
    frame = generated.convert('RGBA').resize((128, 128), Image.Resampling.LANCZOS)
    frame = Image.alpha_composite(Image.new('RGBA', frame.size), frame)
    atlas.paste(frame, (512, 256))
    atlas.save(target, 'WEBP', lossless=True, method=6, exact=True)
print(target.relative_to(ROOT))
