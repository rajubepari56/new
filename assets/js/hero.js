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
  var DUR = 3.3, GAP = 0.55, CYCLE = DUR + GAP, DEST = ['t0', 't1', 't2'];
  var items = sigs.map(function (g, i) {
    var p = svg.querySelector('#' + g.getAttribute('data-r'));
    return { g: g, p: p, len: p.getTotalLength(), start: 0.9 + i * 1.25, fired: {}, dest: DEST[i] };
  });
  function opacity(t) {            // 0..DUR: fade in, slip inside GTM and Server GTM, fade out near the target
    if (t < .25) return t / .25;
    if (t < .52) return 1;
    if (t < .62) return 1 - (t - .52) / .1;
    if (t < 1.1) return 0;
    if (t < 1.24) return (t - 1.1) / .14;
    if (t < 1.62) return 1;
    if (t < 1.72) return 1 - (t - 1.62) / .1;
    if (t < 2.2) return 0;
    if (t < 2.34) return (t - 2.2) / .14;
    if (t < 3.0) return 1;
    return Math.max(0, 1 - (t - 3.0) / .3);
  }
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
        it.g.style.opacity = opacity(c).toFixed(2);
        [['web', 0], ['gtm', .62], ['sgtm', 1.72]].forEach(function (k) { if (c >= k[1] && !it.fired[k[0]]) { it.fired[k[0]] = 1; pulse(k[0]); } });
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
