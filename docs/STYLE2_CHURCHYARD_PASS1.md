# TD2 – Style 2: Kirchhof-Grafikpass 1

Stand: 16. Oktober 2026. Experimenteller Branch `feature/style2-churchyard-pass1-20261016`; basiert auf `feature/v4-level4-church-lion` (PR #34).

## Ziel
Einheitliche `Graphic Dark Fantasy / 2.5D`-Optik für Level 4, ohne historische Maße vorzutäuschen oder die Kampflogik zu verändern.

### Implementiert
- **Kirchendach:** handgezeichnete Schieferschuppen in versetzten Reihen, dezente Kantenakzente und wetterbedingte Verfärbungen.
- **Sandsteinfassade:** feine, deterministisch verteilte Mauerfugen und Verwitterungsspuren.
- **Fenster:** Farbverlauf von gedämpftem Bernstein zu dunklem Blaugrau statt gleichmäßig dunkler Glasfläche.
- **Alter Kirchhof:** feine Steinrisse, Moos und einzelne Herbstblätter an den Randbereichen; freier Mittelbereich für das Ehrenmal.
- **Licht:** ruhiger, warmer Lichtschein ist in den wiederverwendeten Pflaster-Canvas eingebacken.

Alle Zufallsdetails besitzen einen festen Seed. Die Kirche und der Kirchhof werden nur beim ersten Darstellen auf Offscreen-Canvas gerendert und wiederverwendet. Kein zusätzlicher Animations-/WebGL-Shader, keine neuen Bilddownloads.

### Unverändert
- Löwendenkmal von 1879 als einziges Angriffsziel
- Kirchenposition, der relative Abstand zum Löwen und der komplette Kollisions-Fußabdruck
- Alle vier Gegnerwege, Turmbauplätze, Wellen 13–16, Turmwerte und Spielersteuerung
- Speicherstand/Freischaltung, UI und Performance-Limits

Die Architektur und Hofdetails sind **Spielillustrationen**, keine maßhaltige Rekonstruktion. Historische Quell- und Lagehinweise: `docs/LEVEL4_ENDER_DORFKIRCHE.md`.

## Abnahme
- Automatisierte Tests: `node tests/level4.test.cjs`, `node tests/cache-busting.test.cjs` sowie das reguläre Test-Workflow.
- Sichtprüfung: Dachdetails müssen bei Portrait-Zoom noch lesbar bleiben; Mittelbereich und Turmstellplätze dürfen visuell nicht überdeckt werden.
- Reale Android-FPS-/Touch-Prüfung bleibt offen.
- Erst nach Tests und Freigabe in den Elternbranch übernehmen. `main` bleibt unberührt.

Asset-Cache-Key: `church-art.js?v=v400a6s2p1`.
