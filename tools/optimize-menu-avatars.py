#!/usr/bin/env python3
"""Optimize two user-supplied RGBA character portraits for the TD2 V5 mobile menu.
Sources are supplied separately. The script never changes gameplay files or saves.
"""
from io import BytesIO
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "dist/assets/menu/v5-avatars"
ASSETS = {
    "marcel-source.png": "marcel-guardian-v5.webp",
    "kim-source.png": "kim-marksman-v5.webp",
}
LIMIT = 150_000

def optimize(src: Path, dst: Path) -> None:
    with Image.open(src) as image:
        rgba = image.convert("RGBA")
        bounds = rgba.getchannel("A").getbbox()
        if not bounds:
            raise ValueError(f"{src.name} contains no visible pixels")
        rgba = rgba.crop(bounds)

        for maximum_width in (640, 560, 480, 400):
            candidate = rgba.copy()
            candidate.thumbnail((maximum_width, 980), Image.Resampling.LANCZOS)
            for quality in (80, 72, 64, 56, 48, 40):
                output = BytesIO()
                candidate.save(output, "WEBP", quality=quality, method=5, exact=True)
                if output.tell() <= LIMIT:
                    dst.write_bytes(output.getvalue())
                    with Image.open(dst) as final:
                        assert final.format == "WEBP"
                        assert final.mode == "RGBA", dst
                        final.load()
                    print(f"{src.name} -> {dst.name}: {candidate.width}x{candidate.height}, {dst.stat().st_size} bytes")
                    return
    raise RuntimeError(f"Could not make {src.name} smaller than {LIMIT} bytes without unacceptable downscaling")

def main():
    missing = [name for name in ASSETS if not (ROOT / name).is_file()]
    if missing:
        raise SystemExit("Missing portrait source files: " + ", ".join(missing))
    for name, out in ASSETS.items():
        optimize(ROOT / name, ROOT / out)

if __name__ == "__main__":
    main()
