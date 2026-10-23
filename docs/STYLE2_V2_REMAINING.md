> Aktualisierung 22.10.2026: Die folgende ursprüngliche Restliste ist durch den Einbau des Erweiterungspakets teilweise erledigt. Aktueller Stand: [STYLE2_V2_EXPANSION.md](STYLE2_V2_EXPANSION.md). Offen bleiben echte viergerichtete Aktionskunst, historische Feinabnahme und Tests auf physischem Android.

# Denkmal TD2: V2-Grafikstand und offene Pakete

Stand: 21.10.2026. Basis ist die gemeinsame Version aus PR #54. Die Dateiendung
`v1` allein bedeutet nicht, dass ein Asset nicht Style 2 ist. Nachfolgend werden
tatsächliche Bild-/Rendererlücken von bereits vorhandener Style-2-Kunst getrennt.

## Neu erzeugt und in diesem Patch integriert

| Paket | Umfang | Einbindung und Grenze |
|---|---|---|
| Treffer | 30 RGBA-PNG-Master, fünf Familien × sechs Phasen; ein 768×640-WebP | `style2-impact-atlas.js` → `UserStyle2Towers.drawImpact` → bestehender Combat-FX-Pfad. Ein gemeinsamer, lazy geladener Atlas. Bogen, Eis/Magie, Rift: alle drei Stufen mit verschiedener Darstellungsgröße. Kanone/Bumerang: neue Feuer-/Stahldarstellung nur Stufe 3; passende bisherige Darstellung auf Stufen 1/2. Keine Behauptung von drei separat gemalten Stufensätzen. |
| Inventar | acht RGBA-PNG-Master und ein 512×256-WebP | Waffe, Kopf, Rüstung, Handschuhe, Stiefel, Amulett, zwei Ringe. `loot.css` nutzt `equipment-v2.webp`. Die fünf älteren Kirchende-Spezialicons bleiben wegen ihrer eigenen Itemidentität erhalten. Slotbilder sind keine 21 individuellen Itembilder. |

Sparmodus/reduzierte Effekte bleiben bei den bisherigen leichten Canvas-Effekten.
Kaltes oder fehlgeschlagenes Laden und Draw-Fehler lassen den alten Effektpfad
aktiv. Neue Laufzeittexturen zusammen: 2,375 MiB dekodiertes RGBA, ohne Mipmaps oder
GPU-Messbehauptung. Assets werden nicht pro Treffer neu erstellt.

Die ursprüngliche Generierung hatte überlappende gleichmäßige Rasterzellen.
Eine zweite Generierung verbesserte die Abstände; der Export verwendet dennoch
manuell geprüfte Quellrechtecke und Einschlagsmittelpunkte. Es gibt keine
automatische Gleichraster-Schnittannahme. Transparente Randdünste bis Alpha 64
können an den Quellgrenzen abgeschnitten sein; die sichtbaren Hauptformen
berühren diese Grenzen nicht. Alle exportierten Frame-/Iconaußenkanten sind
vollständig transparent. Keine Farbänderung der sichtbaren Kunst.

Export: `tools/export-v2-impacts-icons.py IMPACT_SOURCE ICON_SOURCE`. Die jeweiligen
Quell-SHA-256-Werte stehen in den Manifesten. Die Bildgenerierungen bleiben als
unveränderte Quellen außerhalb des Spielbuilds erhalten. PNG-Master und verlustfreie
WebPs befinden sich unter `dist/assets/impacts-v2/` und `dist/assets/items/`.

## Noch fehlend oder unvollständig

| Priorität | Bereich | Konkrete Restarbeit | Codebeleg |
|---|---|---|---|
| 1 | Individuelle Ausrüstung | Eigene V2-Icons für 21 Katalog-Templates; fünf alte Kirchende-Powericons ersetzen, Identität beibehalten | `equipment-catalog.js`, `loot-ui.js: icon()` nutzt weiterhin slotweise Kategorieart und fünf Power-Overrides |
| 1 | Marcel und Kim | Separate gemalte Angriffs-, Treffer- und Todeszyklen; Referenztreue und identische Pivots prüfen | `hero-saga.js`: vorhandene Walk-Atlanten und prozedurale Kampf-/Bewegungseffekte |
| 1 | Gegner und Bosse | Angriff/Treffer/Tod getrennt malen; bestehende 21 Walkdesigns auf Artefakte prüfen | `enemy-animations.js`: vier Laufphasen pro Design; Attack, Hit und Death verändern Transform/Alpha des Laufbilds |
| 2 | Untere Turmstufen | Eigene sechsphasige Trefferkunst für Holz-/Eisenkanone und Holz-/Kunststoffbumerang | Dieser Patch behält hierfür bewusst den vorhandenen Renderer bei |
| 2 | Portalreise-Menü | Eigene V2-Buttonkunst für Neuer Durchlauf/Fortsetzen | `index.html`: Portalbuttons besitzen Text, die vier bisherigen Hauptmenübuttons eigene Bildgrafiken |
| 2 | Umgebung | Einheitlicher Detailpass für Bodenübergänge, Felsen, Sträucher, Mauern/Hecken und Bäume aller sechs Karten | `style2-maps.js`, `forest-crowns.js`, `goethestrasse-art.js`, `hohensyburg-art.js`: gemalte Canvas-Schichten; nicht pauschal „kein Style 2“ |
| 3 | Historische Feinabnahme | Ortsabstände, Kirchhofwege, Monumentmaßstab und Vegetation gegen Quellen/Laufzeit prüfen | Kirche/Löwe, Kirchende, Kaiser-Wilhelm und Goethestraße haben bereits eigene Style-2-Sprites; eine erneute komplette Generierung ist nicht automatisch erforderlich |
| 3 | Legacy-Fallbacks | Übrige alte Ersatzgrafiken bei Bedarf vereinheitlichen | Vorhandene SVG-/Canvas-Fallbacks bleiben funktionsfähige Absicherung |

## Prüfstatus

Node prüft tatsächliche Frameauswahl, einmalige Bildhaltung, Tiergrenzen,
Sparmodus, ungültige Lebenszeiten und Save/Restore bei Zeichenfehlern. Pillow prüft
38 Master, Alpharänder, Reihenfolge, SHA-256 und die sichtbare Pixelgleichheit der
verlustfreien Laufzeitbilder auf dunklem und hellem Hintergrund.

68 lokale Prüfkommandos bestanden. Chromium 153: Desktop 1280×900 und Touch-Emulation 412×915 bestanden; Inventar, sechs Levelstarts, 30 reale Atlas-Zeichenaufrufe, beide WebP-Decodes, keine beobachteten JS- oder HTTP-Fehler. Browserberichte liegen unter `docs/qa/style2-v2-20261021/`. Browserkontaktbögen
sind synthetische Darstellungen des echten Effektpfads; sie ersetzen keinen
physikalischen Einschlagstest sämtlicher Turmstufen. Reales Android/WebView,
Flacker-/FPS-Langzeittest und Sichtabnahme auf dem Nutzergerät bleiben offen.
