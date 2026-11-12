#!/usr/bin/env python3
"""Stage owner-approved Style-2 pilot art, never activate it in gameplay.

Only WebPs necessary for one representation of each asset are installed.
No existing assets, manifests, level layouts or save files are modified.
Default is validation-only; --install requires a fresh destination.
"""
import argparse
import hashlib
import json
import tempfile
import zipfile
from pathlib import Path, PurePosixPath

PREFIX = "TD2_Style2_Assetpilot/"
GROUNDS = ("earth_damp", "gravel_path", "cobble_moss", "flagstone_ruins",
           "forest_floor", "leaf_litter")
EDGES = ("north", "south", "east", "west", "corner_nw", "corner_ne",
         "corner_sw", "corner_se")
PROPS = ("moss_boulder", "fallen_log", "root_cluster", "grass_tuft",
         "crumbling_wall")
FX = ("marcel_bolt", "marcel_impact", "kim_arrow", "kim_impact", "ambience")
UI = ("panel", "button_normal", "button_pressed", "hud_bar", "tower_card",
      "icon_gold", "icon_health", "icon_wave", "icon_ether", "icon_build")
ENVIRONMENT = (tuple("environment/ground/" + x + ".webp" for x in GROUNDS)
               + tuple("environment/edges/road_edge_" + x + ".webp" for x in EDGES)
               + tuple("environment/props/" + x + ".webp" for x in PROPS))
EFFECTS_UI = (tuple("effects/" + x + "_atlas.webp" for x in FX)
              + tuple("ui/" + x + ".webp" for x in UI))


def validate(archive, phase):
    archive = Path(archive)
    chosen = (ENVIRONMENT if phase == "environment" else EFFECTS_UI
              if phase == "effects-ui" else ENVIRONMENT + EFFECTS_UI)
    with zipfile.ZipFile(archive) as bundle:
        names = bundle.namelist()
        if len(names) != len(set(names)):
            raise ValueError("duplicate archive paths")
        for name in names:
            if (not name.startswith(PREFIX) or PurePosixPath(name).is_absolute()
                    or ".." in PurePosixPath(name).parts):
                raise ValueError("unsafe archive entry: " + name)
        manifest = json.loads(bundle.read(PREFIX + "manifest.json"))
        if (manifest.get("status") != "candidate-unapproved"
                or manifest.get("integrated") is not False):
            raise ValueError("unexpected source release status")
        records = {r["path"]: r for r in manifest["files"]}
        if len(records) != 67 or len(records) != len(manifest["files"]):
            raise ValueError("expected 67 unique source WebPs")
        if not set(chosen).issubset(records):
            raise ValueError("missing selected assets from manifest")
        bytes_total = 0
        for name in chosen:
            data = bundle.read(PREFIX + name)
            info = records[name]
            if (len(data) != info["bytes"] or
                    hashlib.sha256(data).hexdigest() != info["sha256"]):
                raise ValueError("hash mismatch: " + name)
            if not data.startswith(b"RIFF") or data[8:12] != b"WEBP":
                raise ValueError("not a WebP: " + name)
            bytes_total += len(data)
    return chosen, {
        "phase": phase, "file_count": len(chosen),
        "compressed_bytes": bytes_total,
        "archive_sha256": hashlib.sha256(archive.read_bytes()).hexdigest(),
        "files": list(chosen), "approval": "owner-approved-for-integration",
        "art_status": "requires-in-game-visual-review",
        "runtime_active": False, "android_4gb": "not-tested",
        "desktop_touch_chromium": "not-tested-for-these-pixels",
        "deployment": "not-done",
    }


def stage(archive, phase, destination, install=False):
    chosen, report = validate(archive, phase)
    destination = Path(destination)
    if not install:
        return report
    if destination.exists():
        raise FileExistsError("refusing to overwrite " + str(destination))
    if not destination.parent.is_dir():
        raise FileNotFoundError("destination parent does not exist")
    with tempfile.TemporaryDirectory(prefix="td2-stage-", dir=destination.parent) as temp:
        staged = Path(temp) / "stage"
        with zipfile.ZipFile(archive) as bundle:
            for name in chosen:
                target = staged / name
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(bundle.read(PREFIX + name))
        (staged / "staging-status.json").write_text(
            json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        staged.rename(destination)
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive", type=Path)
    parser.add_argument("--phase", choices=("environment", "effects-ui", "all"),
                        default="environment")
    parser.add_argument("--destination", type=Path,
                        default=Path("dist/assets/style2-pilot-v1"))
    parser.add_argument("--install", action="store_true")
    args = parser.parse_args()
    print(json.dumps(stage(args.archive, args.phase, args.destination, args.install),
                     ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
