"""Structural security and compositing contract for pre-release Westhofen V2 SVG source art.

These tests intentionally do NOT claim that the image is historically accurate,
visually approved, or that Chromium/physical Android has been tested.
"""
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1] / "docs" / "graphics" / "westhofen-v2"
NS = "{http://www.w3.org/2000/svg}"
CASES = {
    "westhofen-frame-v2.svg": ("stone-frame-v2", "frame"),
    "westhofen-altar-steps-v2.svg": ("altar-steps-v2", "altar-steps"),
    "westhofen-emblem-v2.svg": ("bronze-emblem-v2", "bronze-emblem"),
    "westhofen-composite-v2.svg": ("stone-frame-v2", "frame"),
}
for name, (part_id, part_kind) in CASES.items():
    p = ROOT / name
    data = p.read_bytes()
    assert len(data) < 100_000, (name, "source SVG exceeds audit budget")
    root = ET.fromstring(data)
    assert root.tag == f"{NS}svg", name
    assert root.attrib["viewBox"] == "0 0 768 512", name
    assert (root.attrib["width"], root.attrib["height"]) == ("768", "512"), name
    assert not (root.text or "").strip(), (name, "unexpected literal root text")
    nodes = list(root.iter())
    ids = [n.get("id") for n in nodes if n.get("id")]
    assert len(ids) == len(set(ids)), (name, "duplicate SVG ID")
    assert part_id in ids, (name, "missing expected layer")
    assert any(n.get("data-part") == part_kind for n in nodes), (name, "missing data-part")
    for n in nodes:
        tag = n.tag.removeprefix(NS)
        assert tag not in {"script", "image", "foreignObject", "text", "animate", "animateTransform"}, (name, "disallowed external/animated content", tag)
        for key, value in n.attrib.items():
            assert not key.lower().startswith("on"), (name, "inline handler")
            assert "url(http" not in value.lower() and "data:" not in value.lower(), (name, "external image/network data")
    assert any(n.tag == f"{NS}path" for n in nodes), (name, "no drawable geometry")
    print(name, "XML parsed; 768x512, unique groups, no embedded images, scripts or animation")

composite = ET.parse(ROOT / "westhofen-composite-v2.svg").getroot()
part_ids = {node.get("data-part") for node in composite.iter()}
assert {"frame", "altar-steps", "bronze-emblem", "ivy"}.issubset(part_ids)
assert not any(node.tag == f"{NS}text" for node in composite.iter())
print("Westhofen V2: compositing layer contracts and no fictional plaque lettering passed")
