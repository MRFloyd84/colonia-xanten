"""Aktualisiert den öffentlichen Update-Kanal im selben Repository (ausgechecktes main-Worktree).

Legt web/game-<version>.html ab und schreibt update.json, das die App beim Start abruft.
Optional wird zusätzlich der APK-Eintrag gesetzt.

Beispiele:
  python3 scripts/publish_update.py --channel ../channel --repo OWNER/REPO \
      --version 1.0.2 --game www/game.html --notes "Neue Gebäude"
  python3 scripts/publish_update.py ... --apk-version 1.0.3 --apk-code 12 \
      --apk-url https://github.com/OWNER/REPO/releases/download/v1.0.3/COLONIA-XANTEN-1.0.3.apk
"""
from __future__ import annotations

import argparse
import base64
import datetime as dt
import hashlib
import json
import re
from pathlib import Path

KEEP_WEB_FILES = 5
VERSION_RE = re.compile(r"\d+\.\d+\.\d+")


def vkey(v: str) -> tuple[int, ...]:
    return tuple(int(x) for x in v.split("."))


def meta(html: str, name: str, default: str) -> str:
    m = re.search(rf'<meta\s+name="{name}"\s+content="([^"]*)"', html)
    return m.group(1) if m else default


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--channel", required=True, type=Path)
    ap.add_argument("--repo", required=True, help="OWNER/REPO des öffentlichen Update-Repos")
    ap.add_argument("--version", required=True)
    ap.add_argument("--game", required=True, type=Path)
    ap.add_argument("--notes", default="")
    ap.add_argument("--branch", default="main")
    ap.add_argument("--apk-version")
    ap.add_argument("--apk-code", type=int)
    ap.add_argument("--apk-url")
    a = ap.parse_args()

    if not VERSION_RE.fullmatch(a.version):
        raise SystemExit(f"Ungültige Version: {a.version}")
    if not re.fullmatch(r"[\w.-]+/[\w.-]+", a.repo):
        raise SystemExit(f"Ungültiger Repo-Name: {a.repo}")

    raw = a.game.read_bytes()
    if raw.startswith(b"\xef\xbb\xbf"):
        raw = raw[3:]  # ohne BOM, damit die Prüfsumme in der App übereinstimmt
    html = raw.decode("utf-8")
    # Die App laedt komplette HTML-Updates und speichert sie offline. Externe
    # Asset-URLs wuerden nach dem Neustart ohne Netz nicht funktionieren.
    # Darum werden die optimierten transparenten WebP-Gebaeude direkt in das
    # veroeffentlichte HTML eingebettet, noch bevor dessen SHA-256 berechnet wird.
    sprite_files = {
        "forum": "forum.webp.b64",
        "thermen": "thermen.webp.b64",
        "amphitheater": "amphitheater.webp.b64",
        "citizens": "citizens.webp.b64",
        "paving": "paving.webp.b64",
    }
    for key, filename in sprite_files.items():
        placeholder = "__CX_SPRITE_" + key.upper() + "__"
        if placeholder not in html:
            raise SystemExit(f"Spiel hat keinen Asset-Platzhalter: {placeholder}")
        asset = (a.game.parent / "assets" / filename).read_text(encoding="ascii").strip()
        try:
            base64.b64decode(asset, validate=True)
        except ValueError as e:
            raise SystemExit(f"Ungueltige WebP-Base64-Datei {filename}: {e}") from e
        html = html.replace(placeholder, "data:image/webp;base64," + asset)
    raw = html.encode("utf-8")
    if meta(html, "cx-web-version", "") != a.version:
        raise SystemExit("Die Version in game.html passt nicht. Zuerst stamp_web_version.py ausführen.")
    min_shell = int(meta(html, "cx-min-shell", "1"))

    manifest_path = a.channel / "update.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else {}
    old_web = manifest.get("web") or {}
    has_apk = bool(a.apk_version or a.apk_code or a.apk_url)
    skip_web = False
    if old_web.get("version") and vkey(old_web["version"]) >= vkey(a.version):
        if not has_apk:
            raise SystemExit(f"Spielversion {old_web['version']} ist bereits veröffentlicht. Bitte eine höhere Version verwenden.")
        # APK-Release mit älterem Spielstand: Spiel-Eintrag bleibt, nur die APK wird eingetragen.
        print(f"Hinweis: Spielversion {old_web['version']} ist bereits gleich/neuer – nur APK wird eingetragen.")
        skip_web = True

    now = dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat()
    if not skip_web:
        publish_web(a, raw, min_shell, manifest, now)
    if has_apk:
        if not (a.apk_version and a.apk_code and a.apk_url):
            raise SystemExit("Für den APK-Eintrag braucht es --apk-version, --apk-code und --apk-url")
        if not VERSION_RE.fullmatch(a.apk_version):
            raise SystemExit(f"Ungültige APK-Version: {a.apk_version}")
        previous_apk = manifest.get("apk") or {}
        if previous_apk.get("versionCode") and a.apk_code <= int(previous_apk["versionCode"]):
            raise SystemExit(f"APK versionCode {a.apk_code} muss höher sein als {previous_apk['versionCode']}")
        manifest["apk"] = {
            "version": a.apk_version,
            "versionCode": a.apk_code,
            "url": a.apk_url,
            "notes": a.notes.strip()[:200],
            "published": now,
        }
    manifest["schema"] = 1
    manifest["updated"] = now
    write_channel(a.channel, manifest)


def publish_web(a, raw: bytes, min_shell: int, manifest: dict, now: str) -> None:
    web_dir = a.channel / "web"
    web_dir.mkdir(parents=True, exist_ok=True)
    name = f"game-{a.version}.html"
    (web_dir / name).write_bytes(raw)

    # Ältere Spieldateien aufräumen, die letzten KEEP_WEB_FILES bleiben erhalten.
    files = sorted(
        (f for f in web_dir.glob("game-*.html") if VERSION_RE.fullmatch(f.stem[5:])),
        key=lambda f: vkey(f.stem[5:]),
    )
    for f in files[:-KEEP_WEB_FILES]:
        f.unlink()

    manifest["web"] = {
        "version": a.version,
        "url": f"https://raw.githubusercontent.com/{a.repo}/{a.branch}/web/{name}",
        "sha256": hashlib.sha256(raw).hexdigest(),
        "minShell": min_shell,
        "notes": a.notes.strip()[:200],
        "published": now,
    }


def write_channel(channel: Path, manifest: dict) -> None:
    manifest_path = channel / "update.json"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    readme = channel / "README.md"
    if not readme.exists():
        readme.write_text(
            "# COLONIA XANTEN · Updates\n\n"
            "Öffentlicher Update-Kanal der COLONIA-XANTEN-App. `update.json` wird von der App beim Start abgerufen; "
            "`web/` enthält die Spieldateien, die APKs liegen unter Releases.\n\n"
            "Dieses Repo wird automatisch befüllt – bitte nicht von Hand ändern.\n",
            encoding="utf-8",
        )
    print(json.dumps(manifest, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
