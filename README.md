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

## Updates

Dieses Repo ist privat. Deshalb liefert ein **separates öffentliches Repo** (Standard: `MRFloyd84/colonia-xanten-releases`) die Updates aus. Die App liest dort nur `update.json`, die Spieldateien und die APKs. Der Quellcode bleibt privat, und in der App steckt kein Token.

**So funktioniert es in der App**

- Beim Öffnen (und beim Zurückkehren in die App, höchstens stündlich) lädt `www/index.html` die Datei `update.json`.
- **Spiel-Update** (neue `game.html`): Die App lädt die Datei im Hintergrund, prüft sie per SHA-256 und speichert sie. Beim nächsten Start ist sie aktiv, oder sofort über „Jetzt neu starten“. Spielstände bleiben erhalten.
- Startet ein Update nicht sauber, fällt die App beim nächsten Start automatisch auf die zuletzt funktionierende Version zurück und lädt dieses Update nicht erneut.
- **App-Update** (neue APK): Die App zeigt einen Hinweis mit Download-Knopf. Android fragt einmal nach „Installieren“.
- Ohne Internet startet einfach die zuletzt geladene Version.
- Unter **Info › Version & Updates** stehen die Versionen, die letzte Prüfung und ein Knopf „Nach Updates suchen“.

**Einmalig einrichten**

1. Auf GitHub ein **öffentliches** Repo `colonia-xanten-releases` anlegen (gern mit README, muss aber nicht).
2. Einen **Fine-grained Token** erstellen: *Settings › Developer settings › Personal access tokens › Fine-grained tokens › Generate new token*
   - Repository access: *Only select repositories* › `colonia-xanten-releases`
   - Permissions › Repository permissions › **Contents: Read and write** (sonst nichts)
   - Ablaufdatum notieren und den Token rechtzeitig erneuern.
3. In **diesem** Repo unter *Settings › Secrets and variables › Actions* das Secret **`RELEASES_TOKEN`** mit dem Token anlegen.
4. Nur bei einem anderen Repo-Namen: unter *Variables* `RELEASES_REPO` = `BESITZER/REPO` setzen und `DEFAULT_UPDATE_URL` in `www/index.html` anpassen.
5. Eine APK mit Update-Funktion bauen (Tag `v1.0.1`, siehe oben) und **einmal von Hand installieren**. Ab dann laufen Updates über die App.

**Updates veröffentlichen**

- **Spiel-Update** (Änderungen an `www/game.html`): *Actions › Spiel-Update veröffentlichen › Run workflow*, Version (z. B. `1.0.2`) und optional eine kurze Notiz eintragen. Alternativ einen Tag pushen: `git tag web-v1.0.2 && git push origin web-v1.0.2`.
- **App-Update** (Änderungen an `www/index.html`, Capacitor, Plugins, Symbol): wie bisher einen Tag `v1.0.3` pushen. Der Release-Workflow lädt die APK zusätzlich ins öffentliche Repo und trägt sie in `update.json` ein.
- Spiel- und App-Updates teilen sich **eine** Versionsreihe, die immer steigen muss (1.0.1 → 1.0.2 → 1.0.3 …).
- Braucht ein Spiel-Update eine neue Fähigkeit der Hülle, in `www/index.html` `SHELL_API` erhöhen und in `game.html` das Meta-Tag `cx-min-shell` entsprechend setzen. Ältere Apps zeigen dann „braucht eine neuere App-Version“.

**Hinweise**

- Debug-APKs (Actions-Artefakte) zeigen ebenfalls App-Update-Hinweise. Eine Release-APK ist aber anders signiert und lässt sich nicht über eine Debug-APK installieren.
- Wer Schreibzugriff auf das öffentliche Update-Repo hat, bestimmt, welcher Spielcode in der App läuft. Den Token deshalb nur dort berechtigen und nirgends sonst verwenden.

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
- `.github/workflows/android-release.yml`: signierter Release-Build und Veröffentlichung im Update-Repo
- `.github/workflows/web-update.yml`: Spiel-Update ohne neue APK veröffentlichen
- `scripts/`: Versionierung, Signing-Konfiguration, `stamp_web_version.py` und `publish_update.py` für den Update-Kanal

## Noch zu prüfen

- GitHub Actions Status und Android-Build auf CI
- Bedienung und Performance auf echtem Android-Gerät
- Updateprüfung auf echtem Gerät, Backup/Restore und Migrationsstrategie für bisherige HTML-Spielstände
- stabile Lockfile/Paketversionen und dauerhaft reproduzierbare Builds
