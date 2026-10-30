"""Validate JSON-LD on the LIVE production pages already downloaded to /tmp/live."""
import json
import re

PAGES = ["home", "about", "projects", "e-os", "pat-ia", "srm-p", "contact"]
defs, refs, fails = {}, {}, 0

print("=== LIVE JSON-LD: parse + types + @id resolution ===")
for n in PAGES:
    src = open(f"/tmp/live/{n}.html", encoding="utf-8").read()
    blocks = re.findall(r'<script type="application/ld\+json">(.*?)</script>', src, re.S)
    if not blocks:
        print(f"  FAIL {n}: no JSON-LD")
        fails += 1
        continue
    try:
        g = json.loads(blocks[0])
    except Exception as e:
        print(f"  FAIL {n}: {e}")
        fails += 1
        continue
    types = [x.get("@type") for x in g["@graph"]]
    print(f"  OK   {n:10} {types}")
    for node in g["@graph"]:
        if "@id" in node and len(node) > 2:
            defs.setdefault(node["@id"], []).append(n)
        for v in node.values():
            for it in (v if isinstance(v, list) else [v]):
                if isinstance(it, dict) and set(it) == {"@id"}:
                    refs.setdefault(it["@id"], set()).add(n)

unres = sorted(set(refs) - set(defs))
print()
print(f"  parse failures:      {fails}")
print(f"  unresolved @id refs: {unres if unres else 'NONE'}")
print(f"  Organization on:     {defs.get('https://cognika.tech/#organization')}")
print(f"  WebSite on:          {defs.get('https://cognika.tech/#website')}")

print()
print("=== LIVE CANONICALS ===")
for n in PAGES:
    src = open(f"/tmp/live/{n}.html", encoding="utf-8").read()
    m = re.search(r'<link rel="canonical" href="([^"]+)"', src)
    print(f"  {n:10} {m.group(1) if m else 'MISSING'}")
