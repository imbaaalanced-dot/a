"""WebP header verification for TD2 assets without third-party dependencies.

Complements tests/assets.test.py: it checks existence, container format,
canvas size, VP8X alpha flag and download budgets from file headers only.
It does NOT decode pixel data and does not replace the Pillow-based
CI acceptance test.
"""
import struct
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIST_ASSETS = ROOT / 'dist' / 'assets'

failures = []
checked = 0


def read_webp_header(path):
    """Return (width, height, has_alpha_flag) parsed from a WebP container."""
    data = path.read_bytes()
    if len(data) < 12 or data[:4] != b'RIFF' or data[8:12] != b'WEBP':
        raise ValueError('not a RIFF/WEBP container')
    offset = 12
    width = height = None
    alpha_flag = None
    while offset + 8 <= len(data):
        chunk = data[offset:offset + 4]
        size = struct.unpack('<I', data[offset + 4:offset + 8])[0]
        payload = data[offset + 8:offset + 8 + size]
        if chunk == b'VP8X' and size >= 10:
            flags = payload[0]
            alpha_flag = bool(flags & 0x10)
            w = int.from_bytes(payload[4:7], 'little') + 1
            h = int.from_bytes(payload[7:10], 'little') + 1
            width, height = w, h
        elif chunk == b'VP8 ' and size >= 10 and width is None:
            # lossy: dims in the frame header after the 3-byte tag + 3-byte sync
            w = struct.unpack('<H', payload[6:8])[0] & 0x3FFF
            h = struct.unpack('<H', payload[8:10])[0] & 0x3FFF
            width, height = w, h
            alpha_flag = alpha_flag or False
        elif chunk == b'VP8L' and size >= 5 and width is None:
            # lossless: signature 0x2f then 14-bit dims minus one
            bits = struct.unpack('<I', payload[1:5])[0]
            width = (bits & 0x3FFF) + 1
            height = ((bits >> 14) & 0x3FFF) + 1
            alpha_flag = alpha_flag or bool((bits >> 28) & 1)
        offset += 8 + size + (size & 1)  # chunks are padded to even lengths
    if width is None or height is None:
        raise ValueError('no dimension-bearing chunk found')
    return width, height, alpha_flag


def check(path, *, size=None, alpha=None, budget=None, label=None):
    global checked
    path = Path(path)
    name = label or str(path.relative_to(ROOT))
    try:
        checked += 1
        assert path.is_file(), 'missing file'
        w, h, alpha_flag = read_webp_header(path)
        assert w > 0 and h > 0, f'invalid canvas {w}x{h}'
        if size is not None:
            assert (w, h) == size, f'canvas {w}x{h} != expected {size[0]}x{size[1]}'
        if alpha:
            assert alpha_flag, 'alpha flag missing (VP8X bit or VP8L alpha)'
        if budget is not None:
            file_size = path.stat().st_size
            assert file_size < budget, f'{file_size} bytes >= budget {budget}'
        print(f'ok  {name}: {w}x{h} alpha={alpha_flag} {path.stat().st_size}B')
    except Exception as exc:  # noqa: BLE001 - collect every failure
        failures.append(f'{name}: {exc}')
        print(f'FAIL {name}: {exc}')


HERO = DIST_ASSETS / 'hero'

for name in ('marcel-portrait-alpha9.webp', 'marcel-lantern-sprite-v1.webp'):
    check(HERO / name)

MENU = DIST_ASSETS / 'menu'
for name, limit in (
    ('memorial-yard-v4.webp', 200000),
    ('memorial-yard-mobile-v4.webp', 120000),
    ('crest-v4.webp', 60000),
):
    check(MENU / name, alpha=(name == 'crest-v4.webp'), budget=limit)

check(DIST_ASSETS / 'items' / 'equipment-v1.webp', size=(1024, 512))

for name, limit in (('monument-photo-v2.webp', 160000), ('ground-photo-v2.webp', 350000)):
    check(DIST_ASSETS / 'kirchende' / name, alpha=name.startswith('monument'), budget=limit)

ELEMENTAL = DIST_ASSETS / 'elemental'
for kind in ('mage', 'rift', 'bow', 'cannon', 'boomerang'):
    for typ, cell, cols, rows in (('towers', 512, 3, 1), ('projectiles', 128, 3, 1), ('impacts', 128, 6, 3)):
        if kind in ('bow', 'cannon', 'boomerang') and typ != 'towers':
            continue
        check(
            ELEMENTAL / f'{kind}-{typ}-v1.webp',
            size=(cols * cell, rows * cell),
            alpha=True,
            budget=450000,
        )
check(ELEMENTAL / 'enemies-v1.webp', size=(1024, 768), alpha=True, budget=1500000)
for kind in ('shadowwing', 'gargoyle', 'stormwing'):
    check(ELEMENTAL / f'{kind}-v1.webp', size=(512, 512), alpha=True, budget=200000)
check(ELEMENTAL / 'goethestrasse-memorial-v1.webp', size=(768, 768), alpha=True)

check(HERO / 'marcel-walk-reference-v1.webp', size=(384, 512), alpha=True, budget=250000)

check(
    DIST_ASSETS / 'westhofen' / 'westhofen-memorial-style2-v4.webp',
    size=(900, 600),
    alpha=False,
    budget=122880,
)

print(f'\n{checked} assets header-verified, {len(failures)} failures')
if failures:
    sys.exit(1)
