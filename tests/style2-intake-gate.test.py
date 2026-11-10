"""Synthetic, non-destructive regression coverage for the Style-2 intake gate."""

import importlib.util
from pathlib import Path
from tempfile import TemporaryDirectory

from PIL import Image


root = Path(__file__).resolve().parents[1]
module_path = root / "tools/audit-style2-intake.py"
spec = importlib.util.spec_from_file_location("style2_intake", module_path)
gate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gate)

with TemporaryDirectory(prefix="td2-style2-gate-") as folder:
    folder = Path(folder)
    good = folder / "approved-shape.png"
    img = Image.new("RGBA", (128, 128))
    for y in range(14, 115):
        for x in range(20, 108):
            img.putpixel((x, y), (42, 65, 83, 255))
    img.save(good)
    assert gate.audit(good)["pixel_gate"] == "pass"

    wrong_grid = gate.audit(good, grid=(3, 4), expected_size=(768, 1024))
    assert "runtime-dimensions-mismatch" in wrong_grid["issues"]
    assert "atlas-not-divisible-by-grid" in wrong_grid["issues"]

    no_alpha = folder / "opaque-logo.webp"
    Image.new("RGB", (128, 128), (20, 20, 20)).save(no_alpha)
    assert "no-alpha-channel" in gate.audit(no_alpha)["issues"]

    mislabeled = folder / "jpeg-disguised-as-webp.webp"
    Image.new("RGB", (128, 128), (20, 20, 20)).save(mislabeled, format="JPEG")
    assert "extension-content-mismatch" in gate.audit(mislabeled)["issues"]

    unsafe = folder / "magenta-bleed.png"
    img = Image.new("RGBA", (128, 128), (255, 0, 255, 0))
    img.putpixel((0, 40), (255, 0, 255, 200))
    img.save(unsafe)
    issues = gate.audit(unsafe)["issues"]
    assert "hidden-rgb-matte-needs-cleanup" in issues
    assert "visible-magenta-pixels-review" in issues
    assert "visible-outer-edge" in issues

print("Style-2 intake pixel gate: clean, invalid atlas, missing alpha and bleed checks passed")
