/* Digital Virtuoso Services: "the edit" section.
   As the section scrolls past, each weak CV line is struck through in cobalt,
   questioned in the margin, rewritten left to right, and the key numbers are
   marked as a recruiter's six-second scan runs. Scroll-scrubbed, so the reader
   controls the pace; it runs backwards too. Without JS, or with reduced motion,
   the page shows the struck original above each rewrite, fully legible. */
(function () {
  'use strict';
  var sec = document.getElementById('edit');
  if (!sec || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var track = sec.querySelector('.edit__track');
  var page = document.getElementById('edit-page');
  var items = [].slice.call(sec.querySelectorAll('.edit__item'));
  var marks = [].slice.call(sec.querySelectorAll('.edit__after mark'));
  var steps = [].slice.call(sec.querySelectorAll('.edit__steps li'));
  var time = document.getElementById('edit-time');
  var pinMQ = matchMedia('(min-width: 900px) and (min-height: 640px)');

  sec.classList.add('is-live');

  /* 0..1 progress of p through [a, b], eased */
  var seg = function (p, a, b) {
    var t = Math.min(1, Math.max(0, (p - a) / (b - a)));
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  var progress = function () {
    var vh = innerHeight;
    if (pinMQ.matches) {
      var r = track.getBoundingClientRect();
      return Math.min(1, Math.max(0, -r.top / (r.height - vh)));
    }
    /* Not pinned: scrub while the page's top edge rises from 85% to 5% of the
       screen, so the rewrite plays while the page is in full view */
    var pr = page.getBoundingClientRect();
    return Math.min(1, Math.max(0, (vh * 0.85 - pr.top) / (vh * 0.8)));
  };

  var ticking = false, lastStep = -1;
  var update = function () {
    ticking = false;
    var p = progress();
    items.forEach(function (it, i) {
      var s = seg(p, 0.04 + i * 0.07, 0.24 + i * 0.07);
      var w = seg(p, 0.36 + i * 0.09, 0.56 + i * 0.09);
      it.style.setProperty('--s', s.toFixed(3));
      it.style.setProperty('--w', w.toFixed(3));
      it.classList.toggle('is-writing', w > 0.01 && w < 0.99);
    });
    marks.forEach(function (m, j) {
      m.style.setProperty('--m', seg(p, 0.8 + j * 0.05, 0.9 + j * 0.05).toFixed(3));
    });
    var scan = Math.min(1, Math.max(0, (p - 0.78) / 0.2));
    time.textContent = (scan * 6).toFixed(1);
    page.classList.toggle('is-scanning', scan > 0 && scan < 1);
    var st = p < 0.32 ? 0 : p < 0.76 ? 1 : 2;
    if (st !== lastStep) {
      steps.forEach(function (li, k) { li.classList.toggle('is-on', k === st); });
      lastStep = st;
    }
  };

  var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  update();
})();
