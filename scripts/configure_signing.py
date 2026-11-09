from pathlib import Path
import os

for key in ["SIGNING_STORE_PASSWORD", "SIGNING_KEY_ALIAS", "SIGNING_KEY_PASSWORD", "KEYSTORE_PATH"]:
    if not os.getenv(key):
        raise SystemExit(f"GitHub-Secret fehlt: {key}")
p = Path("android/app/build.gradle")
s = p.read_text(encoding="utf-8")
if "signingConfigs {" in s:
    raise SystemExit("Signaturkonfiguration existiert bereits")
block = """    signingConfigs {
        release {
            storeFile file(System.getenv("KEYSTORE_PATH"))
            storePassword System.getenv("SIGNING_STORE_PASSWORD")
            keyAlias System.getenv("SIGNING_KEY_ALIAS")
            keyPassword System.getenv("SIGNING_KEY_PASSWORD")
        }
    }
"""
if "android {" not in s:
    raise SystemExit("Android-Konfiguration fehlt")
s = s.replace("android {", "android {\n" + block, 1)
needle = "buildTypes {\n        release {"
if needle not in s:
    raise SystemExit("Release-Konfiguration fehlt")
s = s.replace(needle, needle + "\n            signingConfig signingConfigs.release", 1)
p.write_text(s, encoding="utf-8")
