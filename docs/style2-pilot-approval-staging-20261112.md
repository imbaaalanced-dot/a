# Style 2 · Freigabe für die Integration (Pilot, 12.11.2026)

Ausgangsmaterial: `TD2_Style2_Assetpilot_Komplett.zip`, lokal im Chat erzeugt.
Eigentümerfreigabe: **Integration und QA dürfen beginnen.** Es handelt sich
ausdrücklich nicht um eine bestandene Android-Abnahme oder einen Live-Release.

## Verbindliche Phasen

**A. Umgebung/Wegränder zuerst:** 6 periodische Bodentexturen, 8 transparente
Wegrand-Overlays, 5 isolierte Landschaftsobjekte.

**B. Effekte/HUD anschließend:** 5 separate Effekt-Atlanten mit jeweils
6 Frames (Marcel: blauer Zauberstab, keine Laterne; Kim: Pfeile; Treffer;
Nebel) und 10 UI-/HUD-Bausteine.

`tools/stage-style2-pilot.py` validiert das Archiv und übernimmt nur 34
Runtime-WebPs (19 + 15). Es lädt **nicht gleichzeitig die Frame-Einzelbilder und
deren Atlanten**. Für den vom Nutzer bereitgestellten ursprünglichen ZIP-Stand
beträgt die komprimierte Gesamtgröße der Auswahl 379.112 Byte.
Die PIL/NumPy-Quellprüfung ergab zuvor 578 technische Prüfpunkte ohne Fehler;
das ist kein Ersatz für visuelles oder Runtime-QA.

## Staging statt unkontrollierter Release

```sh
# Nur prüfen, keine Dateien verändern:
python tools/stage-style2-pilot.py TD2_Style2_Assetpilot_Komplett.zip

# Erst nach Entscheidung über die Phasenreihenfolge in ein frisches Verzeichnis:
python tools/stage-style2-pilot.py TD2_Style2_Assetpilot_Komplett.zip \
  --phase environment --destination dist/assets/style2-pilot-environment-qa --install

# Phase B gesondert, nachdem Phase A überprüft ist:
python tools/stage-style2-pilot.py TD2_Style2_Assetpilot_Komplett.zip \
  --phase effects-ui --destination dist/assets/style2-pilot-effects-ui-qa --install
```

Der Paketinhalt wird per SHA-256 gegen das im ZIP enthaltene Manifest abgeglichen.
ZIP-Pfadtraversal, fehlende Einträge und Überschreiben werden zurückgewiesen.
Das Staging ändert **keine** produktiven `dist/index.html`-Einträge,
`asset-manager.js`-Ladepfade, Leveldaten oder Speicherstände.

## Noch zu prüfen

- Canvas-Materialprojektion: Kirchende und Westhofen, Wegnaht und Draw-Order
- Auflösungs-/Touchabnahme im Hochformat, HUD-Texte und ausreichende Trefferflächen
- Einzelne Effekt-Animationen, tatsächliche Schussrichtung und Spielmechanik
- Desktop-Chromium, mobiles Chromium mit Touch-Emulation, HTTP-Assetfehler
- **Separater echter Android-4-GB-Gerätetest** zu FPS/RAM/Flackern/Langzeitsitzung
- Nach einem Merge: GitHub Pages separat auf Erreichbarkeit, Version und Navigation prüfen

Das Approval gilt **für den nächsten Integrationsschritt**, nicht als Vorwegnahme
dieser Ergebnisse. Verknüpfte Aufgabe: #219.
