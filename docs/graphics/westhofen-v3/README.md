# Westhofen V3 – Bronzeemblem-Kandidat

**Status:** `source_only_visual_review_pending`. Keine Runtime-Integration.

Anlass: [Issue #252](https://github.com/imbaaalanced-dot/a/issues/252); die V2-Grafik zeichnet technisch korrekt, die Bronze-Silhouette wurde nach Vergleich der echten Gameplay-Screenshots mit Nutzerfotos nicht visuell freigegeben.

## Änderungen gegenüber V2

- Geformte, asymmetrische Helmflügel mit Federsegmentierung statt langen, steilen V-Hörnern.
- Horizontal verbreitertes, flaches Schild mit Nieten und stärkeren Reliefkonturen.
- Sichtbare, horizontal verlaufende Schwertklinge samt linkem Griff.
- Tieferer Helmvisierschatten, vereinfachtes kontrastreiches Band.
- Unverändert: V2-Steine, Stufen, Tafeln, Spielgeometrie und 450×300-World-Anker.

Dateien:
- `westhofen-emblem-v3.svg`: nur Bronze-Modul auf transparentem 768×512-Canvas.
- `westhofen-composite-v3.svg`: unveränderte V2-Umgebung + V3-Bronze-Modul.

Die Originalfotos sind Nutzerdateien **außerhalb dieses öffentlichen Repositories**. Dieser SVG-Entwurf ist anhand der Bildbeobachtungen manuell konstruiert; keine fotogrammetrisch exakte Rekonstruktion. Keine fiktiven Inschriften; Mittelplatte und Schalenpodeste bleiben im bereits festgelegten 2026-Zustand.

## Qualitätsschranken

`python tests/westhofen-v3-source.test.py` kontrolliert die SVG-Struktur, Ebenen und Unverändertheit des V2-Hintergrunds.

`python tools/export-westhofen-v3.py --out build/westhofen-v3` erzeugt transparente 768×512-WebP/PNG-Prüfkandidaten, 64/128px-Hell-/Dunkelansichten und eine V2-V3-Gegenüberstellung. Der zugehörige GitHub-Workflow lädt sie als **Review-Artefakt** hoch.

Weitere Gates vor jeder Runtime-Nutzung: Vergleich der tatsächlichen Pixelbilder gegen die Fotos, historische Material-/Reliefkorrektur, separater Level-7-Chromium-Desktop/Touch-Test und echter Android-Test (4 GB RAM). V2 und Spielstände werden nicht überschrieben. Merge und Veröffentlichung benötigen gesonderte Freigabe.


## Neuanlauf V3b (14.11.2026)

Marcel Schneider hat den ersten V3-Bronzeentwurf am 14.11.2026 abgelehnt und das gesamte Bronze-Modul neu anfassen lassen. Der V3b-Neuentwurf folgt der Strukturanalyse der frisch bereitgestellten Referenzfotos vom 14.11.2026 (private Nutzerdateien, nicht im Repository):

- Runder, gewölbter Schild mit erhabenem Rand, zentralem Schildbuckel und Nietaugen (statt breiter Querovale), leicht die Helmbasis überdeckend.
- Rundhelm mit Nasenschutz und horizontaler Sehschlitzöffnung (Vikingerform), vor Schwert und Flügeln.
- Beidseitige, aufwärts-außen gerichtete Flügel mit geschichtetem Federaufbau und einzeln modellierten Federrippen, Spannweite je Flügel etwa eine Helmbreite.
- Horizontal liegendes Schwert hinter dem Schild: Klinge nach rechts, gerader senkrechter Parierstangen-Kreuz, Griff links mit Knauf.
- Dunkle Patinabasis mit helleren abgetragenen Bronze-Höhen.

Status bleibt `source_only_visual_review_pending`; keine Runtime-Integration vor kunstabnahme. Die Vergleichsraster (V2 gegen V3b, 64/128 px, hell/dunkel) werden über den Review-Workflow unter `review-20261114/` veröffentlicht.
