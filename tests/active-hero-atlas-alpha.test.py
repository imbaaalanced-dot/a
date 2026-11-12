"""Pixel QA for the actual V5 hero atlas paths loaded by the runtime.

Prevents older / fully opaque artwork being re-introduced by changing a
manifest URL while leaving the archived V5b QA fixtures untouched.
"""
from pathlib import Path
import re
from PIL import Image

dist = Path(__file__).resolve().parents[1] / "dist"
registry = (dist / "canonical-hero-art-v5.js").read_text(encoding="utf-8")
expected = {"walk": (3, 4, 256), "actions": (6, 6, 128)}

for actor in ("marcel", "kim"):
    block = re.search(rf"\b{actor}:\{{(.*?)\n\s*\}}", registry, re.S)
    assert block, f"{actor}: missing canonical art registration"
    for kind, (cols, rows, cell) in expected.items():
        match = re.search(rf"\b{kind}:'([^']+)'", block.group(1))
        assert match, f"{actor}/{kind}: missing asset path"
        url = match.group(1)
        assert url.endswith("?v=v5b-alpha-20261112"), (actor, kind, url)
        path = dist / url.split("?", 1)[0]
        assert path.is_file(), f"Missing active atlas: {path}"
        with Image.open(path) as image:
            image.load()
            assert image.format == "WEBP", path
            assert image.mode == "RGBA", (path, image.mode)
            assert image.size == (cols * cell, rows * cell), (path, image.size)
            for row in range(rows):
                for column in range(cols):
                    frame = image.crop((column * cell, row * cell, (column + 1) * cell, (row + 1) * cell))
                    alpha = frame.getchannel("A")
                    hist = alpha.histogram()
                    transparent = sum(hist[:16])
                    assert transparent >= cell * cell // 10, (
                        path, row, column, "opaque background or rectangle", transparent
                    )
                    assert hist[255] > 0, (path, row, column, "empty image")
                    assert all(alpha.getpixel(point) < 16 for point in (
                        (0, 0), (cell-1, 0), (0, cell-1), (cell-1, cell-1)
                    )), (path, row, column, "opaque corner")
                    bbox = alpha.point(lambda a: 255 if a >= 32 else 0).getbbox()
                    assert bbox and min(bbox[0], bbox[1], cell-bbox[2], cell-bbox[3]) >= 2, (
                        path, row, column, "frame bleed", bbox
                    )

print("Active hero V5 atlases: 96 frames, actual manifest URLs, alpha and frame margins passed")
