/* Cognika — persistent shell router.
 *
 * Every route still returns a complete, server-rendered document: title, meta
 * description, canonical, Open Graph and JSON-LD are all in the HTML, so
 * crawlers and no-JS visitors are unaffected. This file only changes what
 * happens when a *visitor* clicks an internal link.
 *
 * Alive for the whole session (never inside the swapped region):
 *   .backdrop, #meteorSky (+ its animation loop), .cosmos, #logoFlame
 *
 * Swapped per navigation:
 *   <header class="topbar"> | <header class="site-nav">   (the two shells)
 *   <main>…</main>                                        (the page)
 *   the footer's .footer-orb                               (homepage only)
 *   document metadata (title, description, canonical, OG, JSON-LD)
 *
 * The homepage is the special case: it owns the landing cover and the wordmark
 * flight. Navigating away runs that animation to completion against the
 * ORIGINAL .topbar, and only then swaps in the destination header and content
 * ("hybrid" hand-off). Nothing is replaced mid-flight.
 */
(function () {
  'use strict';

  // Only these routes are handled in-page. Anything else is a normal load, so
  // a future page can never be broken by this file.
  // Only the content pages go through the shell. The landing screen ('/') is
  // deliberately NOT in this list: it is a single static screen with its own
  // cover, wordmark flight and orbit navigator, so it gets a normal page load.
  // Routing it in-page needed the cover, the flight and a page script that
  // content pages never download to be kept in sync, and every one of those was
  // a bug for no gain.
  var ROUTES = ['/about/', '/projects/', '/e-os/', '/pat-ia/', '/srm-p/', '/contact/'];
  var HOME = '/';
  var FADE_MS = 180;

  if (!(window.fetch && window.DOMParser && window.history && window.history.pushState)) return;

  var docEl = document.documentElement;
  // Every route needs this: it is what lets the landing cover lift, and it is
  // removed again once a non-home page is in place.
  docEl.classList.add('js');

  var busy = false;
  var navToken = 0;
  var mounted = null;          // { name, cleanup } of the active page module

  // ---- Helpers ------------------------------------------------------------
  function normalise(url) {
    var a = document.createElement('a');
    a.href = url;
    var path = a.pathname.replace(/index\.html$/, '');
    if (path.charAt(path.length - 1) !== '/') path += '/';
    return path;
  }

  function routeFor(url) {
    var path = normalise(url);
    return ROUTES.indexOf(path) === -1 ? null : path;
  }

  function isInternalLink(anchor) {
    if (!anchor || !anchor.getAttribute) return false;
    var href = anchor.getAttribute('href');
    if (!href || href.charAt(0) === '#') return false;
    if (anchor.target && anchor.target !== '_self') return false;
    if (anchor.hasAttribute('download')) return false;
    if (/^(mailto:|tel:|javascript:)/i.test(href)) return false;
    if (anchor.host !== window.location.host) return false;
    return true;
  }

  function reducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // ---- Parsing a fetched page --------------------------------------------
  // Parsed into an inert document; elements are imported into THIS document, so
  // nothing executes during the swap itself.
  function parse(html, url) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var main = doc.querySelector('body > main');
    if (!main) return null;

    // Relative asset URLs in the swapped markup must resolve against the
    // destination, exactly as they would on a real load.
    var base = doc.createElement('base');
    base.href = new URL(url, window.location.href).href;
    doc.head.insertBefore(base, doc.head.firstChild);

    return {
      doc: doc,
      title: doc.title,
      main: main,
      footerOrb: Boolean(doc.querySelector('.footerbar .footer-orb')),
      bodyClass: doc.body.className,
      headerClass: (doc.querySelector('body > header') || {}).className || '',
      meta: doc.querySelectorAll('meta[name="description"], meta[property^="og:"], ' +
                                'meta[name^="twitter:"], link[rel="canonical"]'),
      jsonLd: doc.querySelectorAll('script[type="application/ld+json"]'),
      styles: doc.querySelectorAll('link[rel="stylesheet"]'),
      landing: doc.documentElement.className.indexOf('js') !== -1
    };
  }

  // ---- Metadata -----------------------------------------------------------
  // Kept in step with the fetched document, so the title bar, a shared link and
  // a later direct visit all describe the page actually being shown.
  var META_SELECTOR = 'meta[name="description"], meta[property^="og:"], ' +
                      'meta[name^="twitter:"], link[rel="canonical"]';

  function applyMeta(page) {
    document.title = page.title;

    var existing = document.head.querySelectorAll(META_SELECTOR);
    for (var i = 0; i < existing.length; i++) existing[i].remove();

    // Insert after the favicon so the conventional order is preserved.
    var anchor = document.head.querySelector('link[rel="icon"]');
    for (var j = 0; j < page.meta.length; j++) {
      var node = document.importNode(page.meta[j], true);
      if (anchor) {
        anchor.parentNode.insertBefore(node, anchor.nextSibling);
        anchor = node;
      } else {
        document.head.appendChild(node);
      }
    }

    // Replace the structured data rather than appending to it, or a crawl of a
    // JS-executing client would see several pages' graphs at once.
    var oldLd = document.head.querySelectorAll('script[type="application/ld+json"]');
    for (var k = 0; k < oldLd.length; k++) oldLd[k].remove();
    for (var l = 0; l < page.jsonLd.length; l++) {
      var s = document.createElement('script');
      s.type = 'application/ld+json';
      s.textContent = page.jsonLd[l].textContent;
      document.head.appendChild(s);
    }

    // A stylesheet the destination needs and this document lacks.
    for (var m = 0; m < page.styles.length; m++) {
      var href = page.styles[m].getAttribute('href');
      if (href && !document.head.querySelector('link[rel="stylesheet"][href="' + href + '"]')) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
      }
    }
  }

  // ---- Swapping the shell -------------------------------------------------
  // The landing cover (#landing, with its own wordmark) sits outside <main> on
  // the homepage, so replacing <main> alone would leave it in the document
  // forever — which is what made the flame keep following the landing logo on
  // every other route. It is treated as part of the route.
  function swapLanding(page, isHome) {
    var current = document.getElementById('landing');
    var next = page.doc.querySelector('body > .landing');
    if (current) current.remove();
    // page.landing comes from the fetched document, but `js` there is added by
    // an inline script that DOMParser never runs, so the route itself decides.
    if (next && isHome) {
      var node = document.importNode(next, true);
      var main = document.querySelector('body > main');
      if (main && main.parentNode === document.body) document.body.insertBefore(node, main);
      else document.body.insertBefore(node, document.body.firstChild);
    }
  }

  // The two headers are different markup (.topbar on the landing screen,
  // .site-nav on the content pages), so the element itself is swapped.
  function swapHeader(page) {
    var current = document.querySelector('body > header');
    var next = page.doc.querySelector('body > header');
    if (!next) return null;
    var node = document.importNode(next, true);
    if (current) current.replaceWith(node);
    else document.body.insertBefore(node, document.body.firstChild);
    return node;
  }

  function swapMain(page, animate) {
    var current = document.querySelector('body > main');
    var next = document.importNode(page.main, true);

    if (!current) {
      document.body.appendChild(next);
      return Promise.resolve();
    }
    if (!animate || reducedMotion()) {
      current.replaceWith(next);
      return Promise.resolve();
    }

    // Cross-fade only the page body. The sky, the header and the footer are
    // outside this element, so they never flicker.
    return new Promise(function (resolve) {
      current.style.transition = 'opacity ' + FADE_MS + 'ms ease';
      current.style.opacity = '0';
      setTimeout(function () {
        current.replaceWith(next);
        next.style.opacity = '0';
        next.style.transition = 'opacity ' + FADE_MS + 'ms ease';
        void next.offsetWidth;              // commit the start state
        next.style.opacity = '1';
        setTimeout(function () {
          next.style.transition = '';
          next.style.opacity = '';
          resolve();
        }, FADE_MS);
      }, FADE_MS);
    });
  }

  // The homepage footer carries an orb the content pages do not; keep the
  // shared footer identical to the destination instead of leaving home-only
  // markup behind.
  function swapFooterOrb(page) {
    var orb = document.querySelector('.footerbar .footer-orb');
    if (page.footerOrb && !orb) {
      var right = document.querySelector('.footerbar .footer-right');
      if (right) {
        var span = document.createElement('span');
        span.className = 'footer-orb';
        span.setAttribute('aria-hidden', 'true');
        span.appendChild(document.createElement('span'));
        right.appendChild(span);
      }
    } else if (!page.footerOrb && orb) {
      orb.remove();
    }
  }

  // ---- Page lifecycle -----------------------------------------------------
  // Content pages have no behaviour of their own today. The registry exists so
  // that adding some later cannot leak listeners: a module is mounted once per
  // navigation and must hand back a cleanup function.
  var PAGE_MODULES = {};

  function unmountPage() {
    if (!mounted) return;
    try { if (mounted.cleanup) mounted.cleanup(); } catch (e) { /* never block nav */ }
    mounted = null;
  }

  function mountPage(route, main) {
    var factory = PAGE_MODULES[route];
    if (!factory || !main) return;
    unmountPage();                       // never two pages mounted at once
    try {
      var cleanup = factory(main);
      if (typeof cleanup === 'function') mounted = { name: route, cleanup: cleanup };
    } catch (e) {
      // A page module must never take the shell down with it.
      if (window.console) console.error('page module failed:', e);
    }
  }

  // ---- Applying a navigation ---------------------------------------------
  function applyPage(page, route, url, opts) {
    applyMeta(page);

    // No route handled here is the landing screen, so the cover-related classes
    // have no meaning inside the shell. They are cleared rather than omitted in
    // case a future route needs them.
    docEl.classList.remove('landing-page', 'cover-up');

    document.body.className = page.bodyClass;

    var header = swapHeader(page);

    return swapMain(page, opts.animate !== false).then(function () {
      swapFooterOrb(page);
      mountPage(route, document.querySelector('body > main'));
      if (header) header.classList.remove('shell-hide');

      // The wordmark moved with the new header and that fires no resize event.
      // flame.js positions its canvas from the logo's viewport rect, so it is
      // re-measured once the new header is in the document and laid out.
      if (window.__flameRelayout) {
        requestAnimationFrame(function () {
          window.__flameRelayout();
          requestAnimationFrame(window.__flameRelayout);
        });
      }

      window.scrollTo(0, opts.scrollTo || 0);

      if (opts.push !== false) {
        var state = { shell: true, route: route, scrollY: 0 };
        if (opts.push === 'replace') window.history.replaceState(state, '', url);
        else window.history.pushState(state, '', url);
      }
      return url;
    });
  }

  function fallback(url) {
    // Fetch never produced a usable page: hand the navigation to the browser
    // rather than leaving the visitor on a stale one.
    window.location.assign(url);
  }

  // ---- Navigation ---------------------------------------------------------
  function navigate(route, url, opts) {
    if (busy) return;                    // one navigation at a time
    busy = true;

    var token = ++navToken;
    var leavingHome = docEl.classList.contains('landing-page');

    // Start the fetch immediately: it runs underneath the landing cover.
    var fetched = fetch(url, { credentials: 'same-origin' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.text();
      })
      .then(function (html) {
        var page = parse(html, url);
        if (!page) throw new Error('no <main> in response');
        // A catch-all 200 for a missing file must never be swapped in.
        if (routeFor(url) !== route) throw new Error('route mismatch');
        return page;
      });

    // The homepage runs its wordmark flight to completion first, against the
    // header that is still on the page. Nothing is replaced until it ends.
    var flight = leavingHome ? homeHandOff() : Promise.resolve();

    Promise.all([fetched, flight])
      .then(function (results) {
        if (token !== navToken) return null;      // superseded by a newer nav
        return applyPage(results[0], route, url, opts);
      })
      .catch(function () { fallback(url); })
      .then(function () { busy = false; });
  }

  function homeHandOff() {
    if (window.CognikaHome && typeof window.CognikaHome.handOff === 'function') {
      return window.CognikaHome.handOff();
    }
    return Promise.resolve();
  }

  // ---- Wiring -------------------------------------------------------------
  document.addEventListener('click', function (event) {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    var anchor = event.target.closest && event.target.closest('a[href]');
    if (!anchor || !isInternalLink(anchor)) return;

    var route = routeFor(anchor.href);
    if (!route) return;                        // not one of ours: normal load
    if (normalise(anchor.href) === normalise(window.location.href)) return;

    event.preventDefault();
    navigate(route, anchor.href, { push: true, animate: true });
  });

  window.addEventListener('popstate', function (event) {
    var route = routeFor(window.location.href);
    if (!route) { window.location.reload(); return; }
    var scrollY = (event.state && event.state.scrollY) || 0;
    navigate(route, window.location.href, {
      push: false, animate: false, scrollTo: scrollY
    });
  });

  // Remember the scroll position so Back can restore it.
  window.addEventListener('scroll', function () {
    var state = window.history.state;
    if (!state || !state.shell) return;
    state.scrollY = window.scrollY;
    window.history.replaceState(state, '', window.location.href);
  }, { passive: true });

  if (routeFor(window.location.href) === HOME) docEl.classList.add('landing-page');

  // Exposed for tests and for non-link triggers.
  window.CognikaShell = {
    go: navigate,
    routeFor: routeFor,
    isBusy: function () { return busy; }
  };
})();
