# TD2 V5 Style-2 Quality Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die fünf freigegebenen Grafikbaustellen in versionierten, testbaren Schritten korrigieren.

**Architecture:** Canvas-2D-Renderer und bestehende Manifest-/Loaderstruktur bleiben erhalten. Bildreparaturen werden als eigene WebP-Versionen mit Referenz/QA-Nachweis angeschlossen; bei Fehlern greifen bisherige Fallbacks. Code- und Daten-Gates verhindern stille Grafikregressionen.

**Tech Stack:** Vanilla JS, Canvas 2D, Node-Tests, Python Pillow, WebP/PNG, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-11-09-style2-quality-pass-design.md`

## Global Constraints

- `main` nicht verändern; vorhandene PRs/Branches nicht anfassen.
- Marcel/Kim aus Referenz-Lock 07.11.2026; Kamera/Anker `depth=0.82`.
- Westhofen-Wege/Slots und alle Saves unverändert; Ansturm ohne Helden/Portale.
- Kein neuer FPS-, Android- oder Veröffentlichungsanspruch ohne tatsächlichen Test.

## Review Focus

- Fehlerhafter oder kalter Avatar-Download: vollständiger Menü-Fallback ohne leere Fläche (Task 1).
- Unpassende Dimensionen einer Heldentextur: kein zeichnerischer Ausfall und keine Exception (Task 1).
- Fehlendes Westhofen-Bild: Canvas-Fallback mit gleicher Position und Spielgeometrie (Task 2).
- Fremde Pixel am Atlasrand: QA unterscheidet echte VFX-Trails und cutout-Fragmente (Task 3).
- Grafik-Sparmodus im Hochformat: keine neue Pixelspitzenlast pro Frame (Task 4/5).

---

### Task 1: Helden und V5-Freistellungen

**Files:** `dist/hero-saga.js`, `dist/directional-assets-v410.js`, `dist/portrait-avatars-v5.js`, neue `dist/assets/menu/v5-avatars/*-v6.webp`; Tests unter `tests/hero-style2-v5.test.cjs`.

**Interfaces:** Konsumiert `HeroSaga.drawSprite` und `TD2DirectionalActions.hero`; produziert konsistente Atlaswahl mit Fallback und unveränderten Charakter-IDs.

- [ ] RED: Test zeigt alten 256×64-Rasterfehler, falsche 96×96-Action-Pfade und fehlende Versionierung.
- [ ] GREEN: Runtime-Atlas-Zuordnung und Fallback korrigieren; selektierte neue Portraits nur nach Bildprüfung anschließen.
- [ ] Miniatur-, Alpha- und Referenz-Lock prüfen, Test + relevante Menü-/Gameplay-Tests ausführen.
- [ ] Commit `fix(v5): align hero sprite assets and portrait QA`.

### Task 2: Westhofen-Denkmal und Galerie

**Files:** `dist/westhofen-art.js`, `dist/level-gallery.js`, neues `dist/assets/westhofen/*`, Tests `tests/westhofen-style2-art.test.cjs`.

**Interfaces:** `DenkmalWesthofenArt.drawMonument(ctx,m)` behält Signatur; Bild-Loader ist optional und darf den Canvas-Fallback nicht abschalten.

- [ ] RED: Denkmal-Sprite fehlt, Level-7-Galerie hat `image:null`.
- [ ] GREEN: transparentes historisch angenähertes Sprite erstellen und lazy rendern, Galerie ergänzen.
- [ ] Route, Slot, Fußanker, 64/128-Pixel und Fallback testen; keine Geometrieänderung.
- [ ] Commit `feat(style2): integrate Westhofen memorial art`.

### Task 3: Ansturm-Zuschnitt und QA

**Files:** `dist/ansturm/assets/*`, `ansturm-alpha1-5/assets/*`, vorhandene Asset-Manifeste, neuer `tests/ansturm-asset-edges.test.py`.

**Interfaces:** URLs und Spielwerte unverändert oder als versioniertes Paar; Test meldet Rand- und Fremdpartikel statt absichtlich sichtbare Effekte blind zu löschen.

- [ ] RED: Regressionsprobe mit `enemy_gargoyle.webp` und mindestens einem betroffenen Boss/Icon.
- [ ] GREEN: gezielte Versionen der bestätigten Ausreißer, Quell-/Dist-Parität und transparente Reserve.
- [ ] Vollständige Randdiagnose aller Ansturm-Objekte, Prüfung bei 64/128 px, Assettests.
- [ ] Commit `fix(ansturm): clean clipped art and guard cutouts`.

### Task 4: Level 3–6 Materialangleichung

**Files:** `dist/kirchende-art.js`, `dist/church-art.js`, `dist/hohensyburg-art.js`, `dist/goethestrasse-art.js`, gezielte `tests/style2-environment-coherence.test.cjs`.

**Interfaces:** vorhandene Zeichenfunktionen und Weltgeometrie bleiben; dekorativer Pass ist nur im warmen Cache aktiv.

- [ ] RED: Test fixiert Material-/Lichtregeln und unveränderte Weg-/Bauplatzlogik.
- [ ] GREEN: gemeinsame, nicht blockierende Farbtokens und Boden-/Kantenakzente ergänzen.
- [ ] Mobile Sparstufe, Canvas-Allocations, Layer-Reihenfolge und Screenshots prüfen.
- [ ] Commit `style(style2): unify campaign terrain treatment`.

### Task 5: VFX, Legacy und Abschlussreport

**Files:** bestehende Style-2-Adapter, `docs/STYLE2_V5_QUALITY_REVIEW_20261109.md`, gezielte Tests für Asset-URLs/Spalten und Altpfade.

**Interfaces:** Tower-IDs, Projektilrichtungen, Save-Keys und bestehende Fallbacks unverändert.

- [ ] RED: Test für fragliche aktuelle/alte Pfade und unnötige Textur-Residenz.
- [ ] GREEN: problematische Effekte/Adapter gezielt verbessern und verbliebene Altbestände klassifizieren.
- [ ] Vollständige Node-/Python-/Ansturm-Tests, Syntax, lokale Browserprüfung wo verfügbar.
- [ ] Commit `test(style2): document asset gates and remaining review`.

### Abschluss

- [ ] Selbstständige Gesamt-Diff-/Testprüfung und offene P0/P1-Funde dokumentieren.
- [ ] Nur neuen Branch pushen; Draft-PR ist bei ausstehender Android-Abnahme zulässig.
- [ ] Kein Merge und keine Veröffentlichung ohne Ziel-Freigabe.
