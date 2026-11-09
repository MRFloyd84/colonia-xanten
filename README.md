# COLONIA XANTEN

Historische, spielerische Stadtsimulation um 150 n. Chr. für Android. Die historisch inspirierten Karten und Wirtschaftswerte sind **keine** maßstabsgetreue archäologische Rekonstruktion.

## Status

- Die Web-App v1.0 liegt in `www/index.html`.
- Capacitor 8 verpackt diese Web-App lokal als Android-App.
- GitHub Actions erstellt bei Änderungen auf `main` eine **Debug-APK** als Workflow-Artefakt.
- Ein getaggtes Release (z. B. `v1.0.1`) kann eine **signierte Release-APK** bauen, nachdem GitHub-Secrets für die Signatur eingerichtet wurden.
- Eine App-interne Updateprüfung ist **noch nicht** implementiert. GitHub installiert APKs nicht automatisch.

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
5. Die App benötigt zusätzlich eine **Update-Benachrichtigung** und einen **Spielstand-Export/Import**; beides ist noch ein offener Entwicklungsschritt.

**Privates Repository:** APK-Artefakte und GitHub Releases sind nur für berechtigte GitHub-Nutzer zugänglich. Eine Updateprüfung über die GitHub-API erfordert eine sichere Authentifizierung; kein privates GitHub-Token in die APK einbetten. Für unkomplizierte Updates später entweder Releases öffentlich ausliefern, eine separate öffentliche Update-Adresse anbieten oder den Play Store nutzen.

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

- `www/index.html`: vollständige Web-Simulation
- `package.json`: Capacitor-Abhängigkeiten
- `capacitor.config.json`: Android-App-ID
- `.github/workflows/android-check.yml`: Test-APK
- `.github/workflows/android-release.yml`: signierter Release-Build
- `scripts/`: Versionierung und sichere Signing-Konfiguration

## Noch zu prüfen

- GitHub Actions Status und Android-Build auf CI
- Bedienung und Performance auf echtem Android-Gerät
- Updateprüfung, Backup/Restore und Migrationsstrategie für bisherige HTML-Spielstände
- stabile Lockfile/Paketversionen und dauerhaft reproduzierbare Builds
