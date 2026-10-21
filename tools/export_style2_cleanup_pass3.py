"""Export eleven imagegen edge-cleanup candidates; original V1/V2 stay unchanged.

Input JSON: [{"kind":"bow", "level":1, "source":"/path/generated.png"}, ...]
python tools/export_style2_cleanup_pass3.py candidates.json
"""
from pathlib import Path
import argparse
import json
from PIL import Image
from export_style2_cleanup import export, visible_box, ROOT

EXPECTED = {(kind,level) for kind in ('bow','cannon','mage','boomerang') for level in (1,2,3)}-{('cannon',1)}

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('candidates', type=Path)
    parser.add_argument('--out', type=Path, default=ROOT/'dist/assets/style2-user-towers-v3')
    args=parser.parse_args()
    inputs=json.loads(args.candidates.read_text())
    assert len(inputs)==11 and {(e['kind'],e['level']) for e in inputs}==EXPECTED, 'Expected exactly eleven distinct candidates'
    assets=[]
    for item in inputs:
        original=ROOT/f"dist/assets/style2-user-towers-v1/towers/tower_{item['kind']}_lv{item['level']}.png"
        # Mage L3 has a separate 30-pixel key-color remnant at x56..61.
        # Its measured 77,025-pixel main component is the placement reference.
        reference=(109,74,421,488) if (item['kind'],item['level'])==('mage',3) else None
        entry=export(Path(item['source']),original,args.out,'tower',item['kind'],item['level'],reference_box=reference)
        with Image.open(original) as im:
            entry['original_alpha_bbox']=list(visible_box(im))
        entry['reference_alpha_bbox']=list(reference or entry['original_alpha_bbox'])
        entry['bbox_delta']=[a-b for a,b in zip(entry['alpha_bbox_export'],entry['reference_alpha_bbox'])]
        assets.append(entry)
    data={'name':'td2-style2-cleanup-pass3','version':'3.0.0',
          'inherits':['../style2-user-towers-v1/manifest.json','../style2-user-towers-v2/manifest.json'],
          'runtime_cache_key':'cleanup-3','assets':assets,
          'status':'Imagegen variants; proportional export; opt-in only; real Android test pending.',
          'excluded':'Rift towers retain V1 to preserve intended violet magic.'}
    (args.out/'manifest.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({e['id']:e['bbox_delta'] for e in assets},indent=2))

if __name__=='__main__':
    main()
