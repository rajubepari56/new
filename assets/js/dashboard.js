/* Animated mock dashboard. Illustrative demo data only. */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var DAYS = 14;
  var CRM = [8, 11, 9, 12, 14, 13, 10, 15, 17, 16, 14, 18, 19, 21];
  var BEFORE = [3, 7, 4, 9, 5, 8, 2, 9, 12, 7, 10, 8, 14, 11];
  var AFTER = [8, 11, 9, 12, 13, 13, 10, 15, 16, 16, 14, 18, 19, 20];
  function sum(a) { return a.reduce(function (x, y) { return x + y; }, 0); }
  function state(series) { var t = sum(series), c = sum(CRM); return { series: series, kpis: [['Tracked leads', t], ['CRM leads', c], ['Match rate', Math.round(t / c * 100), '%']] }; }
  var STATE = { before: state(BEFORE), after: state(AFTER) };
  function mk(n, a, p) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }

  window.RBDashboard = function (host, gsap, reduce) {
    host.innerHTML = '<div class="dash glass"><div class="dash__top"><div class="seg" role="group" aria-label="Tracking state"><button type="button" data-s="before" aria-pressed="false">Tracking before</button><button type="button" data-s="after" aria-pressed="true">Tracking after</button></div><span class="demo-note">Illustrative demo</span></div><div class="kpis"></div><svg viewBox="0 0 600 240" role="img" aria-label="Line chart comparing leads reported by ads against real CRM leads over 14 days. Illustrative demo."></svg><div class="legend"><span><i style="background:#A7A9D6"></i>Real leads (CRM)</span><span><i style="background:var(--blue)"></i>Leads reported by tracking</span></div></div>';
    var svg = host.querySelector('svg'), kp = host.querySelector('.kpis'), btns = host.querySelectorAll('.seg button');
    var L = 36, R = 590, T = 16, B = 206, max = 24;
    function X(i) { return L + (R - L) * i / (DAYS - 1); }
    function Y(v) { return B - (B - T) * v / max; }
    var g = mk('g', { class: 'grid' }, svg);
    [0, 8, 16, 24].forEach(function (v) { mk('line', { x1: L, x2: R, y1: Y(v), y2: Y(v) }, g); var t = mk('text', { x: 6, y: Y(v) + 4, class: 'axis' }, svg); t.textContent = v; });
    var tl = mk('text', { x: L, y: 230, class: 'axis' }, svg); tl.textContent = 'Day 1'; var tr = mk('text', { x: R - 34, y: 230, class: 'axis' }, svg); tr.textContent = 'Day 14';
    function d(arr) { return arr.map(function (v, i) { return (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1); }).join(' '); }
    var real = mk('path', { d: d(CRM), fill: 'none', stroke: '#A7A9D6', 'stroke-width': 2.5, 'stroke-dasharray': '6 5', pathLength: 1 }, svg);
    real.style.strokeDasharray = '0.02 0.015';
    var line = mk('path', { d: d(AFTER), fill: 'none', stroke: '#4285F4', 'stroke-width': 3.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', pathLength: 1 }, svg);
    line.style.strokeDasharray = 1;
    var vals = [];
    function kpis(s, animate) {
      kp.innerHTML = '';
      STATE[s].kpis.forEach(function (k) {
        var c = document.createElement('div'); c.className = 'kpi'; c.innerHTML = '<span>' + k[0] + '</span><b></b>'; kp.appendChild(c);
        var b = c.querySelector('b'), suf = k[2] || '', o = { v: animate ? 0 : k[1] };
        b.textContent = Math.round(o.v) + suf;
        if (animate && !reduce) gsap.to(o, { v: k[1], duration: 1.1, ease: 'power2.out', onUpdate: function () { b.textContent = Math.round(o.v) + suf; } });
        else b.textContent = k[1] + suf;
      });
    }
    function draw(s, animate) {
      line.setAttribute('d', d(STATE[s].series));
      line.setAttribute('stroke', s === 'before' ? '#EA4335' : '#4285F4');
      if (animate && !reduce) gsap.fromTo(line, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.out' });
      else line.style.strokeDashoffset = 0;
      btns.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-s') === s ? 'true' : 'false'); });
    }
    var cur = 'after', started = false;
    function show(s, track) { cur = s; draw(s, true); kpis(s, true); if (track && window.RB) RB.push({ event: 'dashboard_toggle', state: s }); }
    btns.forEach(function (b) { b.addEventListener('click', function () { var s = b.getAttribute('data-s'); if (s !== cur) show(s, true); }); });
    draw('after', false); kpis('after', false);
    if (reduce) return;
    line.style.strokeDashoffset = 1; kp.querySelectorAll('b').forEach(function (b) { b.textContent = '0'; });
    ScrollTrigger.create({ trigger: host, start: 'top 75%', once: true, onEnter: function () { started = true; show('after', false); } });
  };
})();
