"""
Agent-comprehension test: extract ONLY what a non-JS crawler/agent can see from
each page's HTML (no JS execution), then check whether the essential facts are
recoverable.

This mirrors what an LLM-based crawler would ingest after fetch + parse.
"""
import glob
import html
import json
import re

ROOT = "v2/changes/public_html/"

def visible_text(path):
    t = open(path, encoding="utf-8").read()
    body = t.split("<body", 1)[1]
    body = re.sub(r"<script.*?</script>|<style.*?</style>", "", body, flags=re.S | re.I)
    body = re.sub(r"<nav.*?</nav>", "", body, flags=re.S | re.I)
    body = re.sub(r"<footer.*?</footer>", "", body, flags=re.S | re.I)
    body = re.sub(r"<dialog.*?</dialog>", "", body, flags=re.S | re.I)
    txt = html.unescape(re.sub(r"<[^>]+>", " ", body))
    return re.sub(r"\s+", " ", txt).strip()

def jsonld(path):
    t = open(path, encoding="utf-8").read()
    out = []
    for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', t, re.S):
        try:
            out.append(json.loads(m.group(1)))
        except Exception as e:
            out.append({"__invalid__": str(e)})
    return out

PAGES = ["index.html", "about/index.html", "projects/index.html",
         "e-os/index.html", "pat-ia/index.html", "srm-p/index.html",
         "contact/index.html"]

print("=== 1. PER-PAGE: text an agent sees, and JSON-LD types present ===")
for p in PAGES:
    txt = visible_text(ROOT + p)
    types = []
    for d in jsonld(ROOT + p):
        if isinstance(d, dict) and "@type" in d:
            types.append(d["@type"])
    print(f"  {p:22} words={len(txt.split()):>4}  jsonld={types or 'NONE'}")

print("\n=== 2. CAN AN AGENT ANSWER THESE FROM HTML ALONE? ===")

# Build the corpus an agent would have
corpus = {p: visible_text(ROOT + p) for p in PAGES}
alltext = " ".join(corpus.values()).lower()
alljson = [d for p in PAGES for d in jsonld(ROOT + p)]

questions = [
    ("What is Cognika?", ["cognika"], None),
    ("What is the company's core idea?", ["cognition", "cognitive"], None),
    ("How many projects are there?", ["e_os", "pat_ia", "srm_p"], None),
    ("What is e_os?", ["elevator", "dispatch"], None),
    ("What is pat_ia?", ["enterprise resource planning", "erp"], None),
    ("What is Srm_p?", ["reluctance", "motor"], None),
    ("Is e_os deployed or simulated?", ["simulation"], None),
    ("Is pat_ia a concept or shipped?", ["concept"], None),
    ("Is Srm_p measured or simulated?", ["design and simulation", "simulation"], None),
    ("How do I contact Cognika?", ["info@cognika.tech"], None),
]

for q, needles, _ in questions:
    found = [n for n in needles if n in alltext]
    ok = len(found) == len(needles)
    print(f"  {'YES' if ok else 'PARTIAL/NO':12} {q:42} found={found}")

print("\n=== 3. Are project pages typed as anything machine-readable? ===")
for p in ["e-os/index.html", "pat-ia/index.html", "srm-p/index.html", "projects/index.html"]:
    types = []
    for d in jsonld(ROOT + p):
        for node in d.get("@graph", [d]):
            t = node.get("@type")
            if t:
                types.append(t)
    print(f"  {p:22} -> {types}")

print("\n=== 4. Is there any llms.txt? ===")
import os
print("  llms.txt exists:", os.path.exists(ROOT + "llms.txt"))
