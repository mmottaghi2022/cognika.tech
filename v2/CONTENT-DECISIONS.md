# Content decisions — RESOLVED 2026-10-30

Owner decisions received. Status of each item below.

## ✅ 1. Cognika Design Skill — resolved

Owner instruction: *"Accept the existing website's design tokens as sufficient
for this implementation. Do not install a substitute skill."*

`agent_policy.md` names a "Cognika Design Skill" as mandatory, but it is **not
installed** on this system (verified: searched `~/.agents/skills`, all `SKILL.md`
files, retired skills, and the project tree). Per the owner decision, the live
site's own `:root` tokens in `assets/css/styles.css` are authoritative:
`--bg #03050a`, `--text #eef5ff`, `--muted #94a8c1`, `--blue #9bd8ff`,
`--blue-strong #4eaaff`, `--mono 'DM Mono'`, `--sans 'Manrope'`.
**`styles.css` is byte-identical to production**, so the visual identity is
provably unchanged.

## ✅ 2. Contact page — approved as shipped

`/contact/` keeps the `info@cognika.tech` mailto link. The "OWNER CONFIRMATION
REQUIRED" HTML comment was removed now that it is approved.

## ✅ 3. Projects page — keep as central overview

`/projects/` remains the overview of the three projects. **All three cards link
to their individual pages** (verified: `/e-os/`, `/pat-ia/`, `/srm-p/` all 200).

## ✅ 4. pat_ia naming — renamed to /pat-ia/

| Aspect | Value |
|---|---|
| Visible name | **pat_ia** |
| Canonical URL | **`/pat-ia/`** |
| Directory | `pat-ia/` (renamed from `pa-ia/` via `git mv`) |

All 14 references updated: nav on 7 pages, in-page links, canonical URL,
sitemap entry, robots.txt `Allow:` line.
**No redirect added** — `pa-ia` was never deployed, so no public URL exists to
preserve. Verified: zero `pa-ia` strings remain in the tree.

## ✅ 5. Verification — split by environment

Two separate suites, results reported per environment:

| Suite | Tool | What it proves |
|---|---|---|
| **Local HTML** | Python `http.server` | Static routing, link integrity, HTML content |
| **Local PHP** | **PHP 8.5.12 built-in server** | Auth flow, CSRF, session handling |
| **Real browser** | Chrome headless + CDP | Navigator click-through, visual rendering |

⚠️ **PHP authentication was tested on a PHP 8.5.12 runtime, not on Python's
`http.server`.** `http.server` cannot execute PHP and would return raw source; it
was never used to make any auth claim.

⚠️ **Still NOT tested: LiteSpeed.** Chrome and PHP built-in are local only.
`.htaccess` behaviour, HTTPS redirects and LiteSpeed-specific routing remain
unverified until this tree is on a staging vhost.

### Auth test results (PHP 8.5.12)

```
1. login.php renders                200, CSRF token present, title COGNIKA — Sign In
2. dashboard.php unauthenticated    redirected to login.php?timeout=1
3. wrong password                   stays on login (not authenticated)
4. correct password                 landed on dashboard.php
5. dashboard.php with session       200, shows user, title COGNIKA — Console
6. raw PHP source leaked            0 responses
```

Test config was created locally only (`inc/config.php`, gitignored) and removed
afterwards. No real credentials were used or committed.

### Navigator click-through (Chrome headless, JS enabled)

```
ABOUT     -> /about/      h1 About Cognika    PASS
e_OS      -> /e-os/       h1 e_os             PASS
pat_ia    -> /pat-ia/     h1 pat_ia           PASS
Srm_p     -> /srm-p/      h1 Srm_p            PASS
PROJECTS  -> /projects/   h1 Projects         PASS
CONTACT   -> /contact/    h1 Contact Cognika  PASS
6/6
```

## ✅ 6. Landing page + navigator preserved

Per owner instruction, the **original landing page is restored byte-for-byte**
from production (11,527 B). The orbit navigator keeps its exact circular layout,
icons, labels and hover/active styling.

**The only change:** the six `<button type="button">` elements are now
`<a class="orbit-node" href="...">`. This was required by the spec's rule that
navigation must work without JavaScript. Additions:

- `href` pointing at the new page for each of the six nodes
- `aria-current="page"` on the active node (replaces `aria-pressed`)
- `node-downloads` relabelled `PROJECTS` / `RESOURCES` -> `/projects/`
  (previously pointed nowhere; the spec defines no downloads page)
- `node-paia` caption `INTELLIGENT ERP` -> `INTELLIGENT BUSINESS` (matches spec)

`script.js` is **unchanged**: it hooks `.orbit-node` and `data-section`, both of
which the `<a>` elements retain, and it never calls `preventDefault()` — so
hover/focus still shows section detail, and clicks navigate.

⚠️ **Nothing has been merged, deployed, or changed in production, DNS or firewall.**
