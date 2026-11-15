"""Westhofen V4 pedestal-junction source gate: internal candidate validity plus live markers.

Evolution-proof: validates its own candidate and asserts the live dist asset still carries
the pedestal-junction markers (worn seams instead of continuous bright lines, contact
shadow under the altar foot). Not historical approval or Android QA."""
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
CAND = ROOT / "docs/graphics/westhofen-v4-base/westhofen-composite-v4-base.svg"
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

# Candidate: worn seams only, no continuous bright rectangle lines.
assert "#c0b3a2" not in text, "continuous bright seam lines still present in candidate"
assert text.count("#a89c86") == 4, "expected four worn seam replacements in candidate"
assert 'fill="#20271f"' in text, "altar-foot contact shadow strip missing in candidate"

# Step/altar silhouette anchors must remain present.
for anchor in ('M209 397 L554 397 L585 414 L188 414 Z', 'M241 287 L524 287 L547 304 L260 306 Z',
               'M148 473 h473 l16 -6 l15 20 h-505 Z'):
    assert anchor in text, "step/altar silhouette path missing in candidate"

# Live markers: the dist asset must still carry the worn pedestal junction.
dist_text = DIST.read_text()
assert "#c0b3a2" not in dist_text, "live asset still has continuous bright seam lines"
assert dist_text.count("#a89c86") == 4, "live asset lost worn seam replacements"
assert 'fill="#20271f"' in dist_text, "live asset lost the altar-foot contact shadow"
print("V4 pedestal-junction gate: candidate valid, worn seams only, live dist asset carries junction markers")