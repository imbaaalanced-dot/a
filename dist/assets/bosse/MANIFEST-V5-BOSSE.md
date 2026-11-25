# Denkmal TD2 V5 - Briefing 06 Bosse - Asset-Manifest

**Stand:** 25.11.2026  
**Produktionsbriefing:** 06_Bosse.md (P2)  
**Boss:** Vergessener Hauptmann (Westhofen, Level 07). Keine weiteren Bosse im Code nachweisbar (Code-Suche boss/Hauptmann/phase in dist: nur Westhofen-Audit-Dokument). Die 'Fuenf Gegner' des Westhofen-Sets gehoeren zu Briefing 03, nicht 06.  
**Identitaets-Lock:** 23.11./25.11.2026, Vision-Check der 7 Keyframes bestanden: Fluegelhelm, korrodierte Brustpanzerung/Offiziersuniform, Saeber, blasse spektrale Energie, konsistenter 3/4-Isometrie-Winkel und Bodenanker. Kein Boss auf der Westhofen-Level-Vorschau vorhanden, Identitaet daher neu am Fluegelhelm-Motiv des Denkmals verankert.

## Repo-Ablage (Branch feature/td2-v5-boss-fx-20261125)
- Runtime-Strips unter `dist/assets/bosse/` (Repo-Namen: hauptmann_<aktion>_6f.webp), Master-PNG bleiben im Drive-Archiv (Denk-mal Branding).
- Binary-Push via Base64-Payload + Decode-Action (gleicher Mechanismus wie Turm-Branch), Payload wird nach Dekodierung geloescht.
- Atlas-Runtime-Namen in bosse-atlas-v5.json auf Repo-Namen umgeschrieben.

## Produzierte Dateien (je 6 Frames, Zellen 160x160)

| Aktion/Effekt | Master-Keyframe | Runtime | Groesse | Pivot |
|---|---|---|---|---|
| idle | td2-boss-v5-hauptmann-idle-master.png | td2-boss-v5-hauptmann-idle-6f.webp | 41.6 KB (q92) | [80.0, 152] |
| move | td2-boss-v5-hauptmann-idle-master.png | td2-boss-v5-hauptmann-move-6f.webp | 53.9 KB (q92) | [80.0, 152] |
| attack-a | td2-boss-v5-hauptmann-attack-a-master.png | td2-boss-v5-hauptmann-attack-a-6f.webp | 59.7 KB (q92) | [80.0, 152] |
| attack-b | td2-boss-v5-hauptmann-attack-b-master.png | td2-boss-v5-hauptmann-attack-b-6f.webp | 48.8 KB (q92) | [80.0, 152] |
| special | td2-boss-v5-hauptmann-special-master.png | td2-boss-v5-hauptmann-special-6f.webp | 55.4 KB (q92) | [80.0, 152] |
| hit | td2-boss-v5-hauptmann-hit-master.png | td2-boss-v5-hauptmann-hit-6f.webp | 40.3 KB (q92) | [80.0, 152] |
| phase-transition | td2-boss-v5-hauptmann-phase-master.png | td2-boss-v5-hauptmann-phase-transition-6f.webp | 52.6 KB (q92) | [80.0, 152] |
| death | td2-boss-v5-hauptmann-death-master.png | td2-boss-v5-hauptmann-death-6f.webp | 38.4 KB (q92) | [80.0, 152] |
| telegraph | td2-boss-v5-hauptmann-telegraph-master.png | td2-boss-v5-telegraph-6f.webp | 55.2 KB (q86) | [80.0, 80.0] |
| bodenwarnung | td2-boss-v5-ground-master.png | td2-boss-v5-bodenwarnung-6f.webp | 56.3 KB (q86) | [80.0, 80.0] |

## Hitbox und Pivot
- Pivot je Aktions-Zelle: Bodenkontakt Mitte (80, 152); Hitbox im Atlas-JSON pro Strip (Alpha > 128; beim death-Strip bezieht sie sich auf Frame 0-2, spaetere Frames verblassen geplant).
- Dokumentation: Frames programmatisch aus Keyframes abgeleitet (Bob/Lean/Flash/Crossfade) - laut Briefing Ausgangspunkt, im Spiel bei 1x/3x pruefen und Dauern an Feuerrate anpassen.

## Offene Punkte laut Abnahmekriterien
- [x] Bestand geprueft (Code-Suche, Westhofen-Audit); Duplikate ausgeschlossen
- [x] Fehlende Motive aufgefuehrt (8 Aktionen + Telegraph + Bodenwarnung)
- [x] Freigestellte PNG-Master, optimierte WebP-Runtime, Atlas-JSON vorhanden (Alpha geprueft)
- [ ] Visuelle Pruefung im laufenden Spiel 1x/3x - offen
- [ ] Android-Chrome-Test 4-GB - offen
- [ ] Separater Branch/Integration nur nach Freigabe - offen

## Hinweise
- Hinweis zu death und phase-transition: Frames aus Crossfade/Alpha-Abstieg; die letzten Frames sind bewusst halbtransparent.
- Weitere Bosse: falls geplant (Ansturm-Endgegner?), sind sie im Code nicht verankert; ist erst ein Nachweis noetig, bevor weitere Bosse produziert werden.