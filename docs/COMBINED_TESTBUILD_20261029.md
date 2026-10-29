# Gemeinsamer TD2-Testbuild · Release-Abnahme

Freigegebene Integration: Level-5-Balance aus #62, Loot V2 aus #63 und der inzwischen gemergte Hauptstand einschließlich Ansturm-Menü und Einführung (#65). Branch: `integrate/td2-combined-20261029`, PR #64.

## Enthalten

- Loot V2: Gegnerfunde, Duplikatschutz, Inventarfilter und Schema-4-Migration mit Sicherung.
- Level 5: erste vier Wellen entzerrt; Einstieg mit Welle 17, 32 Gegnern und 0,75 Sekunden Spawnabstand. Endloswerte unverändert.
- Ansturm: TD2-Szenenmenü, überspringbare Einführung, kompakte Befehle, Speichern und pausiertes Fortsetzen.
- Neue Cache-Adressen für die drei geänderten Loot-Skripte, damit ältere Browserdateien nicht mit Schema 4 vermischt werden.
- Hauptveröffentlichung bewahrt auch die sechs neueren Testpfade. Regression führt die echte Cleanup-Zeile auf Wegwerfdateien aus.

## Prüfnachweise dieses Updates

- Hauptstand ohne Textkonflikte übernommen.
- Vor Release-Fixes: alle JavaScript-Suiten, 61 Ansturm-Tests, zehn Python-Assettests und acht mobile VM-Varianten erfolgreich.
- Cache- und Testpfadfehler vor der Korrektur reproduziert, danach beide Regressionen erfolgreich.
- Abschlusslauf: 67 JavaScript-Dateien (einschließlich Druck-/Adaptertests), 61 Ansturm-Tests, zehn Python-Assettests, acht mobile VM-Varianten, Syntax und Diff-Prüfung erfolgreich.
- Unabhängiges Review: keine kritischen oder wichtigen Befunde; veraltete Testbuild-Dokumentation korrigiert.
- Cloud-Chromium: Hauptmenü → Ansturm, vier Einführungsschritte, Kauf Angriff Stufe 1, Gold 80 und Schaden 15 nach pausierter Fortsetzung/Reload, keine erneute Einführung bestätigt. Remote Preview-CI wird separat am Commit geprüft.
- Lokales Chromium-Binary fehlt; keine lokale Browserprüfung behauptet. Cloud-Browser-Sichtprüfung und CI sind getrennte Nachweise.

## Verbleibende Android-Abnahme

Vor dem Wechsel im Inventar die Sammlung exportieren. Testpfade derselben Domain teilen localStorage; ältere Builds können Schema 4 nicht lesen.

1. Ansturm neu starten: vier Einführungsschritte, Überspringen und Hilfe prüfen.
2. Angriff kaufen, Gold notieren, Seite neu laden und fortsetzen: Gold/Kauf erhalten, Spiel pausiert, keine automatische Einführung.
3. Hoch- und Querformat: Menü, Tech-Drawer und Steuerung vollständig erreichbar.
4. 15 Minuten spielen: Flackern, verschwundene Grafiken, Ruckler und Abstürze beobachten. FPS/RAM nur bei tatsächlicher Messung berichten.
5. Level 5 mehrfach mit vergleichbarer Ausrüstung beginnen: erste vier Wellen und verfügbare Essenz vor dem Boss bewerten. Ein einzelner Lauf belegt keine Gewinnquote.

Testpfad: `/td2-combined/v4-alpha9/`; Ansturm darunter `ansturm/index.html`. Der gemeinsame Build bleibt bis zu diesen Gerätebeobachtungen ein Testbuild. Kein Android-Ergebnis wird aus Desktop-/Touch-Emulation abgeleitet. PR #64 und noch nicht integrierte Einzel-PRs bleiben bis zur Abnahme offen.
