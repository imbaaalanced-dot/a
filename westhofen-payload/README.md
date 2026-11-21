# westhofen-payload

Base64-Paket der Westhofen-Karten-Neufassung v2 (nur diese Datei). Grund und
Ablauf wie bei menu-v4-payload: Der GitHub-Konnektor korrumpiert Binärdaten
(UTF-8), deshalb dekodiert `.github/workflows/decode-westhofen-v2-assets.yml`
dieses Paket, verifiziert die MD5 aus `manifest.md5` und committet die echte
WebP. Payload und Workflow löschen sich danach selbst.

Format manifest.md5: `<b64datei>|<zielpfad>|<md5summe>` (eine Zeile).
