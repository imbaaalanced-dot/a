# Portalreise Task 2 – Perks

Stand: 20.10.2026. Fortsetzung auf feature/td2-portalreise-state-economy-20261020.
Basis: fe79b212c9c356ffa6ad4b610b6527fd8f1c8077. Umfang ausschließlich Task 2 des bestätigten Plans.

## Umsetzung
- Zwölf unveränderliche Katalogeinträge, je drei Stufen, Werte aus dem bestätigten Entwurf.
- PortalPerks.offer(ranks,rngState,{heroId,turretKinds}) liefert drei verschiedene zulässige IDs und den fortgeschriebenen uint32-Zufallszustand. Gleiche gespeicherte Eingabe liefert dasselbe Angebot. Ein direkt nutzbarer Heldenperk wird bevorzugt, wenn keine Türme vorhanden sind und ein solcher Perk noch wählbar ist.
- Falls weniger als drei Perks verfügbar bleiben, werden alle verbleibenden ohne Duplikate angeboten; bei vollständig ausgeschöpftem Katalog ein leeres Angebot. Der Pilot erreicht diesen Fall regulär nicht.
- choose prüft bekannte IDs und Rang 0–3, verändert den Eingang nicht. Die Bindung an das konkret gespeicherte Angebot erfolgt beim UI-/Zustandsanschluss.
- derive verarbeitet heroDamage/maxHp/moveSpeed/towerDamage/towerRange/towerAttackSpeed. Rangprozente werden zum Grundwert addiert, nicht pro Wahl auf den bereits erhöhten Wert multipliziert.
- areaModifiers erhält boolesche Reichweitenbefunde und verhindert damit Stapelung je Turm. Die räumliche Prüfung selbst liegt beim Spiel.
- hitEffects verarbeitet einen gemeinsamen Zustand pro Durchlauf/Held, Zielmarkierungen pro Gegner und eine gemeinsame Gegenstoß-Aufladung mit zwei Sekunden Abklingzeit. Die Abklingzeit beginnt beim Aufladen. Nur origin=base löst Effekte aus oder verbraucht sie; origin=perk verändert den Trefferzustand nicht.
- Engpass liefert Stärke und Dauer. Der Kampfadapter muss den stärksten aktiven Slow verwenden, keine multiplikative Verlangsamung.

## Abgrenzung
Noch keine Einbindung in game.js/index.html, keine Speicheränderung, keine UI und keine Veröffentlichung. Task 3 speichert Angebote/Zufallszustand, Task 4 bindet Auswahl und Kampf an. Dort werden auch Ausdauers zusätzliche Lebenskapazität einmal aufgefüllt, Erholung angewandt, Reichweiten/Radien geprüft und der Trefferzustand zwischen Karten verwaltet.
Task 1 bleibt unverändert. PR 51, andere Featurebranches und main werden nicht beschrieben.

## Tests und Review
RED: node tests/portal-perks.test.cjs schlug vor Implementierung mit MODULE_NOT_FOUND fehl.
GREEN: 13/13 Perkprüfungen, 11/11 Zustandsprüfungen und 19/19 Inventarprüfungen bestanden.
TEST_MOBILE=1 node tests/portal-perks.test.cjs: 13/13 bestanden; reine Modulprüfung, kein Android-Spieltest.
node --check dist/portal-perks.js: bestanden.
Unabhängiges Review: keine wichtigen/kritischen Befunde und keine zurückgestellten Kleinigkeiten.

Gesamtlauf aller 39 lokal verfügbaren *.test.cjs: 35 bestanden. Dieselben vier Asset-abhängigen Dateien wie in Task 1 scheitern wegen fehlender Bilder in der lokalen Quellenkopie: game.test.cjs (Bildpfad-existsSync), level5.test.cjs (Kaiser-Wilhelm-WebP), style2-church-sprite.test.cjs (Kirchen-WebP), v4-alpha5.test.cjs (Bumerang-Atlas). Kein vollständiges grünes Projektergebnis und keine Python-Assetprüfung behauptet.
