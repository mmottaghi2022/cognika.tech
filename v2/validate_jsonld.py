"""Validate the AI-discoverability implementation."""
import json
import re

ROOT = "v2/changes/public_html/"
PAGES = ["index.html", "about/index.html", "projects/index.html",
         "e-os/index.html", "pat-ia/index.html", "srm-p/index.html",
         "contact/index.html"]

print("=== 1. PARSE ALL JSON-LD ===")
graphs, fail = {}, 0
for p in PAGES:
    src = open(ROOT + p, encoding="utf-8").read()
    for b in re.findall(r'<script type="application/ld\+json">(.*?)</script>', src, re.S):
        try:
            graphs[p] = json.loads(b)
        except Exception as e:
            print(f"  FAIL {p}: {e}")
            fail += 1
    if p in graphs:
        print(f"  OK   {p:22} nodes={len(graphs[p]['@graph'])}")
print(f"  parse failures: {fail}")

print("\n=== 2. DEFINITIONS vs REFERENCES ===")
defined, referenced = {}, {}
for p, g in graphs.items():
    for n in g["@graph"]:
        if "@id" in n and len(n) > 2:
            defined.setdefault(n["@id"], []).append(p)
        for v in n.values():
            for item in (v if isinstance(v, list) else [v]):
                if isinstance(item, dict) and set(item.keys()) == {"@id"}:
                    referenced.setdefault(item["@id"], set()).add(p)

for i in sorted(defined):
    print(f"  defined    {i:52} {defined[i]}")
unres = sorted(set(referenced) - set(defined))
print(f"  unresolved references: {unres if unres else 'NONE'}")

print("\n=== 3. Organization / WebSite: homepage only ===")
for t in ["https://cognika.tech/#organization", "https://cognika.tech/#website"]:
    where = defined.get(t, [])
    ok = where == ["index.html"]
    print(f"  {'OK  ' if ok else 'FAIL'} {t:46} defined_on={where} ref_by={len(referenced.get(t, []))} pages")

print("\n=== 4. BreadcrumbList vs visible HTML ===")
for p in PAGES[1:]:
    src = open(ROOT + p, encoding="utf-8").read()
    seg = src.split('class="breadcrumbs"')[1].split("</ol>")[0]
    visible = [re.sub(r"<[^>]+>", "", x).strip() for x in re.findall(r"<li[^>]*>.*?</li>", seg, re.S)]
    visible = [v for v in visible if v]
    bl = [n for n in graphs[p]["@graph"] if n.get("@type") == "BreadcrumbList"][0]
    marked = [i["name"] for i in bl["itemListElement"]]
    print(f"  {'OK  ' if visible == marked else 'FAIL'} {p:22} html={visible} jsonld={marked}")

print("\n=== 5. Forbidden types / invented fields ===")
BANNED = {"Product", "SoftwareApplication", "Offer", "AggregateRating",
          "Review", "FAQPage", "SearchAction"}
hits = []
for p, g in graphs.items():
    for n in g["@graph"]:
        ts = n.get("@type")
        for t in (ts if isinstance(ts, list) else [ts]):
            if t in BANNED:
                hits.append((p, t))
print(f"  banned types: {hits if hits else 'NONE'}")
print(f"  sameAs anywhere: {any('sameAs' in n for g in graphs.values() for n in g['@graph'])}")

print("\n=== 6. Page types ===")
for p in PAGES:
    ts = [n.get("@type") for n in graphs[p]["@graph"]
          if n.get("@type") not in ("Organization", "WebSite", "BreadcrumbList")]
    print(f"  {p:22} -> {ts}")
