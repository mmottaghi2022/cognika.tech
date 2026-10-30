# Cognika v2 — working directory

Status: **PLANNING. Nothing here is deployed.**

Cognika v2 is a staged rework of the public site. It **preserves the current
architecture** and does not migrate frameworks.

## Hosting constraint (verified, not assumed)

Recorded on 2026-10-30 by inspecting the live host and this repository.

| Layer | Verified value | Evidence |
|---|---|---|
| CDN / proxy | Cloudflare (`fiona`/`shane.ns.cloudflare.com`) | `dig NS cognika.tech` |
| Web server | **LiteSpeed Web Server** | `Proudly Served by LiteSpeed` on py-test |
| Platform | cPanel / CloudLinux, account `cognikat` | `tools/*.sh` (`uapi --user=cognikat`) |
| Webroot | **`/home/cognikat/public_html`** | `AUTH-README.md` L83 |
| Public site | **Static HTML/CSS/JS** — `index.html` | 173 visible words without JS |
| Auth | **PHP 8.1** — `login.php`, `dashboard.php`, `inc/auth.php` | live `set-cookie: cognika_sid=…` |
| Deploy | **FTP** (`deploy` account) → webroot | `tools/repoint-deploy-ftp.sh` |
| Python | cPanel "Python App" slot at `py-test.cognika.tech` | currently **not serving** (autoindex only) |

### Consequences

- The public site needs **no application runtime**. It is static files.
- The PHP auth layer **stays PHP**. It is working (Argon2id, CSRF, throttling)
  and is out of scope for v2.
- Server-level behaviour (redirects, headers) is done with **`.htaccess`**,
  which LiteSpeed honours.
- **Do not** introduce PHP dependencies for the public site.
- **Do not** migrate to Flask/Django/WSGI for the public site.
- Python backend work is a **separate project** at `py-test.cognika.tech`.

## Scope of v2

In scope: audit findings F2, F3, F4, F5, F6, F8, F10 (see
`audit-findings.md`), plus structural work pending the F1/F9 decision.

Out of scope without explicit approval: PHP auth, deployment configuration,
DNS records, firewall rules, framework migration.

## Layout

```
v2/
├── README.md              this file
├── audit-findings.md      F1–F10 with evidence, severity, effort
├── plan.md                sequenced implementation plan + acceptance criteria
└── changes/               proposed file changes, mirroring public_html/
    └── README.md          how a proposed change maps to the live webroot
```

Files in `changes/` mirror their destination path under `public_html/`.
Nothing in `changes/` is live until it is copied to the webroot and verified.

## Rollback

Every change is a file addition or a small line edit. Rollback is
`git revert` plus re-uploading the previous file over FTP. Production PHP
auth files are never touched.

## Production safety

- No DNS, nameserver, email, or firewall changes from this directory.
- No deployment without explicit approval.
- Test against the real LiteSpeed host before declaring anything done.
