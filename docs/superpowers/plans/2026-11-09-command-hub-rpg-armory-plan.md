# Denkmal TD2 Command Hub & RPG-Rüstkammer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modernisiere das V5-Hauptmenü und die RPG-Rüstkammer vollständig, ohne bestehende Loot-Regeln oder Spielstände zu verändern.

**Architecture:** Nutze die bestehenden DOM-IDs und Handler als Kompatibilitätsschicht. Erweitere nur Menünavigation und Inventar-UI, nicht `DenkmalLoot`-Persistenz oder Drop-/Stat-Regeln. Bestehende WebP-/Style-2-Bilder sind die erste Wahl; zusätzliche kleine Kachelkunst nur nach konkreter visueller Prüfung.

**Tech Stack:** Vanilla HTML/CSS/JavaScript; Canvas-2D-Spiel bleibt unangetastet; Node.js `assert`/`vm`-Tests; Chromium für Touch-Viewport-Smokes.

**Spec:** `docs/superpowers/specs/2026-11-09-command-hub-rpg-armory-design.md`

## Global Constraints

- Basis `main` @ `af2e768f13c08d148f35907474169f35dce2a57c`; Entwicklung ausschließlich `feature/td2-command-hub-armory-20261109`.
- Kein neues Item, kein Set-Bonus, keine neue Währung, keine Loot-/Balance-Änderung; `dist/loot.js` v4-Schema unverändert.
- Kim nutzt in neuen UI-Texten den letzten freigegebenen Namen „die Treffsichere“; bestehende Gameplay-Regeln unverändert.
- Touchflächen mindestens 48px, sofern möglich; Zielgeräte Hoch-/Querformat inkl. Android 4 GB RAM.
- Kein `main`-Merge, kein Pages-Produktionsdeploy ohne zusätzliche Freigabe. Physische Android-Abnahme bleibt offen.

## Review Focus

1. Gespeicherte Kim-Ausrüstung und Marcel-Ausrüstung dürfen beim Charakterwechsel nicht vertauscht werden — eigener UI-Test mit beiden Helden.
2. Laufendes Spiel darf weder Ausrüstung noch Favoriten noch Schmiedessenz durch neue Buttons ändern — Test der Read-only-Guard.
3. Ein Filter für garantiert bessere Gegenstände darf einen verlorenen Spezialeffekt nicht grün markieren — bestehende Präzedenztests erhalten.
4. Ein noch geöffnetes Item-Detail darf nach einem Wechsel von Held, Filter oder aktiver Ansicht keine falsche destruktive Bestätigung auslösen — UI-Test für Stale-Confirm.
5. Ein beschädigter oder neuerer Speicherstand muss den Recovery-Export weiterhin erlauben; neue UI darf ihn nicht verstecken — bestehende Migration-/UI-Tests erhalten.

---

### Task 1: Verifizierte Ausgangsbasis und Menü-Kompatibilität

**Files:** `tests/main-menu.test.cjs`, `tests/menu-navigation.test.cjs`, `dist/index.html`, `dist/game.js`

**Interfaces:** Bestehende Menü-IDs `menuCampaignBtn`, `menuAnsturmBtn`, `menuCharacterBtn`, `menuOptionsBtn`, `menuBackBtn`; `showMenuPanel(panel, moveFocus)` in `game.js`.

- [ ] **Step 1:** Baseline: `node tests/main-menu.test.cjs && node tests/menu-navigation.test.cjs && node tests/loot-ui.test.cjs && node tests/loot.test.cjs` muss erfolgreich sein.
- [ ] **Step 2:** Schreibe einen fehlschlagenden Menü-Test, der vier direkte Kacheln innerhalb `#menuHomeActions` (`#menuCampaignBtn`, `#menuAnsturmBtn`, `#menuCharacterBtn`, `#menuOptionsBtn`) verlangt und „Kampagne“ direkt zur Kartenwahl leitet.
- [ ] **Step 3:** Passe die Startseiten-Navigation an: direkte Kampagnenkarte, direkte Ansturm-Verlinkung, Helden- und Optionskarte; bewahre versteckte Alt-IDs nur, wenn Tests/Laufzeit sie wirklich benötigen. Passe `showMenuPanel`-Routing und Keyboard-Fokus an.
- [ ] **Step 4:** `node tests/main-menu.test.cjs && node tests/menu-navigation.test.cjs` grün; Tests für Endlos-/Level-Links bleiben grün.
- [ ] **Step 5:** Commit `feat: simplify V5 menu routes to four destinations`.

### Task 2: Responsive Command-Hub-Grafik und Menühierarchie

**Files:** `dist/menu.css`, `dist/index.html`, `tests/main-menu.test.cjs`; optional **nur bei Lücke** `dist/assets/menu/...`.

**Interfaces:** CSS-Klassen `.menu-home-actions`, `.menu-command`, die vorigen Menü-IDs; Laufzeit-Assets der Kim-/Marcel-Referenz.

- [ ] **Step 1:** Ergänze fehlschlagende Struktur-/CSS-Tests: 2×2 Kacheln auf breiten Layouts, kompakte mobile Regeln, mindestens 48px große Touchfläche und per DOM sichtbare Versionsangabe.
- [ ] **Step 2:** Implementiere dunkle, gut lesbare Kacheln mit vorhandenen Style-2-Grafiken, konsistentem Gold-/Stein-Schema, Fokus- und Pressed-Zuständen; sekundäre Werbung/Hilfe in eine ruhige Nebenzone verschieben.
- [ ] **Step 3:** Prüfe 320/360/393/420px und Querformat auf Overflow/Touch, sowie `prefers-reduced-motion`. Falls ein Asset sichtbar ungeeignet ist, erstelle gezieltes, textfreies und komprimiertes Ersatzbild mit Referenzprüfung.
- [ ] **Step 4:** `node tests/main-menu.test.cjs && node tests/menu-navigation.test.cjs` grün.
- [ ] **Step 5:** Commit `style: introduce Style-2 command hub`.

### Task 3: RPG-Rüstkammer mit drei Ansichten und Heldenselektor

**Files:** `dist/index.html`, `dist/loot-ui.js`, `dist/game.js`, `dist/loot.css`, `tests/loot-ui.test.cjs`.

**Interfaces:** `DenkmalLootUI.create(model,{editable,onClose,onImport,getHero,onSelectHero})`; `onSelectHero(hero)` ruft den vorhandenen Spielmenü-Heldenwechsel auf, ohne ein zweites Rollenmodell zu speichern. Tabs `equipment`, `bag`, `forge`; bestehendes `#lootDetail` für gemeinsame Detailansicht.

- [ ] **Step 1:** Fehlschlagender UI-Test: alle drei Tabs existieren; auf Mobile ist exakt ein Hauptpanel sichtbar, auf Desktop darf Ausrüstung und Rucksack nebeneinander bleiben; Heldenwechsel aktualisiert Portrait und Items, nicht v4-Profilwerte.
- [ ] **Step 2:** Erstelle klare Tab-Navigation mit `role=tablist`, `aria-selected`, Arrow/Home/End-Steuerung; verbinde neuen Heldenselektor über `onSelectHero` mit `chooseCharacter` nur im Startmenü.
- [ ] **Step 3:** Baue kompakte Portrait-/Acht-Slot-Heldenseite, lesbare Summenwerte/Powers und dritte Schmiedeansicht auf Basis der vorhandenen Modell-Aktionen.
- [ ] **Step 4:** `node tests/loot-ui.test.cjs && node tests/menu-navigation.test.cjs && node tests/loot.test.cjs` grün.
- [ ] **Step 5:** Commit `feat: add hero-aware RPG armory sections`.

### Task 4: Rucksack-Suche, Filter und sichere Schmiede

**Files:** `dist/index.html`, `dist/loot-ui.js`, `dist/loot.css`, `tests/loot-ui.test.cjs`.

**Interfaces:** UI-Zustand `query` (String); `applyFilters(items, {query, filter, slotFilter, sort})` bleibt interne Funktion; bestehende `model.salvagePreview`, `model.salvageAll`, `model.upgradePreview`, `model.upgrade` unverändert.

- [ ] **Step 1:** Fehlschlagender Test: Suchtext findet Items unabhängig von Groß-/Kleinschreibung; Suche+Slot-/Rarityfilter kombinieren sich; Reset stellt Liste wieder her und verändert `model.exportJSON()` nicht.
- [ ] **Step 2:** Suchfeld + Reset und Ergebniszählung implementieren; bei Texteingabe ca. 150ms debounce in Browser, 60-Item-Ladeblöcke erhalten; Filterleiste ohne permanente destruktive Aktion aufräumen.
- [ ] **Step 3:** Recycling in die Schmiedesektion verschieben, mit Anzahl/Essenzvoransicht und expliziter Bestätigung; ungültige bzw. stale Bestätigungen weiterhin abfangen, Favoriten und Ausrüstung schützen.
- [ ] **Step 4:** `node tests/loot-ui.test.cjs && node tests/loot.test.cjs && node tests/equipment-migration.test.cjs` grün.
- [ ] **Step 5:** Commit `feat: add searchable backpack and guarded forge workflow`.

### Task 5: Vergleichsdetails, Accessibility und Mobile-Polish

**Files:** `dist/loot-ui.js`, `dist/loot.css`, `dist/index.html`, `tests/loot-ui.test.cjs`, `tests/main-menu.test.cjs`.

**Interfaces:** `#lootDetail` als Bottom-Sheet auf Mobile; `closeDetail()` bringt Fokus zum auslösenden Item zurück; `model.view(hero)`, `DenkmalLoot.totals`, Effektschutz bleiben Quelle der Wahrheit.

- [ ] **Step 1:** Fehlschlagende Tests für Fokus nach Öffnen/Schließen, Escape/Backdrop, Read-only-Aktionen und korrekte Ring-2-Wahl; erhalte die vorhandenen Präzedenz- und Werte-Diff-Assertions.
- [ ] **Step 2:** Visuelle Hierarchie der Vergleichsansicht und Schmiede verbessern; klare Negativwerte/Verlustanzeigen, sichtbarer Favoriten-/Anlegestatus und kompakter Held im Hochformat.
- [ ] **Step 3:** ARIA-/Fokus-/Scroll-Guards auch für `forge` integrieren, ohne globale Tastatursteuerung zu überlagern; Sicherungs-/Recovery-Sektion erreichbar halten.
- [ ] **Step 4:** `node tests/loot-ui.test.cjs && node tests/menu-navigation.test.cjs && node tests/equipment-migration.test.cjs` grün.
- [ ] **Step 5:** Commit `fix: polish armory details and touch accessibility`.

### Task 6: Gesamtregression, mobile Browser-Abnahme und Handoff

**Files:** relevante Tests im `tests/`-Verzeichnis, ggf. fokussierte CSS-/JS-Fixes und neue Testdokumentation.

**Interfaces:** Unverändertes persistentes Loot-v4-Schema; bestehende Spielmodi und Hauptmenü-URLs.

- [ ] **Step 1:** `git diff --check` und `node --check dist/loot-ui.js` ausführen; alle vorhandenen `tests/*.test.cjs` und geeignete Python-Assettests nach den tatsächlichen verfügbaren Scripts laufen lassen.
- [ ] **Step 2:** Chromium-UI-Smoke mit Touch-Emulation und Portrait/Querformat durchführen; Screenshots und konkrete Beobachtungen der UI statt geschätzter FPS festhalten.
- [ ] **Step 3:** Sicherungs-/Recovery-, Kampf-Read-only-, Heldwechsel-, Import-/Export- und Ansturm-Regressionschecks isoliert überprüfen; offene reale Android-4-GB-Messungen ausdrücklich ausweisen.
- [ ] **Step 4:** Finalen Branch-Commit und ggf. Draft-PR vorbereiten; verifizierten Preview-Link nur bei tatsächlich erfolgtem Pages-Deploy angeben, `main` unberührt lassen.
