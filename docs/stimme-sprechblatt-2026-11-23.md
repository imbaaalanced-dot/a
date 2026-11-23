# Stimme-Sprechblatt · Denkmal TD2 (23.11.2026)

Anleitung für die Heldenstimme (Marcel): vollständig verkabelte Slots, Zeilen, Aufnahme-Rezept und Datei-Ziele. **Ohne Aufnahmen ist alles per TTS (deutsche Systemstimme) wirksam** - MP3s ersetzen die TTS jederzeit durch Ablage an die Pfade (nur Code-Konstante + Cache-Key-Bump nötig, Agent übernimmt das).

## 1. Slots und Prioritaeten (`dist/hero-saga.js`)

| Slot | Trigger | Prio | MP3-Pfad (leer = TTS-Interim) | Zeile (Vorschlag - gern anpassen) |
| --- | --- | --- | --- | --- |
| intro | Kapitel-I-Story (Welle 1) | 3 | `assets/hero/voice/intro.mp3` | "Ich bin Marcel, der Denkmalschützer. Wir halten die Wacht." |
| chapter2 | Story Welle 4 | 3 | `assets/hero/voice/chapter2.mp3` | "Die Gegner werden stärker. Unsere Türme auch." |
| chapter3 | Story Welle 8 | 3 | `assets/hero/voice/chapter3.mp3` (existiert) | "Sie drängen durch das Labyrinth. Wir halten sie am Weg auf." |
| ending | Story Welle 20 | 3 | `assets/hero/voice/ending.mp3` | "Das Denkmal steht. Die Erinnerung bleibt." |
| ultimate | Seelenruf | 2 | `assets/hero/voice/ultimate.mp3` (existiert) | "Kein Name geht verloren!" |
| lowhp | Held < 30 % LP | 1 | `assets/hero/voice/lowhp.mp3` | "Ich halte noch durch." |
| **record** (neu) | Persönliche Bestmarke (Endlos- und Portal-Rekord) | 2 | `assets/hero/voice/record.mp3` | "Ein neuer Rekord für das Denkmal." |
| **bossnear** (neu) | Baupause vor Bosswelle (20er-Kampagne) | 2 | `assets/hero/voice/bossnear.mp3` | "Er kommt. Stell dich ihm." |
| **portalsecure** (neu) | Portal-Abschnitt gesichert (Exit offen) | 2 | `assets/hero/voice/portalsecure.mp3` | "Ein Abschnitt mehr, der Erinnerung bewahrt." |

## 2. Pacing-Gesetz (implementiert)

- Story (Prio 3) unterbricht nie laufende Story; Reaktionen (Prio < 3) unterbrechen Story nicht.
- **Chronik-Stimmen (record/bossnear/portalsecure) maximal alle 30 Sekunden** - Cooldown zentral in `say()`, pro Run zurückgesetzt.
- Anwendungsseitig: Rekord nur bei tatsächlicher Bestmarke, Boss-Ankündigung einmal je Welle, Abschnittsstimme nur beim Öffnen des Ausgangs.
- `STIMME: AN/AUS` + `LAUTSTAERKE` (100/70/40 %) greifen für MP3 **und** TTS gleichermaßen.

## 3. Aufnahme-Rezept

1. Ruhiger Raum, Handy oder Mikro ca. 20-30 cm, gleichmäßiges Sprechtempo.
2. Pro Slot EINE Datei, mono, 44.1 kHz; Peaks unter -3 dB, 0.3 s Stille an Anfang und Ende.
3. Dateiname = Slotname (z. B. `record.mp3`), Ablage unter `dist/assets/hero/voice/`.
4. Bescheid geben: Agent verdrahtet die Pfade in `VOICE_CLIPS`, bumpt den Cache-Key und pins die Dateien in den Asset-Gates (kein 404 im CI).

## 4. Status

- Implementiert: Slots, Prioritaeten, Cooldown-Gesetz, `speak`-Export, Trigger für Endlos- und Portal-Rekord, Boss-Ankündigung, Abschnittssicherung.
- Bewusst offen: Kim/Marcel-Zeilendifferenzierung - Empfehlung: erst wenn die Basis-Stimme spiel-erprobt ist.
