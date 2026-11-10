# TD2 V5: Pages-Veröffentlichungsanforderung

Datum: 2026-11-10

- Grafikbereinigung aus PR #150 ist nach `main` gemergt (Merge-Commit `3ef426423a5424a56673bf9934884bc52cd21d3d`).
- Dieser Dokumentations-Commit löst über den vorhandenen `push`-Trigger des Workflows `.github/workflows/pages.yml` eine neue Prüfung und, nur bei erfolgreichen Workflow-Tests, die Veröffentlichung des `main`-Testers aus.
- Kein Test wird hier als bestanden markiert; CI, Deployment und Live-Version müssen separat bestätigt werden.
- Echter Android-Test mit 4 GB RAM bleibt offen.
