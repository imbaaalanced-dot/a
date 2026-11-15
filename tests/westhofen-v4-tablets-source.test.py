"""Westhofen V4 tablets source gate (review only, not historical approval or Android QA)."""
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "docs/graphics/westhofen-v4-tablets"
CAND = SRC / "westhofen-composite-v4-tablets.svg"
DIST = ROOT / "dist/assets/westhofen/westhofen-memorial-style2-v3-preview.svg"
NS = "{http://www.w3.org/2000/svg}"

data = CAND.read_bytes()
assert len(data) < 100000, "SVG source exceeds budget"
root = ET.fromstring(data)
assert root.tag == NS + "svg" and root.attrib["viewBox"] == "0 0 768 512"
assert root.attrib["width"] == "768" and root.attrib["height"] == "512"
nodes = list(root.iter())
ids = [n.attrib["id"] for n in nodes if "id" in n.attrib]
assert len(ids) == len(set(ids)), "duplicate element IDs"
required = {"left-tablet", "right-tablet", "bronze-emblem-v3", "stone-weathering-v3",
            "altar-steps-v2", "altar-block", "side-relief-recess-v3", "forecourt-contact-shadow-v3",
            "pillar-left-outer", "pillar-right-outer"}
assert required.issubset(set(ids)), required - set(ids)
for node in nodes:
    tag = node.tag.removeprefix(NS)
    assert tag not in {"image", "script", "foreignObject", "text", "animate", "animateTransform"}, tag
    for key, value in node.attrib.items():
        assert not key.lower().startswith("on"), key
        assert "data:" not in value.lower() and "url(http" not in value.lower(), key

text = data.decode("utf-8")
assert "<text" not in text, "no invented inscription text allowed"

def span(t, gid):
    s = t.index('<g id="%s">' % gid)
    e = t.index("</g>", s)
    return s, e + 4

def group_of(t, gid):
    s, e = span(t, gid)
    return t[s:e]

# Tablet slabs must stay inside the original frames (left x88..151, right x655..718, y158..306).
import re
for gid, x0, x1 in (("left-tablet", 88, 151), ("right-tablet", 655, 718)):
    group = group_of(text, gid)
    xs = [int(m.group(1)) for m in re.finditer(r"\bM(\d+)[ ,]", group)]
    assert xs, gid
    assert min(xs) >= x0 - 1 and max(xs) <= x1 + 1, (gid, min(xs), max(xs))

# Everything outside the two tablet groups must be byte-identical to the live dist asset.
dist_text = DIST.read_text()
ls0, le0 = span(dist_text, "left-tablet")
rs0, re0 = span(dist_text, "right-tablet")
ls1, le1 = span(text, "left-tablet")
rs1, re1 = span(text, "right-tablet")
assert text[:ls1] == dist_text[:ls0], "prefix before tablets diverged"
assert text[le1:rs1] == dist_text[le0:rs0], "gap between tablets diverged"
assert text[re1:] == dist_text[re0:], "suffix after tablets diverged"
# the candidate keeps the frame bounds and the bolted corners of the original layout
for gid, fx, fy in (("left-tablet", 90, 160), ("right-tablet", 657, 160)):
    group = group_of(text, gid)
    assert 'fill="url(#deep)"' in group, (gid, "dark inner field missing")
    assert group.count("circle") == 2, (gid, "corner bolts missing")
print("V4 tablets candidate: valid SVG, no text, slabs in bounds, backdrop byte-identical to dist asset")