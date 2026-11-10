# Ansturm · Koloss V3, einzelner Grafikreview

**Branch:** `art/style2-colossus-review-v3-20261110`

**Audit-Ausgangslage:** Im bestehenden Gegner-/Bossatlas-Bericht wurde der
Koloss als **einzelnes** Ansturm-Standbild mit sichtbaren Randberührungen
eingestuft, nicht als mehrteiliges Action-Atlasblatt. Aktiver Pfad:
`dist/ansturm/assets/boss_colossus.webp` (173×280).

**Einzelentscheidung:**

1. V2 mit vollständiger Silhouette erzeugt; Pixelcheck technisch bestanden,
   aber der Miniaturvergleich zeigte eine **zu breite, zu niedrige Figur** im
   unveränderten 173×280-Feld. V2 wurde für Runtime/PR ausdrücklich verworfen.
2. V3 mit einer aufrechten, schmaleren Figur entlang der Referenz neu erstellt;
   Mauerhelm, orange Flammen, rote Tuchreste und schwere Fäuste bleiben als
   Erkennungsmerkmale bestehen.
3. Für V3 gibt es eine verlustfreie Masterfassung, eine optimierte
   Hochauflösungsansicht und eine 173×280-Reviewgröße. Alle drei bestehen den
   sichtbaren Alpha-Randcheck (31/31/15 px), ohne leere Frames oder sichtbare
   Pixel auf dem Außenrand.
4. Die beiden Bilder im identischen 173×280-Feld wurden visuell verglichen.
   Der neue Koloss ist vollständig und klarer getrennt, aber seine zusätzlichen
   Turmdetails und der mögliche Unterschied im Fußpunkt bleiben ein **Art-Hold**.

**Nicht behauptet:** Animationszustände, künstlerische Freigabe, Ingame-Pivot,
Browser-/Android-Abnahme und FPS/RAM wurden durch die Pixelprüfung **nicht**
nachgewiesen. Der neue Kandidat ist in `source-art/`, nicht im Runtime-Pfad.

**Nächster Schritt:** gemeinsam bei 64/128 px und im Canvas bei Laufbewegung,
Boss-Warnphase und überlappenden Gegnern begutachten. Nur bei freigegebener
Silhouette separat in eine Runtime-Integration überführen und echte Mobiltests
vor dem Merge/Deployment durchführen.
