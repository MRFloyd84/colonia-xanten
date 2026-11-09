from pathlib import Path
import os, re

p = Path("android/app/build.gradle")
s = p.read_text(encoding="utf-8")
version = os.environ["APP_VERSION"].removeprefix("v")
if not re.fullmatch(r"\d+\.\d+\.\d+", version):
    raise SystemExit(f"Ungültige Version: {version}")
code = int(os.environ["BUILD_CODE"])
if code < 1:
    raise SystemExit("BUILD_CODE muss positiv sein")
s, n = re.subn(r"\bversionCode\s+\d+", f"versionCode {code}", s, count=1)
if n != 1:
    raise SystemExit("versionCode fehlt")
s, n = re.subn(r'\bversionName\s+"[^"]+"', f'versionName "{version}"', s, count=1)
if n != 1:
    raise SystemExit("versionName fehlt")
p.write_text(s, encoding="utf-8")
