/* Free tracking checker: sends the address to /api/scan and renders tags, events, problems and a recommended-next-steps teaser. */
(function () {
  var d = document, forms = [].slice.call(d.querySelectorAll('form[data-checker]')); if (!forms.length) return;
  var BOOK = (d.querySelector('[data-calendly]') || {}).getAttribute && d.querySelector('[data-calendly]').getAttribute('data-calendly');
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function push(e, o) { (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: e }, o || {})); }
  var ICON = { ok: '&#10003;', bad: '!', warn: '!', info: 'i', no: '&times;' };
  function render(out, j, idle) {
    var found = j.tags.filter(function (t) { return t.ok; }), miss = j.tags.filter(function (t) { return !t.ok; });
    var core = ['gtm', 'ga4', 'ads', 'consent'], got = core.filter(function (k) { return found.some(function (t) { return t.key === k; }); }).length;
    var evOk = j.events.filter(function (e) { return e.ok; }).length, host = ''; try { host = new URL(j.page).hostname; } catch (e) {}
    var h = '<div class="tcr__head"><div><p class="mono tcr__k">Scanned</p><h2 class="tcr__h">' + esc(host) + '</h2>' + '<p class="muted">' + (j.platform ? 'Looks like a ' + esc(j.platform) + ' site. ' : '') + 'Checked as ' + (j.siteType === 'store' ? 'an online store' : 'a service website') + '' + '.</p>' + '</div>' +
      '<div class="tcr__score"><b>' + got + '/4</b><span>core signals</span></div><div class="tcr__score"><b>' + evOk + '/' + j.events.length + '</b><span>key events</span></div></div>';
    if (j.incomplete) h += '<div class="tcr__inc" role="status"><b>Scan may be incomplete.</b> ' + esc(j.incomplete) + ' Treat the results below as a starting point, or book a call and I will check the live site properly.</div>';
    h += '<h3 class="tcr__sub">Events</h3><div class="tcr__tw"><table class="tcr__ev"><thead><tr><th>Event</th><th>What it tracks</th><th>GA4 / GTM</th><th>Meta</th><th>ChatGPT Ads</th><th>Status</th></tr></thead><tbody>' +
      j.events.map(function (e) { return '<tr><td><code>' + esc(e.name) + '</code></td><td>' + esc(e.label) + '</td><td>' + (e.ga4 ? '<i class="y">&#10003;</i>' : '<i class="n">&ndash;</i>') + '</td><td>' + (e.meta ? '<i class="y">&#10003;</i>' : '<i class="n">&ndash;</i>') + '</td><td>' + (e.chatgpt ? '<i class="y">&#10003;</i>' : '<i class="n">&ndash;</i>') + '</td><td><span class="tcr__st ' + (e.ok ? 'is-ok' : 'is-no') + '">' + (e.ok ? 'Set up' : 'Not found') + '</span></td></tr>'; }).join('') + '</tbody></table></div>';
    if (j.chatgptEvents && j.chatgptEvents.length) h += '<p class="tcr__custom"><b>ChatGPT Ads events I can see:</b> ' + j.chatgptEvents.map(function (c) { return '<code>' + esc(c) + '</code>'; }).join(' ') + '</p>';
    if (j.custom && j.custom.length) h += '<p class="tcr__custom"><b>Other events I can see:</b> ' + j.custom.map(function (c) { return '<code>' + esc(c) + '</code>'; }).join(' ') + '</p>';
    if (j.issues.length) h += '<h3 class="tcr__sub">Problems and warnings</h3><ul class="tcr__issues">' + j.issues.map(function (i) { return '<li class="is-' + i.level + '"><span class="tcr__i" aria-hidden="true">' + ICON[i.level] + '</span><div><b>' + esc(i.title) + '</b><p>' + esc(i.text) + '</p></div></li>'; }).join('') + '</ul>';
    h += '<h3 class="tcr__sub">Tags detected</h3><ul class="tcr__list">' + (found.length ? found.map(function (t) { return '<li class="ok"><span class="tcr__i" aria-hidden="true">&#10003;</span><div><b>' + esc(t.name) + '</b>' + (t.detail ? '<small class="mono">' + esc(t.detail) + '</small>' : '') + '</div></li>'; }).join('') : '<li class="no"><span class="tcr__i" aria-hidden="true">!</span><div><b>No tracking tags were visible</b><small>Either nothing is installed, or it loads in a way I cannot see from outside.</small></div></li>') + '</ul>';
    h += '<h3 class="tcr__sub">Not detected</h3><ul class="tcr__list tcr__list--miss">' + miss.map(function (t) { return '<li><span class="tcr__i" aria-hidden="true">&ndash;</span><div><b>' + esc(t.name) + '</b></div></li>'; }).join('') + '</ul>';
    /* recommended next steps, shown after the detection lists */
    if (j.recommended && j.recommended.length) {
      h += '<div class="tcr__rec"><p class="tcr__rec-t"><span class="tcr__badge">Recommended</span> ' + j.recommended.length + ' thing' + (j.recommended.length > 1 ? 's' : '') + ' worth setting up first</p><ul>' +
        j.recommended.map(function (r) { return '<li><code>' + esc(r.name) + '</code><span>' + esc(r.label) + '</span></li>'; }).join('') + '</ul>' +
        '<p class="tcr__rec-s">I can set these up and test each one. <a href="#' + (idle ? 'tc' : 'hc') + '-cta" class="tcr__rec-a">See how &darr;</a></p></div>';
    } else h += '<div class="tcr__rec tcr__rec--good"><p class="tcr__rec-t"><span class="tcr__badge tcr__badge--ok">Looks complete</span> The key events are visible. A full audit checks that each one fires correctly and matches your real leads.</p></div>';
    h += '<p class="mono h-note">' + esc(j.limits) + '</p>';
    h += '<div class="tcr__cta" id="' + (idle ? 'tc' : 'hc') + '-cta"><p><b>Want me to check it properly?</b> In a free 30-minute call I test every event, compare it with your real leads and sales, and show you what to fix first.</p>' +
      (BOOK ? '<a class="btn btn--wa btn--lg" href="' + esc(BOOK) + '" target="_blank" rel="noopener" data-event="booking_click" data-link-location="tracker_result" data-calendly="' + esc(BOOK) + '">Book my free audit</a>' : '<a class="btn btn--wa btn--lg" href="/contact/">Get a free audit</a>') + '</div>';
    out.innerHTML = h; out.hidden = false; if (idle) idle.hidden = true;
    try { out.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {}
  }
  function fail(out, msg, offline, idle) {
    out.innerHTML = '<div class="tcr__err"><b>' + esc(msg) + '</b>' + (offline ? '<p class="muted">The live scanner is not available on this version of the site. Send me your address and I will check it by hand.</p><a class="btn btn--wa btn--lg" href="/contact/">Request a manual check</a>' : '') + '</div>';
    out.hidden = false; if (idle) idle.hidden = true;
  }
  forms.forEach(function (f) {
    var id = f.getAttribute('data-checker'), inp = d.getElementById(id + '-url'), err = d.getElementById(id + '-err'), btn = f.querySelector('button'), busy = false;
    var out = d.getElementById(id + '-out'), idle = d.getElementById(id + '-idle'); if (!out) return;
    function run(url) {
      var type = f.querySelector('input[name=type]:checked').value;
      if (busy) return; busy = true; err.hidden = true;
      btn.disabled = true; var lab = btn.textContent; btn.textContent = 'Scanning…';
      out.hidden = false; out.innerHTML = '<p class="tcr__load" role="status"><i></i>Scanning your page and Tag Manager container…</p>';
      push('tracker_scan_start', { link_location: id });
      fetch('/api/scan', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url: url, type: type }) })
        .then(function (r) { var ct = r.headers.get('content-type') || ''; if (!/json/.test(ct)) throw new Error('offline'); return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (x) { if (!x.ok) { fail(out, x.j.error || 'The scan failed.', false, idle); push('tracker_scan_error'); } else { render(out, x.j, idle); push('tracker_scan_done', { tags_found: x.j.tags.filter(function (t) { return t.ok; }).length, events_found: x.j.events.filter(function (e) { return e.ok; }).length }); } })
        .catch(function () { fail(out, 'The scanner could not be reached.', true, idle); push('tracker_scan_error'); })
        .then(function () { busy = false; btn.disabled = false; btn.textContent = lab; });
    }
    f.addEventListener('submit', function (e) {
      e.preventDefault(); var v = inp.value.trim();
      if (!v || !/[.]/.test(v)) { err.textContent = 'Enter your website address, like yourwebsite.com.'; err.hidden = false; inp.focus(); return; }
      if (!f.querySelector('input[name=type]:checked')) { err.textContent = 'Choose Service website or Online store first.'; err.hidden = false; return; }
      run(v);
    });
    var q = new URLSearchParams(location.search).get('url'); if (q && id === 'tc') { inp.value = q; var dr = f.querySelector('input[name=type][value=leads]'); if (dr) dr.checked = true; run(q); }
  });
})();
