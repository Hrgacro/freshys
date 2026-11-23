"""Freshy's web build: FreshysSite.tsx (live) -> static site with every asset served from /fu/ (no Framer at runtime)."""
import json, os, re, sys, hashlib, subprocess, concurrent.futures as cf, urllib.request
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = sys.argv[1]            # merged FreshysSite.tsx
CAT = sys.argv[2]            # catalogue json (cat-v3)
OUT = sys.argv[3]            # site dir
FU = "https://framerusercontent.com/"
s = open(SRC, encoding="utf-8").read()
old = 'IMG_BASE + r.img + "?scale-down-to=" + w'
assert s.count(old) == 1
s = s.replace(old, 'IMG_BASE + (w <= 256 ? 256 : w <= 512 ? 512 : 1024) + "/" + r.img')
# assets referenced in code
need = set()
consts = {"IMG": "images/", "IMGS": "images/", "IMG_BASE": "images/", "ASSETS": "assets/"}
for c, d in consts.items():
    for m in re.finditer(r'\b' + c + r'\s*\+\s*"([^"?]+)', s):
        need.add(d + m.group(1))
for m in re.finditer(r'face\("[^"]+",\s*"([^"]+)"', s):
    need.add("assets/" + m.group(1))
for m in re.finditer(re.escape(FU) + r'((?:images|assets)/[A-Za-z0-9_.-]+\.[a-z0-9]+)', s):
    need.add(m.group(1))
s = s.replace(FU, "/fu/")
assert FU not in s
open(os.path.join(HERE, "web/FreshysSite.web.tsx"), "w", encoding="utf-8").write(s)
cat = json.load(open(CAT, encoding="utf-8"))
jobs = [(FU + p, os.path.join(OUT, "fu", p)) for p in sorted(need)]
for it in cat:
    for w in (256, 512, 1024):
        jobs.append((FU + "images/" + it["img"] + "?scale-down-to=" + str(w), os.path.join(OUT, "fu/images", str(w), it["img"])))
def get(j):
    url, path = j
    if os.path.exists(path) and os.path.getsize(path) > 0: return 0
    os.makedirs(os.path.dirname(path), exist_ok=True)
    for t in range(4):
        try:
            with urllib.request.urlopen(url, timeout=60) as r: b = r.read()
            open(path, "wb").write(b); return len(b)
        except Exception as e:
            err = e
    raise RuntimeError(url + " " + str(err))
with cf.ThreadPoolExecutor(12) as ex: n = sum(ex.map(get, jobs))
print("assets:", len(jobs), "downloaded bytes:", n)
# the catalogue file the code fetches must be the cat-v3 we built against
cu = re.search(r'CAT_URL = "/fu/(assets/[^"]+)"', s).group(1)
assert hashlib.md5(open(os.path.join(OUT, "fu", cu), "rb").read()).hexdigest() == hashlib.md5(open(CAT, "rb").read()).hexdigest()
# bundle
for f in os.listdir(os.path.join(OUT, "assets")) if os.path.isdir(os.path.join(OUT, "assets")) else []:
    if f.startswith("app."): os.remove(os.path.join(OUT, "assets", f))
tmp = os.path.join(OUT, "assets", "app.js")
subprocess.run([os.path.join(HERE, "node_modules/.bin/esbuild"), os.path.join(HERE, "entry.jsx"), "--bundle", "--minify", "--outfile=" + tmp,
    "--alias:framer=" + os.path.join(HERE, "stub/framer.js"), "--define:process.env.NODE_ENV=\"production\"", "--log-level=warning", "--legal-comments=none"], check=True)
h = hashlib.sha1(open(tmp, "rb").read()).hexdigest()[:10]
os.rename(tmp, os.path.join(OUT, "assets", "app." + h + ".js"))
html = open(os.path.join(HERE, "index.template.html"), encoding="utf-8").read().replace("{{APP}}", "/assets/app." + h + ".js")
open(os.path.join(OUT, "index.html"), "w", encoding="utf-8").write(html)
print("bundle:", "app." + h + ".js", os.path.getsize(os.path.join(OUT, "assets", "app." + h + ".js")))
