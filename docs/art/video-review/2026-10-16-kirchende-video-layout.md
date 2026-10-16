# Kirchende: erster Geländeabgleich anhand der Rundgänge

Referenzen: Nutzeraufnahmen vom 16.10.2026. Clips 85801–85804 zeigen Kirche,
Kirchhof und Löwendenkmal; 85806 verbindet Kirchhof, Straße und gegenüberliegenden
Zugang; 85807–85809 zeigen die bewaldete Gedenkanlage. Foto 85805 zeigt das
Löwendenkmal. Die Originalaufnahmen sind persönliche Referenzen und werden nicht
ins öffentliche Repository kopiert.

## Umgesetzt

- Level 3: südliche Spielrouten treffen sich vor dem geraden Plattenzugang und
  laufen mittig über die vorhandene kurze Treppe zum Denkmal.
- Erhöhte Gedenkfläche mit Laub/Erdboden statt eines großen Plattenrasters;
  kleine Steinauflage unter dem Monument, separate flache Gedenkplatte.
- Weniger dekorative Grabsteine in der bewaldeten Fläche; seitliche alte Marker
  und Laubstreu bleiben erhalten. Positionen sind angenähert.
- Level 4: breiterer gepflasterter Vorplatz, kleinteiliges Kopfsteinpflaster auf
  den Wegen und bogenförmige Steinreihen am Löwensockel.
- Baumkronen und Sträucher werden auch bei geladenen Style-2-Karten dargestellt;
  vorhandene Transparenz bei nahen Akteuren bleibt wirksam.
- Kartenexport übernimmt Wege und Bauplätze direkt aus dist/levels.js.
- Neue Cachekennungen für geänderte Skripte und Level-3/4-Kartenbilder.

## Grenzen dieses Schritts

Die vier Gegner-Spawns bleiben Spielgeometrie und belegen keine vier realen
Eingänge. Die zusätzliche Seiten-/Rückverbindung in Level 3 ist rekonstruiert.
Abstände sind nicht vermessen. Kirchenform, Löwensprite, Nachbarhäuser und die
übrigen Texturen sind noch keine vollständige fotogetreue Überarbeitung.
Die Kirchenposition und ihre Kollisionsfläche wurden in diesem Schritt nicht
verschoben. Vorschauen sind mit den Produktionsmodulen erzeugte Komposite,
keine Browser-Screenshots oder vollständigen Spieltests auf einem Android-Gerät.

## Prüfung

- 19 Node-Testdateien bestanden; darunter Durchlaufen aller Level-3/4-Routen,
  Bauplatzabstände, Kartenexport-Abgleich und Cache-Revision.
- Bestehende Gameplay-, Level-4- und Alpha-5-Prüfungen auch mit TEST_MOBILE=1.
- Alle vier Karten: Desktop 3072 px, Mobil 2048 px; Bilder vollständig dekodiert.
- Gesamte Kartenbilder: 5.953.336 Byte, unter dem bestehenden 10-MB-Limit.
- Sichtprüfung beider Komposite: Treppe liegt am zentralen Zugang;
  Kirchenfläche bleibt getrennt vom Löwenziel. Weitere Grafikarbeit ist offen.

Vorschauen: level-3-video-review.jpg und level-4-video-review.jpg.
Veröffentlichung des Testbuilds ist nicht Bestandteil dieses Commits.
