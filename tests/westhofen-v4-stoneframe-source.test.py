"""Westhofen V4 stone-frame source gate (review only, not historical approval or Android QA)."""
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "docs/graphics/westhofen-v4-stoneframe"
CAND = SRC / "westhofen-composite-v4-frame.svg"
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
required = {"pillar-left-outer", "pillar-left-inner", "pillar-right-inner", "pillar-right-outer",
            "bronze-emblem-v3", "stone-weathering-v3", "forecourt-contact-shadow-v3",
            "left-tablet", "right-tablet", "altar-steps-v2"}
assert required.issubset(set(ids)), required - set(ids)
for node in nodes:
    tag = node.tag.removeprefix(NS)
    assert tag not in {"image", "script", "foreignObject", "text", "animate", "animateTransform"}, tag
    for key, value in node.attrib.items():
        assert not key.lower().startswith("on"), key
        assert "data:" not in value.lower() and "url(http" not in value.lower(), key

# Pillar geometry must stay inside the original outer bounds so the
# stone-weathering-v3 overlays keep their position.
geom = {"pillar-left-outer": (60, 122), "pillar-left-inner": (170, 232),
        "pillar-right-inner": (525, 587), "pillar-right-outer": (646, 708)}
text = data.decode("utf-8")
for gid, (x0, x1) in geom.items():
    start = text.index('<g id="%s">' % gid)
    end = text.index("</g>", start)
    group = text[start:end]
    assert 'fill="url(#stone)"' in group, (gid, "front mass missing")
    assert 'fill="url(#stoneSide)"' in group, (gid, "side face missing")
    assert 'fill="url(#stoneTop)"' in group, (gid, "top cap missing")
    import re
    xs = [int(m.group(1)) for m in re.finditer(r'<path d="M(\d+)[ ,][^>]*fill="#(?:8a8577|7e7a6c|909082|6f7065|85806f|79766a|95917f)"', group)]
    assert xs, gid
    assert min(xs) >= x0 - 3 and max(xs) <= x1 + 3, (gid, min(xs), max(xs))
    assert group.count("pillow") == 0

# Everything outside the four pillar groups must be byte-identical to the
# live dist asset: bronze emblem, weathering overlays, tablets, shadows.
dist_text = DIST.read_text()
FIRST = '<g id="pillar-left-outer">'
LAST = "pillar-right-outer"
a1, a2 = text.index(FIRST), text.index("</g>", text.index(LAST)) + len("</g>")
b1, b2 = dist_text.index(FIRST), dist_text.index("</g>", dist_text.index(LAST)) + len("</g>")
assert text[:a1] == dist_text[:b1], "prefix before pillars diverged from dist asset"
assert text[a2:] == dist_text[b2:], "suffix after pillars diverged from dist asset"
print("V4 stone-frame candidate: valid SVG, pillars in bounds, backdrop byte-identical to dist asset")