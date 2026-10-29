# Loot-System V2

Normale Gegner in Kampagne und Endlosmodus vergeben mit 4 % Chance einen Gegenstand. Spätestens der 40. erfolglose Kill einer Sitzung vergibt einen Fund. Ein Fund setzt den Zähler zurück; Neuladen beginnt eine neue Sitzung. Portalreise und der heldenlose Ansturm behalten ihre bisherigen Erwerbsregeln.

Normale Funde sind zu 75 % magisch und zu 25 % selten. Seltene Funde können die zum Typ gehörende besondere Kraft tragen. Bosse garantieren weiterhin epische (80 %) oder legendäre (20 %) Ausrüstung. Alle 21 vorhandenen Typen sind erreichbar. Der Duplikatschutz bevorzugt fehlende Typen, danach die am wenigsten vorhandenen Typen im gewählten Pool. Bereits ausstehende Funde zählen dabei mit. Alte Items bleiben unverändert.

Funde werden unmittelbar in die Sammlung übernommen und gespeichert; die laufende Heldenausrüstung bleibt für diesen Durchlauf fest. Das Inventar bietet Platzfilter und einen Verbesserungsfilter. Ringe werden für beide Plätze geprüft. Überlauf wird in derselben gefilterten Liste angezeigt. Ausgerüstete und favorisierte Items bleiben vor Recycling geschützt.

## Spielstände

Schema 4 übernimmt v1/v2/v3. Vor einem v3→v4-Schreiben wird der alte Stand einmal unter `denkmal-loot-v1-pre-v4` gesichert; v1/v2 verwenden weiterhin die vorhandene pre-v3-Sicherung. Export ist im Inventar möglich. Ältere Builds können Schema 4 nicht lesen; für einen Rückweg die Sicherung vor Migration verwenden. Browser-Spielstände teilen sich auf derselben Domain den Speicher, auch auf verschiedenen Testpfaden.

Bei Quota-Fehlern bleibt Beute in der Sitzung exportierbar. An der Sammlungsgrenze bleiben unveränderte Fundkandidaten gespeichert und werden nach Recycling übernommen. Veraltete Tabs überschreiben keine neueren Spielstände.

## Prüfung und Veröffentlichung

55 JavaScript-Testdateien bestanden vor dem abschließenden Review. Zusätzliche Tests decken normale Kills, Pity, Duplikate, 21 Typen, Migration, Quota, Import, volle Sammlung und Inventarfilter ab. Browser-Installation lokal fehlgeschlagen (unvollständiger Download); der separate Workflow führt daher vor Veröffentlichung die echte Chromium-Prüfung auf Desktop und Touch aus. Physisches Android mit 4 GB RAM bleibt als Gerätetest offen.

Der neue Workflow veröffentlicht ausschließlich `/loot-v2/v4-alpha9/`, nach erfolgreichen Tests. Kein Merge nach main. Veröffentlichung gilt erst nach erfolgreichem Workflow und HTTPS-Prüfung als abgeschlossen.
