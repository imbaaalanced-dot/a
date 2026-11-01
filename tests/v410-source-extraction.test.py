import importlib.util
import numpy as np
from pathlib import Path
from PIL import Image,ImageDraw
p=Path(__file__).resolve().parents[1]/'tools/export-v410-directions.py'
spec=importlib.util.spec_from_file_location('v410_export',p);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
# A raised weapon crosses its nominal row boundary but remains isolated.
im=Image.new('RGBA',(400,1200));d=ImageDraw.Draw(im)
for row in range(12):
 for col in range(4):
  x,y=col*100+50,row*100+50;d.rectangle((x-10,y-15,x+10,y+25),fill=(60,60,50,255))
  if row==4 and col==2:d.line((x+10,y-10,x+25,y-65),fill=(100,90,80,255),width=4)
frames,meta=m.extract_frames(im)
assert len(frames)==48
assert meta['threshold']<=240
# Every opaque source pixel is assigned exactly once rather than cut or duplicated.
assert sum(np.count_nonzero(np.asarray(f)[:,:,3]) for f in frames)==np.count_nonzero(np.asarray(im)[:,:,3])
assert frames[4*4+2].height>90,'complete raised weapon is extracted beyond cell boundary'
# Two bodies joined by opaque pixels are ambiguous; fail closed rather than pad cuts.
d.line((50,50,150,50),fill=(60,60,50,255),width=3)
try:m.extract_frames(im)
except ValueError:pass
else:raise AssertionError('merged sprites must not receive a green padding-only report')
print('V4.1 source extraction keeps complete off-grid art, conserves alpha and rejects merged bodies')

# A fresh clone has runtime sheets but intentionally no generator masters.
# Running the export without all masters must leave shipped files untouched.
import tempfile
with tempfile.TemporaryDirectory() as directory:
 m.SOURCE=Path(directory)/'missing-masters';m.OUT=Path(directory)/'runtime'
 try:m.main()
 except ValueError as error:assert 'author sources' in str(error)
 else:raise AssertionError('incomplete masters must not overwrite the runtime manifest')
 assert not m.OUT.exists()
print('Missing source masters fail before touching runtime files')
