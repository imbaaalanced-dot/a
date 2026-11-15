"""Westhofen V4 pedestal-junction source gate (review only, not historical approval or Android QA)."""
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "docs/graphics/westhofen-v4-base"
CAND = SRC / "westhofen-composite-v4-base.svg"
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
required = {"altar-steps-v2", "altar-block", "side-relief-recess-v3", "forecourt-contact-shadow-v3",
            "stone-weathering-v3", "altar-weathering-v3", "bronze-emblem-v3",
            "pillar-left-outer", "pillar-right-outer", "steps-patina-shading-v3", "steps-worn-seams-v3"}
assert required.issubset(set(ids)), required - set(ids)
for node in nodes:
    tag = node.tag.removeprefix(NS)
    assert tag not in {"image", "script", "foreignObject", "text", "animate", "animateTransform"}, tag
    for key, value in node.attrib.items():
        assert not key.lower().startswith("on"), key
        assert "data:" not in value.lower() and "url(http" not in value.lower(), key

text = data.decode("utf-8")
# The continuous bright rectangle-seams must be gone (worn seams replace them).
assert "#c0b3a2" not in text, "continuous bright seam lines still present"
assert text.count("#a89c86") == 4, "expected four worn seam replacements"

# The docs candidate must equal the live dist asset (runtime and review share one source of truth).
assert text == DIST.read_text(), "docs candidate differs from live dist asset"
# Everything outside the altar-steps-v2 group must be byte-identical to the previous asset revision:
# verify anchors instead of a second copy.
for anchor in ('M209 397 L554 397 L585 414 L188 414 Z', 'M241 287 L524 287 L547 304 L260 306 Z',
               'M148 473 h473 l16 -6 l15 20 h-505 Z'):
    assert anchor in text, "step/altar silhouette path missing"
print("V4 pedestal-junction: valid SVG, worn seams, docs candidate matches live dist asset")