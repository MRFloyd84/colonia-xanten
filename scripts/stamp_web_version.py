"""Schreibt die Spielversion in www/game.html (Meta-Tag und Fenstertitel).

Aufruf: python3 scripts/stamp_web_version.py 1.0.2
"""
from pathlib import Path
import re
import sys

if len(sys.argv) != 2:
    raise SystemExit("Aufruf: stamp_web_version.py <version>")
version = sys.argv[1].removeprefix("web-v").removeprefix("v")
if not re.fullmatch(r"\d+\.\d+\.\d+", version):
    raise SystemExit(f"Ungültige Version: {version}")

p = Path("www/game.html")
s = p.read_text(encoding="utf-8")
s, n = re.subn(r'(<meta\s+name="cx-web-version"\s+content=")[^"]*(")', rf"\g<1>{version}\g<2>", s, count=1)
if n != 1:
    raise SystemExit("Meta-Tag cx-web-version fehlt in www/game.html")
s = re.sub(r"(<title>[^<]*?)·\s*v[\d.]+(</title>)", rf"\g<1>· v{version}\g<2>", s, count=1)
p.write_text(s, encoding="utf-8")
print(f"Spielversion {version} gesetzt")
