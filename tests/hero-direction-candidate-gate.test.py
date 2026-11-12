"""Regression QA: future directional art must pass actual decoded alpha checks."""
import importlib.util
import tempfile
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
MODULE = ROOT / "tools/verify-hero-direction-candidate.py"
spec = importlib.util.spec_from_file_location("hero_direction_gate", MODULE)
gate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gate)

for hero, facing in (("marcel", "right"), ("kim", "left")):
    atlas = ROOT / "dist/assets/hero" / f"{hero}-side-actions-v5b.webp"
    report = gate.inspect(atlas, hero, facing)
    assert report["pixel_gate"] == "pass", (hero, report["issues"][:12])
    assert report["frames_checked"] == 18
    assert report["canonical_foot_pivot"] == (
        [64, 116] if hero == "marcel" else [64, 117]
    )
    assert report["art_approval"] == "manual-required", (
        "pixel gate must never claim artistic approval"
    )

with tempfile.TemporaryDirectory() as temp:
    base = Path(temp)
    opaque = base / "fake-sheet.webp"
    Image.new("RGBA", (768, 768), (32, 32, 32, 255)).save(
        opaque, "WEBP", lossless=True
    )
    report = gate.inspect(opaque, "marcel", "left")
    assert report["pixel_gate"] == "hold"
    assert any("opaque-background" in problem for problem in report["issues"])
    assert report["art_approval"] == "manual-required"

    wrong = base / "wrong-grid.webp"
    Image.new("RGBA", (1024, 768), (0, 0, 0, 0)).save(
        wrong, "WEBP", lossless=True
    )
    report = gate.inspect(wrong, "kim", "down")
    assert report["pixel_gate"] == "hold"
    assert "expected-768x768-6x6-cells" in report["issues"]
    assert gate.inspect(base / "missing.webp", "kim", "up")["pixel_gate"] == "hold"

print("Hero direction candidate gate: real V5b sheets pass, opaque/malformed/missing art held")
