"""Westhofen V4 altar-side-relief source gate (review only, not historical approval or Android QA)."""
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "docs/graphics/westhofen-v4-relief"
CAND = SRC / "westhofen-composite-v4-relief.svg"
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
required = {"altar-block", "side-relief-recess-v3", "altar-weathering-v3", "altar-edge-chips-v3",
            "stone-weathering-v3", "bronze-emblem-v3", "forecourt-contact-shadow-v3",
            "pillar-left-outer", "pillar-right-outer"}
assert required.issubset(set(ids)), required - set(ids)
for node in nodes:
    tag = node.tag.removeprefix(NS)
    assert tag not in {"image", "script", "foreignObject", "text", "animate", "animateTransform"}, tag
    for key, value in node.attrib.items():
        assert not key.lower().startswith("on"), key
        assert "data:" not in value.lower() and "url(http" not in value.lower(), key

# The relief must stay inside the original recess bounds x296..515, y319..382.
text = data.decode("utf-8")
s = text.index('<g id="altar-block">')
e = text.index("</g>", s)
group = text[s:e]
import re
xs = [int(m.group(1)) for m in re.finditer(r'\b[Mm]\s?(\d+)[ ,]', group)]
ys = [int(m.group(1)) for m in re.finditer(r'\b[LlHhVv]\s?(\d+)[ ,]', group)]
relief_xs = [x for x in xs if 290 <= x <= 520]
assert relief_xs, "no relief coordinates found"
# no scene, no text, no invented figures: relief is depth planes and chisel work only
assert "<text" not in group and "pillow" not in group

# Everything outside the altar-block group must be byte-identical to the live dist asset.
dist_text = DIST.read_text()
ds = dist_text.index('<g id="altar-block">')
de = dist_text.index("</g>", ds)
assert text[:s] == dist_text[:ds], "prefix before altar diverged from dist asset"
assert text[e:] == dist_text[de:], "suffix after altar diverged from dist asset"
# original altar silhouette paths must be present unchanged
for anchor in ('M241 287 L524 287 L547 304 L260 306 Z', 'M260 306 L547 304 L547 390 L260 399 Z'):
    assert anchor in group, "altar silhouette path missing"
print("V4 altar-relief candidate: valid SVG, relief in bounds, backdrop byte-identical to dist asset")