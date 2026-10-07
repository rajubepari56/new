/* Scroll-drawn data-flow diagram. Needs gsap + ScrollTrigger + MotionPathPlugin. */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var COLORS = { ga4: '#4285F4', ads: '#FBBC05', meta: '#34A853' };
  function el(n, a, p) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }

  window.RBDataflow = function (host, gsap, reduce) {
    var vertical = window.matchMedia('(max-width: 700px)').matches;
    var W = vertical ? 360 : 1000, H = vertical ? 640 : 420, bw = vertical ? 150 : 150, bh = 50;
    var P = vertical
      ? { web: [180, 40], wgtm: [180, 150], sgtm: [180, 260], ga4: [60, 560], ads: [180, 560], meta: [300, 560] }
      : { web: [90, 210], wgtm: [310, 210], sgtm: [530, 210], ga4: [880, 70], ads: [880, 210], meta: [880, 350] };
    var names = { web: 'Website', wgtm: 'Web GTM', sgtm: 'Server GTM', ga4: 'GA4', ads: 'Google Ads', meta: 'Meta CAPI' };
    host.innerHTML = '';
    var svg = el('svg', { id: 'dataflow-svg', viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Data flow: Website to Web GTM to Server GTM, then to GA4, Google Ads and Meta CAPI' }, host);
    function path(dest) {
      var a = P.web, b = P.wgtm, c = P.sgtm, d = P[dest];
      if (vertical) return 'M' + a + ' L' + b + ' L' + c + ' C' + c[0] + ' ' + (c[1] + 140) + ' ' + d[0] + ' ' + (d[1] - 140) + ' ' + d[0] + ' ' + (d[1] - bh / 2);
      return 'M' + a + ' L' + b + ' L' + c + ' C' + (c[0] + 190) + ' ' + c[1] + ' ' + (d[0] - 190) + ' ' + d[1] + ' ' + (d[0] - bw / 2) + ' ' + d[1];
    }
    var dests = ['ga4', 'ads', 'meta'], paths = [], bases = [];
    dests.forEach(function (k) {
      bases.push(el('path', { d: path(k), class: 'base' }, svg));
    });
    dests.forEach(function (k) {
      var p = el('path', { d: path(k), class: 'draw', stroke: COLORS[k], pathLength: 1, id: 'p-' + k }, svg);
      p.style.strokeDasharray = 1; p.style.strokeDashoffset = reduce ? 0 : 1; paths.push(p);
    });
    Object.keys(P).forEach(function (k) {
      var g = el('g', { class: 'node', transform: 'translate(' + (P[k][0] - bw / 2) + ',' + (P[k][1] - bh / 2) + ')' }, svg);
      el('rect', { width: bw, height: bh, rx: 14 }, g);
      var t = el('text', { x: bw / 2, y: bh / 2 }, g); t.textContent = names[k];
    });
    var evs = { ga4: 'page_view', ads: 'generate_lead', meta: 'purchase' };
    var dots = dests.map(function (k) {
      var g = el('g', { class: 'dot', style: 'color:' + COLORS[k] + ';opacity:0' }, svg);
      el('circle', { r: 7, fill: COLORS[k] }, g);
      var t = el('text', { y: -14 }, g); t.textContent = evs[k];
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
