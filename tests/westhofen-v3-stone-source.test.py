"""Source-only Westhofen V3 stone/altar candidate: structural QA, not runtime/Android approval."""
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parents[1]
DIR=ROOT/"docs/graphics/westhofen-v3-stone"
NS="{http://www.w3.org/2000/svg}"
items={
    "stone-weathering-v3.svg":{"stone-weathering-v3","pillar-fissures","uneven-lintel-weathering"},
    "altar-weathering-v3.svg":{"altar-weathering-v3","side-relief-recess-v3","steps-patina-shading-v3"},
    "westhofen-composite-v3-stone.svg":{"stone-weathering-v3","altar-weathering-v3","forecourt-contact-shadow-v3","bronze-emblem-v3","stone-frame-v2","altar-steps-v2"}
}
for filename,expected in items.items():
    data=(DIR/filename).read_bytes()
    assert len(data)<100000,(filename,"source over budget")
    root=ET.fromstring(data)
    assert root.tag==NS+"svg"
    assert root.attrib["width"]=="768" and root.attrib["height"]=="512"
    assert root.attrib["viewBox"]=="0 0 768 512"
    elements=list(root.iter())
    ids=[e.attrib["id"] for e in elements if "id" in e.attrib]
    assert len(ids)==len(set(ids)),(filename,"duplicate ids")
    assert expected.issubset(set(ids)),(filename,expected-set(ids))
    for e in elements:
        assert e.tag.removeprefix(NS) not in {"text","image","script","foreignObject","animate","animateTransform"}
        for k,v in e.attrib.items():
            assert not k.lower().startswith("on"),(filename,k)
            assert "data:" not in v.lower() and "url(http" not in v.lower(),(filename,k)
    assert any(e.tag==NS+"path" for e in elements)
    print(filename,"safe SVG, 768x512, unique IDs, no scripts/images/text")

candidate=(DIR/"westhofen-composite-v3-stone.svg").read_text()
original=(ROOT/"docs/graphics/westhofen-v2/westhofen-composite-v2.svg").read_text()
for fixed in ('id="empty-bowl-pedestal-82"','id="empty-bowl-pedestal-623"','id="left-tablet"','id="right-tablet"'):
    assert fixed in original and fixed in candidate
assert candidate.index('id="stone-weathering-v3"')<candidate.index('id="left-tablet"')
assert candidate.index('id="forecourt-contact-shadow-v3"')<candidate.index('id="altar-steps-v2"')
assert candidate.index('id="altar-steps-v2"')<candidate.index('id="altar-weathering-v3"')<candidate.index('id="bronze-emblem-v3"')
assert not (ROOT/"dist/assets/westhofen/westhofen-memorial-style2-v3.webp").exists()
print("V3 stone/altar overlay order, 2026 empty-pedestal motifs and unchanged live runtime verified")
