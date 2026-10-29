# Gemeinsamer TD2-Testbuild

Freigegebene Integration: PR #62 als Basis (enthält #57–#61), zusätzlich Loot V2 aus #63. Eigener Branch `integrate/td2-combined-20261029`; vorhandene PRs und main werden nicht geändert.

- [x] Änderungen lokal zusammenführen; keine Textkonflikte.
- [x] Bestehende Spiel-, Ansturm- und Assettests zusammen ausführen (74 Befehle erfolgreich).
- [ ] Mobile Tests, Browserprüfung für Loot samt Reload/Export sowie Ansturm-Kauf/Reload/Hoch-/Querformat und echte Level-5-Startwerte.
- [ ] Getesteten Tree auf neuem GitHub-Branch sichern und gemeinsamen Testpfad veröffentlichen.
- [ ] HTTPS und Quelldateien nach Veröffentlichung abgleichen.

Testpfad: `/td2-combined/v4-alpha9/`. Ansturm ist über das Hauptmenü oder `ansturm/index.html` erreichbar. Level 5 ist als Vorschau direkt erreichbar; Start mit Welle 17, 32 Gegnern und 0,75 Sekunden Spawnabstand. Endlos-Balance bleibt erhalten. Neue Items werden wie im freigegebenen Loot V2 gespeichert.

Vor dem Wechsel Sammlung exportieren: mehrere Testpfade derselben Domain teilen localStorage. Schema 4 lässt sich mit älteren Builds nicht bearbeiten. Funktionsprüfungen im Browser ersetzen keinen gemessenen Android-Lasttest. Gewinnquote und Essenzwirtschaft der Level-5-Eröffnung müssen auf dem echten Gerät beurteilt werden.
