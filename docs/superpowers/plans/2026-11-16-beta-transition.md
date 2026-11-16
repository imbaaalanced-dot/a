# Denkmal TD2 – Alpha → Beta: Superpowers-Arbeitsplan

Stand: 16. November 2026. Hauptauftrag: [Issue #330](https://github.com/imbaaalanced-dot/a/issues/330).
Quellstand der Bestandsaufnahme: `main` @ `11d9ca0ef417e9c89fd2d69bfa362ee3b52100a8` (GitHub-Abfrage, **kein** Release).
Erste Implementierung: [Draft-PR #331](https://github.com/imbaaalanced-dot/a/pull/331) (Inventar und Kasernen-Sterne).

## Verantwortlichkeit und Arbeitsmodus
- **Marcel ist Entwickler und trifft alle inhaltlichen, grafischen und historischen Richtungsentscheidungen.**
- Assistenz/Codex: eigenständige Implementierung, Debugging, automatisierte Tests, Refactoring im beauftragten Bereich, Commits, PRs und Issuepflege.
- **Grafikwahl bleibt eine Entscheidung:** Vor dem Austausch denkmalprägender Assets mindestens zwei Kandidaten oder eine begründete Behalten-Option mit direkter Spielvorschau präsentieren. Marcel wählt die Fassung und kann Änderungen verlangen.
- Änderungen an der Spielmechanik, die Konzept oder Spielstände grundlegend verändern, gesondert abnehmen. Routinefixes ohne Mikrogenehmigungen.
- Arbeitsregel: Änderungen auf Feature-Branches und über PR/CI; kein direkter Push auf `main`.

## Meilenstein A – Alpha sichern / P0 stabilisieren

### A1. Reproduzierbarer Start
- [x] Referenz des kontrollierten Alpha-`main` festgehalten.
- [x] Sicherheitsbranch `archive/alpha-before-beta-20261116` angelegt.
- [ ] Im weiteren Ablauf vollständige Branch-/Tag-/Release-/PR-/Issue-Inventur erzeugen, inklusive GitHub-Pages-Deployment und aller möglicherweise ungemergten Arbeiten.
- [ ] Vor jeder Löschung ein unabhängiges Backup mit allen gewünschten Referenzen auf einem separaten Remote/Archiv sicherstellen; *ein einzelner Branch ist noch kein unabhängiges Backup*.
- [ ] Live-URL und lokale Spielstände vor Umstellung exportieren; vorhandene Speicherkeys und Imports erhalten.

### A2. Kritische Spielprobleme (nach Risiko geordnet)
- [ ] Inventar in Hoch- und Desktopdarstellung immer schließen können; Bottom-Sheet, Touch-/Tastaturfall, Bildschirmrotation und Scrollposition testen. In PR #331 umgesetzt, CI/Abnahme noch ausstehend.
- [ ] Kasernensterne Stufe 1–3 analog zu anderen Türmen. In PR #331 umgesetzt, CI/Abnahme noch ausstehend.
- [ ] Schwarzer rechteckiger Hintergrund um aus der Kaserne rekrutierte Kämpfer: Alphakanal, Quellatlas, Sampling-/Crop-Ränder, Transparent-Key und tatsächliche Runtime-Bildpfade prüfen. Einzelne Frame-Ausschnitte bei 128px und auf Android ansehen.
- [ ] Kim/Marcel: Magentaflächen und fehlende Helden im Gameplay/Menü beheben; aktive Referenz-/Ladepfade und Bilddecodierung prüfen. Marcel mit Zauberstab, Kim mit Bogen. Neu entstandene Quellen erst nach Asset-Gate übernehmen.
- [ ] Speicherkompatibilität, Render-Fehlerfreiheit und Touchbedienung in beiden Modi sichern.

## Meilenstein B – Dokumentarische Umgebung (grafisches Freigabegate)
- [ ] Vorhandene Fotos und Zeichnungen nach **Level, Objekt, Quelle, Zeitbezug, Blickrichtung und Version** zuordnen. Gesicherte Befunde und Rekonstruktionen unterscheiden.
- [ ] Richtungsvariante des Denkmals anhand der Referenz: Vorderseite zur unteren Spielecke statt zu weit rechts; Varianten mit gemeinsamer Kamera/Beleuchtung nebeneinander zeigen.
- [ ] Straßenquerschnitt, Fahrbahnbelag, Gehweg/Bordstein, Wälder, Bäume, Gras und Bodentexturen an realen Aufnahmen orientieren; möglichst realistisch, aber top-down-spielbar.
- [ ] Fahrende Autos nur als optionale dekorative Szene und nach Geometrie-/Performanceabnahme.
- [ ] Ein Perspektiv-/Größenraster für Straße, Monument, Turm, Spieler und Vegetation.
- [ ] Von Marcel bestätigte Versionen im Manifest als `selected` markieren. Keine stillen Ersatzassets.

## Meilenstein C – Beide Modi erlebbar machen
- [ ] In Kampagne und Ansturm: Lautstärkekanäle, Audio-Unlock, Voice-over-Cues, Untertitel/Fallback ohne Ton, Treffer-/Schuss-/Magie-/Turm-Effekte.
- [ ] In Ansturm zunächst die **bereits gerenderten** Gegnertypen; Laufanimationen, Richtungen, Pivot und Looping grob sauber integrieren, erst danach Angriffszyklen verfeinern.
- [ ] Ansturm-Entwicklermodus mit 5× Tempo und stabiler Simulation; reguläre Kampagne weiterhin höchstens 2×.
- [ ] Jede Wirkung unter Last (Android 4 GB, Touch-Hochformat, FPS/Memory, lange Wellen) mit reproduzierbarem Test prüfen.

## Meilenstein D – Asset-Audit und Beta-Repository

### D1. Vollständige Assetliste **vor** jeder Löschung
Der vorhandene `tools/audit-assets.py` erfasst Dateien, Größen, Dimensionen, Alpha, SHA-256 und **wörtliche** Referenzen (historischer Export: `docs/ALPHA9_ASSET_INVENTORY.csv`). **0 Textreferenzen beweist keine Unbenutztheit**, da Pfade dynamisch gebaut werden. Live-Asset-Manager, HTML/CSS, Atlas-Manifeste, Preloader, Tests, aktive PRs und ggf. Release-Skripte mitprüfen.

| Spalte für jede Grafik | Zweck |
|---|---|
| Assetpfad + SHA-256 + Vorschau | Eindeutig erkennen, welche Datei bewertet wird |
| Level / Typ / aktiver Loader / tatsächlicher Runtime-Status | Echt eingebaut oder nur Kandidat |
| Referenzfoto + Perspektive + Qualität + mobile Größe | Dokumentarischer und technischer Vergleich |
| Kandidaten A/B/C | Grafische Alternativen gegenüberstellen |
| **Marcel: Behalten / Überarbeiten / Archivieren / Löschen** | Verbindliche künstlerische Entscheidung |
| Technische Freigabe / Datum / PR | Nachvollziehbarer Einbau |
| Abhängigkeits- und Backupprüfung | Voraussetzung für tatsächliche Entfernung |

### D2. GitHub entschlacken
- [ ] `main`, offengebliebene PRs, `gh-pages`, GitHub Actions und Preview-Branches inventarisieren; mindestens 100 Branches wurden in der ersten Seite der Branch-API gefunden, die tatsächliche Gesamtzahl ist noch nicht festgestellt.
- [ ] Entscheidungsvorlage: **neues Beta-Repository** (saubere neue Historie, aber Pages/Issues/Redirects brauchen Migration) **oder bestehendes Repo bereinigen** (bestehende URLs und History bleiben, Repo bleibt historisch groß).
- [ ] Nur bestätigte Assets in Beta übernehmen; Originale und abgewählte Kandidaten außerhalb der Runtime dauerhaft archivieren.
- [ ] Obsolete PRs/Branches erst schließen/löschen, wenn Änderung, Backup, Deployment-Verweise und Zuständigkeit geprüft sind; Löschungsplan mit GitHub-Links und Stückzahl protokollieren.
- [ ] `main`-Schutz, erforderliche CI, Alleinentwickler-Zugriff und Release-Pipeline vor Beta-Veröffentlichung prüfen.

### D3. Beta-Release-Gate
- [ ] P0 vollständig, Browser Desktop + Hochformat-Touch grün, keine relevanten JS-Fehler/fehlenden Bilder, Menü- und Inventarbedienung nachgewiesen.
- [ ] Echte Android-4-GB-Abnahme (Wellenlast, Audio, RAM, FPS, Flackern, Rotation).
- [ ] Boss-/Kampagnen- und Ansturm-Smoke-Tests, Save-/Importtests, Versionslabel und Cacheversionen.
- [ ] Künstlerische Abnahme aller sichtbaren, betroffenen Denkmäler/Helden/Umgebungen durch Marcel.
- [ ] Backup und Rückweg zur Alpha verfügbar; **erst dann Beta taggen/deployen**, Release und Live-URL gesondert verifizieren.

## Erstes Arbeitsprogramm
1. Draft-PR #331 bis CI/Touch-QA korrigieren und auf überprüfbar fertig bringen.
2. Schwarzen Miliz-Hintergrund und Helden-Magenta reproduzierbar eingrenzen.
3. Aktuelle Asset-Galerie und Entscheidungsliste erzeugen, grafische Auswahl einholen.
4. Danach weitere Grafik-/Audio-Inkremente und Beta-Repo-Optionen bearbeiten.

**Status-Legende:** `generiert` ≠ `technisch geprüft` ≠ `integriert` ≠ `im Spiel geprüft` ≠ `veröffentlicht`.
