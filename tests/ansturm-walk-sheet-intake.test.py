"""Smoke tests for the read-only ansturm walk-sheet intake gate.

No runtime asset is touched; synthetic strips exercise accept and reject
paths of tools/verify-ansturm-walk-sheet.py only.
"""
import importlib.util
import tempfile
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
module_path = ROOT / "tools/verify-ansturm-walk-sheet.py"
spec = importlib.util.spec_from_file_location("ansturm_walk_intake", module_path)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


def make_sheet(path, cell=256, mode="valid"):
    sheet = Image.new("RGBA", (cell * 8, cell), (0, 0, 0, 0))
    draw = ImageDraw.Draw(sheet)
    for n in range(8):
        x = n * cell
        if mode == "opaque":
            draw.rectangle((x, 0, x + cell - 1, cell - 1), fill=(30, 26, 24, 250))
            continue
        ground_h = cell * .22 if mode == "ungrounded" else cell * .06
        spread = cell * (.16 - .02 * (n % 3)) if mode != "static" else 0
        draw.rectangle((x + cell * .40, cell * .16,
                        x + cell * .60, cell - ground_h),
                       fill=(70, 84, 110, 255))
        draw.rectangle((x + cell * .50 - spread, cell - ground_h - cell * .40,
                        x + cell * .50 + spread, cell - ground_h),
                       fill=(60 + n * 12, 70, 90, 255))
    sheet.save(path)


with tempfile.TemporaryDirectory() as tmp:
    tmp = Path(tmp)

    good = tmp / "walk_normal_n.png"
    make_sheet(good)
    r = module.analyze(good, "normal", "n")
    assert r["pixel_gate"] == "pass", r["issues"]
    assert r["frames_checked"] == 8
    assert r["art_approval"] == "manual-required"

    assert module.analyze(tmp / "missing.png", "runner", "e")["issues"] == ["missing-file"]

    try:
        module.analyze(good, "unknown_type", "n")
        raise AssertionError("unsupported type accepted")
    except ValueError:
        pass
    try:
        module.analyze(good, "normal", "up")
        raise AssertionError("unsupported direction accepted")
    except ValueError:
        pass

    for mode, expected in (("opaque", "no-true-transparent-background"),
                           ("static", "less-than-three-visible-silhouettes"),
                           ("ungrounded", "feet-not-grounded-at-cell-bottom")):
        p = tmp / (mode + ".png")
        make_sheet(p, mode=mode)
        r = module.analyze(p, "gargoyle", "s")
        assert r["pixel_gate"] == "hold", mode
        assert any(expected in issue for issue in r["issues"]), (mode, r["issues"])

    legacy = tmp / "legacy.png"
    Image.new("RGBA", (640, 480), (0, 0, 0, 0)).save(legacy)
    r = module.analyze(legacy, "siege", "w")
    assert r["pixel_gate"] == "hold"
    assert "requires-8-square-frames-horizontal-strip" in r["issues"]

    nonalpha = tmp / "nonalpha.png"
    Image.new("RGB", (256 * 8, 256), (0, 0, 0)).save(nonalpha)
    assert "requires-rgba" in module.analyze(nonalpha, "normal", "n")["issues"]

    boss = tmp / "walk_stonebreaker_w.png"
    make_sheet(boss)
    assert module.analyze(boss, "stonebreaker", "w")["pixel_gate"] == "pass"

print("Ansturm walk-sheet intake: 8-frame RGBA strips with true alpha, foot anchor and"
      " silhouettes accepted; opaque, static, ungrounded, wrong grid and format rejected")
