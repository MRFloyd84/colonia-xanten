# COLONIA XANTEN 2.0 | Architektur und Migrationsplan

**Stand:** Prototyp auf `feature/stadt-2-prototype`. Die bestehende Karte auf `main` bleibt unverändert.

## Ausgangspunkt (aus dem bestehenden Repository)
- `www/index.html`: Capacitor/WebView-Update-Shell mit Validierung und Rückfall auf die installierte Spielversion.
- `www/game.html`: Spiel, Rendering, DOM-Trefferflächen, Ressourcen, Handel, Chronik, Gebäudeaktionen und Editor in einer Datei.
- `www/assets/*.webp.b64`: Bildatlanten für Gebäude, Hafen, Straßen und Bevölkerung, in die veröffentlichten HTML-Dateien eingebettet.
- `scripts/publish_update.py`: Offline-Einbettung und SHA-256-Prüfsumme, Veröffentlichung in `web/` und `update.json`.
- `localStorage`: Spielstand, Update-Shell-Daten und grafische Objektanordnung. Vorhandene Schlüssel und Spielzustände nicht ändern.

## Referenzbild
Künstlerisch verdichtete, feste schräge Stadtansicht mit warmer römischer Steinarchitektur, zusammenhängendem Pflaster, Stadtmauer im Norden, Hafen am Rhein, belebten Straßen und wiedererkennbaren Monumentalbauten. **Keine pixelgenaue 1:1-Kopie als interaktive Szene zugesichert:** Einzelobjekte benötigen getrennte Tiefe, Hitflächen und Animation; die Vorlage ist keine archäologische Rekonstruktion.

## Architekturentscheidung
**2,5D mit fester Kameraperspektive statt frei drehbarer 3D-Kamera.**
Ein neues, vom bisherigen Kartenrenderer getrenntes Stadtbild wird in logisch festen Szenenkoordinaten aufgebaut. Darstellung besteht aus:

1. **Terrain (statisch / Offscreen-Cache):** Himmel/Hinterland, Erdflächen, gepflasterte Plätze/Straßen, Rhein und Ufer.
2. **Statische Architektur (mehrere Objekte mit Footpoint):** Mauern, Tor, Monumente, Wohnblöcke, Hafenkräne und Kaiobjekte; gemeinsamer Maßstab, einheitlicher Blickwinkel.
3. **Bewegliche Objekte:** Fußgänger, Karren und Schiffe mit festen begehbaren Routen; Sortierung nach Fußpunkt-Y.
4. **Atmosphäre:** Wasserbewegung und Jahreszeit-/Lichtfilter (sparsam für Android).
5. **UI und Interaktion:** Die bereits vorhandenen Gebäudemenüs sind unverändert; das neue Bild nutzt eigene koordinatengerechte Gebäude-Hitflächen.

Die Szene bewegt sich bei Bedarf per Pan/Zoom, aber der Kamerawinkel bleibt unverändert. Neue Häuser werden nicht mehr mittels des alten Grundstückraster-Renderers gezeichnet.

## Migration
1. Branch statt Austausch von `main` erstellen.
2. Alternativen Umschalter **Stadt 1.0 / Stadt 2.0** in `www/game.html` anbieten. Alte Karte ist zu jedem Zeitpunkt erreichbar.
3. Bestehende Atlas-Ladefunktionen (`buildingSprites`, `romanAtlas`) und JS-Spielmechanik wiederverwenden; **keine Änderung** an `state`, `save()`, `storageKey`, Update-Shell und native Android-Abhängigkeiten.
4. Neues Koordinatensystem `CITY2_W/H` und Screen-Mapping inklusive Pan/Zoom und Touchzielermittlung nur für die Alternative nutzen.
5. Sichtbare Hauptgebäude über feste Anker ausrichten und über ihre bestehenden IDs öffnen.
6. Animierte Bewohner auf festen begehbaren Korridoren mit begrenzter Anzahl pro Frame darstellen; Schiffe ausschließlich auf dem Wasser.
7. Erst nach Syntax-, Hitbox-, Speicherstands- und Android-Tests gezielt zusammenführen.

## Assets: wiederverwendbar
| Asset | Verwendungszweck | Einschränkung |
|---|---|---|
| `forum.webp.b64`, `thermen.webp.b64`, `amphitheater.webp.b64` | Hauptgebäude | Unterschiedliche Perspektive/Proportionen, müssen optisch angeglichen werden |
| `atlas-buildings.webp.b64` | Wohnhäuser, Lager, Tempel, Tor | Ausschnitt, feste Perspektive und Größenunterschiede |
| `atlas-harbor.webp.b64` | Hafenobjekte, Kräne, Schiffe | Ein Teil der Atlaskacheln enthält zusammengesetzte Objekte |
| `atlas-people.webp.b64`, `citizens.webp.b64` | Bevölkerungsvielfalt und Gehzyklus | Nicht jede Rolle besitzt echte Animationsframes |
| `paving.webp.b64` | Straßen-/Platzbelag | Nahtübergänge und Maßstab müssen geprüft werden |

## Neu benötigte Grafiken für Produktion
- Orthogonal zueinander passende isometrische Straßenbeläge, Kanten, Kurven und Treppen.
- Gebäudesprites mit identischer Kameraperspektive, definiertem Fußpunkt und optionalem separatem Schatten.
- Baugruppen für Stadtmauer, Zinnen, Ecktürme, Nordtor und Zugänge.
- Hafen: realistische Wasserkante, Kai-Endstücke, Anlegeplätze, Segler mit Wasserlinien- und Segelvarianten.
- Personen: 4 oder 8 Laufrichtungen pro Rolle, Laufen/Arbeiten/Stehen, explizite Framegröße.
- Jahreszeiten-/Nacht-Materialien, Feldkulturen, Bäume, Rauch und Brunnen.

## Kritische Kriterien
- Kein Rendern von Bürgern durch Häuser, Wasser oder Mauern; Fußpunkt-Sortierung beachten.
- Hotspots bleiben bei Pan/Zoom und Android-Touch präzise, Stadt-1.0-Hotspots bleiben unverändert.
- Keine Veränderung bestehender Spielstände durch Aktivieren oder Zurückwechseln.
- 30 FPS ist ein Ziel, **kein verifiziertes Ergebnis** ohne Testgerät; Renderkosten begrenzen und mobil messen.
- Farb-/Perspektiv-Unterschiede der bestehenden KI-Assets offen benennen, nicht als perfekte Rekonstruktion ausgeben.
- Keine automatische Veröffentlichung des unfertigen Prototyps nach `main`.

## Testprotokoll vor Freigabe
- [ ] JavaScript vollständig syntaktisch gültig
- [ ] Stadt 1.0 weiter erreichbar und Gebäude bedienbar
- [ ] Stadt 2.0 bei leerem und vollem lokaler Speicher startbar
- [ ] Touch: alle Gebäude-IDs, Pan, Pinch, Zurückstellen
- [ ] Weder Spielfiguren noch Schiffe durch unpassierbare Bereiche
- [ ] Kein versehentliches Öffnen von Gebäude-Dashboards während Pan-Geste
- [ ] Keine neuen Speicherdaten im eigentlichen Spielstand
- [ ] Android: Portrait/Querformat, Performance und Bildqualität
- [ ] Update-Shell-Offlineverhalten nach Veröffentlichung

**Freigabe:** Nach visuellem Vergleich mit dem Referenzbild und bestätigtem Android-Test.
