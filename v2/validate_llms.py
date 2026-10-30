"""Verify llms.txt: every URL it lists exists in the tree, no invented pages."""
import os
import re

ROOT = "v2/changes/public_html/"
txt = open(ROOT + "llms.txt", encoding="utf-8").read()

urls = sorted(set(re.findall(r"https://cognika\.tech(/[^)\s]*)", txt)))
print("=== URLS IN llms.txt ===")
ok = True
for u in urls:
    if u in ("", "/"):
        path = ROOT + "index.html"
    else:
        path = ROOT + u.strip("/") + "/index.html"
    exists = os.path.exists(path)
    ok &= exists
    print(f"  {'OK  ' if exists else 'FAIL'} https://cognika.tech{u:14} -> {path}")

print(f"\n  all URLs resolve: {ok}")
print(f"  URL count: {len(urls)}")

print("\n=== NEGATIVE CHECKS ===")
for bad in ["login", "dashboard", "/inc/", "info@", "tel:", "linkedin",
            "twitter", "x.com", "github", "instagram"]:
    present = bad.lower() in txt.lower()
    print(f"  {'LEAK' if present else 'absent':8} {bad}")

print("\n=== Status statements present? ===")
flat = re.sub(r"\s+", " ", txt)
for phrase in ["tested in simulation",
               "Not deployed in operational buildings",
               "project concept",
               "Not a completed or commercially available product",
               "design targets and simulated results, not measured hardware performance",
               "synchronous reluctance positioning motor"]:
    print(f"  {'OK  ' if phrase in flat else 'MISSING'} {phrase}")
