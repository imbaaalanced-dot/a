"""Verify Style-2 pilot staging without requiring private artwork in CI."""
import hashlib
import importlib.util
import json
import tempfile
import zipfile
from pathlib import Path

root = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location(
    "style2_pilot", root / "tools/stage-style2-pilot.py")
pilot = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pilot)

assert len(pilot.ENVIRONMENT) == 19
assert len(pilot.EFFECTS_UI) == 15
chosen = pilot.ENVIRONMENT + pilot.EFFECTS_UI
assert len(set(chosen)) == 34

with tempfile.TemporaryDirectory() as workspace:
    tmp = Path(workspace)
    archive = tmp / "candidate.zip"
    records = []
    data_by_path = {}
    for index, name in enumerate(chosen + tuple(
            f"internal/unused-{i:02d}.webp" for i in range(33))):
        data = b"RIFF" + index.to_bytes(4, "little") + b"WEBP" + bytes([index])
        data_by_path[name] = data
        records.append({
            "path": name, "bytes": len(data),
            "sha256": hashlib.sha256(data).hexdigest()})
    def bundle(target, *, tampered=False, unsafe=False):
        with zipfile.ZipFile(target, "w") as z:
            manifest = {
                "status": "candidate-unapproved", "integrated": False,
                "files": records}
            z.writestr(pilot.PREFIX + "manifest.json", json.dumps(manifest))
            for name, payload in data_by_path.items():
                z.writestr(pilot.PREFIX + name,
                           b"broken" if tampered and name == chosen[0] else payload)
            if unsafe:
                z.writestr(pilot.PREFIX + "../escape.txt", "no")
    bundle(archive)
    destination = tmp / "new-stage"
    report = pilot.stage(archive, "environment", destination)
    assert report["file_count"] == 19
    assert not destination.exists(), "dry-run must not touch disk"
    assert pilot.stage(archive, "effects-ui", destination)["file_count"] == 15
    report = pilot.stage(archive, "all", destination, install=True)
    assert report["file_count"] == 34
    assert report["runtime_active"] is False
    assert report["android_4gb"] == "not-tested"
    assert sum(p.suffix == ".webp" for p in destination.rglob("*")) == 34
    assert (destination / "staging-status.json").is_file()
    try:
        pilot.stage(archive, "all", destination, install=True)
    except FileExistsError:
        pass
    else:
        raise AssertionError("existing destination was overwritten")
    bundle(tmp / "tamper.zip", tampered=True)
    try:
        pilot.validate(tmp / "tamper.zip", "environment")
    except ValueError as exc:
        assert "hash mismatch" in str(exc)
    else:
        raise AssertionError("modified asset accepted")
    bundle(tmp / "traversal.zip", unsafe=True)
    try:
        pilot.validate(tmp / "traversal.zip", "all")
    except ValueError as exc:
        assert "unsafe archive entry" in str(exc)
    else:
        raise AssertionError("ZIP traversal path accepted")

print("Style-2 pilot staging: phase ordering, hashes, safe paths, dry-run, "
      "no overwrite and nonactivation passed.")
