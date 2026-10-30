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
    var n = Math.floor(W * H / 2500);
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
      requestAnimationFrame(frame);
      return;
    }
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = 0.45;
    ctx.drawImage(galaxy, 0, 0, W, H);
    ctx.globalAlpha = 1;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var tw = reduce ? 1 : 0.6 + 0.4 * Math.sin(t / 1000 * s.s + s.p);
      ctx.globalAlpha = s.a * tw * 0.8;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, 6.283);
      ctx.fill();
    }
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
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', build);
  build();
  if (W && H) document.documentElement.classList.add('sky-active');
  requestAnimationFrame(frame);
})();
