/* Simulated live telemetry for the home page: a drifting-then-converging chart and a streaming event log. Everything is illustrative. */
(function () {
  var body = document.getElementById('lt-body'), svg = document.getElementById('lt-svg'); if (!body || !svg) return;
  var NS = 'http://www.w3.org/2000/svg', W = 600, H = 210, N = 70;
  var ev = [
    ['generate_lead', 'Web GTM', 'GA4 + Google Ads', 'ok', 'Form submit confirmed'],
    ['purchase', 'Server GTM', 'Google Ads + Meta CAPI', 'ok', 'Value and currency matched'],
    ['purchase', 'Server GTM', 'Meta CAPI', 'dd', 'Duplicate of browser pixel removed'],
    ['generate_lead', 'Server GTM', 'Google Ads', 'rec', 'Recovered after ad blocker'],
    ['whatsapp_click', 'Web GTM', 'GA4', 'ok', 'Click event with link location'],
    ['page_view', 'Web GTM', 'GA4', 'ok', 'Consent granted'],
    ['consent_update', 'Web GTM', 'All tags', 'ok', 'Consent Mode v2 state applied'],
    ['page_view', 'Web GTM', 'GA4', 'no', 'Held: analytics consent denied'],
    ['booking_click', 'Web GTM', 'GA4', 'ok', 'Calendly popup opened'],
    ['add_to_cart', 'Server GTM', 'Meta CAPI', 'rec', 'Recovered after iOS restriction']
  ];
  var label = { ok: 'SENT', rec: 'RECOVERED', dd: 'DEDUPED', no: 'HELD' }, n = 0, rep = [], ver = [], t = 0;
  function pad(x) { return x < 10 ? '0' + x : '' + x; }
  function clock() { var d = new Date(); return pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()); }
  function row() {
    var e = ev[Math.floor(Math.random() * ev.length)], tr = document.createElement('tr'); tr.className = 'new';
    [clock(), '<b>' + e[0] + '</b>', e[1], e[2], '<span class="st st--' + e[3] + '">' + label[e[3]] + '</span>', e[4]].forEach(function (c) { var td = document.createElement('td'); td.innerHTML = c; tr.appendChild(td); });
    body.insertBefore(tr, body.firstChild); while (body.children.length > 12) body.removeChild(body.lastChild);
    n++; document.getElementById('lt-k1').textContent = (38 + Math.round(Math.random() * 22));
    if (e[3] === 'rec') rec++; if (e[3] === 'dd') dd++;
    document.getElementById('lt-k2').textContent = rec; document.getElementById('lt-k3').textContent = dd;
  }
  var rec = 0, dd = 0;
  /* reported drifts above verified, the gap closes as tracking is fixed, then the cycle restarts */
  function point(i) { var phase = (i % 140) / 140, gap = Math.max(0, 1 - phase * 1.6) * 22 + 1.5; var base = 60 + Math.sin(i / 7) * 5 + (i % 140) * .08; return [base + gap + (Math.random() - .5) * 2.5, base + (Math.random() - .5) * 1.5]; }
  function seed() { for (var i = 0; i < N; i++) { var p = point(t++); rep.push(p[0]); ver.push(p[1]); } }
  function path(a, mn, mx) { return a.map(function (v, i) { return (i ? 'L' : 'M') + (i / (N - 1) * W).toFixed(1) + ' ' + (H - 10 - (v - mn) / (mx - mn) * (H - 24)).toFixed(1); }).join(' '); }
  function draw() {
    var all = rep.concat(ver), mn = Math.min.apply(null, all) - 4, mx = Math.max.apply(null, all) + 4;
    var pv = path(ver, mn, mx), g = '';
    [.25, .5, .75].forEach(function (f) { g += '<line x1="0" x2="' + W + '" y1="' + H * f + '" y2="' + H * f + '" stroke="rgba(255,255,255,.06)" stroke-dasharray="3 6"/>'; });
    var ly = H - 10 - (ver[N - 1] - mn) / (mx - mn) * (H - 24);
    svg.innerHTML = '<defs><linearGradient id="ltg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#8B8FFF" stop-opacity=".3"/><stop offset="1" stop-color="#8B8FFF" stop-opacity="0"/></linearGradient></defs>' + g +
      '<path d="' + pv + ' L' + W + ' ' + H + ' L0 ' + H + ' Z" fill="url(#ltg)"/>' +
      '<path d="' + path(rep, mn, mx) + '" fill="none" stroke="#6B7280" stroke-width="1.6" vector-effect="non-scaling-stroke"/>' +
      '<path d="' + pv + '" fill="none" stroke="#8B8FFF" stroke-width="2" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>' +
      '<circle cx="' + W + '" cy="' + ly + '" r="4" fill="#8B8FFF"/><circle cx="' + W + '" cy="' + ly + '" r="10" fill="#8B8FFF" opacity=".25"><animate attributeName="opacity" values=".3;.05;.3" dur="1.6s" repeatCount="indefinite"/></circle>';
    var diff = Math.abs(rep[N - 1] - ver[N - 1]), score = Math.max(62, Math.min(99.6, 100 - diff * 1.1));
    document.getElementById('lt-score').textContent = score.toFixed(1) + '%';
    var dl = document.getElementById('lt-delta'); dl.textContent = diff < 4 ? 'aligned' : 'gap ' + diff.toFixed(1) + ' pts';
  }
  seed(); for (var i = 0; i < 8; i++) row(); draw();
  setInterval(function () { var p = point(t++); rep.push(p[0]); rep.shift(); ver.push(p[1]); ver.shift(); draw(); }, 700);
  setInterval(row, 1500);
})();
