"""Westhofen V4 stone-frame source gate: internal candidate validity plus live markers.

The dist asset evolves module by module (frame, relief, pedestal, tablets); this gate must
not pin the whole asset to one era. It validates its own candidate and asserts that the
live dist asset still carries the V4-frame markers (irregular block palette and preserved
pillar structure). Not historical approval or Android QA."""
from pathlib import Path
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
CAND = ROOT / "docs/graphics/westhofen-v4-stoneframe/westhofen-composite-v4-frame.svg"
DIST = ROOT / "dist/assets/westhofen/westhofen-memorial-style2-v3-preview.svg"
NS = "{http://www.w3.org/2000/svg}"
PALETTE = ("#8a8577", "#7e7a6c", "#909082", "#6f7065", "#85806f", "#79766a", "#95917f")

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

geom = {"pillar-left-outer": (60, 122), "pillar-left-inner": (170, 232),
        "pillar-right-inner": (525, 587), "pillar-right-outer": (646, 708)}
for gid, (x0, x1) in geom.items():
    s = text.index('<g id="%s">' % gid)
    e = text.index("</g>", s)
    group = text[s:e]
    assert 'fill="url(#stone)"' in group, (gid, "front mass missing")
    assert 'fill="url(#stoneSide)"' in group, (gid, "side face missing")
    assert 'fill="url(#stoneTop)"' in group, (gid, "top cap missing")
    xs = [int(m.group(1)) for m in re.finditer(r'<path d="M(\d+)[ ,][^>]*fill="#(?:8a8577|7e7a6c|909082|6f7065|85806f|79766a|95917f)"', group)]
    assert xs, gid
    assert min(xs) >= x0 - 3 and max(xs) <= x1 + 3, (gid, min(xs), max(xs))

# Live markers: the dist asset must still carry the irregular block palette and the
# preserved pillar structure (not the old regular block stack with uniform joints).
dist_text = DIST.read_text()
for gid, (x0, x1) in geom.items():
    s = dist_text.index('<g id="%s">' % gid)
    e = dist_text.index("</g>", s)
    group = dist_text[s:e]
    assert 'fill="url(#stone)"' in group and 'fill="url(#stoneSide)"' in group and 'fill="url(#stoneTop)"' in group, (gid, "live pillar structure lost")
    assert any(c in group for c in PALETTE), (gid, "live irregular block palette lost")
print("V4 stone-frame gate: candidate valid, pillars in bounds, live dist asset carries frame markers")