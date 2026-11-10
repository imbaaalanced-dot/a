"""Regression checks for the read-only Style-2 enemy/boss sprite audit."""

import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "tools" / "audit-enemy-boss-style2.py"


def run_audit(image, grid="1x1"):
    completed = subprocess.run(
        [sys.executable, str(SCRIPT), "--grid", grid, str(image)],
        capture_output=True, text=True, check=False,
    )
    assert completed.returncode == 0, completed.stderr
    return json.loads(completed.stdout)["sprites"][0]


class SpriteAuditTests(unittest.TestCase):
    def test_transparent_rgb_matte_is_not_a_visible_border(self):
        with tempfile.TemporaryDirectory() as dirname:
            path = Path(dirname) / "clean.png"
            image = Image.new("RGBA", (32, 32))
            for y in range(8, 24):
                for x in range(8, 24):
                    image.putpixel((x, y), (90, 68, 51, 255))
            image.putpixel((0, 0), (255, 0, 0, 0))
            image.save(path)
            report = run_audit(path)
            self.assertEqual(report["min_visible_margin"], 8)
            self.assertEqual(report["visible_edge_cells"], 0)
            self.assertGreaterEqual(report["hidden_rgb_pixels"], 1)
            self.assertEqual(report["status"], "pixel-pass")

    def test_actual_visible_edge_prevents_pixel_approval(self):
        with tempfile.TemporaryDirectory() as dirname:
            path = Path(dirname) / "clipped.png"
            image = Image.new("RGBA", (32, 32))
            for y in range(8, 24):
                for x in range(0, 24):
                    image.putpixel((x, y), (90, 68, 51, 255))
            image.save(path)
            report = run_audit(path)
            self.assertEqual(report["min_visible_margin"], 0)
            self.assertEqual(report["visible_edge_cells"], 1)
            self.assertEqual(report["status"], "hold")

    def test_empty_atlas_cell_is_reported_separately(self):
        with tempfile.TemporaryDirectory() as dirname:
            path = Path(dirname) / "partial.png"
            image = Image.new("RGBA", (32, 16))
            for y in range(4, 12):
                for x in range(4, 12):
                    image.putpixel((x, y), (90, 68, 51, 255))
            image.save(path)
            report = run_audit(path, "2x1")
            self.assertEqual(report["cells"], 2)
            self.assertEqual(report["empty_cells"], [1])
            self.assertEqual(report["status"], "hold")


if __name__ == "__main__":
    unittest.main()
