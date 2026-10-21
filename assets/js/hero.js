/* Hero: signal flow, pointer and scroll parallax. Headline and content reveal are pure CSS, so nothing waits for this file. */
(function () {
  'use strict';
  var d = document, svg = d.getElementById('h-flow');
  if (!svg) return;
  var sigs = [].slice.call(svg.querySelectorAll('.sig'));
  var reduce = (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) ||
    d.documentElement.classList.contains('rm');
  var NS = 'http://www.w3.org/2000/svg';

  /* Reduced motion: show each signal parked at its destination with its label. No animation, no library. */
  if (reduce) {
    d.documentElement.classList.add('rm-hero');
    var park = { ra: .9, rb: .7, rc: .9 };
    sigs.forEach(function (g) {
      var id = g.getAttribute('data-r'), p = svg.querySelector('#' + id), pt = p.getPointAtLength(p.getTotalLength() * park[id]);
      g.setAttribute('transform', 'translate(' + pt.x.toFixed(1) + ' ' + pt.y.toFixed(1) + ')');
      if (id === 'rc') { var t = g.querySelector('text'); t.setAttribute('x', -14); t.setAttribute('text-anchor', 'end'); }
      g.style.opacity = 1;
    });
    return;
  }

  function start() {
    if (!window.RB) return setTimeout(start, 60);
    RB.afterPaint(function () {
      RB.gsap().then(function (gsap) {
        var ST = window.ScrollTrigger, nodes = {};
        svg.querySelectorAll('[data-n]').forEach(function (n) { nodes[n.getAttribute('data-n')] = n; });
        var pulse = function (k) {
          var n = nodes[k]; if (!n) return;
          gsap.fromTo(n, { scale: 1 }, { scale: 1.08, duration: .16, yoyo: true, repeat: 1, ease: 'power2.out', overwrite: 'auto' });
        };

        /* signals: each one loops on its own timeline, evenly staggered */
        var tls = [], dest = ['t0', 't1', 't2'];
        sigs.forEach(function (g, i) {
          var path = '#' + g.getAttribute('data-r');
          var tl = gsap.timeline({ repeat: -1, repeatDelay: .55, delay: .9 + i * 1.25 });
          tl.set(g, { opacity: 0 })
            .to(g, { opacity: 1, duration: .25 }, 0)
            .to(g, { motionPath: { path: path, autoRotate: false }, duration: 3.3, ease: 'none' }, 0)
            /* the signal disappears into each GTM container and comes out the other side */
            .to(g, { opacity: 0, duration: .1 }, .52).to(g, { opacity: 1, duration: .14 }, 1.1)
            .to(g, { opacity: 0, duration: .1 }, 1.62).to(g, { opacity: 1, duration: .14 }, 2.2)
            .to(g, { opacity: 0, duration: .3 }, 3.0)
            .call(pulse, ['web'], 0)
            .call(pulse, ['gtm'], .62)
            .call(pulse, ['sgtm'], 1.72)
            .call(pulse, [dest[i]], 3.2);
          tls.push(tl);
        });

        /* pause when the tab is hidden or the hero is off screen */
        var onScreen = true, hidden = d.hidden;
        var heroEl = d.querySelector('.h-hero');
        var sync = function () { var run = onScreen && !hidden; heroEl.classList.toggle('h-paused', !run); tls.forEach(function (t) { run ? t.resume() : t.pause(); }); };
        d.addEventListener('visibilitychange', function () { hidden = d.hidden; sync(); });
        if ('IntersectionObserver' in window) {
          new IntersectionObserver(function (es) { onScreen = es[0].isIntersecting; sync(); }, { threshold: 0 }).observe(d.getElementById('h-stage'));
        }

        /* scroll parallax: photo drifts up slightly faster than the page; glow drifts down */
        var hero = d.querySelector('.h-hero');
        gsap.to('#h-photo', { y: -34, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: .6 } });
        gsap.to('.h-glow', { y: 70, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: .6 } });

        /* pointer parallax (fine pointers only): photo moves most, console a little, glow opposite */
        if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
          var photo = gsap.quickTo('.h-photo__in', 'x', { duration: .9, ease: 'power3.out' }),
              photoY = gsap.quickTo('.h-photo__in', 'y', { duration: .9, ease: 'power3.out' }),
              cons = gsap.quickTo('.h-console', 'x', { duration: 1.1, ease: 'power3.out' }),
              consY = gsap.quickTo('.h-console', 'y', { duration: 1.1, ease: 'power3.out' }),
              glow = gsap.quickTo('.h-glow i:first-child', 'x', { duration: 1.6, ease: 'power3.out' }),
              glowY = gsap.quickTo('.h-glow i:first-child', 'y', { duration: 1.6, ease: 'power3.out' });
          hero.addEventListener('pointermove', function (e) {
            var r = hero.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5;
            photo(nx * 26); photoY(ny * 20); cons(nx * -8); consY(ny * -6); glow(nx * -60); glowY(ny * -40);
          }, { passive: true });
        }
        ST.refresh();
      }).catch(function () {});
    });
  }
  start();
})();
