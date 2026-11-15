"""Westhofen V4 altar-side-relief source gate: internal candidate validity plus live markers.

Evolution-proof: validates its own candidate and asserts the live dist asset still carries
the relief markers (chamfered surround, ledges, chisel marks) inside altar-block. Not
historical approval or Android QA."""
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
CAND = ROOT / "docs/graphics/westhofen-v4-relief/westhofen-composite-v4-relief.svg"
DIST = ROOT / "dist/assets/westhofen/westhofen-memorial-style2-v3-preview.svg"
NS = "{http://www.w3.org/2000/svg}"

def validate(path):
    data = path.read_bytes()
    assert len(data) < 100000, (path.name, "SVG source exceeds budget")
    root = ET.fromstring(data)
    assert root.tag == NS + "svg" and root.attrib["viewBox"] == "0 0 768 512", path.name
    assert root.attrib["width"] == "768" and root.attrib["height"] == "512", path.name
    ids = [n.attrib["id"] for n in root.iter() if "id" in n.attrib]
    assert len(ids) == len(set(ids)), (path.name, "duplicate element IDs")
    for node in root.iter():
        tag = node.tag.removeprefix(NS)
        assert tag not in {"image", "script", "foreignObject", "text", "animate", "animateTransform"}, (path.name, tag)
        for key, value in node.attrib.items():
            assert not key.lower().startswith("on"), (path.name, key)
            assert "data:" not in value.lower() and "url(http" not in value.lower(), (path.name, key)
    return data

cand = validate(CAND)
validate(DIST)
text = cand.decode("utf-8")

# Candidate: relief stays inside the original recess bounds; no scene, no text.
s = text.index('<g id="altar-block">')
e = text.index("</g>", s)
group = text[s:e]
assert 'fill="#5a5f52"' in group and 'fill="#4e5349"' in group, "chamfer/depth steps missing in candidate"
assert 'stroke="#7a7d6b"' in group, "chisel marks missing in candidate"
assert 'stroke="#2e352f"' in group, "ledge shadow lines missing in candidate"
assert "<text" not in group and "<text" not in text, "no invented scene or text allowed"

# Live markers: the dist asset altar-block must still carry the relief composition.
dist_text = DIST.read_text()
ds = dist_text.index('<g id="altar-block">')
de = dist_text.index("</g>", ds)
dist_group = dist_text[ds:de]
for marker in ('fill="#5a5f52"', 'fill="#4e5349"', 'stroke="#7a7d6b"', 'stroke="#2e352f"'):
    assert marker in dist_group, ("live altar relief marker lost", marker)
assert "<text" not in dist_group, "no text in live altar relief"
print("V4 altar-relief gate: candidate valid, relief in bounds, live dist asset carries relief markers")