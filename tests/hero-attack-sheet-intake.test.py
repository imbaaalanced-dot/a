"""Standalone smoke tests for the six-frame, read-only hero concept intake."""
import importlib.util
import tempfile
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
module_path = ROOT / "tools/verify-hero-attack-sheet.py"
spec = importlib.util.spec_from_file_location("hero_attack_intake", module_path)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


def make_sheet(path, mode="valid"):
    cell = 256
    sheet = Image.new("RGBA", (768, 512), (0, 0, 0, 0))
    draw = ImageDraw.Draw(sheet)
    for n in range(6):
        x, y = (n % 3) * cell, (n // 3) * cell
        if mode == "opaque":
            draw.rectangle((x, y, x+255, y+255), fill=(24, 29, 26, 240))
        else:
            offset = n * 8 if mode == "valid" else 0
            draw.rectangle((x+67+offset, y+40, x+137+offset, y+230),
                           fill=(50+n*14, 80, 110, 255))
    sheet.save(path)


with tempfile.TemporaryDirectory() as tmp:
    tmp = Path(tmp)
    good = tmp / "good.png"
    make_sheet(good)
    r, frames = module.analyze(good)
    assert r["pixel_gate"] == "pass", r["issues"]
    assert r["frames_checked"] == 6
    target = module.export_candidates(r, frames, tmp / "out")
    assert len(list(target.glob("*.png"))) == 6
    with Image.open(target / "00.png") as im:
        assert im.size == (128, 128) and im.mode == "RGBA"
    try:
        module.export_candidates(r, frames, tmp / "out")
        raise AssertionError("unapproved frames overwritten")
    except FileExistsError:
        pass
    for mode, expected in (("opaque", "no-true-transparent-background"),
                           ("recolor", "less-than-three-visible-silhouettes")):
        p = tmp / (mode + ".png")
        make_sheet(p, mode)
        check, bad_frames = module.analyze(p)
        assert check["pixel_gate"] == "hold", check
        assert any(expected in error for error in check["issues"]), check
        try:
            module.export_candidates(check, bad_frames, tmp / mode)
            raise AssertionError("invalid sheet exported")
        except ValueError:
            pass
        assert not (tmp / mode).exists()
    invalid = tmp / "invalid.png"
    Image.new("RGBA", (640, 480), (0, 0, 0, 0)).save(invalid)
    r, _ = module.analyze(invalid)
    assert r["pixel_gate"] == "hold" and "requires-3x2-square-cells" in r["issues"]

print("hero sheet intake: six genuine-alpha frames accepted; opaque, recolored, bad grid and overwrite rejected")
