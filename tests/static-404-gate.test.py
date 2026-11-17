"""Static 404 gate for the TD2 dist build.

Verifies that every statically referenced local file in the shipped
HTML/JS/CSS actually exists on disk, so broken asset paths, cache-key
typos and missing files fail in CI instead of as browser 404s.

Pure standard library: no browser, no Pillow, runs everywhere.
Only literal static references are checked; dynamically composed
paths (template literals, string concatenation) are skipped.
"""
import re
import sys
from pathlib import Path

DIST = Path(__file__).resolve().parents[1] / 'dist'

missing = []
checked_paths = set()

# Skip anything that is clearly not a local file reference.
SKIP_PREFIXES = ('http://', 'https://', '//', '#', 'data:', 'mailto:',
                 'javascript:', 'tel:', 'blob:')

# Literal local asset references inside JS/CSS sources.
REF_IN_CODE = re.compile(
    r"""['"(](?:\./)?((?:assets|config|sprites|sounds?)/[A-Za-z0-9_./-]+\.[A-Za-z0-9]{2,4}|(?:app|render|model|storage|tutorial|sprites|config|asset-manifest|run-state)\.js)['")?]"""
)
# HTML src/href attributes.
ATTR = re.compile(r"""(?:src|href)\s*=\s*["']([^"']+)["']""")

html_files = sorted(DIST.rglob('*.html'))
code_files = sorted(list(DIST.rglob('*.js')) + list(DIST.rglob('*.css')))

for html in html_files:
    base_dir = html.parent
    for match in ATTR.finditer(html.read_text(encoding='utf-8', errors='replace')):
        ref = match.group(1).strip()
        if not ref or ref.startswith(SKIP_PREFIXES):
            continue
        clean = ref.split('#', 1)[0].split('?', 1)[0]
        if not clean:
            continue
        target = (base_dir / clean).resolve()
        try:
            target.relative_to(DIST)
        except ValueError:
            continue  # outside dist (should not happen) - ignore
        key = str(target)
        if key in checked_paths:
            continue
        checked_paths.add(key)
        if not target.is_file() and not target.is_dir():
            missing.append(f'{html.relative_to(DIST)} -> {ref} (missing {clean})')

for code in code_files:
    for match in REF_IN_CODE.finditer(code.read_text(encoding='utf-8', errors='replace')):
        ref = match.group(1)
        # Runtime resolves relative references against the including page URL,
        # which for every shipped page sits in the same directory as the code file.
        target = (code.parent / ref).resolve()
        key = str(target)
        if key in checked_paths:
            continue
        checked_paths.add(key)
        if not target.is_file():
            missing.append(f'{code.relative_to(DIST)} -> {ref} (missing)')

for entry in missing:
    print(f'FAIL {entry}')
print(f'{len(checked_paths)} local references checked across '
      f'{len(html_files)} HTML and {len(code_files)} JS/CSS files, '
      f'{len(missing)} missing')
if missing:
    sys.exit(1)
