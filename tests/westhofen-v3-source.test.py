"""Westhofen V3 bronze concept source gate (not historical approval or Android QA)."""
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "docs/graphics/westhofen-v3"
NS = "{http://www.w3.org/2000/svg}"
required = {"bronze-emblem-v3", "horizontal-sword-v3", "oval-shield-v3",
            "curved-feather-wing-left-v3", "curved-feather-wing-right-v3", "metal-helmet-v3"}
for name in ("westhofen-emblem-v3.svg", "westhofen-composite-v3.svg"):
    path = SRC / name
    data = path.read_bytes()
    assert len(data) < 100000, (name, "SVG source exceeds budget")
    root = ET.fromstring(data)
    assert root.tag == NS + "svg" and root.attrib["viewBox"] == "0 0 768 512", name
    assert root.attrib["width"] == "768" and root.attrib["height"] == "512", name
    nodes = list(root.iter())
    ids = [n.attrib["id"] for n in nodes if "id" in n.attrib]
    assert len(ids) == len(set(ids)), (name, "duplicate element IDs")
    assert required.issubset(ids), (name, required - set(ids))
    assert not any(n.attrib.get("id") == "bronze-emblem-v2" for n in nodes)
    for node in nodes:
        tag = node.tag.removeprefix(NS)
        assert tag not in {"image", "script", "foreignObject", "text", "animate", "animateTransform"}, (name, tag)
        for key, value in node.attrib.items():
            assert not key.lower().startswith("on"), (name, key)
            assert "data:" not in value.lower() and "url(http" not in value.lower(), (name, key)
    assert any(n.tag == NS + "path" for n in nodes)
    print(name, "SVG parsed, 768x512, unique layers and non-network shapes passed")

old = (ROOT / "docs/graphics/westhofen-v2/westhofen-composite-v2.svg").read_text().split('<g id="bronze-emblem-v2"')[0]
new = (SRC / "westhofen-composite-v3.svg").read_text().split('<g id="bronze-emblem-v3"')[0]
assert new == old, "V3 candidate must leave V2 frame, altar, steps and background untouched"
print("V3 bronze-only source replacement preserves original V2 backdrop")
