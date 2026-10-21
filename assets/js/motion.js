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

  /* booking banner: opens twice per visit. First 10 seconds after landing, then again when the visitor moves the mouse
     toward the browser's close/tab area (desktop) or 60 seconds after the first one closes (touch devices). */
  (function () {
    var bk = d.getElementById('bk'); if (!bk || /^\/(contact|thank-you)\//.test(location.pathname)) return;
    var DONE = 'rb_bk_done', COUNT = 'rb_bk_n', MAX = 2, fired = { timer: false, second: false };
    try { var t = +localStorage.getItem(DONE); if (t && Date.now() - t < 30 * 864e5) return; } catch (e) {}
    function count() { try { return +sessionStorage.getItem(COUNT) || 0; } catch (e) { return 0; } }
    function show() {
      if (count() >= MAX || !bk.hidden) return false;
      var ask = d.getElementById('msgw-ask'), panel = d.getElementById('msgw-panel');
      if (ask && !ask.hidden) ask.hidden = true;                     // the booking question takes priority over the chat prompt
      if (panel && !panel.hidden) return false;
      bk.hidden = false; try { sessionStorage.setItem(COUNT, String(count() + 1)); } catch (e) {}
      return true;
    }
    function close() { bk.hidden = true; if (touch && count() < MAX && !fired.second) { fired.second = true; setTimeout(show, 60000); } }
    var touch = !matchMedia('(hover:hover) and (pointer:fine)').matches;
    /* 1st: 10 seconds after landing */
    setTimeout(function () { if (!fired.timer) { fired.timer = true; if (!show()) setTimeout(function () { show(); }, 3000); } }, 10000);
    /* 2nd (desktop): the mouse leaves through the top edge, where the tabs and the close button are */
    if (!touch) d.addEventListener('mouseout', function (e) {
      if (!e.relatedTarget && e.clientY < 8 && !fired.second && fired.timer) { if (show()) fired.second = true; }
      else if (!e.relatedTarget && e.clientY < 8 && !fired.timer) { fired.timer = true; show(); }
    });
    d.getElementById('bk-x').addEventListener('click', close); d.getElementById('bk-no').addEventListener('click', close);
    d.getElementById('bk-cta').addEventListener('click', function () { bk.hidden = true; try { localStorage.setItem(DONE, String(Date.now())); } catch (e) {} });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !bk.hidden) close(); });
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
  /* scroll traveler: a glowing signal rides a rail down the page with your scroll and hops into each new section */
  (function () {
    var d = document;
    var all = [].slice.call(d.querySelectorAll('main section, .h-hero, .h-strip, .h-final'));
    var secs = all.filter(function (s, i, a) { return !a.some(function (o) { return o !== s && o.contains(s); }) && s.offsetHeight > 120; });
    if (secs.length < 3) return;
    var rail = d.createElement('div'); rail.className = 'trv'; rail.setAttribute('aria-hidden', 'true');
    rail.innerHTML = '<i class="trv__line"></i><i class="trv__fill"></i>' + secs.map(function () { return '<b class="trv__dot"></b>'; }).join('') + '<span class="trv__orb"><u></u></span>';
    d.body.appendChild(rail);
    var orb = rail.querySelector('.trv__orb'), fill = rail.querySelector('.trv__fill'), dots = [].slice.call(rail.querySelectorAll('.trv__dot'));
    var cur = -1, last = scrollY, vel = 0, T0 = .14, T1 = .7, tops = [], max = 1, vh = innerHeight;
    function measure() {
      vh = innerHeight; max = Math.max(1, d.documentElement.scrollHeight - vh);
      tops = secs.map(function (s) { return s.getBoundingClientRect().top + scrollY; });
      dots.forEach(function (dt, i) { dt.style.top = ((T0 + Math.min(1, tops[i] / max) * (T1 - T0)) * 100) + '%'; });
    }
    function tick() {
      var y = scrollY, p = Math.min(1, y / max), top = (T0 + p * (T1 - T0)) * vh;
      vel += ((y - last) - vel) * .25; last = y;
      var sq = Math.min(1.9, 1 + Math.abs(vel) / 28);
      orb.style.transform = 'translate3d(0,' + top.toFixed(1) + 'px,0) scale(' + (1 / Math.sqrt(sq)).toFixed(3) + ',' + sq.toFixed(3) + ')';
      fill.style.height = (T0 * 100 + p * (T1 - T0) * 100) + 'vh'; fill.style.top = '0';
      var mid = y + vh * .45, idx = 0;
      for (var i = 0; i < tops.length; i++) if (tops[i] <= mid) idx = i;
      if (idx !== cur) {
        cur = idx; dots.forEach(function (dt, i) { dt.classList.toggle('on', i <= idx); });
        orb.classList.remove('hop'); void orb.offsetWidth; orb.classList.add('hop');
      }
      requestAnimationFrame(tick);
    }
    measure(); addEventListener('resize', measure); addEventListener('load', measure); setTimeout(measure, 1500);
    requestAnimationFrame(tick);
  })();

