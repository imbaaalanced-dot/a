# Denkmal TD2 – Witten-Heven: Kriegerdenkmal (Foto-Referenz aus Cloudinary)

Stand: 26.11.2026. Quelle: **12 JPG-Uploads in Cloudinary**, Ordner `Witten heven`,
Public-IDs `kdwupper423048-0` bis `kdwupper423048-11`, Tags `td2-reference`,
`witten-heven`, `ehrenmal`, `kriegerdenkmal`, hochgeladen am 2026-11-26
(17:37–17:47 UTC). Die Bilddateien selbst werden **nicht** als GitHub-Binärdateien
eingecheckt; diese Dokumentation speichert Zuordnung und Auswertung
(Konvention siehe `docs/LEVEL3_KIRCHENDE_MONUMENT_PHOTO_REFERENCE_20261112.md`).

Es existiert noch **kein Level „Witten-Heven“ im Code** (`dist/levels.js` endet
bei Level 7 Westhofen). Die Fotos sind Referenzmaterial für ein geplantes neues
Level, für eine künftige Galerie-Karte
(`dist/assets/menu/level-gallery/level-08-*.webp`) und für Style-2-Assets.

## Gesicherte Foto-Beobachtungen

1. Hauptdenkmal: **vier hohe, schlanke, quadratische Steinpfeiler** aus dunklem,
   grob behauenem Stein (basaltartig), eng beieinander zu einer geschlossenen
   Einheit, sich nach oben leicht verjüngend; auf leicht erhöhter Steinplattform
   mit niedriger Einfassungsmauer.
2. Bekrönung: **schmiedeeisernes Kreuz auf dünnem Metallstab** über den Pfeilern
   (klar in `-5`; in `-2`/`-3` als Metallfigur an der Pfeilerspitze sichtbar).
3. Fronttafel: Steinplatte mit **goldfarbener Inschrift**, in `-5` und `-7`
   vollständig lesbar: „TREUE UM TREUE / DEN UNVERGESSENEN IM / WELTKRIEGE
   GEFALLENEN / SÖHNEN DER HEIMAT! / DIE BÜRGER VON HEVEN“; darunter **Herz und
   Anker** in Gold. Abweichende Lesarten in `-2`/`-3`/`-4` („HELDEN DES
   WELTKRIEGES“, „SÖHNEN DER STADT“) sind Winkel-/Auflösungsartefakte; maßgeblich
   ist die Frontal-Lesung aus `-5`. In `-6` wurde die letzte Zeile als „DIE BÜRGER
   VON LEVER“ gelesen – vermutlich unscharfe Lesung von „HEVEN“, **nicht
   verifiziert**.
4. Namenstafeln: mehrere **Metallplatten mit spaltenweise gravierten Namen** in
   Steinwänden eingelassen (`-8` mit Jahreszahl **1918** und Teilschrift „TREUE“
   auf dem Pfeiler; `-9`, `-10`; `-11` zusätzlich mit **Eisernem Kreuz als
   Relief**). Namen nicht transkribieren, ergänzen oder erfinden.
5. Gelände: Denkmal auf **grasbewachsenem Hügel** (`-0`), umgeben von
   **laubabwerfenden Bäumen** (Herbst-/Winterstand), bodenbedeckendes Laub, kleine
   **Stufen/Treppe** zum Denkmal (`-1`). Keine vermessenen Maße, keine
   Grundrissaufnahme, verschiedene Tageslichtsituationen.

## Zuordnung der 12 Cloudinary-Quellen

| Public-ID | Format | Inhalt | Verwendung |
| --- | --- | --- | --- |
| `kdwupper423048-0` | 665×445 quer | Gesamtansicht: Monument auf grasigem Hügel, tiefe Perspektive, kahle Bäume, Sonne | Maßstab, Landschaft, Silhouette |
| `kdwupper423048-1` | 665×445 quer | Säulengruppe auf gemeinsamem Sockel mit Tafel, Wald, Laubboden, kleine Treppe | Umgebung, Zugang, Sockel |
| `kdwupper423048-2` | 663×993 hoch | Vier Pfeiler von vorn/unten, Inschrift inkl. „DIE BÜRGER VON HEVEN“, Herz+Anker, Metallfigur oben, Laubboden | Monument-Front, Inschrift |
| `kdwupper423048-3` | 664×993 hoch | Vier Pfeiler als geschlossene Einheit, große Frontplatte, Kreuzfigur oben, Steinplattform mit niedriger Mauer, Seitenlicht | Monument-Front, Plattform |
| `kdwupper423048-4` | 664×993 hoch | Vier dunkle Pfeiler in Reihe, Inschrift, Herz/Anker/Kreuz, klarer blauer Himmel, kahle Bäume | Monument-Front, Material |
| `kdwupper423048-5` | 665×1004 hoch | Frontal, hell ausgeleuchtet: Pfeiler, schmiedeeisernes Kreuz oben, **vollständig lesbare Goldinschrift inkl. „DIE BÜRGER VON HEVEN“**, Herz+Anker | **Beste Haupt-Referenz** (Sprite + Tafel) |
| `kdwupper423048-6` | 665×445 quer | Tafel mit Goldinschrift in Steinmauer (letzte Zeile unscharf gelesen „LEVER“), weitere unleserliche Tafeln, Bäume | Mauer-/Tafeltextur, Nebentafel |
| `kdwupper423048-7` | 664×440 quer | Nahaufnahme der Goldinschrift „… DIE BÜRGER VON HEVEN“ in Steinmauer, Herz+Anker, Fenster darüber, Seitenplatten | Tafel-Detail |
| `kdwupper423048-8` | 664×993 hoch | Pfeiler-Nahaufnahme: Jahreszahl „1918“, Metall-Namenstafel mit Spalten, Teilschrift „TREUE“, grobe Steinblöcke | Namenstafeln, Gravur, Steintextur |
| `kdwupper423048-9` | 664×993 hoch | Zwei Metall-Namenstafeln an Steinmauer, frontal, Namen lesbar | Namenstafeln-Detail |
| `kdwupper423048-10` | 664×993 hoch | Zwei vertikale Namenstafeln in Bruchsteinwand, verwittert/oxidiert | Namenstafeln, Verwitterung |
| `kdwupper423048-11` | 665×440 quer | Namenstafeln + Eisernes-Kreuz-Relief in Steinmauer, frontal | Namenstafeln + Kreuzrelief |

## Was davon brauchbar ist

- **Alle 12 Bilder sind als Referenz brauchbar; es gibt keine Ausschussbilder.**
  Auflösung (663–665 px Breite, JPG 84–270 KB) reicht für Struktur-, Form- und
  Materialreferenz, nicht als Runtime-Textur.
- **Kern für das Monument-Sprite:** `-5` (frontal, lesbare Inschrift), ergänzt um
  `-2`, `-3`, `-4` (Winkel, Plattform, Kreuzbekrönung).
- **Tafel-/Inschrift-Details:** `-7`, `-6`. **Namenstafeln:** `-8` bis `-11`.
- **Umgebung/Layout:** `-0`, `-1` (Hügel, Bäume, Laub, Treppe).
- Laut Workflow (`ART-DIRECTION.md`, `docs/MENU_V4_REDESIGN_20261121.md`) werden
  die Fotos **nicht direkt zu Spielgrafiken bearbeitet**, sondern liefern die
  foto-basierte Strukturbeschreibung für Generierung und Style-2-Prompts. Im
  Spiel landen später generierte, optimierte Runtime-Assets (z. B. Galerie-Karte
  `level-08-witten-heven.webp`, transparentes Monument-Sprite), nie die JPGs
  selbst.

## Nächste Arbeit

- Level „Witten-Heven“ in `dist/levels.js` anlegen (derzeit nicht vorhanden); erst
  danach Galerie-Karte und Monument-Sprite auf Basis dieser Referenz produzieren.
- Vollständigen Style-2-Asset-Lock mit Generationsprompts analog zu
  `docs/LEVEL3_KIRCHENDE_MONUMENT_PHOTO_REFERENCE_20261112.md` erstellen, sobald
  das Level im Code steht. **Dokumentation allein ist keine Grafik- oder
  Android-Abnahme.**
