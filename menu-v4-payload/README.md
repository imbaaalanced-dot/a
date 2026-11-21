# menu-v4-payload

Base64-Pakete der Menü-v4-Assets (feature/menu-v4-herbstwacht).

Warum dieser Umweg: Der verwendete GitHub-Konnektor kann Binärdateien nur
als UTF-8-Text übertragen, wodurch WebP-Bytes > 0x7F korrumpiert werden
(verifiziert per MD5 gegen den Branch-Tarball). Die abschließenden Bilddateien
werden daher von `.github/workflows/decode-menu-v4-assets.yml` dekodiert,
per MD5 gegen `manifest.md5` verifiziert und als echte Dateien committet.

Format manifest.md5 (eine Zeile je Datei): `<b64datei>|<zielpfad>|<md5summe>`

Nach dem Dekodieren löscht sich sowohl dieser Ordner als auch der Workflow selbst.
Dies ist ein einmaliger Mechanismus; dauerhafte Automation wird nicht hinterlassen.
