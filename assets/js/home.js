(function () {
  'use strict';
  var d = document;
  /* process: a thin line fills as the section scrolls past, and each step lights up when the line reaches it */
  var steps = d.getElementById('h-steps');
  if (steps) {
    var items = [].slice.call(steps.children), tick = false;
    var update = function () {
      tick = false;
      var r = steps.getBoundingClientRect(), vh = window.innerHeight, line = vh * 0.62;
      var p = (line - r.top) / r.height;
      steps.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
      items.forEach(function (li) { li.classList.toggle('on', li.getBoundingClientRect().top < line - 12); });
    };
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }
  /* progress bars and mismatch bars grow when their block is revealed */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.35 });
    d.querySelectorAll('.h-bar, .h-mismatch').forEach(function (n) { io.observe(n); });
  } else {
    d.querySelectorAll('.h-bar, .h-mismatch').forEach(function (n) { n.classList.add('in'); });
  }
})();
/* bento: soft pointer-following accent light inside each card (fine pointers only) */
(function () {
  if (!window.matchMedia || !matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  document.querySelectorAll('.bx').forEach(function (c) {
    c.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  });
})();
