# COLONIA XANTEN

Historische, spielerische Stadtsimulation um 150 n. Chr. für Android. Die historisch inspirierten Karten und Wirtschaftswerte sind **keine** maßstabsgetreue archäologische Rekonstruktion.

## Status

- Das Spiel liegt in `www/game.html`, die Start-Hülle mit Update-Funktion in `www/index.html`.
- Capacitor 8 verpackt diese Web-App lokal als Android-App.
- GitHub Actions erstellt bei Änderungen auf `main` eine **Debug-APK** als Workflow-Artefakt.
- Ein getaggtes Release (z. B. `v1.0.1`) kann eine **signierte Release-APK** bauen, nachdem GitHub-Secrets für die Signatur eingerichtet wurden.
- Die App prüft beim Öffnen auf Updates: **Spiel-Updates** werden automatisch geladen, für **neue APKs** erscheint ein Download-Hinweis (Android verlangt eine Bestätigung). Siehe [Updates](#updates).

## Erste Debug-APK

Öffne **Actions > Android Test-APK**. Wähle den letzten erfolgreichen Run oder löse **Run workflow** aus. Unter **Artifacts** befindet sich `COLONIA-XANTEN-Debug-APK` (ZIP mit APK). Zum Installieren muss Android die Installation aus der verwendeten Quelle erlauben.

Debug-APKs sind nur zum Testen geeignet. Die endgültige Release-APK braucht einen dauerhaften privaten Signierschlüssel. Eine später anders signierte Release-APK kann die Debug-APK nicht als reguläres Update ersetzen: Vorher bitte Spielstände sichern.

## Dauerhafte Releases vorbereiten

1. Erzeuge **lokal** einen Keystore, z. B. mit dem Android-SDK-`keytool`. Sichere Keystore, Alias und Passwörter separat und dauerhaft. **Niemals in GitHub committen oder in Chats verschicken.**
2. Setze unter **Settings > Secrets and variables > Actions > New repository secret**:
   - `SIGNING_KEYSTORE_BASE64`: Base64-kodierter Inhalt der privaten Keystore-Datei (ohne Zeilenumbrüche)
   - `SIGNING_STORE_PASSWORD`: Keystore-Passwort
   - `SIGNING_KEY_ALIAS`: Alias
   - `SIGNING_KEY_PASSWORD`: Passwort für den Schlüssel
3. Erstelle einen neuen Tag wie `v1.0.1` (nicht `v1.0`, da dieser initiale Stand als v1.0 geführt wird). Der Workflow erstellt die signierte APK und einen GitHub Release.
4. Verwende für **alle** kommenden Releases denselben Keystore und höhere `versionCode`-Werte.
5. Offen ist noch ein **Spielstand-Export/Import**.

## Updates über dasselbe öffentliche Repository

Dieses Repository ist **öffentlich**. App und Spiel laden die Versionsdatei direkt von
`https://raw.githubusercontent.com/MRFloyd84/colonia-xanten/main/update.json`.
Die veröffentlichten Spielversionen liegen unter `web/game-X.Y.Z.html`. Signierte APK-Dateien liegen unter **GitHub Releases**.
**Kein separates Repository, kein privates Zugriffs-Token in der App und kein `RELEASES_TOKEN` nötig.**

**Was passiert beim Öffnen?**

- Die App liest `update.json`. Ein neueres Spiel wird heruntergeladen, per SHA-256 geprüft und beim nächsten Start aktiviert (optional sofort über „Jetzt neu starten“).
- Bei einer neueren signierten APK erhält der Nutzer einen Download-Link. Die Installation erfordert Android-Bestätigung.
- Offline wird die mitgelieferte oder zuletzt gespeicherte Version geladen.
- Unter **Info → Version & Updates** können Versionen und der Status kontrolliert werden.
- Der Updatekanal wird nur durch GitHub Actions mit dem zeitlich begrenzten `GITHUB_TOKEN` beschrieben.

**Wichtig für bestehende Installationen:** Die vorherige Debug-APK hatte die alte Updateadresse `colonia-xanten-releases` fest im App-Startcode. **Einmalig muss eine neue APK mit dieser Änderung installiert werden.** Ein Web-Update allein kann die Adresse in der bestehenden APK nicht austauschen. Der bisherige Debug-Schlüssel ist außerdem möglicherweise nicht mit späteren Builds identisch.

### Spielversion ohne neue APK veröffentlichen

Nach dem Mergen der Updatefunktion nach `main`:

1. Im Code die Änderungen an `www/game.html` nach `main` committen.
2. Unter **Actions → Spiel-Update veröffentlichen → Run workflow** die neue Versionsnummer eingeben (z. B. `1.0.2`), oder einen Tag `web-v1.0.2` auf dem gewünschten Commit erstellen.
3. Der Workflow versioniert die Spieldatei, schreibt `web/game-1.0.2.html` und aktualisiert `update.json` auf `main`.
4. Bei der nächsten Updateprüfung lädt die App die neue Version.

Spielversionen müssen streng steigen; veröffentlichte Versionen werden nicht überschrieben. GitHub Actions benötigt die Berechtigung **Contents: write**. Bei aktivem Branch-Schutz muss der Workflow Schreibzugriff auf `main` besitzen.

### Signierte Android-Release-APK

Zum Erstellen von dauerhaft installierbaren Updates müssen die vier GitHub-Actions-Secrets eingerichtet sein:
`SIGNING_KEYSTORE_BASE64`, `SIGNING_STORE_PASSWORD`, `SIGNING_KEY_ALIAS`, `SIGNING_KEY_PASSWORD`.
Den **privaten Keystore nur lokal erzeugen**, sicher aufbewahren und nie in Git oder einen Chat senden.
Alle künftigen Release-APKs müssen mit demselben Keystore signiert werden und einen steigenden Android-`versionCode` haben.

Einen `vX.Y.Z`-Tag auf dem gewünschten `main`-Commit erstellen. Der Release-Workflow kompiliert und signiert die APK, veröffentlicht sie unter **Releases**, aktualisiert das Update-Manifest und legt die veröffentlichte Spielversion in `web/` ab.

**Noch nicht freigegeben:** Die Release-Signierschlüssel fehlen, und der Update-Ablauf wurde bislang nicht Ende-zu-Ende auf dem Smartphone getestet. Ein Spielstand-Export/Import ist ebenfalls noch erforderlich, bevor eine Debug-App deinstalliert wird.

**Sicherheit:** GitHub veröffentlicht ausführbaren Web-Spielcode. SHA-256 erkennt beschädigte Downloads, ist aber keine eigenständige Herausgeber-Signatur. Schreibzugriffe auf `main`, GitHub Actions und Releases absichern. Der veröffentlichte Spielcode ist öffentlich einsehbar.

## Lokal bauen

Voraussetzungen: Node.js 22+, Java 21 und Android SDK.

```bash
npm install
npx cap add android
npx cap sync android
cd android
./gradlew assembleDebug
```

APK: `android/app/build/outputs/apk/debug/app-debug.apk`.

## Projektstruktur

- `www/game.html`: vollständige Web-Simulation (Spiel)
- `www/index.html`: Start-Hülle – lädt das Spiel, prüft und installiert Spiel-Updates, meldet neue APKs
- `package.json`: Capacitor-Abhängigkeiten
- `capacitor.config.json`: Android-App-ID
- `.github/workflows/android-check.yml`: Test-APK
- `.github/workflows/android-release.yml`: signierter Release-Build und Veröffentlichung im selben Repository
- `.github/workflows/web-update.yml`: Spiel-Update ohne neue APK auf `main` veröffentlichen
- `scripts/`: Versionierung, Signing-Konfiguration und Veröffentlichung des Updatekanals

## Noch zu prüfen

- GitHub Actions Status und Android-Build auf CI
- Bedienung und Performance auf echtem Android-Gerät
- Updateprüfung auf echtem Gerät, Backup/Restore und Migrationsstrategie für bisherige HTML-Spielstände
- stabile Lockfile/Paketversionen und dauerhaft reproduzierbare Builds
