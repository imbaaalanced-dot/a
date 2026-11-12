"""Non-active Style-2 approved pilot graphics: hash, decode and memory QA.

This test verifies only art staged under dist/assets/style2-pilot-v1.
It does NOT claim a visual review, active runtime usage or Android testing.
"""
import hashlib
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "dist/assets/style2-pilot-v1"
MANIFEST = ROOT / "candidate-manifest.json"
assert MANIFEST.is_file(), "Staged pilot manifest is missing"
data = json.loads(MANIFEST.read_text(encoding="utf-8"))
files = data["files"]
assert data["runtime_active"] is False
assert data["status"] == "candidate-staged-owner-approved"
assert data["android_4gb_qa"] == "not-tested"
assert data["visual_canvas_qa"] == "not-tested"
assert len(files) == len(set(files)) == 34

h = hashlib.sha256()
byte_count = 0
decoded_bytes = 0
total_ground = total_edges = total_props = total_fx = total_ui = 0
for rel in sorted(files):
    assert ".." not in Path(rel).parts
    f = ROOT / rel
    payload = f.read_bytes()
    assert payload[:4] == b"RIFF" and payload[8:12] == b"WEBP"
    h.update(rel.encode("utf-8") + b"\0" + payload)
    byte_count += len(payload)
    with Image.open(f) as im:
        im.load()
        assert im.format == "WEBP"
        decoded_bytes += im.width * im.height * 4
        if rel.startswith("environment/ground/"):
            total_ground += 1
            assert im.size == (256, 256)
            assert im.mode in ("RGB", "RGBA")
        elif rel.startswith("environment/edges/"):
            total_edges += 1
            assert im.size == (256, 256) and im.mode == "RGBA"
            assert im.getchannel("A").getextrema()[0] == 0
        elif rel.startswith("environment/props/"):
            total_props += 1
            assert im.size == (256, 256) and im.mode == "RGBA"
            assert im.getchannel("A").getextrema()[0] == 0
        elif rel.startswith("effects/"):
            total_fx += 1
            assert im.size == (768, 128) and im.mode == "RGBA"
            for frame in range(6):
                bounds = (frame * 128, 0, (frame + 1) * 128, 128)
                crop = im.crop(bounds)
                assert crop.getchannel("A").getbbox(), (rel, frame)
                for x, y in ((0, 0), (127, 0), (0, 127), (127, 127)):
                    limit = 64 if rel == "effects/ambience_atlas.webp" else 24
                    assert crop.getchannel("A").getpixel((x, y)) < limit, (rel, frame)
        elif rel.startswith("ui/"):
            total_ui += 1
            assert im.mode == "RGBA" and im.width <= 512 and im.height <= 256
        else:
            raise AssertionError("unexpected asset category " + rel)

assert (total_ground, total_edges, total_props, total_fx, total_ui) == (6, 8, 5, 5, 10)
assert byte_count == data["compressed_bytes"] == 379112
assert h.hexdigest() == data["aggregate_sha256"] == (
    "ab89966f3b972463d5df907bae8badc8026da78ba75de1fbc402a030cec5e077")
# Software estimates only. Chrome, GPU copies and other cached assets need real profiling.
assert decoded_bytes < 22 * 1024 * 1024
print(f"Style-2 pilot approved staging passed: 34 WebPs, "
      f"{byte_count} bytes compressed, {decoded_bytes / 1048576:.2f} MiB "
      f"estimated fully decoded RGBA; no gameplay activation or Android claim")
