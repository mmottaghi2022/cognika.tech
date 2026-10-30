# Cognika v2 — implementation plan

Nothing below is applied. Each step lists acceptance criteria and rollback.

## Phase 0 — Lock down exposures (not a code change)

| # | Action | Owner | Acceptance |
|---|---|---|---|
| 0.1 | Cloudflare → DNS → `py-test` set to **Proxied (orange)**, or delete the record | you (dashboard) | `dig +short py-test.cognika.tech @1.1.1.1` returns Cloudflare IPs |
| 0.2 | Add `Options -Indexes` to the py-test vhost, after checking the existing `/.htaccess` (currently returns 403) | you | `curl -o /dev/null -w '%{http_code}' https://py-test.cognika.tech/` → `403`, not `200` |
| 0.3 | Report the four cPanel Python app settings from the UI (app root, app URL, startup file, passenger log) | you | values recorded in `README.md` |

Rationale: `py-test` currently publishes the origin IP and lists its docroot.
This is independent of v2 and should not wait for it.

## Phase 1 — Server-level canonicalisation (F3, F4)

Add `public_html/.htaccess`:

1. Force `https://` on all requests.
2. Redirect `www.*` → apex, preserving path and query.
3. **Do not** add HSTS in this step.

Acceptance:
```
curl -o /dev/null -w '%{http_code} %{redirect_url}\n' http://cognika.tech
  → 301 https://cognika.tech/
curl -o /dev/null -w '%{http_code} %{redirect_url}\n' https://www.cognika.tech/e_os/
  → 301 https://cognika.tech/e_os/
curl -o /dev/null -w '%{http_code} %{redirect_url}\n' https://cognika.tech/
  → 200   (no loop)
```
Must be verified on the **real LiteSpeed host** before declaring done. A
redirect loop here would take the site down, so test `http` and `https`,
apex and `www`, with and without a path.

Rollback: delete `.htaccess`. Site reverts to current behaviour immediately.

## Phase 2 — Crawl entry points (F2)

Add `public_html/robots.txt` with real directives and a `Sitemap:` line.
Add `public_html/sitemap.xml`.

Acceptance:
```
curl -sS https://cognika.tech/robots.txt | grep -E '^(User-agent|Sitemap)'
curl -sS -o /dev/null -w '%{http_code}\n' https://cognika.tech/sitemap.xml   → 200
```
Sitemap must contain only URLs that return 200 and are not `noindex`
(so **not** `/login.php`, which carries `noindex, nofollow`).

Open question: the current `robots.txt` is Cloudflare's content-signals
commentary block served from the origin. Replacing it means the content-signal
text disappears. If you want to keep those signals, they must be carried into
the new file as real `Content-Signal:` lines — a policy decision, not a
technical one. Default in this plan: **do not declare AI-training permission.**

Rollback: delete both files; `robots.txt` reverts to the current 404/commentary
state and `sitemap.xml` returns 404 as it does today.

## Phase 3 — Metadata and markup (F6, F8, F10)

- F6: add `sameAs` to the `Organization` JSON-LD — **only** for profiles you
  confirm are authoritative. No invented social URLs.
- F8: add a static `<h1>` that is correct without JavaScript; leave the JS
  mutation as progressive enhancement rather than the only source of the heading.
- F10: convert `logo.png` to WebP with a PNG fallback via `<picture>`/`srcset`.
  Target: transfer size well under 151,949 B.

Acceptance: JSON-LD parses with `sameAs`; heading counts show ≥1 static `h1`;
logo total transfer smaller than today; visual output unchanged at 1440 px and
375 px widths.

Rollback: `git revert` the commit and re-upload the previous files.

## Phase 4 — HSTS (F5)

**Only after Phase 1 has been verified in production for a sustained period.**
Add:
```
Header always set Strict-Transport-Security "max-age=31536000"
```
Start without `includeSubDomains` and without `preload`. Both are one-way
doors and must not be enabled until every subdomain is HTTPS-only —
`py-test` is currently plain-HTTP-reachable when unproxied.

## Blocked — needs a product decision, not code

**F1 / F9.** The site has one crawlable link and no sub-pages, because there
are no sub-pages. No amount of markup fixes that. The decision required:

1. Should `/e-os/`, `/pa-ia/`, `/srm-p/`, `/contact/` exist as real pages?
2. If yes, what is the approved wording for each — given `references/site-profile.md`
   labels every project claim as *"supplied by the owner, verify before publication"*.

Converting the orbit `<button>`s to `<a href>` without real destination pages
would produce six links to nothing, which is worse than the current state.
**No work starts on F1/F9 until you answer 1 and 2.**

## Sequencing

```
Phase 0  (exposures)      independent, do now
Phase 1  (redirects)      low risk, high value      → verify on LiteSpeed
Phase 2  (robots/sitemap)  no risk                   → ships with 1
Phase 3  (meta/media)     low risk                   → needs sameAs URLs
Phase 4  (HSTS)           after 1 is proven
F1/F9                     blocked on product decision
```

## Approval gates

Writing files into `v2/changes/` — no approval needed, it is repo-only.
Copying anything to `public_html/` over FTP — **explicit approval required.**
Touching PHP auth, DNS, email, or firewall — **out of scope for v2.**
