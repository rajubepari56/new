/* Scroll-drawn data-flow diagram. Needs gsap + ScrollTrigger + MotionPathPlugin. */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var COLORS = { ga4: '#4285F4', ads: '#FBBC05', meta: '#34A853', crm: '#EA4335' };
  function el(n, a, p) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }

  window.RBDataflow = function (host, gsap, reduce) {
    var vertical = window.matchMedia('(max-width: 700px)').matches;
    var W = vertical ? 380 : 1000, H = vertical ? 700 : 440, bw = vertical ? 112 : 140, bh = 48, fs = vertical ? 12.5 : 15;
    var P = vertical
      ? { web: [190, 40], consent: [190, 130], wgtm: [190, 220], sgtm: [190, 310], crm: [320, 400], ga4: [60, 620], ads: [190, 620], meta: [320, 620] }
      : { web: [80, 190], consent: [260, 190], wgtm: [440, 190], sgtm: [620, 190], crm: [440, 370], ga4: [900, 60], ads: [900, 190], meta: [900, 320] };
    var names = { web: 'Website', consent: 'Consent Mode v2', wgtm: 'Web GTM', sgtm: 'Server GTM', crm: 'CRM sales', ga4: 'GA4', ads: 'Google Ads', meta: 'Meta CAPI' };
    host.innerHTML = '';
    var svg = el('svg', { id: 'dataflow-svg', viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Data flow: Website, Consent Mode v2, Web GTM and Server GTM, then to GA4, Google Ads and Meta CAPI. CRM sales also flow into Server GTM.' }, host);
    function trunk() { return 'M' + P.web + ' L' + P.consent + ' L' + P.wgtm + ' L' + P.sgtm; }
    function branch(k) {
      var s = P.sgtm, d = P[k];
      return vertical
        ? trunk() + ' C' + s[0] + ' ' + (s[1] + 140) + ' ' + d[0] + ' ' + (d[1] - 140) + ' ' + d[0] + ' ' + (d[1] - bh / 2)
        : trunk() + ' C' + (s[0] + 130) + ' ' + s[1] + ' ' + (d[0] - bw / 2 - 90) + ' ' + d[1] + ' ' + (d[0] - bw / 2) + ' ' + d[1];
    }
    function crmPath() {
      var c = P.crm, s = P.sgtm;
      return vertical
        ? 'M' + c[0] + ' ' + (c[1] - bh / 2) + ' C' + c[0] + ' ' + (c[1] - 70) + ' ' + s[0] + ' ' + (s[1] + 90) + ' ' + s[0] + ' ' + (s[1] + bh / 2)
        : 'M' + c[0] + ' ' + (c[1] - bh / 2) + ' C' + c[0] + ' ' + (c[1] - 90) + ' ' + s[0] + ' ' + (s[1] + 90) + ' ' + s[0] + ' ' + (s[1] + bh / 2);
    }
    var flows = [
      { k: 'ga4', d: branch('ga4'), ev: 'page_view' },
      { k: 'ads', d: branch('ads'), ev: 'generate_lead' },
      { k: 'meta', d: branch('meta'), ev: 'purchase' },
      { k: 'crm', d: crmPath(), ev: 'crm_sale' }
    ];
    flows.forEach(function (f) { el('path', { d: f.d, class: 'base' }, svg); });
    var paths = flows.map(function (f) {
      var p = el('path', { d: f.d, class: 'draw', stroke: COLORS[f.k], pathLength: 1 }, svg);
      p.style.strokeDasharray = 1; p.style.strokeDashoffset = reduce ? 0 : 1; return p;
    });
    Object.keys(P).forEach(function (k) {
      var g = el('g', { class: 'node', transform: 'translate(' + (P[k][0] - bw / 2) + ',' + (P[k][1] - bh / 2) + ')' }, svg);
      el('rect', { width: bw, height: bh, rx: 14 }, g);
      var t = el('text', { x: bw / 2, y: bh / 2, style: 'font-size:' + fs + 'px' }, g); t.textContent = names[k];
    });
    var dots = flows.map(function (f) {
      var g = el('g', { class: 'dot', style: 'color:' + COLORS[f.k] + ';opacity:0' }, svg);
      el('circle', { r: 7, fill: COLORS[f.k] }, g);
      var t = el('text', { y: -14 }, g); t.textContent = f.ev;
      return g;
    });
    if (reduce) { dots.forEach(function (d, i) { d.style.opacity = 1; gsap.set(d, { motionPath: { path: paths[i], align: paths[i], alignOrigin: [.5, .5], start: .55, end: .55 } }); }); return; }

    gsap.to(paths, { strokeDashoffset: 0, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: host, start: 'top 80%', end: 'bottom 55%', scrub: .6 } });
    ScrollTrigger.create({
      trigger: host, start: 'top 55%', once: true,
      onEnter: function () {
        dots.forEach(function (d, i) {
          gsap.to(d, { motionPath: { path: paths[i], align: paths[i], alignOrigin: [.5, .5] }, onStart: function () { gsap.set(d, { opacity: 1 }); }, onRepeat: function () { gsap.set(d, { opacity: 1 }); }, duration: 3.6, ease: 'power1.inOut', repeat: -1, repeatDelay: .6, delay: i * 1.1 });
        });
      }
    });
  };
})();
