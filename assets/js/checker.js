/* Free tracking checker: sends the address to /api/scan and renders what the server could see. */
(function () {
  var d = document, forms = [].slice.call(d.querySelectorAll('form[data-checker]')); if (!forms.length) return;
  var BOOK = (d.querySelector('[data-calendly]') || {}).getAttribute && d.querySelector('[data-calendly]').getAttribute('data-calendly');
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function push(e, o) { (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: e }, o || {})); }
  function render(out, j) {
    var found = j.tags.filter(function (t) { return t.ok; }), miss = j.tags.filter(function (t) { return !t.ok; });
    var core = ['gtm', 'ga4', 'ads', 'consent'], got = core.filter(function (k) { return found.some(function (t) { return t.key === k; }); }).length;
    var host = ''; try { host = new URL(j.page).hostname; } catch (e) {}
    var h = '<div class="tcr__head"><div><p class="mono tcr__k">Scanned</p><h2 class="tcr__h">' + esc(host) + '</h2>' + (j.platform ? '<p class="muted">Looks like a ' + esc(j.platform) + ' site.</p>' : '') + '</div>' +
      '<div class="tcr__score"><b>' + got + '/4</b><span>core signals found</span></div></div>';
    h += '<h3 class="tcr__sub">Detected</h3><ul class="tcr__list">' + (found.length ? found.map(function (t) { return '<li class="ok"><span class="tcr__i" aria-hidden="true">&#10003;</span><div><b>' + esc(t.name) + '</b>' + (t.detail ? '<small class="mono">' + esc(t.detail) + '</small>' : '') + '</div></li>'; }).join('') : '<li class="no"><span class="tcr__i" aria-hidden="true">!</span><div><b>No tracking tags were visible</b><small>Either nothing is installed, or it loads in a way I cannot see from outside.</small></div></li>') + '</ul>';
    h += '<h3 class="tcr__sub">Not detected</h3><ul class="tcr__list tcr__list--miss">' + miss.map(function (t) { return '<li><span class="tcr__i" aria-hidden="true">&ndash;</span><div><b>' + esc(t.name) + '</b></div></li>'; }).join('') + '</ul>';
    if (j.notes.length) h += '<h3 class="tcr__sub">What I would look at first</h3><ol class="tcr__notes">' + j.notes.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '</ol>';
    h += '<p class="mono h-note">' + esc(j.limits) + '</p>';
    h += '<div class="tcr__cta"><p><b>Want me to check it properly?</b> In a free 30-minute call I test every event, compare it with your real leads and sales, and show you what to fix first.</p>' +
      (BOOK ? '<a class="btn btn--wa btn--lg" href="' + esc(BOOK) + '" target="_blank" rel="noopener" data-event="booking_click" data-link-location="tracker_result" data-calendly="' + esc(BOOK) + '">Book my free audit</a>' : '<a class="btn btn--wa btn--lg" href="/contact/">Get a free audit</a>') + '</div>';
    out.innerHTML = h; out.hidden = false; var idle = d.getElementById('tc-idle'); if (idle) idle.hidden = true;
    try { out.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {}
  }
  function fail(out, msg, offline) {
    out.innerHTML = '<div class="tcr__err"><b>' + esc(msg) + '</b>' + (offline ? '<p class="muted">The live scanner is not available on this version of the site. Send me your address and I will check it by hand.</p><a class="btn btn--wa btn--lg" href="/contact/">Request a manual check</a>' : '') + '</div>';
    out.hidden = false; var idle = d.getElementById('tc-idle'); if (idle) idle.hidden = true;
  }
  forms.forEach(function (f) {
    var id = f.getAttribute('data-checker'), inp = d.getElementById(id + '-url'), err = d.getElementById(id + '-err'), btn = f.querySelector('button'), busy = false;
    var onPage = !!d.getElementById('tc-out');
    function run(url) {
      var out = d.getElementById('tc-out'); if (!out || busy) return; busy = true; err.hidden = true;
      btn.disabled = true; var lab = btn.textContent; btn.textContent = 'Scanning…';
      out.hidden = false; out.innerHTML = '<p class="tcr__load" role="status"><i></i>Scanning your page and Tag Manager container…</p>';
      push('tracker_scan_start');
      fetch('/api/scan', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url: url }) })
        .then(function (r) { var ct = r.headers.get('content-type') || ''; if (!/json/.test(ct)) throw new Error('offline'); return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (x) { if (!x.ok) { fail(out, x.j.error || 'The scan failed.'); push('tracker_scan_error'); } else { render(out, x.j); push('tracker_scan_done', { tags_found: x.j.tags.filter(function (t) { return t.ok; }).length }); } })
        .catch(function (e) { fail(out, 'The scanner could not be reached.', true); push('tracker_scan_error'); })
        .then(function () { busy = false; btn.disabled = false; btn.textContent = lab; });
    }
    f.addEventListener('submit', function (e) {
      var v = inp.value.trim();
      if (!v || !/[.]/.test(v)) { e.preventDefault(); err.textContent = 'Enter your website address, like yourwebsite.com.'; err.hidden = false; inp.focus(); return; }
      if (onPage) { e.preventDefault(); history.replaceState(null, '', '/tracking-checker/?url=' + encodeURIComponent(v)); run(v); }
      /* on the home page the form submits normally to /tracking-checker/?url=… which starts the scan on load */
    });
    if (onPage) { var q = new URLSearchParams(location.search).get('url'); if (q) { inp.value = q; run(q); } }
  });
})();
