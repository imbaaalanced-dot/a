#!/bin/sh
# Denkmal TD2 - Abnahme-Begleiter (physische Geraete-Abnahme, z. B. 4 GB Android)
# Fuehrt interaktiv durch die 9 Szenarien aus docs/android-4gb-abnahme-2026-11-20.md,
# erzeugt ein Markdown-Protokoll und kann es optional als Kommentar ans Issue posten.
#
# Nutzung:
#   ./tools/android-abnahme-protokoll.sh                     # interaktiv, Protokoll nach stdout
#   ./tools/android-abnahme-protokoll.sh -o protokoll.md     # Protokoll in Datei
#   ./tools/android-abnahme-protokoll.sh --issue 388         # danach Abfrage: als Kommentar posten?
#   ./tools/android-abnahme-protokoll.sh --rehearsiert        # Leer-Eingaben fallen auf Standards zurueck
set -eu

OUT=""; ISSUE=""; REHEARSAL=0
while [ $# -gt 0 ]; do
  case "$1" in
    -o) OUT="$2"; shift 2 ;;
    --issue) ISSUE="$2"; shift 2 ;;
    --rehearsiert) REHEARSAL=1; shift ;;
    -h|--hilfe) sed -n '2,11p' "$0"; exit 0 ;;
    *) echo "Unbekannte Option: $1" >&2; exit 2 ;;
  esac
done

ask() { # $1=Standard (bei --rehearsiert), Rest=Prompt
  std="$1"; shift
  printf '%s\n' "$*" >&2
  answer=""
  read -r answer || true
  if [ -z "$answer" ]; then
    if [ "$REHEARSAL" = "1" ]; then answer="$std"; else answer="k.A."; fi
  fi
  printf '%s' "$answer"
}

GERAET=$(ask "Testgeraet 4 GB" "Geraet/Browser (z. B. Pixel 6a, Chrome)")
DATUM=$(date +%Y-%m-%d)

TMP="${TMPDIR:-/tmp}/td2-abnahme-$$"
trap 'rm -f "$TMP"' EXIT
{
  printf '# Android-4-GB-Abnahme - Protokoll (%s)\n\n' "$DATUM"
  printf '**Geraet/Browser:** %s\n\n' "$GERAET"
  printf '**Suite:** https://imbaaalanced-dot.github.io/a/ | Katalog: docs/android-4gb-abnahme-2026-11-20.md | Telemetrie: FPS: AN | Bewertungsvorschlag: Median >= 50 fps, kein unspielbares Szenario\n\n'
  printf '| # | Szenario | FPS-Med. | P95/DRAW/SIM (ms) | Stutters>50ms/Frame | E/FX | JS-Heap Start->End (MiB) | Fehler | Urteil |\n'
  printf '| - | --- | --- | --- | --- | --- | --- | --- | --- |\n'
  for id in A B C D E F G H I; do
    case "$id" in
      A) name="Cold Start bis Hauptmenue" ;;
      B) name="Kapitel 1, Welle 1-5 (Intro)" ;;
      C) name="Kapitel 1, Welle 10-20 mit Boss" ;;
      D) name="Kirchende, laufende Welle + Touch-Bau" ;;
      E) name="Endlosmodus, volle Karte, Grosswelle" ;;
      F) name="Ansturm, Welle 15+, Frost+Tesla+Feuer" ;;
      G) name="Rucksack voll, Import/Export" ;;
      H) name="Optionen: Lautstaerke/TON/Vollbild" ;;
      I) name="10 min Dauersitzung + App-Wechsel" ;;
    esac
    fps=$(ask "60" "[$id $name] FPS-Median am Ende")
    lat=$(ask "16.7/1.3/0.1" "[$id] P95 / DRAW / SIM (ms)")
    stu=$(ask "0/240" "[$id] Stutters > 50 ms / Frames")
    ef=$(ask "0/0" "[$id] E (Gegner) / FX (Partikel)")
    heap=$(ask "10->12" "[$id] JS-Heap Start -> Ende (MiB)")
    err=$(ask "-" "[$id] sichtbare Fehler (oder -)")
    urt=$(ask "ok" "[$id] Urteil: fluessig (ok) / akzeptabel / schlecht")
    printf '| %s | %s | %s | %s | %s | %s | %s | %s | %s |\n' "$id" "$name" "$fps" "$lat" "$stu" "$ef" "$heap" "$err" "$urt"
  done
  printf '\n**Gesamturteil:** %s\n\n' "$(ask 'Angaben folgen' 'Gesamturteil / Anmerkungen')"
  printf '*Erstellt am %s mit tools/android-abnahme-protokoll.sh*\n' "$DATUM"
} > "$TMP"

if [ -n "$OUT" ]; then
  cp "$TMP" "$OUT"
  echo "Protokoll geschrieben: $OUT" >&2
else
  cat "$TMP"
fi

if [ -n "$ISSUE" ]; then
  printf '%s\n' "Als Kommentar an Issue #$ISSUE posten? [j/N]" >&2
  read -r confirm || true
  if [ "$confirm" = "j" ] || [ "$confirm" = "J" ]; then
    if command -v gh >/dev/null 2>&1; then
      gh issue comment "$ISSUE" --repo imbaaalanced-dot/a --body-file "$TMP"
      echo "Kommentar gepostet." >&2
    else
      echo "gh nicht verfuegbar - Protokoll bitte manuell an Issue #$ISSUE anhaengen." >&2
    fi
  fi
fi
