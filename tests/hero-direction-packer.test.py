"""Contract tests for optional, real-frame 6x6 V5b atlas packaging."""
import importlib.util
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]


def load(name, filename):
    spec = importlib.util.spec_from_file_location(name, ROOT / filename)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


packer = load("hero_direction_packer", "tools/pack-hero-action-directions.py")
gate = load("hero_direction_gate", "tools/verify-hero-direction-candidate.py")


def paint(source, actor, facing, *, mode="valid", skip=None):
    pivot = packer.ACTORS[actor][1]
    for action in packer.ACTIONS:
        folder = source / actor / facing / action
        folder.mkdir(parents=True, exist_ok=True)
        for frame in range(6):
            if (action, frame) == skip:
                (folder / f"{frame:02d}.png").unlink(missing_ok=True)
                continue
            img = Image.new("RGBA", (128, 128), (0, 0, 0, 0))
            draw = ImageDraw.Draw(img)
            x = 38 + frame
            if mode == "opaque" and action == "attack" and frame == 0:
                draw.rectangle((0, 0, 127, 127), fill=(10, 10, 10, 255))
            elif mode == "bad-ground" and action == "attack" and frame == 0:
                draw.rectangle((x, 12, x+38, 92), fill=(60, 170, 180, 255))
            else:
                draw.rectangle((x, 22, x+39, pivot-1),
                               fill=(70+frame*10, 90, 170, 255))
            img.save(folder / f"{frame:02d}.png")


with tempfile.TemporaryDirectory() as folder:
    source = Path(folder) / "frames"
    output = Path(folder) / "export"
    paint(source, "marcel", "down")
    paint(source, "kim", "right")
    for actor, facing in (("marcel", "down"), ("kim", "right")):
        report, path = packer.pack(actor, facing, source, output)
        assert report["status"] == "candidate-unapproved"
        assert report["manual_art_approval"] is False
        assert report["anchor"] == list(packer.ACTORS[actor])
        assert report["bytes"] > 0 and path.is_file()
        assert path.with_suffix(".json").is_file()
        assert gate.inspect(path, actor, facing)["pixel_gate"] == "pass"
        with Image.open(path) as im:
            assert im.size == (768, 768) and im.mode == "RGBA"
            # Unused rows cannot accidentally expose copied artwork.
            for row in (0, 1, 3):
                for column in range(6):
                    alpha = im.getchannel("A").crop(
                        (column*128, row*128, (column+1)*128, (row+1)*128)
                    )
                    assert alpha.getbbox() is None
        try:
            packer.pack(actor, facing, source, output)
        except FileExistsError:
            pass
        else:
            raise AssertionError("unapproved candidate overwritten silently")
    try:
        packer.pack("marcel", "right", source, output)
    except ValueError:
        pass
    else:
        raise AssertionError("canonical V5b facing must be protected")

with tempfile.TemporaryDirectory() as folder:
    source = Path(folder) / "source"
    output = Path(folder) / "output"
    for bad in ("opaque", "bad-ground"):
        paint(source, "marcel", "left", mode=bad)
        try:
            packer.pack("marcel", "left", source, output)
        except ValueError:
            pass
        else:
            raise AssertionError("bad direction sprite passed: " + bad)
        assert not output.exists() or not list(output.glob("*.webp"))
    paint(source, "marcel", "left", skip=("attack", 3))
    try:
        packer.pack("marcel", "left", source, output)
    except FileNotFoundError:
        pass
    else:
        raise AssertionError("missing frame accepted")
# Loop/terminal holds are animation semantics, not a missing-frame bug.
with tempfile.TemporaryDirectory() as folder:
    source = Path(folder) / "frames"
    output = Path(folder) / "out"
    paint(source, "marcel", "down")
    for action, final, first in (("attack", 5, 0),
                                 ("hit", 5, 0),
                                 ("death", 5, 4)):
        folder_action = source / "marcel" / "down" / action
        (folder_action / f"{final:02d}.png").write_bytes(
            (folder_action / f"{first:02d}.png").read_bytes()
        )
    manifest, target = packer.pack("marcel", "down", source, output)
    assert target.is_file()
    for action in packer.ACTIONS:
        assert manifest["motion_checks"][action]["unique_frames"] == 5
        assert manifest["motion_checks"][action]["manual_identity_review"] == "required"

with tempfile.TemporaryDirectory() as folder:
    source = Path(folder) / "frames"
    output = Path(folder) / "out"
    paint(source, "kim", "right")
    action_dir = source / "kim" / "right" / "attack"
    (action_dir / "03.png").write_bytes((action_dir / "02.png").read_bytes())
    try:
        packer.pack("kim", "right", source, output)
    except ValueError as error:
        assert "unexpected repeats" in str(error)
    else:
        raise AssertionError("repeated middle action pose was accepted")
    assert not list(output.glob("*.webp")) if output.exists() else True

with tempfile.TemporaryDirectory() as folder:
    source = Path(folder) / "frames"
    output = Path(folder) / "out"
    paint(source, "kim", "up")
    # A still-standing death 01 to near-horizontal death 02 is a large skip
    # even though both are individually valid, opaque-free 128px sprites.
    row = source / "kim" / "up" / "death"
    collapse = Image.new("RGBA", (128, 128), (0, 0, 0, 0))
    ImageDraw.Draw(collapse).rectangle((31, 94, 95, 116), fill=(110, 60, 45, 255))
    collapse.save(row / "02.png")
    try:
        packer.pack("kim", "up", source, output)
    except ValueError as error:
        assert "abrupt collapse" in str(error)
    else:
        raise AssertionError("death pose height jump was accepted")
    assert not list(output.glob("*.webp")) if output.exists() else True

print("Hero direction packer: valid / intentional loop holds pass; bad alpha, crop, unexpected repeats and abrupt death jumps blocked")
