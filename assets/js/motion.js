/* Motion helpers: section transitions, number counters. Small, passive, and skipped entirely for reduced motion. */
(function () {
  'use strict';
  var d = document, root = d.documentElement, reduce = false; /* animations are always on */
  var hasIO = 'IntersectionObserver' in window;




  /* chat prompt: opens by itself a moment after the page loads with one small question; the cross closes it for a week */
  (function () {
    var ask = d.getElementById('msgw-ask'), x = d.getElementById('msgw-ask-x'), more = d.getElementById('msgw-ask-more'), btn = d.getElementById('msgw-btn');
    if (!ask || /^\/(contact|thank-you)\//.test(location.pathname)) return;
    var KEY = 'rb_ask';
    try { var t = +localStorage.getItem(KEY); if (t && Date.now() - t < 7 * 864e5) return; } catch (e) {}
    function close(remember) { ask.hidden = true; if (remember) { try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {} } }
    setTimeout(function () { var panel = d.getElementById('msgw-panel'); if (panel && !panel.hidden) return; ask.hidden = false; }, 2500);
    x.addEventListener('click', function () { close(true); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !ask.hidden) { close(true); btn && btn.focus(); } });
    ask.addEventListener('click', function (e) { if (e.target.closest('.msgw__chips a')) close(true); });
    more.addEventListener('click', function () { close(true); if (btn) btn.click(); });
    if (btn) btn.addEventListener('click', function () { close(false); });
  })();


  /* Calendly: loaded only when someone asks for it (no third-party cookies before that) */
  var calLoad = null;
  function loadCalendly() {
    if (window.Calendly) return Promise.resolve();
    if (calLoad) return calLoad;
    calLoad = new Promise(function (res, rej) {
      var l = d.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://assets.calendly.com/assets/external/widget.css'; d.head.appendChild(l);
      var s = d.createElement('script'); s.src = 'https://assets.calendly.com/assets/external/widget.js'; s.async = true; s.onload = res; s.onerror = function () { calLoad = null; rej(); }; d.head.appendChild(s);
    });
    return calLoad;
  }
  d.addEventListener('click', function (e) {
    var a = e.target.closest('[data-calendly]'); if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    var url = a.getAttribute('data-calendly'), fallback = setTimeout(function () { window.open(url, '_blank', 'noopener'); }, 4000);
    loadCalendly().then(function () { clearTimeout(fallback); window.Calendly.initPopupWidget({ url: url }); }).catch(function () { clearTimeout(fallback); window.open(url, '_blank', 'noopener'); });
  });
  /* inline calendar on the contact page: appears when the visitor asks for it */
  var calBtn = d.getElementById('cal-load');
  if (calBtn) calBtn.addEventListener('click', function () {
    var box = d.getElementById('cal-embed'), url = box.getAttribute('data-url'); calBtn.disabled = true; calBtn.textContent = 'Loading the calendar...';
    loadCalendly().then(function () { box.innerHTML = ''; var h = d.createElement('div'); h.style.cssText = 'min-width:320px;height:700px'; box.appendChild(h); window.Calendly.initInlineWidget({ url: url, parentElement: h }); })
      .catch(function () { box.innerHTML = '<p>The calendar could not load. <a href="' + url + '" target="_blank" rel="noopener">Open it in a new tab</a>.</p>'; });
  });

  /* booking banner: a full-screen booking message that returns every 30 seconds with a different message each time.
     It waits while the chat panel is open, stays off the contact and thank-you pages, and stops for 30 days after a booking click. */
  (function () {
    var bk = d.getElementById('bk'); if (!bk || /^\/(contact|thank-you)\//.test(location.pathname)) return;
    var DONE = 'rb_bk_done', N = 'rb_bk_i', EVERY = 30000;
    try { var t = +localStorage.getItem(DONE); if (t && Date.now() - t < 30 * 864e5) return; } catch (e) {}
    var M = [
      ['Free 30-minute tracking audit', 'How much budget is bad tracking wasting this month?', 'Every week without accurate data is another week of ad decisions made blind. In a free call I show you what to fix first.', 'Book my free 30-minute audit'],
      ['Quick question', 'Do your Google Ads and GA4 numbers match?', 'If they do not, Smart Bidding is learning from the wrong data. A 30-minute call is enough to find out where they split.', 'Check my numbers with Raju'],
      ['Before you spend another dollar', 'Is Google Ads really bringing you customers?', 'Missing or duplicate conversions make good campaigns look bad. Let me look at your account with you and show you what is real.', 'Book a free call'],
      ['Straight talk', 'Losing sales to ad blockers and iOS?', 'Server-side tracking can recover signals the browser drops. I can tell you in one call whether it fits your setup.', 'See if it fits my site'],
      ['No pitch, no obligation', 'Pick a time. I will bring the questions.', 'You choose a slot on my calendar. I review your tracking beforehand and tell you plainly what is broken and what to fix first.', 'Choose my time slot'],
      ['One specialist, one call', 'Talk to the person who will actually do the work.', 'No account managers and no hand-offs. You speak with me directly, and I reply to every message myself.', 'Book my free audit']
    ];
    var eb = d.querySelector('.bk__eyebrow'), ti = d.getElementById('bk-t'), de = d.getElementById('bk-d'), cta = d.getElementById('bk-cta'), x = d.getElementById('bk-x'), no = d.getElementById('bk-no'), prev = null, timer = null;
    function idx() { try { return +sessionStorage.getItem(N) || 0; } catch (e) { return 0; } }
    function schedule(ms) { clearTimeout(timer); timer = setTimeout(show, ms); }
    function show() {
      if (!bk.hidden) return;
      var panel = d.getElementById('msgw-panel');
      if ((panel && !panel.hidden) || d.hidden) return schedule(5000);   // never stack on the chat panel or run in a background tab
      var i = idx(), m = M[i % M.length]; try { sessionStorage.setItem(N, String(i + 1)); } catch (e) {}
      eb.textContent = m[0]; ti.textContent = m[1]; de.textContent = m[2]; cta.textContent = m[3];
      var ask = d.getElementById('msgw-ask'); if (ask && !ask.hidden) ask.hidden = true;
      prev = d.activeElement; bk.hidden = false; d.documentElement.classList.add('bk-open');
      setTimeout(function () { cta.focus({ preventScroll: true }); }, 60);
    }
    function close() {
      bk.hidden = true; d.documentElement.classList.remove('bk-open');
      if (prev && prev.focus) try { prev.focus({ preventScroll: true }); } catch (e) {}
      schedule(EVERY);
    }
    schedule(EVERY);
    x.addEventListener('click', close); no.addEventListener('click', close);
    bk.addEventListener('click', function (e) { if (e.target === bk) close(); });
    cta.addEventListener('click', function () { clearTimeout(timer); bk.hidden = true; d.documentElement.classList.remove('bk-open'); try { localStorage.setItem(DONE, String(Date.now())); } catch (e) {} });
    d.addEventListener('keydown', function (e) {
      if (bk.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') { var f = [x, cta, no], a = d.activeElement, k = f.indexOf(a); e.preventDefault(); f[(k + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus(); }
    });
  })();

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

  /* floating jump arrow: follows you down the page and jumps to the next section */
  (function () {
    var secs = [].slice.call(d.querySelectorAll('.h-sec, .h-strip, .h-final')); if (secs.length < 3) return;
    var b = d.createElement('button'); b.type = 'button'; b.className = 'jump jump--float'; b.setAttribute('data-off', '');
    b.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    d.body.appendChild(b); var target = null, ticking = false;
    b.addEventListener('click', function () { if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    function upd() {
      ticking = false; var vh = innerHeight, t = null;
      for (var i = 0; i < secs.length - 1; i++) { var r = secs[i].getBoundingClientRect(); if (r.top < vh * .5 && r.bottom > vh * .5) { t = secs[i + 1]; if (r.bottom < vh + 40) t = null; break; } }
      target = t; if (t) { b.removeAttribute('data-off'); b.setAttribute('aria-label', 'Jump to the next section'); } else b.setAttribute('data-off', '');
      b.tabIndex = t ? 0 : -1;
    }
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true }); upd();
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
