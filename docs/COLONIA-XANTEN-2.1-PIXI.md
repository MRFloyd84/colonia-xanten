# COLONIA XANTEN 2.1 | PixiJS-Migration

## Grundentscheidung
Wir setzen die Grafik von COLONIA XANTEN schrittweise auf **PixiJS 8 / WebGL** um. Die bisherige HTML5-Canvas-Simulation mit Wirtschaft, Handel, Chronik, Spielständen und ihren etablierten Touchflächen bleibt während der Entwicklungsphase unverändert.

## Aufbau des ersten Prototyps
- `src/pixi21.js`: modularer, eigenständiger PixiJS-Renderer für feststehenden Kamerawinkel
- `npm run build:pixi21`: per esbuild offline bündeln (`www/pixi21.bundle.js`)
- `www/game.html`: zusätzlicher Button **P** für den Test; Altansicht jederzeit wiederherstellbar
- Pixi-Vorschau: Rhein und Kai, Straßen- und Marktflächen, Mauersegmente, Forum, Thermen, Amphitheater, Häuser, Wachen/Passanten und Schiffe
- bestehe Spielobjekte: Wiederverwendung der vorhandenen HTML-/Atlasbilddaten statt Änderung der Wirtschaftsdaten
- `scripts/publish_update.py`: Beim späteren OTA-Release den Bundled-Code direkt in die veröffentlichte HTML-Datei einbetten; ohne zusätzliche Online-Abhängigkeit
- `tests/pixi21-smoke.mjs`: Syntax- und Verkabelungsprüfung vor Android-Build

## Technische Grenzen
Die Referenzvorlage ist grafisch wesentlich dichter und realistischer als die bisherigen Atlanten. Der neue Renderer **löst dieses Asset-Problem nicht automatisch**. Für die endgültige Umsetzung brauchen wir einheitliche Gebäudesprites, Pflaster- und Mauermodule, korrekte Schatten und einen echten Hafen-Hintergrund.

## Abnahmekriterien vor der Freigabe
- [ ] GitHub Android-Testbuild erfolgreich
- [ ] Testgeräte: WebGL-Start, Umschalten, Sichtbarkeit UI
- [ ] Wischen und Pinch-Zoom ohne doppelte Eingabe
- [ ] Forum, Thermen, Arena, Hafen per Touch erreichbar
- [ ] Rückkehr zur alten Karte, Spielstände unverändert
- [ ] Offline-Bundle ohne Internet nutzbar
- [ ] Grundszene erreicht annähernd den Stil des gelieferten Referenzbildes

**WICHTIG:** Dieser Branch wird NICHT automatisch nach `main` gemergt. Ein funktionierender Build allein belegt keine überzeugende Grafikqualität oder Android-Touchfunktion.
