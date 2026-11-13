"""Synthetic tests for the Westhofen candidate composer; no real or private photos."""

import importlib.util
import json
from pathlib import Path
from tempfile import TemporaryDirectory

from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("westhofen_production", root / "tools/build-westhofen-candidate.py")
tool = importlib.util.module_from_spec(spec)
spec.loader.exec_module(tool)


def layer(path, rectangle):
    image = Image.new("RGBA", tool.SIZE, (0, 0, 0, 0))
    ImageDraw.Draw(image).rectangle(rectangle, fill=(111, 104, 91, 255))
    image.save(path)


with TemporaryDirectory(prefix="td2-westhofen-production-") as tmp:
    d = Path(tmp)
    frame = d / "stone-frame.png"
    altar = d / "altar.png"
    emblem = d / "bronze.png"
    layer(frame, (60, 45, 706, 414))
    layer(altar, (268, 235, 510, 449))
    layer(emblem, (331, 71, 425, 277))
    ok = tool.build(frame, altar, emblem, d / "success")
    assert ok["gate"] == "pixel-pass-visual-review-pending", ok
    assert ok["runtime_activated"] is False
    assert (d / "success/westhofen-v2-64-128-review.png").is_file()
    assert (d / "success/westhofen-memorial-candidate-v2.webp").is_file()
    with Image.open(d / "success/westhofen-memorial-candidate-v2.webp") as image:
        image.load()
        assert image.mode == "RGBA" and image.size == (768, 512)
    assert json.loads((d / "success/report.json").read_text())["gate"] == ok["gate"]

    # A labeled collage or screenshot with no genuine alpha must be blocked.
    Image.new("RGB", tool.SIZE, (22, 22, 22)).save(frame)
    bad = tool.build(frame, altar, emblem, d / "opaque")
    assert bad["gate"] == "hold" and "genuine RGBA" in bad["errors"][0]
    assert not (d / "opaque/westhofen-memorial-candidate-v2.webp").exists()

    # Fully isolated sources can still crop the visible silhouette.
    layer(frame, (0, 35, 706, 414))
    clipped = tool.build(frame, altar, emblem, d / "clipped")
    assert clipped["gate"] == "hold" and clipped["edge_pixels_alpha_ge_32"] > 0
    assert not (d / "clipped/westhofen-memorial-candidate-v2.webp").exists()

    # No silent stretching of the existing 768x512 renderer contract.
    Image.new("RGBA", (512, 512), (0, 0, 0, 0)).save(frame)
    malformed = tool.build(frame, altar, emblem, d / "invalid-size")
    assert malformed["gate"] == "hold" and "expected (768, 512)" in malformed["errors"][0]

print("Westhofen modular sprite composer: pass, opaque collage, clipped silhouette and wrong-size safeguards passed")
