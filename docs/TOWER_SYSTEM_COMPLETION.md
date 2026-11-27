# Turmsystem – Abschluss der Gameplay-Spezialisierung

Stand: 27.11.2026 · Branch: `feature/tower-system-completion`

## Aktive Türme und Ausbaustufen

Die Kosten und allgemeinen Ausbauschritte bleiben unverändert. Jede der vier Fernkampfklassen erhält zusätzlich eine klar unterscheidbare Stufenmechanik:

| Turm | Stufe I | Stufe II | Stufe III |
|---|---|---|---|
| Bogenturm | 1 Trefferziel | Durchschlag auf 2 Ziele | Durchschlag auf 3 Ziele |
| Kanone | 64 px Explosionsradius | 78 px | 92 px; leicht verbesserter Flächenschadenfaktor |
| Magieturm | 58 % Bewegungstempo, 1,6 s | 50 %, 1,9 s | 44 %, 2,2 s und 46 px Frostzone |
| Riftlanze | 2 Kettenziele, 108 px | 3 Ziele, 120 px | 4 Ziele, 132 px |
| Kaserne | Schwertmiliz | Speerträger | Elite-Hellebardier |

Die Kaserne behält ihr vorhandenes separates Rekrutierungs- und Beförderungssystem. Der alte Bumerang bleibt ausschließlich für kompatible Spielstände erhalten und wird nicht erneut kaufbar.

## Technische Regeln

- Turmprofile werden beim Bau, beim Upgrade und bei der ersten Aktualisierung eines älteren gespeicherten Turms angewendet.
- Allgemeine Upgrade-Kosten, Rückerstattung, Zielprioritäten, Tower-Limit und Save-Struktur werden nicht geändert.
- Frostzonen und Ketteneffekte berücksichtigen weiterhin die Fluggegner-Kompatibilitätsprüfung.
- Die vier V6-WebP-Familien sind im Repository vorhanden; ihre automatische Aktivierung bleibt bis zur visuellen Desktop-/Android-Abnahme getrennt. Der V4-Fallback bleibt erhalten.
- Ansturm wird durch diese Kampagnenänderung nicht um Helden, Portale oder neue Spawns erweitert.

## Abnahme

Der neue Gameplay-Test prüft alle zwölf Fernkampf-Tierprofile, die Wiederherstellung eines alten Rift-Turms und die getrennten Kaserne-/Bumerang-Pfade. Zusätzlich muss der vollständige vorhandene GitHub-Actions-Testlauf grün sein. Visuelle Abnahme auf echtem Android bleibt ein separates Release-Gate.
