# Audit findings — cognika.tech

Evidence collected 2026-10-30 against `https://cognika.tech` (apex, Cloudflare-proxied)
and the repository at `ba6a77d`. Read-only inspection; no changes made.

Method note: TLS 1.3 handshakes from this workstation fail against the edge, so
HTTPS probes were pinned with `--tlsv1.2 --tls-max 1.2`. This is a local client
limitation (LibreSSL 3.3.6), not a site defect — browsers negotiated TLS 1.2 fine.

| ID | Finding | Evidence | Severity | Status |
|---|---|---|---|---|
| F1 | Only **1 crawlable `<a href>`** (`#home`); all six nav items are `<button>` | `grep -oE '<a [^>]*href' index.html` → 1 | Critical | **Blocked** — needs IA decision |
| F2 | `sitemap.xml` → **404**; `robots.txt` has **0 directives** (1248 B of comments only) | `curl /sitemap.xml` = 404; `grep -cE '^\s*(User-agent\|Allow\|Disallow\|Sitemap)'` = 0 | High | Ready |
| F3 | **HTTP serves 200**, identical payload to HTTPS (no upgrade) | `md5` of `http://` and `https://` both `40adbb708d6b7080a4a39e74e5fe5d99` | High | Ready |
| F4 | Four host/scheme variants all 200, no canonical redirect; `COGNIKA.TECH` also 200 | `code=200 redirect=""` for all | Medium | Ready |
| F5 | **No HSTS** header | `grep -i strict-transport` → no match | Medium | Ready (after F3) |
| F6 | JSON-LD `Organization` valid but **no `sameAs`** | parsed: `['@context','@type','description','logo','name','slogan','url']` | Low | Ready — needs profile URLs |
| F7 | `robots.txt` declares **no content signals**, only commentary | content-signals preamble present, 0 signal lines | Low | **Intentional** — leave; no AI-training grants |
| F8 | Headings: 1×h1, 2×h2, 0×h3–h6; the h1 text is **mutated by JS** | `grep` heading counts | Low | Ready |
| F9 | Project bodies exist **only in JS state**; `<dialog>` is a static placeholder | `index.html` L164–171 | Medium | **Blocked** — content decision |
| F10 | `logo.png` **151,949 B** at 1700×300 RGBA; no WebP/AVIF/srcset | `file`, `ls -la` | Medium | Ready |

## Verified as correct (no action)

- Canonical tag absolute and self-referencing: `https://cognika.tech/`
- Full Open Graph + Twitter Card set, including `og:image:alt`
- `og:image` reachable: `back_ground.webp` 200, 43,740 B, TTFB 0.53 s
- **Zero mixed content** (`http://` refs: 0)
- Brotli active: HTML 11,527 → 3,352 B; CSS 32,829 → 9,139 B; JS 25,311 → 7,602 B
- Edge cert valid: `CN=cognika.tech`, Let's Encrypt, expires 2027-01-28
- `alt-svc: h3=":443"` — HTTP/3 offered
- All 5 `<img>` have `alt`; 3 correctly `alt=""` decorative
- Landmarks: header/main/nav/footer/section×2/aside/dialog
- No zoom-blocking; `prefers-reduced-motion` and `focus-visible` present
- `/login.php` 200 + `noindex, nofollow`; `/dashboard.php` 303; `/inc/*` 403
- 404 handling correct; crawler UAs (Googlebot, Bingbot, OAI-SearchBot, GPTBot) all get 200

## Test tally

27 tests: **19 pass · 6 fail · 2 partial**.

Not tested (stated as limitation, not as pass): Core Web Vitals field data,
rendered-DOM accessibility, Search Console indexing status, static-asset
cache HIT ratio, AI-crawler behaviour against provider documentation.

## Unresolved exposures (separate from site code)

| Item | Detail |
|---|---|
| `py-test.cognika.tech` | Grey/unproxied → exposes origin `5.9.176.204`; **directory listing enabled** (`Index of /`, only `php.ini`); no Python app serving (`/health` returns LiteSpeed's 796-byte 404, identical to a random path) |
| Subdomains | `cpanel`, `webmail`, `ftp`, `autodiscover` all resolve to `5.9.176.204` (grey, intentional but discoverable) |
| Origin exposure | 80/443 not yet restricted to Cloudflare ranges — requires approval |
