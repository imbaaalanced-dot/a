#!/bin/sh
# Erzeugt das alpha-final-Quellarchiv (Rezepist aus RELEASE_alpha-final.md):
#   ./tools/make-alpha-final-tarball.sh [git-ref] [ausgabe.tar.gz]
set -eu
ref="${1:-alpha-final}"
out="${2:-denkmal-td2-alpha-final-$(date +%Y%m%d).tar.gz}"
git archive --format=tar.gz --prefix=denkmal-td2-alpha-final/ -o "$out" "$ref"
echo "Archiv: $out ($(du -h "$out" | cut -f1)) aus $ref ($(git rev-parse --short "$ref"))"
