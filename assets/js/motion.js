/* Motion helpers: section transitions, number counters. Small, passive, and skipped entirely for reduced motion. */
(function () {
  'use strict';
  var d = document, root = d.documentElement, reduce = root.classList.contains('rm');
  var hasIO = 'IntersectionObserver' in window;

  /* section entrance: hairline draws across and the rail label lights up */
  var secs = d.querySelectorAll('.h-sec, .h-final, .cs-sec');
  if (!hasIO || reduce) secs.forEach(function (s) { s.classList.add('in-view'); });
  else {
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in-view'); so.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });
    secs.forEach(function (s) { so.observe(s); });
  }

  /* counters: only elements that carry a real number (data-count or data-ct). Text such as "4x", "+120%", "A$0.20", "200+" keeps its prefix and suffix. */
  if (reduce || !hasIO) return;
  var RE = /^(\D*?)(\d[\d,]*(?:\.\d+)?)(.*)$/;
  function fmt(v, dec, commas) {
    var s = v.toFixed(dec);
    return commas ? Number(s).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) : s;
  }
  var co = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      co.unobserve(e.target);
      var el = e.target, m = el._m, t0 = performance.now(), dur = 900;
      (function step(t) {
        var k = Math.min(1, (t - t0) / dur); k = 1 - Math.pow(1 - k, 3);
        el.textContent = m.pre + fmt(m.end * k, m.dec, m.commas) + m.suf;
        if (k < 1) requestAnimationFrame(step); else el.textContent = m.final;
      })(t0);
    });
  }, { threshold: 0.6 });
  d.querySelectorAll('[data-count], [data-ct]').forEach(function (el) {
    var txt = el.textContent.trim(), p = txt.match(RE);
    if (!p) return;
    var raw = p[2], end = parseFloat(raw.replace(/,/g, ''));
    if (!isFinite(end) || end === 0) return;
    el._m = { pre: p[1], suf: p[3], end: end, dec: (raw.split('.')[1] || '').length, commas: raw.indexOf(',') > -1, final: txt };
    el.textContent = el._m.pre + fmt(0, el._m.dec, el._m.commas) + el._m.suf;
    co.observe(el);
  });
})();
