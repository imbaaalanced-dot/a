#!/usr/bin/env python3
"""Erzeugt die Beta-Asset-Matrix mit Vorschaubildern aus der Unreferenced-CSV.

Liest docs/beta-inventar-2026-11-17-unreferenced.csv (Kandidatenliste aus PR #365),
generiert Miniaturvorschauen (Pillow) und schreibt:

- docs/asset-matrix-2026-11-18/asset-matrix.csv  (Vorschlag + Entscheidungsspalte)
- docs/asset-matrix-2026-11-18/index.html        (Galerie nach Ordner gruppiert)
- docs/asset-matrix-2026-11-18/previews/         (WebP-Thumbnails)

Die Spalte "Vorschlag" ist eine Heuristik auf Basis der Bestandsaufnahme;
die endgültige Entscheidung (Behalten/Überarbeiten/Archivieren/Löschen)
trifft Marcel. Nichts wird gelöscht oder verschoben.
"""

import csv
import html
import sys
from pathlib import Path

from PIL import Image, ImageFile

ImageFile.LOAD_TRUNCATED_IMAGES = True

REPO = Path(__file__).resolve().parent.parent
CSV_IN = REPO / "docs/beta-inventar-2026-11-17-unreferenced.csv"
OUT_DIR = REPO / "docs/asset-matrix-2026-11-18"
PREVIEW_DIR = OUT_DIR / "previews"
THUMB_MAX = 128
IMAGE_EXTS = {".webp", ".png", ".svg", ".jpg", ".jpeg", ".gif", ".b64"}

PROTECTED_PREFIXES = [
    ("assets/hero/voice/", "BEHALTEN", "Voice-over-Assets, P1-Audiosystem #330"),
    ("assets/menu/v6/", "BEHALTEN", "aktives v6-Menue, per marcel-menu-wand-Test gepinnt"),
]

VORBEHALT_PREFIXES = [
    ("assets/menu/v5-avatars/", "PRUEFEN", "vermutlich durch canonical-hero-art-v5 abgeloest"),
    ("assets/barracks/", "PRUEFEN", "Manifest/Loader-Ressourcen, Doku-Dateien"),
    ("assets/elemental/", "PRUEFEN", "dynamisch zusammengesetzte Pfade moeglich"),
    ("assets/directional-v410/", "PRUEFEN", "Manifest-Loader, Referenz aus #330-Kontext"),
]

LEGACY_MARKERS = [
    "-alpha8", "-alpha9", "-v1.", "-v1/", "-v2.", "-v3.", "-v4.", "-v27", "-v5-av",
    "_v1.", "alpha8", "hellscape-map", "stone-terrain",
]


def propose(rel: str) -> tuple[str, str | None]:
    scoped = rel[len("dist/"):] if rel.startswith("dist/") else rel
    for prefix, status, reason in PROTECTED_PREFIXES:
        if scoped.startswith(prefix):
            return status, reason
    for prefix, status, reason in VORBEHALT_PREFIXES:
        if scoped.startswith(prefix):
            return status, reason
    if not rel.endswith(tuple(IMAGE_EXTS)):
        return "PRUEFEN", "keine Bilddatei (Manifest/Doku/Daten), kein Runtime-Fetch im Scan"
    if scoped.startswith("assets/hero"):
        return "PRUEFEN", "Helden-Asset, Referenz-Lock docs/art/HERO_REFERENCE_LOCK_20261107.md"
    lowered = scoped.lower()
    if any(marker in lowered for marker in LEGACY_MARKERS):
        return "ARCHIV/LOESCHEN (Vorschlag)", "Legacy-Version/Zwischenstand laut Bestandsaufnahme"
    if "/style2-user-towers-" in rel or "style2-pilot" in rel or "style2-v6-candidates" in rel:
        return "ARCHIV/LOESCHEN (Vorschlag)", "Style-2-Zwischenstand"
    if "reference" in lowered and "ground" not in lowered:
        return "ARCHIV/LOESCHEN (Vorschlag)", "abgeloeste Referenz-Renderstufe"
    return "PRUEFEN", "kein eindeutiger Befund, Runtime-Request-Log verifizieren"


def thumb_name(rel: str) -> str:
    return rel.replace("../", "").replace("/", "__") + ".webp"


def make_thumb(src: Path, dst: Path) -> bool:
    try:
        with Image.open(src) as im:
            im.thumbnail((THUMB_MAX, THUMB_MAX))
            dst.parent.mkdir(parents=True, exist_ok=True)
            im.save(dst, "WEBP", quality=70, method=4)
        return True
    except Exception:
        return False


def main() -> int:
    if not CSV_IN.exists():
        print(f"Eingabedatei fehlt: {CSV_IN}", file=sys.stderr)
        return 1
    PREVIEW_DIR.mkdir(parents=True, exist_ok=True)

    rows = []
    with CSV_IN.open(newline="", encoding="utf-8") as fh:
        for raw in csv.reader(fh, delimiter="\t"):
            if len(raw) < 2 or raw[0] == "path":
                continue
            rel, size = raw[0], int(raw[1])
            status, reason = propose(rel)
            ext = Path(rel).suffix.lower()
            preview = ""
            if ext in {".webp", ".png", ".gif", ".jpg", ".jpeg"}:
                dst = PREVIEW_DIR / thumb_name(rel)
                if dst.exists() or make_thumb(REPO / rel, dst):
                    preview = "previews/" + dst.name
            rows.append({"path": rel, "size": size, "status": status,
                         "reason": reason or "", "preview": preview})

    matrix_csv = OUT_DIR / "asset-matrix.csv"
    with matrix_csv.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.writer(fh)
        writer.writerow(["path", "size_bytes", "vorschlag", "begruendung",
                         "vorschau", "entscheidung_marcel"])
        for row in rows:
            writer.writerow([row["path"], row["size"], row["status"],
                             row["reason"], row["preview"], ""])

    groups: dict[str, list[dict]] = {}
    for row in rows:
        parts = row["path"].split("/")
        key = "/".join(parts[:-1]) if len(parts) > 2 else "(Top-Level)"
        groups.setdefault(key, []).append(row)

    def order(item: tuple[str, list[dict]]) -> tuple[int, str]:
        return (item[0] == "(Top-Level)", item[0])

    parts_html = []
    total = sum(r["size"] for r in rows)
    counts: dict[str, int] = {}
    for row in rows:
        counts[row["status"]] = counts.get(row["status"], 0) + 1
    parts_html.append("<h2>Uberblick</h2><ul>")
    parts_html.append(f"<li>Kandidaten: {len(rows)} Dateien / {total / 1e6:.1f} MB</li>")
    for status in sorted(counts):
        parts_html.append(f"<li>{html.escape(status)}: {counts[status]}</li>")
    parts_html.append("</ul>")
    parts_html.append(
        "<p>Der Vorschlag ist eine Heuristik aus der Bestandsaufnahme "
        "(docs/beta-inventar-2026-11-17.md). Entscheidung: Marcel.</p>")

    for group, items in sorted(groups.items(), key=order):
        parts_html.append(f"<h2>{html.escape(group)}</h2>")
        parts_html.append("<table><tr><th>Vorschau</th><th>Datei</th>"
                          "<th>Groesse</th><th>Vorschlag</th><th>Begruendung</th>"
                          "<th>Entscheidung</th></tr>")
        for row in sorted(items, key=lambda r: r["path"]):
            preview = (f'<img src="{row["preview"]}" loading="lazy" alt="">'
                       if row["preview"] else "&ndash;")
            parts_html.append(
                "<tr>"
                f"<td>{preview}</td>"
                f"<td><code>{html.escape(row['path'])}</code></td>"
                f"<td>{row['size'] / 1024:.0f} KB</td>"
                f"<td>{html.escape(row['status'])}</td>"
                f"<td>{html.escape(row['reason'])}</td>"
                "<td></td></tr>")
        parts_html.append("</table>")

    doc = f"""<!doctype html>
<html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Beta-Asset-Matrix (18.11.2026)</title>
<style>
body{{font-family:system-ui,sans-serif;margin:1rem;background:#14151b;color:#e8e8ee}}
table{{border-collapse:collapse;width:100%;margin-bottom:2rem}}
th,td{{border:1px solid #33374a;padding:.35rem .5rem;text-align:left;vertical-align:top}}
th{{background:#1d2030;position:sticky;top:0}}
img{{width:128px;height:128px;object-fit:contain;background:#0d0e14;display:block}}
code{{font-size:.8em;word-break:break-all}}
h2{{margin-top:2rem}}
td:nth-child(6){{min-width:6em;background:#1a1c28}}
</style></head><body>
<h1>Beta-Asset-Matrix &ndash; unreferenzierte Kandidaten</h1>
{chr(10).join(parts_html)}
</body></html>
"""
    (OUT_DIR / "index.html").write_text(doc, encoding="utf-8")
    print(f"{len(rows)} Eintraege, {counts}")
    print(f"Vorschauen: {len(list(PREVIEW_DIR.glob('*.webp')))}")
    print(f"Ausgabe: {OUT_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
