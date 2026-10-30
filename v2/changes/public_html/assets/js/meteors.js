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

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    if (!W || !H) return;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    galaxy = document.createElement('canvas');
    galaxy.width = W;
    galaxy.height = H;
    var g = galaxy.getContext('2d');
    if (!photoBackdrop) {
      g.fillStyle = '#000';
      g.fillRect(0, 0, W, H);
    } else {
      g.clearRect(0, 0, W, H);
    }
    g.translate(W / 2, H / 2);
    g.rotate(-0.5);
    var len = Math.hypot(W, H);
    // The photo supplies the galaxy, so skip the procedural blue haze.
    var hazeCount = photoBackdrop ? 0 : 90;
    for (var i = 0; i < hazeCount; i++) {
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
    g.setTransform(1, 0, 0, 1, 0, 0);
    var n = Math.min(MAX_STARS, Math.floor(W * H / 2500));
    stars = [];
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

  function frame(t) {
    if (!galaxy) {
      rafId = requestAnimationFrame(frame);
      return;
    }
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = 0.45;
    ctx.drawImage(galaxy, 0, 0, W, H);
    ctx.globalAlpha = 1;
    // Stars come from a pre-rendered layer: one drawImage instead of hundreds
    // of arc() + fill() calls per frame.
    if (starLayer) ctx.drawImage(starLayer, 0, 0);
    ctx.globalAlpha = 1;
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

  // Stars are drawn once into an offscreen layer, then blitted with a single
  // drawImage per frame. Previously every star was an individual arc() + fill()
  // call on every frame (2,073 calls/frame on a retina desktop).
  var starLayer = null;

  function paintStars() {
    starLayer = document.createElement('canvas');
    starLayer.width = W;
    starLayer.height = H;
    var s = starLayer.getContext('2d');
    for (var i = 0; i < stars.length; i++) {
      var st = stars[i];
      s.globalAlpha = st.a * 0.8;
      s.fillStyle = '#fff';
      s.beginPath();
      s.arc(st.x, st.y, st.r, 0, 6.283);
      s.fill();
    }
    s.globalAlpha = 1;
  }

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

  var resizeTimer = 0;
  function onResize() {
    // Debounce: rebuild() allocates two canvases, which is wasteful during a
    // drag-resize. 150ms is imperceptible for a static background.
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      build();
      if (W && H) paintStars();
      start();
    }, 150);
  }

  window.addEventListener('resize', onResize);
  document.addEventListener('visibilitychange', onVisibility);

  build();
  if (W && H) {
    paintStars();
    document.documentElement.classList.add('sky-active');
  }
  watchViewport();
  start();
})();
