# Pre-deployment validation — Phase 1

Status: **proposed, not applied, not deployed.** Branch `v2` only.

---

## 1. Existing `.htaccess` inventory (inspected, nothing overwritten)

A full search of the production tree found **exactly one** `.htaccess` file:

```
public_html/inc/.htaccess      <- the only existing one
```

| Location | Exists? | Content | Risk to new rules |
|---|---|---|---|
| `public_html/.htaccess` (root) | **absent** | - | **No conflict possible.** Phase 1 creates a new file. |
| `public_html/inc/.htaccess` | present | `Require all denied` (2.4) + `Order allow,deny` fallback | **None.** 4 levels below root, never modified. |
| `public_html/assets/.htaccess` | absent | - | None |
| `public_html/*/` (about, e-os, ...) | absent | - | None |

Live confirmation:
```
GET https://cognika.tech/.htaccess      -> 403  (server denies it)
GET https://cognika.tech/inc/.htaccess  -> 403  (server denies it)
```

**Conclusion: there is no pre-existing root configuration to conflict with,
weaken, or merge into.** Phase 1 is purely additive.

### PHP auth rules — untouched
`inc/.htaccess` is byte-identical to production (md5) and stays that way.
`inc/auth.php`, `login.php`, `dashboard.php`, `inc/config.example.php` are also
byte-identical. No authentication or security rule is modified.

---

## 2. Proposed Phase 1 `.htaccess`

File: `v2/changes/public_html/.htaccess` (new). Full contents and a
rule-by-rule explanation are in the chat response accompanying this document.

| # | Block | Purpose | Why it is safe |
|---|---|---|---|
| 1 | `www` -> apex 301 | One canonical hostname | Matches the apex already in every `<link rel="canonical">` |
| 2 | HTTP -> HTTPS 301 | Kills audit findings F3/F4 | **Tests both `%{HTTPS}` and `X-Forwarded-Proto`** so Cloudflare TLS termination cannot loop |
| 3 | Header hardening | `nosniff`, `Referrer-Policy`, `X-Frame-Options`, unset `X-Powered-By` | Adds headers only; PHP sets its own on auth pages and runs later |
| 4 | `Options -Indexes` | No directory listings | Proven by A/B test below |
| 5 | `DirectoryIndex` | `index.html` first | Explicit; matches current behaviour |
| 6 | Dotfile/backup deny | Blocks `.bak`, `.swp`, `~` etc. | `FilesMatch` scoped; `.htaccess` itself already denied |
| 7 | `php_flag display_errors off` | No path/value leakage | Wrapped in `<IfModule mod_php.c>`; logging stays on |

**Deliberately excluded: `Strict-Transport-Security`.** HSTS is Phase 4 and is
unsafe until every subdomain is HTTPS-only — `mail`, `cpanel`, `webmail` and
`py-test` all share this origin.

---

## 3. PHP compatibility — tested on **8.1.34**, not just 8.5

`php@8.1` was installed via Homebrew (local dev tool; no project change).

```
PHP 8.1.34 (cli)              <- matches production's stated 8.1.34
password_algos: 2y,argon2i,argon2id
```

### Syntax (`php -l`), all files, both versions

| File | PHP 8.1.34 | PHP 8.5.12 |
|---|---|---|
| `login.php` | no syntax errors | no syntax errors |
| `dashboard.php` | no syntax errors | no syntax errors |
| `inc/auth.php` | no syntax errors | no syntax errors |
| `inc/config.example.php` | no syntax errors | no syntax errors |

### Full auth flow on PHP 8.1.34

```
1. login.php renders                200, CSRF present, "COGNIKA - Sign In"
2. dashboard.php unauthenticated    -> login.php?timeout=1
3. wrong password                   stays on login (not authenticated)
4. correct password                 -> dashboard.php
5. dashboard.php with session       200, "COGNIKA - Console", user shown
6. raw PHP source leaked            0 responses
```

**6/6 pass on 8.1.34 — identical to 8.5.12.**

### Deprecation / removed-function scan
- Server log: **no** deprecation, warning, notice or fatal entries.
- `error_reporting=E_ALL` lint: clean.
- Scan for 8.x-removed functions (`strftime`, `utf8_encode/decode`,
  `create_function`, `money_format`, `mysql_*`, `each(`): **none used**
  (the only `each(` hit was the substring inside `foreach`).
- `?: never` return type is PHP **8.1+** — valid at the floor version.

**Conclusion: PHP 8.1 compatible. No code change required.**

---

## 4. `.htaccess` behaviour — validated on Apache 2.4.67

LiteSpeed is not installed locally, so rules were tested on a real Apache 2.4
instance (`AllowOverride All`, `mod_rewrite` + `mod_headers` + `mod_autoindex`),
which is the dialect LiteSpeed emulates.

| Test | Request | Expected | Actual | Result |
|---|---|---|---|---|
| www -> apex | `Host: www.cognika.tech`, HTTP | 301 -> `https://cognika.tech/` | `301 https://cognika.tech/` | PASS |
| HTTP -> HTTPS | `Host: cognika.tech`, `/about/` | 301 -> `https://.../about/` | `301 https://cognika.tech/about/` | PASS |
| **No loop behind Cloudflare** | `X-Forwarded-Proto: https`, `/` | **200, no redirect** | **200** | PASS **(critical)** |
| No loop, subpage | `X-Forwarded-Proto: https`, `/about/` | 200 | 200 | PASS |
| Security headers | same | 3 headers, no `X-Powered-By` | all present, `X-Powered-By` unset | PASS |
| Dotfile denied | `/.htaccess` | 403 | 403 | PASS |
| Auth include denied | `/inc/auth.php` | 403 | 403 | PASS |
| **Directory listing** | dir containing `x.txt` | contents hidden | hidden (A/B below) | PASS |
| All routes | 9 URLs | 200 | 9/9 200 | PASS |

### Directory-listing A/B proof
`Options -Indexes` returns **404** (not 403) on Apache 2.4 — correct behaviour.
The security property is that **contents are not exposed**:

```
Options +Indexes  -> x.txt visible : 1   (listing allowed)
Options -Indexes  -> x.txt visible : 0   (our rule blocks it)
```

---

## 5. LiteSpeed staging test plan

**Not yet executed.** Requires a staging vhost that does not exist today.
Local PHP built-in server and local Apache are **not** substitutes: PHP's server
ignores `.htaccess` entirely, and Apache is an emulation of LiteSpeed, not
LiteSpeed.

### 5.1 Prerequisites (owner action)
1. Create a staging subdomain, e.g. **`staging.cognika.tech`**, on the same
   cPanel account (`cognikat`) so it shares the real LiteSpeed + PHP 8.1 stack.
2. Upload `v2/changes/public_html/` to that webroot by FTP — **not** to the live
   `public_html`.
3. **Proxy `staging` through Cloudflare** (orange) so `X-Forwarded-Proto`
   behaves exactly as in production. Testing behind Cloudflare is the scenario
   that matters, because that is where the loop risk lives.
4. Set `~/cognika-config/config.php` for staging with a throwaway password.

### 5.2 Tests to run — in this order

**A. Loop / redirect safety (highest risk)**
```
curl -sSI  https://staging.cognika.tech/                    # expect 200, no Location
curl -sSI  https://staging.cognika.tech/about/              # expect 200
curl -sSIL http://staging.cognika.tech/                     # expect single 301 -> https
curl -sSIL https://staging.cognika.tech/about/              # expect 200, no redirect
curl -sSI  -H 'X-Forwarded-Proto: https' http://staging.cognika.tech/   # expect 200
```
Pass criteria: **no request exceeds one redirect**; no `ERR_TOO_MANY_REDIRECTS`.

**B. PHP auth on LiteSpeed + PHP 8.1**
```
curl -sSI https://staging.cognika.tech/login.php   # 200, X-Powered-By: PHP/8.1.x
# then the 6-step flow from v2/test_auth_local.py against staging
```
Pass: dashboard redirects when unauthenticated; correct password lands on
dashboard; wrong password does not; no PHP source in any body.

**C. `.htaccess` honoured by LiteSpeed**
```
curl -sS -o /dev/null -w '%{http_code}\n' https://staging.cognika.tech/inc/auth.php  # 403
curl -sS -o /dev/null -w '%{http_code}\n' https://staging.cognika.tech/.htaccess     # 403
# upload a test dir with one file, then:
curl -sS https://staging.cognika.tech/_t/ | grep -c 'filename'                       # expect 0
curl -sSI https://staging.cognika.tech/ | grep -i x-content-type                     # nosniff
```

**D. Static routing + MIME**
```
for p in / /about/ /projects/ /e-os/ /pat-ia/ /srm-p/ /contact/ \
         /robots.txt /sitemap.xml /assets/css/pages.css /assets/img/logo.png; do
  curl -sS -o /dev/null -w "$p %{http_code} %{content_type}\n" https://staging.cognika.tech$p
done
```
Pass: all 200 with correct content types.

**E. Visual parity**
Screenshot desktop (1440x900) and mobile (390x844) of all 7 pages on staging and
compare against the local captures. Pass: no layout regression.

**F. Regression on sibling hostnames**
The root `.htaccess` must not affect mail or cPanel hostnames:
```
curl -sSI https://mail.cognika.tech/     | head -3   # must NOT redirect to apex
curl -sSI https://webmail.cognika.tech/  | head -3   # must NOT redirect to apex
```
These are grey/unproxied and share the origin, so this test is essential.

### 5.3 Rollback
Delete `public_html/.htaccess` over FTP. Behaviour reverts instantly to today's.
No other file needs touching.

---

## 6. Conflicts found

| # | Conflict / risk | Severity | Detail | Resolution |
|---|---|---|---|---|
| **C1** | **Cloudflare TLS termination vs `%{HTTPS}`** | CRITICAL | Origin sees HTTP with `X-Forwarded-Proto: https`. A rewrite on `%{HTTPS}` alone causes an **infinite redirect loop**. | Rule 2 tests both signals. **Proven: 200, not 301.** |
| **C2** | HSTS would break sibling subdomains | HIGH | `mail`, `cpanel`, `webmail`, `py-test` share this origin and are not all HTTPS-only. | HSTS **deliberately omitted**. Deferred to Phase 4. |
| **C3** | `inc/.htaccess` uses Apache 2.4 syntax | none | cPanel/CloudLinux runs 2.4; `Require all denied` is correct. `Order allow,deny` fallback is dead code but harmless. | **Leave as is.** Not touched. |
| **C4** | `Options -Indexes` may be disallowed by host `AllowOverride` | MEDIUM | Some cPanel profiles restrict `Options`. If so the directive is silently ignored, not fatal. | Verify on staging test C. Fallback: `IndexIgnore *`. |
| **C5** | `php_flag` requires mod_php | MEDIUM | LiteSpeed may not honour `php_flag` in `.htaccess` (often needs `.user.ini`). | Wrapped in `<IfModule mod_php.c>` so it is inert if unsupported. Verify on staging. |
| **C6** | Root `.htaccess` may also reach `py-test` | MEDIUM | `py-test.cognika.tech` currently has an **unproxied, publicly listable docroot**. If it shares this document root, the rules apply there too. | Confirm the `py-test` docroot path on the server before upload. Separately, `py-test` should be proxied or removed. |
| **C7** | `X-Frame-Options: SAMEORIGIN` vs `DENY` on auth pages | none | Public pages get `SAMEORIGIN`; `inc/auth.php` already sends `DENY` and runs later. | No action. |
| **C8** | No `mod_rewrite` guarantee | MEDIUM | If `mod_rewrite` were unavailable, canonicalisation silently does nothing. | `<IfModule mod_rewrite.c>` makes it inert rather than fatal. LiteSpeed supports rewrite by default. |

---

## 7. Summary

| Item | Status |
|---|---|
| Existing `.htaccess` inspected | one file, `inc/` only; root has none |
| Auth/security rules weakened | **No** — all byte-identical (md5) |
| Phase 1 file proposed | `v2/changes/public_html/.htaccess`, not applied to production |
| Redirect loop risk | Tested and eliminated |
| PHP 8.1.34 compatibility | Syntax + full auth flow pass (6/6) |
| `.htaccess` logic validated | Apache 2.4.67, incl. A/B listing proof |
| LiteSpeed tested | **No** — plan written, needs staging vhost |
| Merged / deployed / DNS / firewall | **None** |


