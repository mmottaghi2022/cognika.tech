(function () {
  var canvas = document.getElementById('meteorSky');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W, H, dpr, stars = [], meteors = [], galaxy, nextMeteor = 0;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Meteor head radius in CSS px. The canvas is scaled by dpr, so a literal 1
  // drew a 2-3px blob on Retina/high-density screens. Dividing by dpr keeps the
  // head at exactly one device pixel everywhere.
  var HEAD_RADIUS = 0.5;
  // When a photographic backdrop is painted behind the canvas, skip the opaque
  // black galaxy fill so the photo stays visible through the stars and meteors.
  var photoBackdrop = Boolean(document.querySelector('.backdrop'));

  // ---- Animation lifecycle ------------------------------------------------
  // The frame loop used to run forever, even in a background tab or when the
  // canvas was scrolled out of view. It is now started and stopped explicitly.
  // Appearance is unchanged: the same stars, the same meteors, the same rate.
  var running = false;
  var rafId = 0;
  var hidden = false;
  var offscreen = false;

  // Upper bound on twinkling stars. The old density formula (W*H/2500) gave
  // 2,073 stars on a 2880x1800 retina desktop, each drawn as its own arc() every
  // frame. Capping keeps large displays smooth without thinning the field:
  // above the cap the stars are simply spread over the same area, so the field
  // still reads as dense.
  var MAX_STARS = 700;

  // ---- Galaxy layer cache -------------------------------------------------
  // The galaxy layer is generated with Math.random(): every page load placed
  // different stars, so the sky changed on every navigation, and generating it
  // was the most expensive part of the first paint on a content page.
  //
  // Now it is generated once per browser and stored in localStorage as two
  // compressed JPEG snapshots: the star field, and the haze/bloom pass on its
  // own (so the haze keeps its 0.45 opacity when the two are composited, as
  // they are drawn). Both are later blitted at the current size in a single
  // drawImage each, so every page and every visit shows the identical sky.
  var SKY_VERSION = 1;
  var SKY_KEY = 'cognika.sky.v' + SKY_VERSION;
  // localStorage is synchronous, so only a small snapshot is kept; larger ones
  // fall back to generating the sky, which is what this code did before.
  var SKY_BUDGET = 900000;

  function readCache() {
    try {
      var raw = window.localStorage.getItem(SKY_KEY);
      if (!raw) return null;
      var rec = JSON.parse(raw);
      return rec && rec.v === SKY_VERSION ? rec : null;
    } catch (e) { return null; }
  }

  function writeCache(w, h, dpr, stars, haze) {
    try {
      var payload = JSON.stringify({ v: SKY_VERSION, w: w, h: h, dpr: dpr,
                                     stars: stars, haze: haze });
      if (payload.length > SKY_BUDGET) return;
      window.localStorage.setItem(SKY_KEY, payload);
    } catch (e) { /* private mode or quota: the sky is simply regenerated */ }
  }


  // Decoding a large data URI is not synchronous: Chromium reports
  // img.complete === false right after src is assigned even though the bytes
  // are already in memory. So the cached sky is loaded asynchronously and
  // committed as soon as both layers are ready — one frame at most, and the
  // canvas is simply empty until then.
  function restoreAsync(rec, done) {
    var galaxyLayer = null;
    var starsLayer = null;
    var remaining = rec.haze ? 2 : 1;

    function settle() {
      if (--remaining > 0) return;
      if (galaxyLayer && starsLayer) done(galaxyLayer, starsLayer);
      else done(null, null);          // unusable cache: caller regenerates
    }

    if (!rec.haze) {
      // No haze layer means this page has a photo backdrop, so an empty galaxy
      // layer is exactly what drawStatic() composites over the photo.
      galaxyLayer = document.createElement('canvas');
      galaxyLayer.width = W;
      galaxyLayer.height = H;
    } else {
      loadInto(rec.haze, function (img) {
        var c = document.createElement('canvas');
        c.width = W;
        c.height = H;
        var g = c.getContext('2d');
        if (!photoBackdrop) {
          g.fillStyle = '#000';
          g.fillRect(0, 0, W, H);
        }
        g.drawImage(img, 0, 0, W, H);
        galaxyLayer = c;
      }, settle);
    }

    loadInto(rec.stars, function (img) {
      var c = document.createElement('canvas');
      c.width = W;
      c.height = H;
      c.getContext('2d').drawImage(img, 0, 0, W, H);
      starsLayer = c;
    }, settle);
  }

  // Loads a data URI and hands the decoded image to `use`; `after` always runs.
  function loadInto(src, use, after) {
    var img = new Image();
    img.onload = function () {
      if (img.naturalWidth) use(img);
      after();
    };
    img.onerror = after;
    img.src = src;
    if (img.complete && img.naturalWidth) {
      // Already decoded (small payloads can complete synchronously).
      use(img);
      after();
    }
  }



  // Haze pass on its own layer, so the cached snapshot keeps its 0.45 opacity
  // when the two layers are composited side by side.
  function paintHaze() {
    var haze = document.createElement('canvas');
    haze.width = W;
    haze.height = H;
    if (photoBackdrop) return haze;   // the photo supplies the galaxy

    var g = haze.getContext('2d');
    g.translate(W / 2, H / 2);
    g.rotate(-0.5);
    var len = Math.hypot(W, H);
    for (var i = 0; i < 90; i++) {
      var x = (Math.random() - 0.5) * len;
      var y = (Math.random() - 0.5) * H * 0.18 * (Math.random() + Math.random());
      var r = 40 + Math.random() * 120;
      var hue = Math.random() < 0.5 ? '120,90,220' : '60,110,230';
      var grad = g.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, 'rgba(' + hue + ',0.05)');
      grad.addColorStop(1, 'rgba(' + hue + ',0)');
      g.fillStyle = grad;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    return haze;
  }

  // The star field, drawn once. `stars` drives nothing after this point, so it
  // is only generated when there is no cached snapshot to draw from.
  function paintStarField() {
    var layer = document.createElement('canvas');
    layer.width = W;
    layer.height = H;
    var s = layer.getContext('2d');
    if (!stars.length) {
      var n = Math.min(MAX_STARS, Math.floor(W * H / 2500));
      for (var j = 0; j < n; j++) {
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1.2 + 0.2,
          p: Math.random() * 6.28,
          s: 0.5 + Math.random() * 1.5,
          a: 0.35 + Math.random() * 0.65
        });
      }
    }
    for (var i = 0; i < stars.length; i++) {
      var st = stars[i];
      s.globalAlpha = st.a * 0.8;
      s.fillStyle = '#fff';
      s.beginPath();
      s.arc(st.x, st.y, st.r, 0, 6.283);
      s.fill();
    }
    s.globalAlpha = 1;
    return layer;
  }

  window.__skyTrace = [];

  function build() {
    // Measure the laid-out CSS box first, then size the backing store from it.
    // Two reasons: the canvas is `fixed; width/height: 100%`, so the first
    // measurement happens before any resize handling has settled; and if
    // devicePixelRatio is a fraction, rounding the backing store makes the
    // ratio between backing pixels and CSS pixels differ from the transform
    // set below, which drew every star and streak at the wrong scale until the
    // next (debounced) rebuild.
    W = Math.round(canvas.clientWidth);
    H = Math.round(canvas.clientHeight);
    if (!W || !H) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);

    // Fast path: the sky this browser already generated on an earlier page.
    // It arrives asynchronously, so the layers are committed the moment both
    // images are decoded and the canvas is left empty until then — one frame.
    var rec = readCache();
    if (rec) {
      restoreAsync(rec, function (galaxyLayer, starLayerRestored) {
        if (!galaxyLayer || !starLayerRestored) {
          window.__skyTrace.push('restore failed: regenerating');
          generateSky();
          drawStatic();
          return;
        }
        galaxy = galaxyLayer;
        starLayer = starLayerRestored;
        window.__skyTrace.push('restored ' + W + 'x' + H);
        drawStatic();
        start();
      });
      return;
    }
    window.__skyTrace.push('no cache: generating');
    generateSky();
  }

  // Generate the sky from scratch and store it for every later page.
  function generateSky() {

    // Nothing usable cached: generate once, then store it for every later page.
    var haze = paintHaze();
    var starField = paintStarField();     // also becomes the cached star layer
    starLayer = starField;

    galaxy = document.createElement('canvas');
    galaxy.width = W;
    galaxy.height = H;
    var g = galaxy.getContext('2d');
    if (!photoBackdrop) {
      g.fillStyle = '#000';
      g.fillRect(0, 0, W, H);
      g.drawImage(haze, 0, 0, W, H);
    }

    // The star field is snapshotted before it is merged with the galaxy, and
    // the haze pass only exists when there is no photo behind it. PNG keeps the
    // transparency, so the cached layers composite exactly like the live ones.
    try {
      writeCache(W, H, dpr,
                 starField.toDataURL('image/png'),
                 photoBackdrop ? '' : haze.toDataURL('image/png'));
    } catch (e) { /* tainted canvas: keep generating, never cache */ }
  }


  function spawn() {
    var ang = Math.PI * (0.18 + Math.random() * 0.14);
    var sp = 9 + Math.random() * 7;
    meteors.push({
      x: Math.random() * W * 0.9 - W * 0.1,
      y: -20 + Math.random() * H * 0.35,
      vx: Math.cos(ang) * sp,
      vy: Math.sin(ang) * sp,
      len: 7 + Math.random() * 8,
      life: 0,
      max: 220 + Math.random() * 120
    });
  }

  // A frame is: the galaxy layer, the star layer, then any meteors in flight.
  // The first two are the only reason the sky exists, so they are painted
  // synchronously at load and must cost a single composited blit each — the
  // landing cover waits on exactly this work before it can start, which is why
  // the homepage used to hold a blank screen on a cold cache.
  function drawStatic() {
    if (!galaxy) return;
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = 0.45;
    ctx.drawImage(galaxy, 0, 0, W, H);
    ctx.globalAlpha = 1;
    // Stars come from a pre-rendered layer: one drawImage instead of hundreds
    // of arc() + fill() calls per frame.
    if (starLayer) ctx.drawImage(starLayer, 0, 0);
    ctx.globalAlpha = 1;
  }

  function frame(t) {
    if (!galaxy) {
      rafId = requestAnimationFrame(frame);
      return;
    }
    drawStatic();
    if (!reduce && t > nextMeteor) {
      spawn();
      nextMeteor = t + 1800 + Math.random() * 4200;
    }
    for (var k = meteors.length - 1; k >= 0; k--) {
      var m = meteors[k];
      m.x += m.vx;
      m.y += m.vy;
      m.life++;
      var fade = Math.min(1, m.life / 8) * Math.max(0, 1 - m.life / m.max);
      // Tail = point `len` px behind the head along the (unit) velocity vector.
      var mag = Math.hypot(m.vx, m.vy) || 1;
      var tx = m.x - (m.vx / mag) * m.len;
      var ty = m.y - (m.vy / mag) * m.len;
      ctx.save();
      var gr = ctx.createLinearGradient(m.x, m.y, tx, ty);
      gr.addColorStop(0, 'rgba(255,255,255,' + fade + ')');
      gr.addColorStop(0.3, 'rgba(160,190,255,' + fade * 0.5 + ')');
      gr.addColorStop(1, 'rgba(120,140,255,0)');
      ctx.strokeStyle = gr;
      ctx.lineWidth = 0.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      // Head stays one device pixel wide regardless of dpr.
      ctx.fillStyle = 'rgba(255,255,255,' + fade + ')';
      ctx.beginPath();
      ctx.arc(m.x, m.y, HEAD_RADIUS / dpr, 0, 6.283);
      ctx.fill();
      ctx.restore();
      if (m.life > m.max || m.x > W + 200 || m.y > H + 200) meteors.splice(k, 1);
    }
    rafId = requestAnimationFrame(frame);
  }

  // ---- Loop control -------------------------------------------------------
  function start() {
    if (running || hidden || offscreen) return;
    if (!W || !H) return;
    running = true;
    last = 0;   // avoid a time jump on resume
    rafId = requestAnimationFrame(frame);
  }

  function stop() {
    if (!running) return;
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  }

  function sync() {
    if (hidden || offscreen) stop(); else start();
  }

  // Stars are drawn once into an offscreen layer (generated, or restored from
  // the cached snapshot), then blitted with a single drawImage per frame.
  // Previously every star was an individual arc() + fill() call on every frame.
  var starLayer = null;

  // Pause while the tab is hidden and resume on return. Browsers already
  // throttle rAF in background tabs, but stopping explicitly avoids the burst
  // of catch-up work on some engines and keeps the intent obvious.
  function onVisibility() {
    hidden = document.visibilityState === 'hidden';
    sync();
  }

  // Pause while the canvas is scrolled out of view (long sub-pages, or a very
  // tall viewport on a short window). The sky is decorative; there is no
  // reason to burn CPU painting it off-screen.
  function watchViewport() {
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      offscreen = !entries[0].isIntersecting;
      sync();
    }, { threshold: 0 });
    io.observe(canvas);
  }

  // Test hook: render N frames without relying on rAF (headless throttles it),
  // and report whether this page generated the sky or restored it from cache.
  window.__skyInfo = function () {
    return {
      generated: !starLayer,
      hasCache: Boolean(readCache()),
      cacheBytes: (function () {
        try { return (window.localStorage.getItem(SKY_KEY) || '').length; } catch (e) { return 0; }
      }()),
      cacheW: (readCache() || {}).w,
      cacheH: (readCache() || {}).h,
      viewW: W, viewH: H,
      layerW: galaxy ? galaxy.width : null,
      starLayerNull: !starLayer,
    };
  };

  // Test hook: hash of the static sky only (galaxy + star layer), so a cached
  // sky can be compared between pages without the moving meteors in the way.
  window.__skyStaticHash = function () {
    if (!galaxy || !starLayer) return null;
    var tmp = document.createElement('canvas');
    tmp.width = W;
    tmp.height = H;
    var g = tmp.getContext('2d');
    g.globalAlpha = 0.45;
    g.drawImage(galaxy, 0, 0, W, H);
    g.globalAlpha = 1;
    g.drawImage(starLayer, 0, 0);
    var d = g.getImageData(0, 0, W, H).data;
    var h = 0, lit = 0;
    for (var i = 0; i < d.length; i += 4) {
      if (d[i + 3] > 8) { lit++; h = (h * 31 + d[i] + i) | 0; }
    }
    return { hash: h, lit: lit };
  };

  var resizeTimer = 0;
  function onResize() {
    // Debounce: build() allocates two canvases, which is wasteful during a
    // drag-resize. 150ms is imperceptible for a static background. The layers
    // are re-restored from the cache at the new size, so this stays cheap.
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      build();
      start();
    }, 150);
  }

  window.addEventListener('resize', onResize);
  document.addEventListener('visibilitychange', onVisibility);

  build();
  if (W && H) {
    // build() has produced both sky layers — generated once, or restored from
    // this browser's cache when an earlier page already made them.
    // Paint the finished sky now rather than waiting for the first animation
    // frame. The loop is the same, but the sky is on screen the moment the
    // script runs instead of one frame (and one main-thread stall) later.
    drawStatic();
    document.documentElement.classList.add('sky-active');
  }
  // Registers the IntersectionObserver that gates the loop. Without this call
  // `offscreen` is never updated and start() never runs.
  watchViewport();

  // Only animate once the page is fully loaded. On a cold cache the load is
  // waiting on the wordmark and the backdrop photo; an animation loop running
  // underneath it competes for the same main thread and delays the point at
  // which the landing cover can start. The static sky painted just above is
  // already complete, so nothing looks unfinished while we wait.
  //
  // The timer is a backstop: a slow font or photo must never leave the sky
  // frozen. Whichever comes first wins, and `armed` makes it idempotent.
  var armed = false;
  function arm() {
    if (armed) return;
    armed = true;
    start();
  }
  if (document.readyState === 'complete') arm();
  else {
    window.addEventListener('load', arm, { once: true });
    setTimeout(arm, 2500);
  }
})();
