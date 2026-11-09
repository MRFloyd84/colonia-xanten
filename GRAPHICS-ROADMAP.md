# COLONIA XANTEN: Grafik-Renovierung (historisch-realistisch)

Status: **in Planung / schrittweise Umsetzung**. Bestehende spielbare Version nicht durch eine ungetestete Gesamtkarten-Grafik ersetzen.

## Festgelegter Stil
- Basis: römische Provinzstadt Colonia Ulpia Traiana, Rheinregion um 150 n. Chr.
- Isometrische 3/4-Sicht, fixe Kamerarichtung und Beleuchtung von links oben.
- Naturgetreue Materialien: Kalkstein, römische Ziegel, Holz, Putz, Kies, Pflaster, Wasser.
- Assetformat: freigestelltes WebP mit Alphakanal; transparente PNG-Master separat erhalten.
- Keine eingebrannten Beschriftungen oder Bedienelemente in Gebäude-Sprites.
- Einheitliche Perspektive; Gebäudegrößen orientieren sich an vorhandenen Defs und müssen sich auf Mobilgeräten lesen lassen.
- Archäologische Genauigkeit wird je Gebäudetyp geprüft; KI-Konzeptbilder sind keine gesicherten Rekonstruktionen.

## Bauabschnitte
1. **Bereits umgesetzt (v1.0.4):** Forum, Große Thermen, Amphitheater mit WebP-Bilddaten und Canvas-Fallback.
2. **Als Nächstes:** Getreidespeicher, Handwerkerviertel, Nordtor, Hafen, Hafentempel, Wohnviertel, Wasseranlagen, Herberge. Pro Objekt eigenes Bild, nicht eine fertige Stadtansicht.
3. **Stadtblöcke:** 3–5 kompatible Varianten für Insulae, Domus, Werkstätten und Höfe; anschließende prozedurale Platzierung.
4. **Gelände-Tiles:** Pflasterstraße (gerade, Kreuzung, Ecke), Sandweg, Markt, Hof, Gras, Acker, Flussufer, Kai; Übergänge ohne harte rechteckige Kanten.
5. **Stadtmauer/Türme/Tore:** Segmente, Ecken und Torsprites, mit korrekter Perspektive; Schattierung von Stadt und Umgebung angleichen.
6. **Umwelt und Animation:** Bäume in Jahreszeiten, Wiesen, Wassertexturen, Schiffe, Bürger, Fuhrwerke, Rauch; Performance-Optimierung und sichtbare Zoomstufen.
7. **UI:** Icons, Ressourcenleisten und Gebäudepanels, einheitliches Material und ausreichende Lesbarkeit auf kleinen Android-Geräten.

## Technik und Akzeptanzkriterien
- Das vorhandene `defs`-Koordinatensystem und die bestätigte Touch-Erkennung bleiben stabil.
- Interaktive Gebäude bleiben **einzeln auswählbar**; kein statisches Stadtfoto als Klickoberfläche.
- Assets werden beim Web-Release zusammen mit `www/game.html` offlinefähig eingebettet oder sicher versioniert/zwischengespeichert.
- Die Zeichenfunktionen behalten bis zum visuellen Abnahmetest einen Fallback.
- Neue Assets erscheinen nur nach erfolgreicher Syntax-/Buildprüfung und funktionierendem Update-Manifests.
- Android-Prüfung: Touch, Pinch-Zoom, Schwenken, 24-FPS-Ziel, Offline-Betrieb, Spielstand-Erhalt, Gebäudeaktionen.
- Ein neuer Bauabschnitt darf die bestehenden funktionierenden Gebäude nicht verdecken oder die Touch-Hitboxes verschieben.

## Offen
Die vollständige isometrische Umgestaltung ist eine mehrstufige Aufgabe. Die bisher generierten Gesamtansichten sind Stilreferenzen, keine editierbaren Spielkarten.