# TD2 initial loading-screen assets

Die drei Bilddateien müssen exakt in diesem Ordner liegen:

- `storm.webp`
- `gate.webp`
- `journey.webp`

Die Bilder stammen aus dem bereitgestellten Archiv `td2_preload_9x16_assets.zip`.
Der Startbildschirm verwendet automatisch `assets/menu/warden-mobile-v2.webp`, falls kein Ladebild vorhanden ist.

Die neue Integration befindet sich in `dist/preloader.js` und `dist/preloader.css`.
Bei einem Ladefehler wird die Grafik im Fortschritt als fehlend gemeldet und das Hauptmenü trotzdem freigegeben.

**Vor Merge:** Bilddateien hinzufügen; Browser und Android im Hoch- und Querformat testen;
mit geleertem Cache erneut laden; Netzwerk/Offline-Fall prüfen; GitHub-Actions-Tests abwarten.
