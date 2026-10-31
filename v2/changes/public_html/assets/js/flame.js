/* Blue flame burning along the top ridge of the wordmark's trailing "A".
   The emitter follows the glyph's real contour (a peaked chevron), so flames
   rise from the ridge itself rather than floating near it. */
(function () {
  var canvas = document.getElementById('logoFlame');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Contour of the "A" in logo.png (1700x300), normalised: left foot →
  // apex → right foot.
  var RIDGE = [
    [0.8371, 0.6200], [0.8488, 0.5133], [0.8612, 0.4000], [0.8735, 0.2800],
    [0.8859, 0.1767], [0.8982, 0.0833], [0.9106, 0.0767], [0.9229, 0.1633],
    [0.9353, 0.2767], [0.9476, 0.3900], [0.9600, 0.5033], [0.9724, 0.6167]
  ];

  var W = 0, H = 0, dpr = 1, parts = [], last = 0, box = null;

  function visibleLogo() {
    if (document.body.classList.contains('panel-ready')) {
      return document.querySelector('.brand-logo');
    }
    return document.getElementById('landingLogo');
  }

  // Map a normalised ridge point into canvas-local pixels.
  function ridgePoint(t) {
    var n = RIDGE.length - 1;
    var pos = Math.min(0.9999, Math.max(0, t)) * n;
    var i = Math.min(n - 1, Math.floor(pos));
    var f = pos - i;
    var nx = RIDGE[i][0] + (RIDGE[i + 1][0] - RIDGE[i][0]) * f;
    var ny = RIDGE[i][1] + (RIDGE[i + 1][1] - RIDGE[i][1]) * f;

    // Convert straight to canvas-local coordinates using the recorded offsets,
    // so a stale `box` can never send particles off-canvas.
    var ox = parseFloat(canvas.dataset.ox || '0');
    var oy = parseFloat(canvas.dataset.oy || '0');
    var logoW = parseFloat(canvas.dataset.lw || '0');
    var logoH = parseFloat(canvas.dataset.lh || '0');
    var logoL = parseFloat(canvas.dataset.ll || '0');
    var logoT = parseFloat(canvas.dataset.lt || '0');

    return {
      x: (logoL + nx * logoW) - ox,
      y: (logoT + ny * logoH) - oy
    };
  }

  function layout() {
    var logo = visibleLogo();
    if (!logo) return;
    var r = logo.getBoundingClientRect();
    if (!r.width || !r.height) return;

    var left = r.left + r.width * RIDGE[0][0] - r.width * 0.02;
    var top = r.top + r.height * 0.0767 - r.height * 2.1;
    var cssW = r.width * (RIDGE[11][0] - RIDGE[0][0]) + r.width * 0.04;
    var cssH = r.height * (0.6267 - 0.0767) + r.height * 2.1 + r.height * 0.15;

    // Only resize the backing store when the geometry actually changed —
    // assigning canvas.width clears the canvas, which would erase the flame.
    var changed = Math.abs(cssW - W) > 0.5 || Math.abs(cssH - H) > 0.5;

    box = { left: r.left, top: r.top, width: r.width, height: r.height };

    canvas.style.left = left + 'px';
    canvas.style.top = top + 'px';
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';

    if (changed || !W) {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cssW;
      H = cssH;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    canvas.dataset.ox = left.toFixed(2);
    canvas.dataset.oy = top.toFixed(2);
    canvas.dataset.scale = (r.height / 300).toFixed(4);
    canvas.dataset.ll = r.left.toFixed(2);
    canvas.dataset.lt = r.top.toFixed(2);
    canvas.dataset.lw = r.width.toFixed(2);
    canvas.dataset.lh = r.height.toFixed(2);
  }

  function spawn() {
    if (!box) return;
    var scale = parseFloat(canvas.dataset.scale || '1');

    // Bias emission toward the apex, where a real flame runs hottest.
    var t = (Math.random() + Math.random()) / 2;
    t = Math.min(0.999, Math.max(0.001, t));

    var pt = ridgePoint(t);

    // Flames must not touch the glyph: lift the emission point above the ridge.
    var lift = 3.2 * scale + 1.4;

    // Lower points along the ridge (the A's legs) get taller, stronger tongues.
    // t is 0..1 across left foot → apex → right foot, so distance from the apex
    // (0.5) tells us how low we are.
    var fromApex = Math.abs(t - 0.5) / 0.5;          // 0 at apex, 1 at the feet
    var heightBoost = 1 + fromApex * 0.85;           // up to ~1.85x taller
    var sizeBoost = 1 + fromApex * 0.28;

    var sizeBase = (4.8 * scale + 1.6) * sizeBoost;

    parts.push({
      x: pt.x + (Math.random() - 0.5) * 1.6 * scale,
      y: pt.y - lift + (Math.random() - 0.5) * 0.8 * scale,
      vx: (Math.random() - 0.5) * 0.16 * scale,
      vy: -(0.55 + Math.random() * 0.55) * scale * (0.85 + fromApex * 0.35),
      life: 0,
      max: (56 + Math.random() * 54) * heightBoost,
      r: sizeBase * (0.7 + Math.random() * 0.8),
      wob: Math.random() * 6.283,
      wobAmp: (0.1 + Math.random() * 0.22) * scale,
      hot: Math.random()
    });
  }

  function tint(hot, a) {
    // Starts just lighter than the logo's cyan (0,192,240) and cools downward —
    // never white.
    if (hot < 0.25) return 'rgba(150, 236, 255, ' + a + ')';
    if (hot < 0.6) return 'rgba(80, 200, 255, ' + a + ')';
    return 'rgba(48, 128, 255, ' + a + ')';
  }

  function frame(t) {
    if (!W || !H || !box) {
      layout();
      requestAnimationFrame(frame);
      return;
    }
    var dt = last ? Math.min((t - last) / 16.67, 3) : 1;
    last = t;

    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';

    if (!reduce) for (var s = 0; s < 6.4 * dt; s++) spawn();

    for (var k = parts.length - 1; k >= 0; k--) {
      var p = parts[k];
      p.life += dt;
      p.wob += 0.09 * dt;
      p.x += (p.vx + Math.sin(p.wob) * p.wobAmp * 0.6) * dt;
      p.y += p.vy * dt;
      p.vy *= (1 - 0.006 * dt);
      p.r *= (1 - 0.0105 * dt);

      var f = p.life / p.max;
      if (f >= 1 || p.r < 0.35) { parts.splice(k, 1); continue; }

      var a = (f < 0.12 ? f / 0.12 : 1 - (f - 0.12) / 0.88);
      // Keep every particle translucent: with normal compositing a stack of
      // opaque particles would read as solid white where they overlap.
      a = a * a * 0.34;
      var hot = p.hot * (1 - f * 0.85);

      var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      g.addColorStop(0, tint(hot, a));
      g.addColorStop(0.5, tint(hot + 0.15, a * 0.55));
      g.addColorStop(1, tint(1, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 6.283);
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', layout);
  (function follow() { layout(); requestAnimationFrame(follow); })();
  if (document.readyState === 'complete') layout();
  else window.addEventListener('load', layout);

  // Test hook: render N frames without relying on rAF (headless throttles it).
  window.__flameTick = function (frames) {
    frames = frames || 60;
    for (var i = 0; i < frames; i++) frame(performance.now() + i * 16.7);
    return { count: parts.length, sample: parts.slice(0, 3).map(function (p) {
      return { x: +p.x.toFixed(1), y: +p.y.toFixed(1), r: +p.r.toFixed(2), life: +p.life.toFixed(1), max: +p.max.toFixed(1) };
    }) };
  };

  requestAnimationFrame(frame);
})();
