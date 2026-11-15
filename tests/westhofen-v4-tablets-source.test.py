"""Westhofen V4 side-tablets source gate: internal candidate validity plus live markers.

Evolution-proof: validates its own candidate and asserts the live dist asset still carries
the tablet markers (weathered slabs, no invented text, bolts, dark field). Not historical
approval or Android QA."""
from pathlib import Path
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
CAND = ROOT / "docs/graphics/westhofen-v4-tablets/westhofen-composite-v4-tablets.svg"
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
assert "<text" not in text, "no invented inscription text allowed"

def span(t, gid):
    s = t.index('<g id="%s">' % gid)
    e = t.index("</g>", s)
    return s, e + 4

def group_of(t, gid):
    s, e = span(t, gid)
    return t[s:e]

# Candidate: slabs inside the original frames, dark field and bolts kept.
for gid, x0, x1 in (("left-tablet", 88, 151), ("right-tablet", 655, 718)):
    group = group_of(text, gid)
    xs = [int(m.group(1)) for m in re.finditer(r"\bM(\d+)[ ,]", group)]
    assert xs, gid
    assert min(xs) >= x0 - 1 and max(xs) <= x1 + 1, (gid, min(xs), max(xs))
    assert 'fill="url(#deep)"' in group, (gid, "dark inner field missing")
    assert group.count("circle") == 2, (gid, "corner bolts missing")
    assert "#5d6d4e" in group, (gid, "moss at lower corners missing")

# Live markers: the dist asset tablets must still be weathered, text-free and bolted.
dist_text = DIST.read_text()
assert "<text" not in dist_text, "no text in live asset"
for gid in ("left-tablet", "right-tablet"):
    group = group_of(dist_text, gid)
    assert 'fill="url(#deep)"' in group, (gid, "live dark field lost")
    assert group.count("circle") == 2, (gid, "live corner bolts lost")
    assert "#5d6d4e" in group, (gid, "live moss patina lost")
print("V4 tablets gate: candidate valid, no text, slabs in bounds, live dist asset carries tablet markers")