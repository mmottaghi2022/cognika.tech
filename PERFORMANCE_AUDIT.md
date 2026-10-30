# Cognika Performance Audit

**Investigation only. No production file, server setting, Cloudflare rule or
Git history was modified.**

---

## Executive summary

The site is **not slow in aggregate** — six of seven pages score 0.92–1.00 on
desktop Lighthouse. The problem is concentrated on the **homepage only**, and
it is two distinct defects, not a general performance issue:

1. **CLS 0.39 on the homepage** (Lighthouse flags it red; "good" is < 0.1).
   Cause: `flame.js` sets `canvas.logo-flame` dimensions *after* measuring
   `#landingLogo`, so the canvas resizes from its default 300×150 and drags
   `section.writing-pane` with it. The largest measurable defect on the site
   and the most visible to users as a "jump" while loading.
2. **`logo.png` is 152 KB at 1700×300 but renders at ~40 px tall** in the header
   — a **56× pixel oversupply**. Lighthouse estimates **125 KiB recoverable**
   on the homepage. Longest single request in the waterfall (1,462 ms).

A third, intermittent issue: **`meteors.js` main-thread cost is volatile** —
191 ms in one run, **3,773 ms in another**. It is an uncapped
`requestAnimationFrame` loop that redraws *every star individually* each frame
(518 arcs/frame at 1440×900; 2,073 at 2× DPR). In one of five desktop runs it
produced `NO_FCP` — Lighthouse recorded no paint at all.

**Mobile scores better than desktop** (0.95 vs 0.81 median), which inverts the
usual pattern and further confirms the problem is CPU-bound animation, not
network or server.

---

## Test environment

| Item | Value |
|---|---|
| Date | 2026-10-30, 20:54–21:15 UTC |
| Browser | Google Chrome **156.0.8078.79** (headless=new) |
| Lighthouse | **13.6.0** (installed into `/tmp/perf-audit`, not global) |
| Node | v22.23.2 |
| Desktop profile | `--preset=desktop`, window 1350×940, DPR 1 |
| Mobile profile | Lighthouse default mobile emulation + simulated throttling |
| Network | Unthrottled local (desktop preset applies no simulated throttling) |
| Cache states | Cold = `setCacheDisabled(true)` + `clearBrowserCache()`; Warm = same profile, cache enabled |
| Runs | 5× desktop homepage, 3× mobile homepage, 3× desktop `/about/`, 3× desktop `/e-os/`, 1× each remaining page |
| Statistics | **Median reported**, never a best-of |

**Unavailable:** field INP (no CrUX/RUM access). Stated as unavailable rather
than guessed.

---

## Results — all seven pages (desktop, median or single run)

| Page | Score | FCP | LCP | CLS | TBT | SI | Main-thread | Bytes |
|---|---|---|---|---|---|---|---|---|
| **`/`** | **0.81** | 601 ms | 744 ms | **0.390** | 0 ms | 1,351 ms | **546–4,060 ms** | 255 KiB |
| `/about/` | 0.99 | 466 ms | 626 ms | 0.000 | 0 ms | 1,126 ms | 62 ms | 252 KiB |
| `/projects/` | 0.99 | 300 ms | 400 ms | 0.006 | 0 ms | 1,300 ms | 84 ms | 243 KiB |
| `/e-os/` | 1.00 | 300 ms | 360 ms | 0.000 | 0 ms | 904 ms | 55 ms | 109 KiB |
| `/pat-ia/` | 1.00 | 300 ms | 300 ms | 0.004 | 0 ms | 1,000 ms | 66 ms | 152 KiB |
| `/srm-p/` | 0.92 | 300 ms | 400 ms | 0.034 | 0 ms | 3,500 ms | 72 ms | 243 KiB |
| `/contact/` | 1.00 | 400 ms | 600 ms | 0.000 | 0 ms | 1,000 ms | 56 ms | 244 KiB |

**The homepage is the only page with a failing metric.** `/srm-p/` has a high
Speed Index (3.5 s) but near-zero main-thread cost and no CLS — a paint-pacing
artefact, not a defect.

### Desktop vs mobile (homepage)

| Metric | Desktop (median, n=4) | Mobile (median, n=3) |
|---|---|---|
| Score | 0.81 | **0.95** |
| FCP | 601 ms | 847 ms |
| LCP | 744 ms | 1,267 ms |
| CLS | **0.390** | 0.135 |
| TBT | 0 ms | 0 ms |
| Speed Index | 1,351 ms | 2,149 ms |
| TTFB | 246 ms | 250 ms |
| Bytes | 255 KiB | 255 KiB |

Mobile is slower in absolute ms (throttling) but **scores higher**, because the
star field is `W*H/2500` = 131 stars at 390 px vs 518 at 1440 px.

---

## Cold vs warm cache (homepage, CDP)

| | Cold | Warm |
|---|---|---|
| TTFB | 490 ms | 1,260 ms |
| FCP | 1,220 ms | 1,636 ms |
| DOMContentLoaded | 1,982 ms | 2,337 ms |
| Load | 1,985 ms | 2,342 ms |
| Requests | 9 | 10 |
| Transferred | 250 KiB | 250 KiB |
| Served from browser cache | 0/9 | **1/10** |

**Warm cache barely helps**, and the warm run was *slower*. Two reasons:

- `cache-control: no-cache, no-store, must-revalidate` on HTML (deliberate, set
  in the existing `.htaccess`) forces revalidation on every navigation.
- Assets carried `age` 68–233 s, so they came from the **Cloudflare edge**, not
  the browser disk cache. The browser re-requested them; Cloudflare answered
  from edge — fast, but still a round trip.

The single browser-cache hit was the second `favicon.svg` request.

---

## Network waterfall (cold, homepage)

| Resource | Type | Start | Duration | Transfer | Blocks render | Note |
|---|---|---|---|---|---|---|
| `manrope-var.woff2` | font | 503 ms | 420 ms | 24,736 B | no (preloaded) | variable font, all weights |
| `dm-mono-400.woff2` | font | 504 ms | 426 ms | 8,988 B | no (preloaded) | |
| `styles.css?v=21` | css | 504 ms | 649 ms | 10,025 B | **yes** | 34 KB raw, 10 KB brotli |
| `back_ground.webp` | img | 504 ms | 1,463 ms | 44,040 B | no | preloaded, `fetchpriority=high` |
| **`logo.png`** | img | 505 ms | **1,462 ms** | **152,249 B** | no | **largest asset, 60% of bytes** |
| `favicon.svg` | img | 505 ms | 1,462 ms | 2,824 B | no | |
| **`meteors.js`** | script | 505 ms | 1,462 ms | 2,000 B | deferred | **CPU dominant** |
| `script.js` | script | 505 ms | 401 ms | 8,128 B | deferred | |
| `flame.js` | script | 505 ms | 424 ms | 3,000 B | deferred | CLS cause |

**No third-party requests.** No Google Fonts (removal confirmed). The
`favicon.svg` and `rum` entries flagged in an earlier session were red herrings:
`favicon.svg` is a 2.8 KB icon that does not block render, and `rum` is
Cloudflare's own edge-injected beacon, not part of the origin HTML.

---

## LCP element analysis

| Page | LCP | Element | Size |
|---|---|---|---|
| `/` | 1,224 ms | `<img>` (background, scaled) | 202,500 px |
| `/about/` | 984 ms | `<img>` (background, scaled) | 202,500 px |

LCP is the **background galaxy photograph**, not the wordmark and not text. It
is `preload`ed with `fetchpriority="high"`, so LCP is already close to optimal —
**LCP is not a problem on this site**. 744 ms desktop / 1,267 ms mobile sits
well inside the 2,500 ms "good" threshold.

Effort spent chasing LCP would be wasted. The real defects are **CLS** and
**logo weight**.

---

## CLS root cause — confirmed

```
CLS 0.4370 @ 1207 ms
  sources: SECTION.writing-pane.is-minimal  +  CANVAS.logo-flame
```

Mechanism, from source:

- `styles.css`: `.logo-flame { position: fixed; z-index: 25; … }` — **no width
  or height declared**, so the canvas defaults to 300×150 CSS px.
- `flame.js` L55–71: measures `#landingLogo` via `getBoundingClientRect()`,
  *then* sets `canvas.style.width/height`. Until that runs the canvas holds the
  default box; when it resizes, `section.writing-pane` reflows → CLS 0.39–0.44.
- `.landing-logo` width is `min(78%, calc(74vh * 5.667))`, dependent on the
  loaded logo's intrinsic size, so the measurement itself lands late.

`/about/` has the identical background image and fonts but **CLS 0.000** — it
does not load `flame.js`. That isolates the cause to the flame canvas.

---

## Confirmed problems

### P1 — Homepage CLS 0.39 (Critical)

- **Evidence:** CLS 0.39 median of 4 desktop runs (min 0.035, max 0.390 —
  bimodal); CDP `layout-shift` observer attributes **0.4370** to
  `SECTION.writing-pane` + `CANVAS.logo-flame` at 1,207 ms. Lighthouse shows CLS
  in red and lists "Layout shift culprits".
- **Pages:** `/` only.
- **Impact:** visible content jump ~1.2 s after load; fails Core Web Vitals.
- **Fix:** give `.logo-flame` an explicit initial size (or `visibility:hidden`
  until positioned) and reserve the landing logo box with `aspect-ratio`.
  **CSS-only.**
- **Side effects:** none if sizes match current output.
- **Risk:** low.

### P2 — `logo.png` 152 KB rendered at 40 px (High)

- **Evidence:** 1700×300 RGBA PNG, 151,949 B; `.brand-logo` height
  `clamp(26px, 3.1vw, 40px)`. Oversupply **56×** at 40 px, **133×** at 26 px.
  Lighthouse: *"Improve image delivery — Est savings of 125 KiB."* Waterfall:
  longest request, 1,462 ms.
- **Pages:** all seven (header logo everywhere).
- **Impact:** 60% of page weight; competes with fonts and the background image.
- **Fix:** WebP/AVIF at ~340×60 (2× retina) with `srcset`, PNG fallback.
  **Image + HTML.**
- **Side effects:** none if 2× supplied for retina.
- **Risk:** low.

### P3 — `meteors.js` unbounded rAF loop, volatile CPU (High)

- **Evidence:** `bootup-time` attributes **3,773 ms total / 2,119 ms scripting**
  to `meteors.js` in one run vs 191 ms in another; main-thread swings
  546 ms → 4,060 ms. One of five desktop runs gave **`NO_FCP`**. Source:
  `requestAnimationFrame(frame)` with no visibility check, redrawing each star
  as an individual `arc()` — 518/frame at 1440×900, 2,073/frame at 2× DPR.
- **Pages:** `/` only.
- **Impact:** intermittent multi-second main-thread stalls; on slower hardware
  this is what "slow" feels like. Explains the bimodal Lighthouse scores.
- **Do not remove the effect.** Recommended: pause on `document.hidden`, cap
  star count, pre-render stars to an offscreen canvas instead of per-frame arcs.
  All preserve the visual.
- **Fix:** **JavaScript.** Risk: medium (visual must be re-verified).

### P4 — HTML never edge-cached (Medium)

- **Evidence:** `cf-cache-status: DYNAMIC`, `cache-control: no-cache, no-store,
  must-revalidate` on all HTML. TTFB: 10 samples, median 629 ms, min 507 ms,
  **max 1,470 ms**, stdev 308 ms.
- **Impact:** every navigation pays an origin round trip with high jitter; a
  1.47 s TTFB directly delays FCP.
- **Fix:** a Cloudflare **Cache Rule** decision, not a code change. Outside this
  audit's scope, and the no-store policy is deliberate.
- **Risk:** changing it means stale-HTML risk on deploy.

---

## Likely problems

### P5 — Assets revalidate every 4 h despite `?v=` versioning (Medium)

`.htaccess` intends `max-age=31536000, immutable` for versioned assets, but live
headers show `public, max-age=14400, must-revalidate` — Cloudflare overrides.
`pages.css` and fonts returned `REVALIDATED` rather than `HIT`. Repeat visitors
re-check every 4 h instead of annually. **Fix out of scope** (Cloudflare / .htaccess).

### P6 — Two render-blocking stylesheets on sub-pages (Low)

`styles.css` + `pages.css` both block; 10 KB + 3 KB brotli. ~200 ms added FCP on
sub-pages. `/about/` still scores 0.99, so this is minor.

---

## Unverified hypotheses

- **H1** — The `NO_FCP` runs indicate real-world jank on low-end hardware.
  *Plausible given P3, not proven: no low-end device was tested.*
- **H2** — TTFB jitter (507→1,470 ms) is origin-side (shared cPanel host), not
  Cloudflare. *Not separable from this vantage point.*
- **H3** — `script.js` (410 lines) adds to homepage main-thread time.
  *Bootup-time attributed cost only to `meteors.js` and "Unattributable" in the
  runs sampled, so unconfirmed.*

---

## Top five optimisations, ranked by value ÷ risk

| # | Optimisation | Type | Expected gain | Risk |
|---|---|---|---|---|
| **1** | Reserve `.logo-flame` size + landing-logo `aspect-ratio` | CSS | **CLS 0.39 → ~0** | **Low** |
| **2** | Serve `logo.png` as WebP/AVIF at 2× with `srcset` | Image + HTML | **−125 KiB (~50% weight)** | **Low** |
| **3** | `meteors.js`: pause when hidden, cap stars, offscreen star layer | JS | Removes 0–4 s stalls and `NO_FCP` | Medium |
| **4** | Cloudflare rule: long-cache versioned assets | Cloudflare | Repeat-visit speed | Medium |
| **5** | Inline critical CSS for sub-pages | CSS | ~200 ms FCP on 6 pages | Medium |

**Items 1 + 2 together** should move the homepage from 0.81 to an estimated
0.95+ without altering any design decision. Item 3 addresses the intermittent
worst case, which is most likely what users perceive as "slow".

---

## Constraints observed

| Constraint | Status |
|---|---|
| No production file edited | ✅ |
| No Git branch/commit change | ✅ `main` @ `5c31ffb`, tree clean before and after |
| No global dependency install | ✅ Lighthouse in `/tmp/perf-audit` only |
| No server / Cloudflare / DNS change | ✅ read-only HTTP + FTP reads |
| No cache purge | ✅ |
| No credentials in this report | ✅ |
| Audit files not committed | ✅ all in `/tmp/perf-audit` |

**No fixes implemented. Awaiting per-item approval.**



