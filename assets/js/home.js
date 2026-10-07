(function () {
  'use strict';
  var d = document, RB = window.RB;
  if (!RB) return;
  var reduce = RB.reduce;

  function lazyScript(src) { return RB.load(src); }

  RB.afterPaint(function () {
    if (reduce) {
      // static gradient only: no Three.js, no heavy motion
      var cv = d.getElementById('hero-canvas'); if (cv) cv.remove();
      var host = d.querySelector('#dash-root');
      if (host) { RB.gsap().then(function (gsap) { lazyScript('/assets/js/dashboard.js').then(function () { RBDashboard(host, gsap, true); }); }).catch(function () {}); }
      var df = d.querySelector('[data-dataflow]');
      if (df) { RB.gsap().then(function (gsap) { lazyScript('/assets/js/dataflow.js').then(function () { RBDataflow(df, gsap, true); }); }).catch(function () {}); }
      return;
    }

    RB.gsap().then(function (gsap) {
      var ST = window.ScrollTrigger;
      RB.onLenis(function (l) { l.on('scroll', ST.update); });

      /* hero headline: letter reveal */
      var h1 = d.getElementById('hero-h1');
      if (h1 && window.SplitText) {
        var sp = SplitText.create(h1, { type: 'chars,words', aria: 'auto' });
        gsap.from(sp.chars, { autoAlpha: 0, yPercent: 60, duration: .6, ease: 'power3.out', stagger: .012, delay: .1 });
      }

      /* rotating words */
      var rot = d.querySelector('.rotor');
      if (rot) {
        var words = rot.getAttribute('data-words').split('|'), i = 0;
        (function next() {
          gsap.delayedCall(2.2, function () {
            if (d.hidden) return next();
            gsap.to(rot, { yPercent: -60, autoAlpha: 0, duration: .25, onComplete: function () {
              i = (i + 1) % words.length; rot.textContent = words[i];
              gsap.fromTo(rot, { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: .3, onComplete: next });
            } });
          });
        })();
      }

      /* process: pinned horizontal scroll on desktop */
      var sec = d.getElementById('process'), steps = sec && sec.querySelector('.steps');
      if (sec && steps) {
        var mm = gsap.matchMedia();
        mm.add('(min-width: 861px)', function () {
          sec.classList.add('hscroll');
          var dist = function () { return Math.max(0, steps.scrollWidth - innerWidth + 32); };
          var tw = gsap.to(steps, { x: function () { return -dist(); }, ease: 'none', scrollTrigger: { trigger: sec, start: 'top top', end: function () { return '+=' + dist(); }, pin: true, scrub: .6, invalidateOnRefresh: true, anticipatePin: 1 } });
          return function () { sec.classList.remove('hscroll'); gsap.set(steps, { clearProps: 'all' }); };
        });
      }

      /* data-flow */
      var df = d.querySelector('[data-dataflow]');
      if (df) lazyScript('/assets/js/dataflow.js').then(function () { RBDataflow(df, gsap, false); ST.refresh(); });

      /* dashboard */
      var dash = d.getElementById('dash-root');
      if (dash) lazyScript('/assets/js/dashboard.js').then(function () { RBDashboard(dash, gsap, false); ST.refresh(); });
    }).catch(function () {});

    /* Three.js hero: Home only, after first paint */
    var canvas = d.getElementById('hero-canvas');
    if (canvas) import('/assets/js/hero-3d.js').then(function (m) { m.start(canvas, { mobile: RB.mobile }); }).catch(function () {});
  });
})();
