
#!/bin/sh

# =====================================
# DENKMAL TD2 - VIDEOANALYSE
# Android / Acode / Alpine Linux
# =====================================

echo "=== TD2 Videoanalyse startet ==="

# 1. Programme installieren
if ! command -v ffmpeg >/dev/null 2>&1 || \
   ! command -v zip >/dev/null 2>&1; then
    echo "Installiere FFmpeg und ZIP..."
    apk update
    apk add ffmpeg zip || exit 1
fi

# 2. Speicherorte durchsuchen
echo "Suche A.mp4..."

VIDEO=""

for DIR in \
    /storage/emulated/0/Download \
    /sdcard/Download \
    /mnt/shared/Download \
    /root \
    /home
do
    if [ -d "$DIR" ]; then
        VIDEO=$(find "$DIR" -type f -iname "A.mp4" \
            -print -quit 2>/dev/null)
        [ -n "$VIDEO" ] && break
    fi
done

# 3. Video prüfen
if [ -z "$VIDEO" ]; then
    echo "FEHLER: A.mp4 nicht gefunden!"
    echo "Pruefe den Speicherzugriff."
    exit 1
fi

echo "Video gefunden: $VIDEO"

# 4. Ausgabeordner bestimmen
OUTPUT="/storage/emulated/0/Download/TD2_Analyse"

if [ ! -d "/storage/emulated/0/Download" ]; then
    OUTPUT="$HOME/TD2_Analyse"
fi

mkdir -p "$OUTPUT" || exit 1

# 5. Alte Bilder entfernen
rm -f "$OUTPUT"/frame_*.jpg

# 6. Einzelbilder extrahieren
echo "Extrahiere Einzelbilder..."

ffmpeg -hide_banner -loglevel error \
    -i "$VIDEO" \
    -vf "fps=1/2,scale=960:-2" \
    -q:v 3 \
    "$OUTPUT/frame_%04d.jpg" || exit 1

# 7. Bilder zählen
COUNT=$(find "$OUTPUT" -maxdepth 1 \
    -name 'frame_*.jpg' | wc -l)

echo "Erstellte Bilder: $COUNT"

if [ "$COUNT" -eq 0 ]; then
    echo "FEHLER: Keine Bilder erstellt!"
    exit 1
fi

# 8. ZIP erstellen
echo "Erstelle ZIP-Datei..."

cd "$OUTPUT" || exit 1

rm -f TD2_Bilder.zip

zip -q TD2_Bilder.zip frame_*.jpg || exit 1

# 9. Fertig
echo ""
echo "================================"
echo "TD2 VIDEOANALYSE FERTIG!"
echo "================================"
echo "Bilder: $COUNT"
echo "Ordner: $OUTPUT"
echo "ZIP: $OUTPUT/TD2_Bilder.zip"
echo "================================"
