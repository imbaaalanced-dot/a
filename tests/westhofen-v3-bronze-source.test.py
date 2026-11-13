"""Safety, layer order and source-only contract for Westhofen V3 bronze pilot.
Do not infer historical or visual approval from these structural tests.
"""
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
DIR = ROOT / "docs/graphics/westhofen-v3"
NS = "{http://www.w3.org/2000/svg}"
PILOT = DIR / "westhofen-emblem-v3.svg"
COMPOSITE = DIR / "westhofen-composite-v3-candidate.svg"
V2 = ROOT / "docs/graphics/westhofen-v2/westhofen-composite-v2.svg"
assert V2.is_file(), "original version stays available"

def read(path):
    assert 0 < path.stat().st_size < 100_000, path
    root = ET.parse(path).getroot()
    assert root.tag == NS + "svg"
    assert root.get("width") == "768" and root.get("height") == "512"
    assert root.get("viewBox") == "0 0 768 512"
    ids = [n.get("id") for n in root.iter() if n.get("id")]
    assert len(ids) == len(set(ids)), (path, "duplicate ids")
    for n in root.iter():
        tag = n.tag.removeprefix(NS)
        assert tag not in {"script", "image", "foreignObject", "text", "animate", "animateTransform", "use"}, tag
        for k, value in n.attrib.items():
            assert not k.lower().startswith("on"), k
            assert "url(http" not in value.lower() and "data:" not in value.lower()
    return root, ids

emblem, ids = read(PILOT)
full, ids_full = read(COMPOSITE)
assert "bronze-emblem-v3" in ids and "bronze-emblem-v3" in ids_full
assert "bronze-emblem-v2" not in ids_full
for part in ("horizontal-sword-v3", "broad-oval-shield-v3", "curved-wing-left-v3", "curved-wing-right-v3", "open-helmet-v3"):
    assert part in ids, part
wing = next(n for n in emblem.iter() if n.get("id") == "curved-wing-right-v3")
assert wing.get("transform") == "translate(768 0) scale(-1 1)"
assert len([n for n in wing if n.tag == NS+"path"]) >= 4, "feather details on mirrored wing"
layers = [node.get("data-part") for node in full if node.get("data-part")]
assert layers.index("frame") < layers.index("altar-steps") < layers.index("bronze-emblem")
assert {"frame","altar-steps","ivy","bronze-emblem"}.issubset({node.get("data-part") for node in full.iter()})
emblem_layer = next(n for n in emblem.iter() if n.get("id") == "bronze-emblem-v3")
composite_layer = next(n for n in full.iter() if n.get("id") == "bronze-emblem-v3")
assert ET.tostring(emblem_layer) == ET.tostring(composite_layer), "candidate includes exactly the same new bronze layer"
assert not any("westhofen-emblem-v3.svg" in p.read_text("utf-8") for p in (ROOT/"dist/westhofen-art.js", ROOT/"dist/asset-manager.js")), "pilot must not be accidentally activated in live runtime"
print("Westhofen V3 source/candidate: alpha-capable standalone SVG, safe layer ids, feathered wings, preserved V2 runtime")
