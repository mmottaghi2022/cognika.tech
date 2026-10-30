"""Review robots.txt: parse groups and print effective policy per known bot."""
import re

path = "v2/changes/public_html/robots.txt"
txt = open(path, encoding="utf-8").read()

# Strip comments
lines = [l.split("#")[0].strip() for l in txt.splitlines()]
lines = [l for l in lines if l]

groups, cur, sitemaps = {}, None, []
for l in lines:
    k, _, v = l.partition(":")
    k, v = k.strip().lower(), v.strip()
    if k == "user-agent":
        cur = v
        groups.setdefault(cur, {"allow": [], "disallow": []})
    elif k == "allow" and cur:
        groups[cur]["allow"].append(v)
    elif k == "disallow" and cur:
        groups[cur]["disallow"].append(v)
    elif k == "sitemap":
        sitemaps.append(v)

print("=== PARSED GROUPS ===")
for ua, rules in groups.items():
    a = ",".join(rules["allow"]) or "-"
    d = ",".join(rules["disallow"]) or "-"
    print(f"  {ua:20} Allow[{a}]  Disallow[{d}]")
print(f"  Sitemap: {sitemaps}")

print("\n=== EFFECTIVE POLICY PER BOT ===")
TRAINING = ["GPTBot", "Google-Extended", "ClaudeBot", "CCBot"]
SEARCH = ["OAI-SearchBot", "Claude-SearchBot", "PerplexityBot", "Googlebot", "Bingbot"]

def verdict(ua):
    r = groups.get(ua, groups.get("*"))
    if "/" in r["disallow"]:
        return "BLOCKED"
    return "ALLOWED"

ok = True
print("  -- training (expect BLOCKED) --")
for b in TRAINING:
    v = verdict(b)
    ok &= (v == "BLOCKED")
    print(f"    {'OK  ' if v=='BLOCKED' else 'FAIL'} {b:18} {v}")
print("  -- search (expect ALLOWED, private paths still denied) --")
for b in SEARCH:
    v = verdict(b)
    r = groups.get(b, groups.get("*"))
    priv = all(p in r["disallow"] for p in ["/login.php", "/dashboard.php", "/inc/"])
    ok &= (v == "ALLOWED" and priv)
    print(f"    {'OK  ' if v=='ALLOWED' and priv else 'FAIL'} {b:18} {v:8} private_excluded={priv}")

print(f"\nRESULT: {'PASS' if ok else 'FAIL'}")
print(f"Sitemap line present: {'https://cognika.tech/sitemap.xml' in sitemaps}")
