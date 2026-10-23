/* Hero geodesic wireframe sphere: rotates slowly and tilts toward the cursor. Canvas 2D, no dependencies. */
(function () {
  var cv = document.getElementById('h-geo'); if (!cv) return;
  var ctx = cv.getContext('2d'), dpr = Math.min(2, window.devicePixelRatio || 1), W = 0, H = 0, vis = true;
  /* icosphere: subdivide an icosahedron twice and project to the unit sphere */
  var t = (1 + Math.sqrt(5)) / 2, V = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]];
  var F = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
  function norm(v) { var l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; }
  V = V.map(norm);
  for (var lvl = 0; lvl < 2; lvl++) {
    var cache = {}, nf = [];
    var mid = function (a, b) { var k = a < b ? a + '_' + b : b + '_' + a; if (cache[k] !== undefined) return cache[k]; var m = norm([(V[a][0] + V[b][0]) / 2, (V[a][1] + V[b][1]) / 2, (V[a][2] + V[b][2]) / 2]); V.push(m); return (cache[k] = V.length - 1); };
    F.forEach(function (f) { var a = mid(f[0], f[1]), b = mid(f[1], f[2]), c = mid(f[2], f[0]); nf.push([f[0], a, c], [f[1], b, a], [f[2], c, b], [a, b, c]); });
    F = nf;
  }
  var E = {}; F.forEach(function (f) { [[f[0], f[1]], [f[1], f[2]], [f[2], f[0]]].forEach(function (e) { E[e[0] < e[1] ? e[0] + '_' + e[1] : e[1] + '_' + e[0]] = e; }); });
  E = Object.keys(E).map(function (k) { return E[k]; });
  var rotY = 0, tx = 0, ty = 0, cx = 0, cy = 0, mx = 0, my = 0;
  function size() { var r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function frame() {
    requestAnimationFrame(frame); if (!vis || document.hidden) return;
    rotY += 0.0028; cx += (tx - cx) * 0.045; cy += (ty - cy) * 0.045;   /* ease toward the cursor */
    var ax = cy * 0.55, ay = rotY + cx * 0.7, sx = Math.sin(ax), cxn = Math.cos(ax), sy = Math.sin(ay), cyn = Math.cos(ay);
    var R = Math.min(W, H) * 0.46, ox = W * 0.5, oy = H * 0.5;
    var P = V.map(function (v) { var x = v[0] * cyn + v[2] * sy, z = -v[0] * sy + v[2] * cyn, y = v[1] * cxn - z * sx; z = v[1] * sx + z * cxn; var s = 1 / (1 - z * 0.28); return [ox + x * R * s, oy + y * R * s, z]; });
    ctx.clearRect(0, 0, W, H); ctx.lineWidth = 1;
    E.forEach(function (e) { var a = P[e[0]], b = P[e[1]], d = (a[2] + b[2]) / 2; ctx.strokeStyle = 'rgba(139,143,255,' + (0.12 + (d + 1) * 0.3).toFixed(3) + ')'; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); });
    P.forEach(function (p, i) { if (p[2] < -0.2) return; ctx.fillStyle = i % 9 === 0 ? 'rgba(251,188,5,' + (0.5 + p[2] * 0.4) + ')' : 'rgba(183,186,255,' + (0.25 + p[2] * 0.4) + ')'; ctx.beginPath(); ctx.arc(p[0], p[1], i % 9 === 0 ? 2.6 : 1.6, 0, 6.283); ctx.fill(); });
  }
  addEventListener('mousemove', function (e) { var r = cv.getBoundingClientRect(); tx = Math.max(-1.4, Math.min(1.4, (e.clientX - (r.left + r.width / 2)) / innerWidth * 2.2)); ty = Math.max(-1.4, Math.min(1.4, (e.clientY - (r.top + r.height / 2)) / innerHeight * 2.2)); }, { passive: true });
  addEventListener('resize', size);
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }).observe(cv);
  size(); frame();
})();
