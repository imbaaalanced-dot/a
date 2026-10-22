# Denkmal TD2 · Ansturm · Alpha 1.5 Style-2-Test

Der eigenständige Alpha-1.4-Upload wurde als isolierter Alpha-1.5-Test unter `dist/alpha1-5/` weitergeführt. Der Hauptbuild, PR #51 und `main` werden von diesem Feature-Branch nicht verändert.

## Änderungen

- Das Shop-/Upgrade-Menü kann im Hochformat über **⚡ UPGRADES** ein- und ausgeblendet werden. `aria-expanded` hält den Zustand für Screenreader aktuell; beim Wechsel ins Querformat bleibt der Shop sichtbar.
- Die Ingame-Oberfläche nutzt kleine, gekachelte Stein- und Bronze-SVG-Texturen sowie das vorhandene Forschungs-Schrein-Bild im Shopkopf.
- Kaufkarten behalten beim HUD-Refresh ihre DOM-Elemente, sodass laufende Touch-Gesten nicht abgebrochen werden. Die TECH-/UPGRADES-Schalter geben ihren gewählten Zustand zusätzlich über `aria-pressed` aus.
- Alle 59 vorhandenen WebP-Dateien wurden auf WebP-Format, RGBA-Transparenz und Manifest-Zuordnung geprüft. Der Cache lädt höchstens vier Bilder parallel und erhält einen automatisierten Belastungstest.
- Die fünf aktuell spielbaren Waffentypen zeigen ihre vorhandenen drei Upgrade-Stufen. Die vier Bossbilder wechseln bei aufeinanderfolgenden Bosswellen.
- Bolzen-, Lanzen-, Feuer-, Eis-, Blitz- und Explosionseffekte werden im Canvas gezeichnet. Die Spriteausschnitte vermeiden leere Atlasränder und Fremdfragmente.

## Noch nicht spielbar

Die Feuer-/Durchdringungs-Waffenstufen und fünf zusätzliche Gegnerbilder liegen im Paket und im Asset-Cache, haben in Alpha 1.4 aber noch keine zugehörige Kauf-/Gegnerlogik. Sie werden deshalb noch nicht als aktive Spielmechanik angezeigt. Kampfwerte und Wellenbalance bleiben unverändert.

## Testadresse

`https://imbaaalanced-dot.github.io/a/alpha1-5/` wird von der separaten Branch-Pipeline veröffentlicht, sobald die Tests erfolgreich sind.
