# DENKMAL TD2 – Agentenleitfaden 3.0

Dieser Leitfaden regelt, wie autonome Agenten und KI-Assistenten an Denkmal TD2 arbeiten.
Er ersetzt die bisherige AGENTS.md („Fast Development Mode 2.1") vollständig.

## 1. Projekt-Snapshot

| Eigenschaft | Wert |
| --- | --- |
| Repository | `imbaaalanced-dot/a` (Default-Branch: `main`) |
| Spiel | Browser-Tower-Defense im Denkmal-Setting, statische App, kein Build-Step am Root |
| Grafikstil | Style 2 – isometrische 2.5D Dark Fantasy |
| Zielplattform | Mobile Browser, Android, 4 GB RAM, Hochformat, Touch |
| Veröffentlichung | GitHub Pages aus `dist/` (https://imbaaalanced-dot.github.io/a/) |
| Team | Solo-Entwicklung (imbaaalanced-dot); externe PRs werden nicht angenommen |
| Rolle des Agenten | Umsetzung, Art Direction, QA, Release-Vorbereitung |

Wichtig: Aktuelle Stände und offene PRs **vor jeder Arbeit auf GitHub prüfen**. Keine Annahmen über bereits gemergte Features.

## 2. Repo-Landkarte

- `dist/` – lauffähiges Spiel und veröffentlichter Build. Der Loader erwartet Assets hier und in `dist/assets/`.
- Alte Ansturm-URLs enthalten nur Weiterleitungen zur Spielstand-Sicherung; Ansturm wird separat in GitLab entwickelt.
- `tests/` – Node-Tests (`game.test.cjs`), Mobile-Suite (`TEST_MOBILE=1`), Python-Asset-Tests (`assets.test.py`).
- `docs/` – Level-Dokumentation, Style-2-Pässe, QA- und Abnahmeprotokolle, Performance-Benchmarks. **Historische Dokumente können überholt sein.**
- `docs/STYLE2_*.md` – verbindliche Style-2-Referenzen und Abnahmestände.
- `tools/`, `source-art/`, `originals/` – Werkzeuge und Original-Referenzen (Originale niemals überschreiben).

Schnellstart zum lokalen Prüfen:
```bash
python3 -m http.server 8777 --directory dist
node tests/game.test.cjs
TEST_MOBILE=1 node tests/game.test.cjs
python3 tests/assets.test.py
```

## 3. Verhaltensgrundsätze

1. **Kleinste wirksame Änderung.** Nur betroffene Dateien und direkte Abhängigkeiten anfassen. Keine Voll-Audits, kein Re-Launch von Refactorings ohne Auftrag.
2. **Nur Belegtes behaupten.** Keine erfundenen Testergebnisse, FPS-, RAM- oder Integrationsaussagen. Offen heißt offen.
3. **Vorhandenes wiederverwenden.** Bestehende Tests, Assets, Dokumente und Ergebnisse nutzen, bevor Neues entsteht.
4. **Ohne Rückfragen handeln, wenn das Risiko gering ist.** Bei hohem Risiko oder Schutzzonen (Abschnitt 8) vorher fragen.
5. **Datenintegrität bewahren.** Spielstände, Freischaltungen und historische Referenzen dürfen nie verloren gehen oder stillschweigend geändert werden.

## 4. Arbeitszyklus

```
Stand prüfen → Branch → umsetzen → testen → PR → Merge → Release verifizieren
```

1. **Branch:** Von aktuell verifiziertem `main` einen thematischen Branch erstellen (`feature/…`, `fix/…`, `assets/…`). Nie direkt auf `main` arbeiten.
2. **Umsetzen:** Änderung implementieren, klein und testbar halten.
3. **Testen:** Betroffene Tests aus Abschnitt 2 ausführen; fehlgeschlagene Pflichtchecks beheben, nicht ignorieren. CI (test.yml) muss grün sein.
4. **PR:** Commit + Pull Request mit knapper, fachlicher Beschreibung. Unvollständige Arbeit als Draft-PR.
5. **Merge/Release:** Nach grüner CI ohne weitere Freigabe mergen (Schutzzonen in Abschnitt 8 bleiben unangetastet). Nach Merge die veröffentlichte HTTPS-Vorschau unabhängig verifizieren – ein Merge beweist keine Veröffentlichung.

Bei „Weiter": die letzte sichere, offene Aufgabe fortführen.

## 5. Grafik und Assets (Style 2)

- Verbindliche Referenzen für Marcel und Kim verwenden; Originale unter `originals/` bleiben unangetastet.
- Vor jeder Neugenerierung prüfen, ob bereits eine brauchbare Animation/Asset existiert.
- Konsistenz sichern über: Perspektive, Alpha, Auflösung, Pivot, Insets, Framefolge, Atlas, Ladepfade, Speicherbedarf.
- Nur loader-unterstützte, optimierte Runtime-Assets integrieren; doppelte oder unbenutzte Dateien nicht blind löschen.
- Asset-Statuskette: **Generiert → Technisch geprüft → Integriert → Im Spiel geprüft.** „Integriert" erst nach nachgewiesenem Runtime-Laden und visueller Prüfung im Spiel behaupten.

## 6. Teststufen und Abnahme

| Stufe | Was | Aussagekraft |
| --- | --- | --- |
| 1 | Node-/Python-Tests (`node tests/game.test.cjs` etc.) | Logik und Assets – **keine** Browser-/Android-Abnahme |
| 2 | Chromium-Smoke-Test (Desktop) | UI/Runtime-Grundfunktion |
| 3 | Mobile-Emulation (`TEST_MOBILE=1`) | Layout/Touch-Indikatoren |
| 4 | Physisches Android-Gerät (optional, keine Pflicht) | Zusatzprüfung bei Bedarf; Stufe 1–3 genügen als Nachweis |

Jede Stufe getrennt ausweisen. Ohne physisches Gerät sind Stufe 1–3 der Nachweis; Stufe 4 ist optional und keine Abnahmepflicht mehr. Änderungen an Spielständen, Kernarchitektur oder großen Gameplay-Systemen weiterhin beim Nutzer abnehmen lassen.

## 7. Performance-Regeln

- Primärziele: FPS bei großen Gegnerwellen, RAM-Peaks, Grafik-Caching, Flackern, lange Sitzungen, Touch-Reaktivität.
- Vorher-/Nachher-Messwerte erfassen, wo möglich; keine unbelegten Versprechen.
- Worst-Case-Szenarien (viele Gegner, viele Projektile) bei Balancing-Änderungen immer mitdenken.
- Kampagne: maximal 2× Geschwindigkeit; den Developer-Modus nicht erneut einführen.

## 8. Schutzzonen – nur mit ausdrücklicher Freigabe

- Löschen von Branches, PRs, Assets oder Original-Referenzen.
- Irreversible Datenänderungen (inkl. Spielstände/Migrationsformate).
- Änderungen an bestehenden PRs anderer (hier: des Nutzers).
- Umgehung von Branch-Schutz oder CI-Pflichtchecks.

Alles andere im beauftragten Arbeitsumfeld (lokale Befehle, Tests, Diagnose, Sandbox-Berechtigungen) ohne zusätzliche Einzelfreigabe — einschließlich Merge grüner PRs nach Abschnitt 4 und dem Verzicht auf die physische Geräte-Abnahme (Stufe 4 optional, Abschnitt 6).

## 9. Berichtsformat

Kurz, technisch, ergebnisorientiert. Keine langen Einleitungen, keine mehrfachen Bestätigungen, keine Spekulation. Bei Blockern: Ursache, Auswirkung, ein nächster Schritt.

```
Änderung:    umgesetzt / offen
Test:        Stufe 1 bestanden / Stufe 2–4 offen / fehlgeschlagen (Grund)
PR/Commit:   tatsächliche Referenz
Merge/Release: bestätigter Status
Nächstes:    eine konkrete Aufgabe
```

**Ziel:** Denkmal TD2 schnell, stabil, grafisch einheitlich und performant weiterentwickeln – ohne Qualität, Datenintegrität oder Branch-Schutz zu opfern.
