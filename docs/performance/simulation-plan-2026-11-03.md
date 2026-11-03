# Simulation: Auftrag und Ausführung

Initiale Messbasis: main c5d6f21 (PR #82). Abschließend auf main 4c8aad9 mit bestehender 3×-Tempoauswahl rebased; erneute vollständige Regression. Separater Branch, Draft-PR gegen main, keine bestehenden PRs verändern.

Ziel: Weniger CPU-Arbeit und kurzlebige Arrays bei exakt gleicher Reihenfolge von Bewegung, Treffern, Zielwahl und Statuswirkungen. Keine Änderungen an Zeitsteuerung, Balance oder Spawnlimit.

1. Deterministische Lastszenarien für Kampagne und Ansturm mit 25/50/100/200 Gegnern erstellen; Referenzzustände vor Änderungen sichern.
2. Ansturm: direkte Gegnerreferenzen statt wiederholter ID-Suche; stabile begrenzte Zielauswahl und lineare Tesla-Auswahl; Listen in-place bereinigen.
3. Kampagne: Zielsuche erst bei schussbereiten Türmen; Wegabstände ohne temporäre Listen; billige konservative Projektil-Vorprüfung; überflüssige Zielvorhersage-Objekte entfernen.
4. Nach jedem Patch Referenzzustände und gezielte Operationenzähler prüfen, vollständige vorhandene Tests ausführen, Vorher/Nachher-Lastmessung dokumentieren.

Alternativen: Ein räumliches Raster kann bei größeren Listen helfen, kostet aber Aufbau, stabile Trefferreihenfolge und Invalidierung nach Bewegung. Zuerst einfachere messbare Engpässe beseitigen. Feste Schritte in der Kampagne würden bestehende frameabhängige Cooldowns/Hitstop ändern; keine Umstellung in diesem Patch. Ansturm nutzt bereits 30 Hz und begrenztes Aufholen. Kameraabhängige KI-Ausdünnung würde Gegnerbewegung und Angriffe verändern.

Abnahme: Referenzsimulation bleibt bitgenau identisch in den dokumentierten Szenarien; neue Lasttests und bestehende Suiten bestehen. Server-CPU-Messungen sind keine Android-FPS-Zusage.
