/* Hero motion with no library: signal flow along the SVG paths, plus pointer and scroll parallax.
   Headline and content reveals are pure CSS, so they run even if this file fails. */
(function () {
  'use strict';
  var d = document, svg = d.getElementById('h-flow');
  if (!svg) return;
  var hero = d.querySelector('.h-hero'), stage = d.getElementById('h-stage');
  var sigs = [].slice.call(svg.querySelectorAll('.sig')), nodes = {};
  svg.querySelectorAll('[data-n]').forEach(function (n) { nodes[n.getAttribute('data-n')] = n; });

  /* ---- signal flow ---- */
  var DUR = 3.3, GAP = 0.55, CYCLE = DUR + GAP, DEST = ['t0', 't1', 't2', 't1'];
  var items = sigs.map(function (g, i) {
    var p = svg.querySelector('#' + g.getAttribute('data-r'));
    return { g: g, p: p, len: p.getTotalLength(), start: 0.9 + i * 1.0, fired: {}, dest: DEST[i], crm: g.classList.contains('sig--crm') };
  });
  /* visibility profile per signal: fade in, slip inside each node it passes through, fade out near the target */
  function ramp(t, pts) {                  // pts: [[time, opacity], ...] linear between points
    if (t <= pts[0][0]) return pts[0][1];
    for (var i = 1; i < pts.length; i++) if (t <= pts[i][0]) { var a = pts[i - 1], b = pts[i]; return a[1] + (b[1] - a[1]) * (t - a[0]) / (b[0] - a[0]); }
    return pts[pts.length - 1][1];
  }
  var MAIN = [[0, 0], [.25, 1], [.3, 1], [.4, 0], [.9, 0], [1.0, 1], [1.05, 1], [1.15, 0], [1.67, 0], [1.77, 1], [1.81, 1], [1.91, 0], [2.43, 0], [2.53, 1], [3.0, 1], [3.3, 0]];
  var CRM = [[0, 0], [.25, 1], [.3, 1], [.41, 0], [1.52, 0], [1.66, 1], [3.0, 1], [3.3, 0]];
  function opacity(t, it) { return ramp(t, it.crm ? CRM : MAIN); }
  var PULSES = [['web', 0], ['consent', .38], ['gtm', 1.15], ['sgtm', 1.91]];
  function pulse(key) {
    var n = nodes[key]; if (!n) return;
    n.classList.remove('pulse'); void n.getBoundingClientRect(); n.classList.add('pulse');
  }
  var running = true, t0 = performance.now(), paused = 0, lastHidden = 0;
  function frame(now) {
    if (running) {
      var t = (now - t0 - paused) / 1000;
      items.forEach(function (it) {
        var local = t - it.start;
        if (local < 0) return;
        var c = local % CYCLE, cycleNo = Math.floor(local / CYCLE);
        if (c > DUR) { it.g.style.opacity = 0; it.cycle = -1; return; }
        if (it.cycle !== cycleNo) { it.cycle = cycleNo; it.fired = {}; }
        var pt = it.p.getPointAtLength(it.len * (c / DUR));
        it.g.setAttribute('transform', 'translate(' + pt.x.toFixed(1) + ' ' + pt.y.toFixed(1) + ')');
        it.g.style.opacity = opacity(c, it).toFixed(2);
        (it.crm ? [['crm', 0], ['sgtm', 1.6]] : PULSES).forEach(function (k) { if (c >= k[1] && !it.fired[k[0]]) { it.fired[k[0]] = 1; pulse(k[0]); } });
        if (c >= 3.2 && !it.fired.end) { it.fired.end = 1; pulse(it.dest); }
      });
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  /* pause when the tab is hidden or the hero is off screen */
  var onScreen = true;
  function setRun(v) {
    if (v === running) return;
    running = v;
    if (!v) lastHidden = performance.now(); else paused += performance.now() - lastHidden;
  }
  d.addEventListener('visibilitychange', function () { setRun(!d.hidden && onScreen); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { onScreen = es[0].isIntersecting; hero.classList.toggle('h-paused', !onScreen); setRun(!d.hidden && onScreen); }).observe(stage);
  }

  /* ---- parallax (uses the independent `translate` property, so it never fights CSS animations) ---- */
  var photo = d.querySelector('.h-photo__in'), cons = d.querySelector('.h-console'), glow = d.querySelector('.h-glow i'), photoWrap = d.getElementById('h-photo'), glowBox = d.querySelector('.h-glow');
  var tx = 0, ty = 0, cx = 0, cy = 0, sy = 0, busy = false;
  function apply() {
    busy = false;
    cx += (tx - cx) * .08; cy += (ty - cy) * .08;
    if (photo) photo.style.translate = (cx * 26).toFixed(1) + 'px ' + (cy * 20).toFixed(1) + 'px';
    if (cons) cons.style.translate = (cx * -8).toFixed(1) + 'px ' + (cy * -6).toFixed(1) + 'px';
    if (glow) glow.style.translate = (cx * -60).toFixed(1) + 'px ' + (cy * -40).toFixed(1) + 'px';
    var s = Math.min(window.scrollY, 900);
    if (photoWrap) photoWrap.style.translate = '0 ' + (-s * .06).toFixed(1) + 'px';
    if (glowBox) glowBox.style.translate = '0 ' + (s * .12).toFixed(1) + 'px';
    if (Math.abs(tx - cx) > .002 || Math.abs(ty - cy) > .002) kick();
  }
  function kick() { if (!busy) { busy = true; requestAnimationFrame(apply); } }
  window.addEventListener('scroll', kick, { passive: true });
  if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width - .5; ty = (e.clientY - r.top) / r.height - .5; kick();
    }, { passive: true });
    hero.addEventListener('pointerleave', function () { tx = 0; ty = 0; kick(); });
  }
  kick();
})();
