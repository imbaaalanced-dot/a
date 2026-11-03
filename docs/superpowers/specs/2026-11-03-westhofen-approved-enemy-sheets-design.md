# Westhofen: freigegebene Gegner-Sheets integrieren
Stand: 03.11.2026 · Entwurf zur technischen Freigabe

## Ziel und bisherige Abnahme
Die vom Nutzer visuell bestätigte Vorschau enthält 84 Posen aus fünf transparenten PNG-Quellen. Diese Abnahme gilt für die Vorschau, noch nicht für den Renderer im Spiel oder die Android-Performance.

## Grundlage
- Neuer, unabhängiger Branch: feature/westhofen-approved-enemy-sheets-20261103.
- Ausgangscommit: 9d02d399a671a1801805c40df2a45f36faafbf89, Westhofen-Preview aus PR #80.
- PR #80 ist laut GitHub bereits geschlossen und gemergt (Ziel war der QA-Vorgängerbranch). Das belegt keinen Merge nach main.
- Der vorhandene Branch feature/v4.3-westhofen-action-animation und sämtliche bestehenden PRs bleiben unverändert.
- dist/enemy-animations.js ruft TD2DirectionalActions.enemy und V2Expansion.enemy vor dem bisherigen Laufatlas auf. Der neue Westhofen-Renderer muss davor eingehängt werden; sonst können vorhandene Renderer die neuen Sheets verdecken.
- Westhofen ist Level 7. Seine Bodenwellen enthalten wraith, runner, guardian, archer, sapper sowie den Boss. Fluggegner behalten ihre bisherige Darstellung.

## Ansätze
1. Empfohlen: separates, nur für Level 7 aktives Render-Modul mit frühem Aufruf in DenkmalEnemyAnimations.draw. Kleine Eingriffsfläche, klare Rückfallebene.
2. Globaler Ersatz der Gegner- und Richtungsatlanten: betrifft andere Level und verlangt mehrere neu gezeichnete Blickrichtungen. Für diese Integration unnötig groß.
Der empfohlene Ansatz ist eine technische Empfehlung, noch keine vom Nutzer gewählte Umsetzung.

## Zuordnung (Vorschlag)
| Bestehender Gegnertyp | Quellsheet | Posen |
| --- | --- | --- |
| wraith und runner | 1911.png – Schwertkämpfer | 16 |
| guardian | 1913.png – Schildritter | 16 |
| archer | 1912.png – Skelettbogenschütze | 16 |
| sapper | 1914.png – Giftträger | 16 |
| boss | 1915.png – Glutgolem | 20 |

Diese Zuordnung ändert keine Gegnertypen, Werte, Wellen oder Fähigkeiten. Zwei Typen teilen dieselbe Figur; Geschwindigkeit und bestehende Erkennungsmerkmale müssen bei der Spielprüfung lesbar bleiben.

## Darstellung
- Vier Quellposen je Aktion: Laufen, Angriff, Treffer und Tod; Golem zusätzlich vier Spezialposen.
- Die Quelle zeigt nur eine Blickrichtung. Spiegeln ist eine Darstellungsvereinfachung und keine neu gezeichnete Richtung.
- Aktionspriorität: Tod, Treffer, Angriff, Bewegung, Ruhepose.
- Angriff und Treffer an vorhandene Timer koppeln; Tod an deathProgress. Kein neuer Schaden durch Animationsbilder.
- Todesfolge einmalig abspielen und letzte Pose halten; bestehende Entfernung und Transparenz berücksichtigen, keine doppelte Ausblendung.
- Körpermaß pro Figur konstant halten. Fußkontakt manuell prüfen; beim Todeszyklus feste Bodenlage erhalten.
- Golem-Spezialposen zunächst nicht als neue Fähigkeit integrieren. Erst bei belegtem, passendem vorhandenen Bosszustand kosmetisch verwenden; andernfalls bleiben sie in der Vorschau.

## Assets und Speicher
- Originale unverändert aufbewahren; Quellhashes und Ausschnittkoordinaten dokumentieren.
- Eng abgegrenzte Posen mit konstantem Maßstab und transparenten Sicherheitsrändern auf mobile Atlanten vorbereiten; ursprüngliche unregelmäßige Raster nicht direkt als gleich große Zellen behandeln.
- Schwache Alpha-Restpixel prüfen und außerhalb echter Rauch-/Effektkonturen entfernen. Rauch darf nicht pauschal weggeschwellt werden.
- Nur Westhofen-Assets bedarfsgerecht laden; Asset-Manager und dessen Freigabe verwenden. Keine neuen Bildobjekte pro Gegner oder Frame.
- Vorläufiges Budget: höchstens 8 MiB zusätzlich decodierte RGBA-Atlanten für das Set. Dateigröße und decodierte Fläche separat messen.
- Bei Ladefehlern oder fehlender Bildbereitschaft ohne Blockade den vorhandenen Renderer verwenden.

## Dateien und Prüfung
- Neues dist/westhofen-enemy-actions.js: Auswahl, Aktionsfortschritt, Ausschnitte, Laden und Zeichnen.
- dist/enemy-animations.js: eng begrenzter Aufruf vor den bisherigen Renderern.
- dist/index.html: Modulreihenfolge und Cache-Kennung.
- dist/assets/enemies/westhofen/: optimierte Assets plus Herkunfts-/Mappingdaten.
- Tests: Auswahl nur in Level 7, alle Aktionsgrenzen, Todes-Endbild, Rückfall bei Ladefehlern, keine doppelten Alpha-Effekte, ausgeglichene Canvas-save/restore, Spiegeln, reduzierte Bewegung und konstante Anker.
- Bildtests: RGBA-Dekodierung, vollständige Posen, Grenzen, Sicherheitsränder und Speicherbudget.
- Bestehende Node-/Python- und mobile Logikprüfungen aus dem Westhofen-QA-Workflow ausführen.
- Browserprüfung: tatsächliche Screens im Spiel, keine Lade-/Konsolenfehler. Separat: physischer Android-Test auf 4 GB RAM.
- Veröffentlichung erst nach Prüfung; neue HTTPS-Adresse nur nach tatsächlichem Deployment nennen. Kein Merge nach main.

## Freigabegrenze
Bisher erfolgt: Quellprüfung, Vorschau und Nutzerabnahme der Vorschau.
Offen: Zustimmung zu diesem technischen Zuschnitt und danach Implementierungsplan, Code, Assetaufbereitung, Regressionstests, Browser- und Android-Abnahme.
