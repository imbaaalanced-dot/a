# TD2 V6 – Turm-Sprite-Integration

## Stand

**Alle zwölf WebP-Dateien liegen im Entwicklungsbranch.** Der einmalige SHA-256-geprüfte Import über GitHub Actions war erfolgreich (Asset-Commit `5d411e4a7f5ea3956ef5cbed664d30243705b6b1`).

Der Canvas-Renderer `dist/style2-v6-towers.js` wird nach `style2-user-towers-v4.js` geladen. Standardmäßig bleibt die bestehende V4-Darstellung aktiv.

- Aktivieren: `?td2V6Towers=1`
- Deaktivieren / Rollback: Parameter entfernen oder `?td2V6Towers=0`
- Mapping: `bow→bogen`, `cannon→kanone`, `rift→riftlanze`, `mage→eis`
- Jeweils L1–L3, 256 × 256 Pixel, RGBA WebP; Bodenanker 0.9531, Canvas-Anzeigegröße 112
- Kein Austausch der Helden-Assets, der Geschosse, der Spielstände oder von V4-Quelldateien
- Während Lade-/Dekodierfehlern: automatischer Rückfall auf V4; begrenzter Bildcache

## Eingebundene Dateien

```text
dist/assets/style2-v6-candidates/tuerme/upgrade_stufen/
  bogen_l1.webp bogen_l2.webp bogen_l3.webp
  kanone_l1.webp kanone_l2.webp kanone_l3.webp
  riftlanze_l1.webp riftlanze_l2.webp riftlanze_l3.webp
  eis_l1.webp eis_l2.webp eis_l3.webp
```

Gesamtgröße aller zwölf WebPs: 246.788 Bytes (gerundet 247 KB).

## Tests

```bash
node tests/v6-towers.test.cjs
node tests/v6-tower-assets.test.cjs
node tests/cache-busting.test.cjs
```

Der abgeschlossene GitHub-Importjob hat den ZIP-Digest, alle zwölf Bild-Prüfsummen und die beiden V6-Node-Tests bestätigt. Die Dateien wurden zusätzlich lokal per Pillow als 256×256-RGBA-WebPs dekodiert.

## Vor Freigabe offen

- CI des letzten Repository-Commits abschließen und auf weitere Regressionen prüfen.
- Aktive Darstellung mit `?td2V6Towers=1` im Desktop-Chromium und im mobilen Hochformat visuell abnehmen.
- Physisches Android-Gerät (4 GB RAM) getrennt prüfen.
- Kein Merge und kein Release ohne ausdrückliche Freigabe.

`tools/import-v6-tower-webps.py` bleibt zur reproduzierbaren, SHA-256-gesicherten Wiederherstellung des Assetpakets im Repository. Der temporäre Übertragungsworkflow wird nach erfolgreichem Import entfernt.
