/* Motion helpers: section transitions, number counters. Small, passive, and skipped entirely for reduced motion. */
(function () {
  'use strict';
  var d = document, root = d.documentElement, reduce = false; /* animations are always on */
  var hasIO = 'IntersectionObserver' in window;



  /* jump arrows: a bouncing button at the end of each section that scrolls to the next one */
  (function () {
    var secs = [].slice.call(d.querySelectorAll('.h-hero, .h-strip, .h-sec, .h-final'));
    secs.forEach(function (s, i) {
      var next = secs[i + 1]; if (!next || s.classList.contains('h-final')) return;
      var label = (next.querySelector('.h-sec__rail span') || next.querySelector('h2')); var name = label ? label.textContent.replace(/^\s*\d+\s*\/\s*/, '').trim() : 'next section';
      var b = d.createElement('button'); b.type = 'button'; b.className = 'jump' + (s.classList.contains('h-hero') ? ' jump--hero' : '');
      b.setAttribute('aria-label', 'Jump to the next section: ' + name);
      b.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      b.addEventListener('click', function () { next.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
      s.appendChild(b);
    });
  })();

  /* split section headings into words so each word rises out of a mask (staggered) */
  d.querySelectorAll('.h-h2.reveal, .cs-h2.reveal, .h-display--m.reveal').forEach(function (h) {
    var n = 0;
    (function walk(node) {
      [].slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var parts = c.textContent.split(/(\s+)/), frag = d.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(d.createTextNode(' ')); return; }
            var w = d.createElement('span'), i = d.createElement('span');
            w.className = 'w'; i.className = 'wi'; i.style.setProperty('--wi', n++); i.textContent = p; w.appendChild(i); frag.appendChild(w);
          });
          c.parentNode.replaceChild(frag, c);
        } else if (c.nodeType === 1) walk(c);
      });
    })(h);
    h.classList.add('split');
  });

  /* scroll progress line */
  var bar = d.getElementById('scroll-progress'), ticking = false;
  if (bar) {
    var up = function () { ticking = false; var h = root.scrollHeight - window.innerHeight; bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, window.scrollY / h) : 0).toFixed(4) + ')'; };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(up); } }, { passive: true });
    up();
  }

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
  /* diagram: boxes light up one after another when it scrolls into view */
  d.querySelectorAll('.cs-flow[data-lit]').forEach(function (fl) {
    var st = [].slice.call(fl.querySelectorAll('.cs-flow__s'));
    if (reduce || !hasIO) { st.forEach(function (x) { x.classList.add('on'); }); return; }
    var o = new IntersectionObserver(function (es) { if (!es[0].isIntersecting) return; o.disconnect(); st.forEach(function (x, i) { setTimeout(function () { x.classList.add('on'); }, i * 380); }); }, { threshold: 0.4 });
    o.observe(fl);
  });

  /* scroll timeline: a thin line fills and each step lights up as it is reached */
  var tl = d.querySelector('[data-timeline]');
  if (tl) {
    var li = [].slice.call(tl.children), tick = false;
    var upd = function () {
      tick = false;
      var r = tl.getBoundingClientRect(), vh = window.innerHeight, line = vh * 0.62;
      tl.style.setProperty('--p', Math.max(0, Math.min(1, (line - r.top) / r.height)).toFixed(3));
      li.forEach(function (x) { x.classList.toggle('on', reduce || x.getBoundingClientRect().top < line - 12); });
    };
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    window.addEventListener('resize', upd); upd();
  }

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
