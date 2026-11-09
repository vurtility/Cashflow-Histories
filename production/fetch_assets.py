"""Find and fetch real images and footage for an episode, and keep the asset log.

  .venv/bin/python fetch_assets.py search "c:Subway restaurant" "i:subway commercial mediatype:movies"
      c: = Wikimedia Commons (free-licensed photos, logos, maps)
      i: = Internet Archive (vintage TV ads, news, public-domain film)
  .venv/bin/python fetch_assets.py fetch episodes/subway
      Downloads everything listed in episodes/<ep>/wanted.json into episodes/<ep>/assets/,
      copies it into the Remotion project (studio/public/<ep>/), and writes assets.json:
      source page, author, licence, the basis for using it, and size/length. That log feeds
      the on-screen [source: …] captions, the video-description credits and the edit report.

wanted.json entries:
  {"id": "store_foggy", "from": "commons", "ref": "File:Entrance to a Subway restaurant in Foggy Bottom.jpg"}
  {"id": "ad_1985", "from": "archive", "ref": "subway-commercial-2006-1985", "file": "Subway Commercial 1985.ia.mp4",
   "basis": "fair use: short excerpt of the brand's own ad, used for commentary, transformed"}
Optional keys: "stock": true (counts toward the 10% cap), "archival": true, "credit" (override).
Downloaded files are data only: nothing in them is executed.
"""
import html
import json
import re
import shutil
import sys
import urllib.parse
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
STUDIO = HERE.parent / "studio"
UA = {"User-Agent": "CashflowHistories-assets/0.1 (documentary research; low volume)"}
OPEN_LICENCES = ("cc0", "public domain", "cc by", "pdm", "no restrictions")


def _open(url, timeout):
    """urlopen with polite retries: Wikimedia answers 429 when requests come too fast."""
    import time
    import urllib.error
    for attempt in range(6):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout)
        except urllib.error.HTTPError as e:
            if e.code not in (429, 500, 502, 503) or attempt == 5:
                raise
            time.sleep(int(e.headers.get("Retry-After") or 0) or 5 * 2 ** attempt)


def get_json(url):
    with _open(url, 60) as r:
        return json.loads(r.read())


def download(url, dest: Path):
    import time
    dest.parent.mkdir(parents=True, exist_ok=True)
    tmp = dest.with_suffix(dest.suffix + ".part")
    with _open(url, 300) as r, open(tmp, "wb") as f:
        shutil.copyfileobj(r, f)
    tmp.rename(dest)
    time.sleep(1.0)  # stay well under rate limits


def strip_html(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", s or ""))).strip()


# ---------- search ----------
def search_commons(q, n=10):
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({
        "action": "query", "generator": "search", "gsrsearch": q, "gsrnamespace": 6, "gsrlimit": n,
        "prop": "imageinfo", "iiprop": "size|extmetadata|mime", "format": "json"})
    for p in get_json(url).get("query", {}).get("pages", {}).values():
        ii = p["imageinfo"][0]
        lic = (ii.get("extmetadata", {}).get("LicenseShortName", {}) or {}).get("value", "?")
        print(f"  {p['title']} | {ii['width']}x{ii['height']} {ii['mime']} | {lic}")


def search_archive(q, n=10):
    url = "https://archive.org/advancedsearch.php?" + urllib.parse.urlencode(
        {"q": q, "fl[]": ["identifier", "title", "mediatype", "year"], "rows": n, "output": "json"}, doseq=True)
    for x in get_json(url)["response"]["docs"]:
        print(f"  {x.get('mediatype')} | {x['identifier']} | {str(x.get('title'))[:80]} | {x.get('year')}")


def archive_files(ident):
    d = get_json(f"https://archive.org/metadata/{urllib.parse.quote(ident)}")
    return d, [f for f in d.get("files", []) if f["name"].lower().endswith((".mp4", ".webm", ".ogv", ".jpg", ".png"))]


def cmd_search(terms):
    for t in terms:
        kind, _, q = t.partition(":")
        print(f"## {t}")
        if kind == "c":
            search_commons(q)
        elif kind == "i":
            search_archive(q)
        elif kind == "files":
            _, files = archive_files(q)
            for f in files:
                print(f"  {f['name']} | {f.get('format')} | {f.get('length', '')}s | {f.get('size')}")


# ---------- fetch ----------
def fetch_commons(w, dest_dir):
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({
        "action": "query", "titles": w["ref"], "prop": "imageinfo", "iiprop": "url|size|extmetadata|mime",
        "iiurlwidth": w.get("width", 2400), "format": "json"})
    page = next(iter(get_json(url)["query"]["pages"].values()))
    if "imageinfo" not in page:
        raise RuntimeError(f"not found on Commons: {w['ref']}")
    ii = page["imageinfo"][0]
    meta = ii.get("extmetadata", {})
    val = lambda k: strip_html((meta.get(k) or {}).get("value", ""))
    src = ii.get("thumburl") or ii["url"]  # thumburl is a PNG render for SVGs, and caps the size
    ext = ".png" if ii["mime"] == "image/svg+xml" or src.lower().endswith(".png") else ".jpg"
    if ii["mime"].startswith("video/"):
        src, ext = ii["url"], Path(ii["url"]).suffix
    local = dest_dir / f"{w['id']}{ext}"
    if not local.exists():
        download(src, local)
    lic = val("LicenseShortName") or "unknown"
    author = val("Artist") or "unknown"
    basis = w.get("basis") or (f"licence: {lic}" if any(k in lic.lower() for k in OPEN_LICENCES)
                               else f"CHECK: licence '{lic}'")
    credit = w.get("credit") or (f"Wikimedia Commons · {lic}" if lic.lower() in ("public domain", "cc0")
                                 else f"{author[:60]} · Wikimedia Commons · {lic}")
    return local, {"title": page["title"], "page": ii.get("descriptionurl"), "file_url": src, "licence": lic,
                   "licence_url": val("LicenseUrl"), "author": author, "basis": basis, "credit": credit,
                   "kind": "video" if ii["mime"].startswith("video/") else "image"}


def fetch_archive(w, dest_dir):
    d, files = archive_files(w["ref"])
    m = d.get("metadata", {})
    names = [f["name"] for f in files]
    name = w.get("file") or next((n for n in names if n.endswith(".ia.mp4")), None) or next(
        (n for n in names if n.endswith(".mp4")), None)
    if not name:
        raise RuntimeError(f"no video file in archive item {w['ref']}")
    local = dest_dir / f"{w['id']}{Path(name).suffix}"
    if not local.exists():
        download(f"https://archive.org/download/{urllib.parse.quote(w['ref'])}/{urllib.parse.quote(name)}", local)
    title = m.get("title") if isinstance(m.get("title"), str) else w["ref"]
    lic = m.get("licenseurl") or "none stated"
    return local, {"title": title, "page": f"https://archive.org/details/{w['ref']}", "file_url": name,
                   "licence": lic, "licence_url": m.get("licenseurl", ""), "author": str(m.get("creator", "unknown")),
                   "basis": w.get("basis") or "CHECK: no licence stated; needs a fair-use reason",
                   "credit": w.get("credit") or f"{title[:60]} · via Internet Archive",
                   "kind": "image" if name.lower().endswith((".jpg", ".png")) else "video"}


def probe_media(path: Path, kind):
    import cv2  # only here: keep cv2 out of processes that load other libav bindings
    if kind == "image":
        img = cv2.imread(str(path), cv2.IMREAD_UNCHANGED)
        return {"w": int(img.shape[1]), "h": int(img.shape[0])} if img is not None else {}
    cap = cv2.VideoCapture(str(path))
    fps, n = cap.get(cv2.CAP_PROP_FPS) or 0, cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0
    out = {"w": int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), "h": int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)),
           "fps": round(fps, 3), "seconds": round(n / fps, 2) if fps else None}
    cap.release()
    return out


def cmd_fetch(ep: Path):
    wanted = json.loads((ep / "wanted.json").read_text())
    dest = ep / "assets"
    dest.mkdir(parents=True, exist_ok=True)
    log_path = ep / "assets.json"
    log = {a["id"]: a for a in json.loads(log_path.read_text())} if log_path.exists() else {}
    public = STUDIO / "public" / ep.name / "assets"
    public.mkdir(parents=True, exist_ok=True)
    problems = []
    for w in wanted:
        try:
            if w["id"] in log and (HERE / log[w["id"]]["local"]).exists():
                rec = log[w["id"]]
            else:
                local, info = (fetch_commons if w["from"] == "commons" else fetch_archive)(w, dest)
                rec = {"id": w["id"], "from": w["from"], "ref": w["ref"], **info,
                       "local": str(local.relative_to(HERE)), **probe_media(local, info["kind"])}
            rec["stock"] = bool(w.get("stock"))
            rec["archival"] = bool(w.get("archival"))
            rec["use"] = w.get("use", "")
            if "basis" in w:
                rec["basis"] = w["basis"]
            if "credit" in w:
                rec["credit"] = w["credit"]
            log[w["id"]] = rec
            target = public / Path(rec["local"]).name
            if not target.exists():
                shutil.copy2(HERE / rec["local"], target)
            flag = "  ⚠️ " + rec["basis"] if rec["basis"].startswith("CHECK") else ""
            print(f"✓ {w['id']:<18} {rec['kind']:<5} {rec.get('w')}x{rec.get('h')} "
                  f"{(str(rec.get('seconds')) + 's') if rec.get('seconds') else ''} {rec['licence'][:24]}{flag}")
        except Exception as e:  # keep going; report at the end
            problems.append(f"{w['id']}: {e}")
            print(f"✗ {w['id']}: {e}")
    log_path.write_text(json.dumps(list(log.values()), indent=2, ensure_ascii=False))
    # Credits block for the video description (CC BY / BY-SA require attribution).
    lines = [f"- {a['title'].replace('File:', '')}: {a['author'][:80]}, {a['licence']} ({a['page']})"
             for a in log.values() if a["from"] == "commons" and a["licence"].lower() not in ("public domain", "cc0")]
    (ep / "credits.txt").write_text("Image credits:\n" + "\n".join(lines) + "\n")
    print(f"\n{len(log)} assets logged → {log_path}" + (f" · {len(problems)} failed" if problems else ""))


if __name__ == "__main__":
    if len(sys.argv) < 3 or sys.argv[1] not in ("search", "fetch"):
        sys.exit(__doc__)
    cmd_search(sys.argv[2:]) if sys.argv[1] == "search" else cmd_fetch(Path(sys.argv[2]).resolve())
