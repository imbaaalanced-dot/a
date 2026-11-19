# Beta-Freigabe: Branches und Asset-Bereinigung (18.11.2026)

Dokumentiert die Freigabe „alles freigeben" vom 18.11.2026 (nach Marcels
Bulk-Freigabe im Beta-Meilenstein #330, Abschnitt 4 / Bestandsaufnahme
Abschnitt 8). Alle Maßnahmen sind über Backups vollständig reversibel.

## 1. Sicherungen vor jedem Schritt

- **Archiv-Branch:** `archive/alpha-snapshot-20261118` auf main-HEAD `025b5f1`
  (enthält den vollständigen Asset-Bestand vor Löschung).
- **Branch-Backup-Tags:** alle 23 gelöschten Branch-Köpfe liegen als annotierte
  Tags `alpha-branch-backup/<branch-name-mit-bindestrichen>` (23 Tags, 18.11.2026).
  Bei Squash-Merges sind die Original-Commits sonst nirgends erhalten;
  über die Tags ist jeder Branch wiederherstellbar.

## 2. Branch-Bereinigung (23 Branches)

Triage aus der Bestandsaufnahme Abschnitt 3, verifiziert gegen die PR-Historie:
14 Branches mit gemergtem PR, 5 mit geschlossenem PR (#291, #253, #311, #51 …),
4 ohne PR (`art/hero-reference-v6-pair-20261113`, `assets/hero-directional-v5-candidate2-20261113`,
`design/equipment-hybrid-boss-loot-20261020`, `docs/td2-v6-menu-gameplay-design-20261113`,
`diag/issue303-qa-20261115`) — alle per Backup-Tag gesichert und deshalb löschbar.

Gelöschte Branches: die 23 Kandidaten aus docs/beta-inventar-2026-11-17.md
Abschnitt 3 (Löschkandidaten-Liste). Erwartet verbleiben Haupt-,
Archiv- und aktive Feature-Branches unangetastet.

## 3. Asset-Löschung (24 Dateien, empirisch verifiziert)

Die Kandidatenliste (401) und der ARCHIV/LÖSCHEN-Vorschlag (249) aus der
Asset-Matrix erwiesen sich in der Verifikation als Obergrenze: Ein großer Teil
ist durch **aktive Tests** gepinnt, die über zusammengesetzte Template-Namen
(`tower_${kind}_lv${level}.webp`), Manifeste (`manifest.json`) und Verzeichnis-
Enumerierung auf die Dateien zugreifen — genau die in der Bestandsaufnahme
 dokumentierte False-Positive-Quelle. Tests sind hier der stärkste Proxy für
tatsächliche Runtime-Verwendung.

**Verifikationsmethode (dreistufig, je Stufe mit voller Test-Batterie):**

1. 249 Kandidaten − 60 per Basename in `tools/`, `tests/`, `ansturm-alpha1-5/`
   textuell referenzierte Dateien = 189 Kandidaten.
2. Lösch-Test der 189: 11 Suiten rot (u. a. `game.test.cjs`-Basispin auf
   `style2-user-towers-v1/v2/v3`, `style2-pilot-v1`, `style2-reference-*`,
   `alpha9-assets`, `style2-towers-v4`, `v4-alpha5`) → Rückschluss auf
   gepinnte Verzeichnisgruppen (156 Dateien) durch Analyse der Templates.
3. Lösch-Test der verbleibenden 33: nur `alpha9-assets.test.py` rot
   (weitere per `f'{name}.webp'` komponierte Top-Level-Türme) → diese Pinnings
   wurden ebenfalls restores. Finale Menge: 24 Dateien.

**Gelöscht (24 Dateien, ~14 MB):** vollständige Liste in
`docs/asset-matrix-2026-11-18/asset-matrix.csv` (Spalte `entscheidung_marcel`
= „LOESCHEN (freigegeben & ausgefuehrt 18.11.2026)"), u. a. Kirchende-Pilot-PNGs
(`towers/monument/mobs/items-v1.png`), Menü-Altbilder
(`button-*-v1`, `warden-*-v2`, `crest-v2`, Banner-Bilder), Ballisten-/Mörser-
legacy-Bögen (`tower-ballista-*-v2.png`, `tower-mortar-volcanic-v1.png`,
`tower-warden-shrine-v1.png`), `hellscape-map-v1.png`,
`hohensyburg/kaiser-wilhelm-v1.webp`, `projectile-fx-v3.svg`.

**Bewusst behalten (377 der 401):** durch aktive Tests gepinnt oder als
QA-Fixture referenziert; insbesondere die kompletten
`style2-user-towers-*`-, `style2-pilot-v1`-, `style2-reference-*`-,
`expansion-v2`- und `alpha9`-Bestände. Solange die_BASE-Suite diese Dateien
fordert, gelten sie als runtime-relevant. Eine echte Löschung dieser Blöcke
erfordert vorher ein Update der pinnenden Tests plus Runtime-Request-Logs.

## 4. Nachweis

- Volle Batterie grün nach Löschung: alle `tests/*.test.cjs` (inkl. `game.test.cjs`
  und `TEST_MOBILE=1`), alle `tests/*.test.py` (Pillow/numpy/scipy),
  `npm test --prefix ansturm-alpha1-5` (87/87), `python3 tests/assets.test.py`.
- CI des Bereinigungs-PRs läuft gegen denselben Baum.

---
Freigabe und Umsetzung im Rahmen von #330, Stand 18.11.2026 (main `025b5f1-Vorgängerstand`).
