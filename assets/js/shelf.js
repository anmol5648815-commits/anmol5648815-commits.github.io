/* Digital Virtuoso Services: the career-file shelf
   One requestAnimationFrame loop + the Web Animations API. No libraries.
   Each service is a hardcover file standing spine-out; the active one is pulled
   out and turned in 3D so its cover faces the viewer. Clicking it grows a sheet
   of paper out of the cover that becomes the detail page. */
(function () {
  'use strict';
  var hero = document.querySelector('.hero');
  var stage = document.getElementById('stage');
  if (!hero || !stage) return;

  var WA = 'https://wa.me/919752798192?text=';
  var REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = matchMedia('(pointer: fine)').matches;

  var ICONS = {
    cv: '<rect x="5" y="3" width="14" height="18" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 8h8M8 11.5h8M8 15h5" stroke="currentColor" stroke-width="1.5"/>',
    cvli: '<circle cx="10.5" cy="10.5" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M15 15l5 5" stroke="currentColor" stroke-width="1.8"/><circle cx="10.5" cy="9" r="2" fill="currentColor"/><path d="M7 14c.8-1.8 2-2.6 3.5-2.6S13.2 12.2 14 14" fill="none" stroke="currentColor" stroke-width="1.3"/>',
    accel: '<path d="M5 19L19 5M10 5h9v9" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M5 13l6-6" stroke="currentColor" stroke-width="1.2" opacity=".6"/>',
    interview: '<path d="M3 5h11v7H8l-3 3v-3H3z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M10 14h4l3 3v-3h4V8h-4" fill="none" stroke="currentColor" stroke-width="1.5"/>',
    career: '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M15.5 8.5L13.2 13.2 8.5 15.5 10.8 10.8z" fill="currentColor"/>',
    letters: '<rect x="3" y="6" width="18" height="12" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M3 6l9 7 9-7" fill="none" stroke="currentColor" stroke-width="1.5"/>'
  };

  var FILES = [
    { id: 'cv', title: 'CV Rewrite', cat: 'Packages', tag: 'CV', bg: '#EDE6D6', fg: '#141414',
      sub: 'Package / CV', meta: 'Word + PDF files',
      dMeta: 'Package / Message me for pricing / First draft in 2 working days',
      syn: 'For an active job search where the CV is the bottleneck. I rewrite it from scratch around what you actually achieved, in a format applicant tracking systems read cleanly and a recruiter can scan in six seconds.',
      list: ['Deep-dive call about your career and target roles', 'CV rewritten from scratch, ATS-friendly', 'Revisions included', 'Word and PDF files'],
      credit: 'Written personally by Anmol Sharma.', wa: "Hi Anmol, I'm interested in the CV Rewrite package." },
    { id: 'cvli', title: 'CV + LinkedIn', cat: 'Packages', tag: 'CV + LI', bg: '#1F3FB0', fg: '#EDE6D6',
      sub: 'Recommended package / CV + LI', meta: 'CV files + LinkedIn copy ready to paste',
      dMeta: 'Recommended package / Message me for pricing',
      syn: 'For being found by recruiters, not just applying. Everything in CV Rewrite, plus a LinkedIn profile rewritten so the people hiring for your next role find you in search and want to message you.',
      list: ['Everything in CV Rewrite', 'LinkedIn headline, About and experience rewritten', 'Keyword plan for the roles you want to be found for', 'Profile checklist: photo, banner, featured section'],
      credit: 'Written personally by Anmol Sharma.', wa: "Hi Anmol, I'm interested in the CV + LinkedIn package." },
    { id: 'accel', title: 'Career Accelerator', cat: 'Packages', tag: 'PRO', bg: '#141414', fg: '#EDE6D6',
      sub: 'Package / Pro', meta: 'CV, LinkedIn, cover letter and mock interviews',
      dMeta: 'Package / Message me for pricing',
      syn: 'For senior moves where the interview decides it. Your CV and LinkedIn rewritten, a cover letter for your top-choice role, and mock interviews until your answers sound like you on a good day.',
      list: ['Everything in CV + LinkedIn', 'A cover letter tailored to your top-choice role', 'Mock interview sessions with feedback', 'WhatsApp support during your search'],
      credit: 'Written and coached personally by Anmol Sharma.', wa: "Hi Anmol, I'm interested in the Career Accelerator package." },
    { id: 'interview', title: 'Interview Coaching', cat: 'Coaching', tag: 'IV', bg: '#C9432A', fg: '#EDE6D6',
      sub: 'Coaching / IV', meta: 'Live video sessions',
      dMeta: 'Coaching / Live video sessions / $39 per session',
      syn: 'Mock interviews for your target role with honest feedback. We build your stories so you can answer the hard questions without rehearsing a script.',
      list: ['Mock interviews for the role you are going for', 'Specific feedback after every answer', 'Your strongest stories, structured', 'Book a single session or add it to a package'],
      credit: 'Coached one-to-one by Anmol Sharma.', wa: "Hi Anmol, I'm interested in interview coaching." },
    { id: 'career', title: 'Career Coaching', cat: 'Coaching', tag: 'CC', bg: '#E4DCC8', fg: '#141414',
      sub: 'Coaching / CC', meta: 'Live video sessions',
      dMeta: 'Coaching / Live video sessions / $39 per session',
      syn: 'For when the question is what to apply for, not how. We get clear on direction and build a plan you can act on this month.',
      list: ['Where you are, and what you want next', 'Which roles are worth applying for, and why', 'A plan you can act on this month'],
      credit: 'Coached one-to-one by Anmol Sharma.', wa: "Hi Anmol, I'm interested in career coaching." },
    { id: 'letters', title: 'Cover Letters & Bios', cat: 'Writing', tag: 'CL', bg: '#CDB892', fg: '#141414',
      sub: 'Writing / CL', meta: 'Word + PDF files',
      dMeta: 'Writing / Word + PDF files / Message me for pricing',
      syn: 'Cover letters, speaker bios and profile copy written in your voice, for when you need to introduce yourself well in writing.',
      list: ['Cover letters tailored to a specific role', 'Professional and speaker bios', 'Profile copy for websites and portfolios'],
      credit: 'Written personally by Anmol Sharma.', wa: "Hi Anmol, I need a cover letter or bio written." }
  ];
  var N = FILES.length, COPIES = 4, LOOP = N * COPIES;
  var coverUrl = function (f) { return 'assets/img/covers/' + f.id + '.webp'; };
  FILES.forEach(function (f) { var im = new Image(); im.src = coverUrl(f); });

  /* ---------- Geometry ---------- */
  var H, ws, d, gap, W = innerWidth;
  var probe = document.createElement('div');
  probe.style.cssText = 'position:absolute;visibility:hidden;width:1px;height:var(--H)';
  hero.appendChild(probe);
  function measure() {
    W = hero.clientWidth;
    H = probe.getBoundingClientRect().height;
    ws = H * 142 / 840; d = H * 474 / 900; gap = H * 0.03;
    stage.style.setProperty('--th', H + 'px');
    stage.style.setProperty('--ws', ws + 'px');
    stage.style.setProperty('--d', d + 'px');
  }

  /* ---------- Build the shelf ---------- */
  var tapes = [];
  for (var v = 0; v < LOOP; v++) {
    var f = FILES[v % N];
    var t = document.createElement('div');
    t.className = 'tape';
    t.setAttribute('aria-hidden', 'true');
    var fs = Math.min(0.5, 4.9 / f.title.length).toFixed(3);
    t.innerHTML =
      '<div class="face sp" style="--c-bg:' + f.bg + ';--c-fg:' + f.fg + ';--fs:' + fs + '">' +
        '<svg class="sp__mark" viewBox="0 0 24 24">' + ICONS[f.id] + '</svg>' +
        '<span class="sp__rule"></span>' +
        '<span class="sp__title">' + f.title.replace('&', '&amp;') + '</span>' +
        '<span class="sp__by">DVS</span>' +
        '<span class="sp__tag">' + f.tag + '</span>' +
      '</div>' +
      '<div class="face cv" style="background-image:url(' + coverUrl(f) + ')"></div>';
    stage.appendChild(t);
    tapes.push({ el: t, sp: t.firstChild, cv: t.lastChild, v: v, lift: 0, shown: true });
    (function (v) {
      t.addEventListener('pointerenter', function () { hover = v; });
      t.addEventListener('pointerleave', function () { if (hover === v) hover = -1; });
    })(v);
  }

  /* ---------- State ---------- */
  var START = 1; // CV + LinkedIn, the recommended package
  var s = START + N * 2, T = s;
  var hover = -1, active = -1, dragging = false;
  var mx = W / 2, my = innerHeight / 2, cx = mx, cy = my;
  var tiltX = 0, tiltY = 0, onCover = false, isOpen = false, heroVisible = true;
  var shelfRect = null;

  var mod = function (a, n) { return ((a % n) + n) % n; };
  var smooth = function (x) { return x * x * (3 - 2 * x); };
  var B = function (r) { return Math.abs(r) < 1 ? (r + Math.sin(Math.PI * r) / Math.PI) / 2 : (r > 0 ? 0.5 : -0.5); };
  var F = function (r) { return r * (ws + gap) + (d - ws + 1.6 * gap) * B(r); };
  var relOf = function (v) { return mod(v - s + LOOP / 2, LOOP) - LOOP / 2; };

  /* ---------- Caption + tabs ---------- */
  var cap = document.getElementById('caption');
  var masks = cap.querySelectorAll('.mask');
  var tabs = [].slice.call(document.querySelectorAll('.tab'));
  var ind = document.getElementById('tabs-ind');
  function swap(mask, text, dir) {
    if (REDUCE) { mask.innerHTML = ''; var sp0 = document.createElement('span'); sp0.textContent = text; mask.appendChild(sp0); return; }
    var old = [].slice.call(mask.children).filter(function (c) { return !c.dataset.leaving; });
    var n = document.createElement('span'); n.textContent = text; mask.appendChild(n);
    n.animate([{ transform: 'translateY(' + dir * 105 + '%)' }, { transform: 'translateY(0)' }], { duration: 650, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' });
    old.forEach(function (o) {
      o.dataset.leaving = '1';
      var cur = getComputedStyle(o).transform; if (cur === 'none') cur = 'translateY(0)';
      o.animate([{ transform: cur }, { transform: 'translateY(' + -dir * 105 + '%)' }], { duration: 650, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' })
        .onfinish = function () { o.remove(); };
    });
  }
  function setTab(cat) {
    tabs.forEach(function (b) {
      var on = b.dataset.cat === cat;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', String(on));
      if (on) { ind.style.width = b.offsetWidth + 'px'; ind.style.transform = 'translateX(' + b.offsetLeft + 'px)'; }
    });
  }
  function setActive(i, dir) {
    if (i === active) return;
    var f = FILES[i];
    var first = active === -1;
    active = i;
    var dd = dir || 1;
    if (first) {
      masks[0].innerHTML = '<span></span>'; masks[0].firstChild.textContent = f.title;
      masks[1].innerHTML = '<span></span>'; masks[1].firstChild.textContent = f.sub;
      masks[2].innerHTML = '<span></span>'; masks[2].firstChild.textContent = f.meta;
    } else {
      swap(masks[0], f.title, dd); swap(masks[1], f.sub, dd); swap(masks[2], f.meta, dd);
    }
    setTab(f.cat);
  }

  /* ---------- Play ring ---------- */
  var play = document.getElementById('play');

  /* ---------- Cursor ---------- */
  var cursor = document.getElementById('cursor');
  var useCursor = FINE && cursor;
  if (useCursor) { document.documentElement.classList.add('has-cursor'); cursor.style.visibility = 'hidden'; }
  var overBtn = false, overInput = false, overDark = false, probeTick = 0;
  /* Read what is under the pointer. Also re-run while scrolling, because content moves
     under a still pointer without firing pointerover. */
  var probeUnder = function (tg) {
    if (!tg || !tg.closest) return;
    overInput = !!tg.closest('input, textarea, select');
    overBtn = !overInput && !!tg.closest('a, button, summary, label, .cat__row') && !tg.closest('.shelf');
    overDark = !!tg.closest('.band') && !tg.closest('.btn--paper');
  };
  document.addEventListener('pointermove', function (e) {
    mx = e.clientX; my = e.clientY;
    if (e.pointerType === 'mouse' && useCursor) cursor.style.visibility = 'visible';
  }, { passive: true });
  document.addEventListener('pointerover', function (e) { probeUnder(e.target); });
  document.documentElement.addEventListener('pointerleave', function () { if (useCursor) cursor.style.visibility = 'hidden'; });

  /* ---------- Detail sheet ---------- */
  var detail = document.getElementById('detail');
  var dImg = document.getElementById('d-img');
  var blots = [].slice.call(document.querySelectorAll('#blots circle'));
  var BLOT_DELAY = [0, 120, 220, 300, 360, 420, 180];
  var lines = [].slice.call(detail.querySelectorAll('.detail__text > .mask > *'));
  var outside = [document.querySelector('.nav'), document.getElementById('main'), document.querySelector('.foot'), document.getElementById('dock')];
  var sheetAnim = null, opener = null, sourceRect = null, inkRaf = 0;

  function activeCoverRect() {
    var best = null, bd = 1e9;
    tapes.forEach(function (tp) { var r = Math.abs(relOf(tp.v)); if (r < bd) { bd = r; best = tp; } });
    return best.cv.getBoundingClientRect();
  }
  function insetFrom(r) {
    var vw = innerWidth, vh = innerHeight;
    return 'inset(' + Math.max(0, r.top) + 'px ' + Math.max(0, vw - r.right) + 'px ' + Math.max(0, vh - r.bottom) + 'px ' + Math.max(0, r.left) + 'px round 3px)';
  }
  function fill(f) {
    document.getElementById('d-sub').textContent = f.sub;
    document.getElementById('d-title').textContent = f.title;
    document.getElementById('d-meta').textContent = f.dMeta;
    document.getElementById('d-syn').textContent = f.syn;
    document.getElementById('d-credit').textContent = f.credit;
    var ul = document.getElementById('d-list'); ul.innerHTML = '';
    f.list.forEach(function (li) { var el = document.createElement('li'); el.textContent = li; ul.appendChild(el); });
    document.getElementById('d-wa').href = WA + encodeURIComponent(f.wa);
    dImg.setAttribute('href', coverUrl(f));
  }
  function ink(start) {
    cancelAnimationFrame(inkRaf);
    var t0 = start;
    (function step(now) {
      var el = now - t0;
      blots.forEach(function (c, i) {
        var p = Math.min(1, Math.max(0, (el - BLOT_DELAY[i]) / 1250));
        c.setAttribute('r', (720 * (1 - Math.pow(1 - p, 3))).toFixed(1));
      });
      if (el < 2400) inkRaf = requestAnimationFrame(step);
    })(performance.now());
  }
  function openDetail(i, fromEl) {
    if (isOpen) return;
    isOpen = true;
    var f = FILES[i];
    fill(f);
    blots.forEach(function (c) { c.setAttribute('r', 0); });
    opener = document.activeElement;
    sourceRect = fromEl ? function () { return fromEl.getBoundingClientRect(); } : activeCoverRect;
    var r = sourceRect();
    detail.hidden = false;
    detail.scrollTop = 0;
    detail.style.transformOrigin = (r.left + r.width / 2) + 'px ' + (r.top + r.height / 2) + 'px';
    document.documentElement.classList.add('is-locked');
    outside.forEach(function (el) { if (el) el.inert = true; });
    detail.getAnimations({ subtree: true }).forEach(function (a) { a.cancel(); });
    var D = REDUCE ? 1 : 1050;
    sheetAnim = detail.animate([
      { clipPath: insetFrom(r), transform: 'rotate(-4.5deg)' },
      { clipPath: 'inset(0px 0px 0px 0px round 0px)', transform: 'rotate(0deg)' }
    ], { duration: D, easing: 'cubic-bezier(.76,0,.18,1)', fill: 'both' });
    lines.forEach(function (el, k) {
      el.animate([{ transform: 'translateY(110%)' }, { transform: 'translateY(0)' }],
        { duration: REDUCE ? 1 : 900, delay: REDUCE ? 0 : 620 + k * 75, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' });
    });
    if (REDUCE) ink(performance.now() - 5000);
    else setTimeout(function () { if (isOpen) ink(performance.now()); }, 520);
    document.getElementById('d-close').focus({ preventScroll: true });
  }
  function closeDetail(after) {
    if (!isOpen) return;
    var r = sourceRect ? sourceRect() : activeCoverRect();
    var anim = detail.animate([
      { clipPath: 'inset(0px 0px 0px 0px round 0px)', transform: 'rotate(0deg)' },
      { clipPath: insetFrom(r), transform: 'rotate(-4.5deg)' }
    ], { duration: REDUCE ? 1 : 850, easing: 'cubic-bezier(.76,0,.18,1)', fill: 'both' });
    anim.onfinish = function () {
      cancelAnimationFrame(inkRaf);
      detail.hidden = true;
      detail.getAnimations({ subtree: true }).forEach(function (a) { a.cancel(); });
      isOpen = false;
      document.documentElement.classList.remove('is-locked');
      outside.forEach(function (el) { if (el) el.inert = false; });
      if (typeof after === 'function') after();
      else if (opener && opener.focus) opener.focus({ preventScroll: true });
    };
  }
  document.getElementById('d-close').addEventListener('click', function () { closeDetail(); });
  document.getElementById('d-pk').addEventListener('click', function (e) {
    e.preventDefault();
    closeDetail(function () { document.getElementById('packages').scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth' }); });
  });
  detail.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var f = [].slice.call(detail.querySelectorAll('a[href], button')).filter(function (x) { return x.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  /* Catalogue rows elsewhere on the page open the same sheets, growing from the button */
  document.querySelectorAll('[data-open]').forEach(function (b) {
    b.addEventListener('click', function () {
      var i = FILES.findIndex(function (f) { return f.id === b.dataset.open; });
      if (i > -1) openDetail(i, b);
    });
  });

  /* ---------- Inputs ---------- */
  var shelf = document.getElementById('shelf');
  var downX = 0, T0 = 0, moved = false, pid = null;
  shelf.addEventListener('pointerdown', function (e) {
    if (e.button !== 0 || isOpen) return;
    downX = e.clientX; T0 = T; moved = false; pid = e.pointerId;
  });
  shelf.addEventListener('pointermove', function (e) {
    if (pid !== e.pointerId) return;
    var dx = e.clientX - downX;
    if (!moved && Math.abs(dx) > 5) { moved = true; dragging = true; try { shelf.setPointerCapture(pid); } catch (_) {} }
    if (moved) T = T0 - dx / (ws + gap);
  });
  var endDrag = function (e) {
    if (pid !== e.pointerId) return;
    pid = null;
    if (moved) { T = Math.round(T); dragging = false; }
  };
  shelf.addEventListener('pointerup', endDrag);
  shelf.addEventListener('pointercancel', function (e) { endDrag(e); moved = false; });
  /* Clicks are resolved from the pointer position with the same geometry the shelf is
     drawn with, so they never depend on how a browser hit-tests 3D-rotated faces. */
  function tapeAt(clientX, clientY) {
    if (!shelfRect) readShelf();
    var dx = clientX - (shelfRect.left + W / 2), dy = clientY - (shelfRect.top + shelfRect.height / 2);
    if (Math.abs(dy) > 0.6 * H) return null;
    if (Math.abs(dx) < 0.55 * d && Math.abs(T - s) < 0.3) return { open: true };
    var best = null, bd = 1e9;
    for (var n = 0; n < tapes.length; n++) {
      var r = relOf(tapes[n].v);
      if (Math.abs(r) < 0.5) continue;
      var dist = Math.abs(F(r) - dx);
      if (dist < bd) { bd = dist; best = r; }
    }
    return bd <= ws / 2 + gap ? { r: best } : null;
  }
  shelf.addEventListener('click', function (e) {
    if (moved) { moved = false; return; }
    var hit = tapeAt(e.clientX, e.clientY); if (!hit) return;
    if (hit.open) { T = Math.round(T); openDetail(mod(Math.round(T), N)); }
    else T = Math.round(T + hit.r);
  });
  play.addEventListener('click', function () { T = Math.round(T); openDetail(mod(Math.round(T), N)); });
  document.getElementById('prev').addEventListener('click', function () { T = Math.round(T) - 1; });
  document.getElementById('next').addEventListener('click', function () { T = Math.round(T) + 1; });
  tabs.forEach(function (b) {
    b.addEventListener('click', function () {
      var k = b.dataset.cat === 'all' ? 0 : FILES.findIndex(function (f) { return f.cat === b.dataset.cat; });
      var a = mod(Math.round(T), N), delta = mod(k - a, N);
      if (delta > N / 2) delta -= N;
      T = Math.round(T) + delta;
    });
  });
  var wheelTimer = 0;
  shelf.addEventListener('wheel', function (e) {
    if (isOpen || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; // vertical wheel scrolls the page
    e.preventDefault();
    T += e.deltaX / (ws + gap) * 0.5;
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(function () { T = Math.round(T); }, 160);
  }, { passive: false });
  document.addEventListener('keydown', function (e) {
    if (isOpen) { if (e.key === 'Escape') closeDetail(); return; }
    var tag = (document.activeElement && document.activeElement.tagName) || '';
    if (/INPUT|TEXTAREA|SELECT/.test(tag) || !heroVisible) return;
    if (e.key === 'ArrowLeft') { T = Math.round(T) - 1; }
    else if (e.key === 'ArrowRight') { T = Math.round(T) + 1; }
    else if (e.key === 'Enter' && (document.activeElement === document.body || document.activeElement === document.getElementById('main'))) {
      e.preventDefault(); T = Math.round(T); openDetail(mod(Math.round(T), N));
    }
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { heroVisible = en[0].isIntersecting; }, { threshold: 0.05 }).observe(hero);
  }
  var readShelf = function () { shelfRect = shelf.getBoundingClientRect(); };
  addEventListener('scroll', readShelf, { passive: true });
  addEventListener('resize', function () { measure(); readShelf(); setTab(FILES[active].cat); });

  /* ---------- First-visit hint: slides out of its mask after the first interaction ---------- */
  var hint = document.getElementById('hero-hint');
  var hintGone = false, T_START = T;
  function hideHint() {
    if (hintGone || !hint) return;
    hintGone = true;
    var line = hint.firstElementChild;
    if (REDUCE) { hint.style.visibility = 'hidden'; return; }
    line.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(110%)' }],
      { duration: 500, easing: 'cubic-bezier(.5,0,.75,0)', fill: 'forwards' });
  }

  /* ---------- Frame loop ---------- */
  var last = performance.now();
  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    var k = REDUCE ? 1e3 : dragging ? 18 : 5.2;
    s += (T - s) * (1 - Math.exp(-k * dt));
    if (Math.abs(T - s) < 1e-4) s = T;
    if (Math.abs(s) > LOOP * 4) { var sh = Math.round(s / LOOP) * LOOP; s -= sh; T -= sh; T0 -= sh; }

    if (!hintGone && (Math.abs(T - T_START) > 0.4 || isOpen)) hideHint();
    var idx = mod(Math.round(s), N);
    if (idx !== active) setActive(idx, Math.sign(T - s) || 1);

    if (!shelfRect) readShelf();
    var scy = shelfRect.top + shelfRect.height / 2;
    var settled = Math.abs(T - s) < 0.3;
    onCover = !isOpen && heroVisible && settled && Math.abs(mx - W / 2) < 0.55 * d && Math.abs(my - scy) < 0.55 * H;
    var tyT, txT;
    if (onCover) { tyT = (mx - W / 2) / (0.55 * d) * 9; txT = -(my - scy) / (H / 2) * 6; }
    else { tyT = (mx - W / 2) / W * 5; txT = 0; }
    var ke = 1 - Math.exp(-7 * dt);
    tiltY += (tyT - tiltY) * ke; tiltX += (txT - tiltX) * ke;

    if (heroVisible || !settled) {
      var limit = W / 2 + 1.5 * d, kl = REDUCE ? 1 : 1 - Math.exp(-12 * dt);
      for (var n = 0; n < tapes.length; n++) {
        var tp = tapes[n], r = relOf(tp.v), x = F(r);
        if (Math.abs(x) > limit) { if (tp.shown) { tp.el.style.visibility = 'hidden'; tp.shown = false; } continue; }
        if (!tp.shown) { tp.el.style.visibility = ''; tp.shown = true; }
        var o = smooth(Math.max(0, 1 - Math.abs(r)));
        tp.lift += ((hover === tp.v && Math.abs(r) > 0.5 ? 1 : 0) - tp.lift) * kl;
        var ry = -90 * o + tiltY * o, rx = tiltX * o, rz = -4.5 * o;
        var z = o * 0.2 * H, y = -o * 0.025 * H - tp.lift * 0.045 * H;
        tp.el.style.transform = 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,' + z.toFixed(2) + 'px) rotateZ(' + rz.toFixed(3) + 'deg) rotateX(' + rx.toFixed(3) + 'deg) rotateY(' + ry.toFixed(3) + 'deg)';
        tp.el.style.zIndex = Math.round(100 - Math.abs(r) * 4);
        tp.sp.style.setProperty('--shade', (o * 0.55).toFixed(3));
        tp.cv.style.setProperty('--shade', ((1 - o) * 0.5).toFixed(3));
      }
      var ps = isOpen ? 0 : smooth(Math.max(0, 1 - Math.abs(T - s) * 3));
      play.style.left = (W / 2 - 0.5 * d - 6) + 'px';
      play.style.top = (shelf.offsetTop + shelf.offsetHeight / 2 + 0.36 * H) + 'px';
      play.style.transform = 'scale(' + ps.toFixed(3) + ')';
      play.tabIndex = ps > 0.5 ? 0 : -1;
    }

    if (useCursor) {
      var kc = 1 - Math.exp(-16 * dt);
      cx += (mx - cx) * kc; cy += (my - cy) * kc;
      cursor.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
      var overSpine = !isOpen && hover > -1 && Math.abs(relOf(hover)) > 0.5;
      cursor.classList.toggle('is-open', onCover);
      cursor.classList.toggle('is-spine', !onCover && overSpine);
      cursor.classList.toggle('is-btn', !onCover && !overSpine && overBtn);
      cursor.classList.toggle('is-hidden', overInput);
      if (++probeTick % 6 === 0) probeUnder(document.elementFromPoint(mx, my));
      cursor.classList.toggle('is-dark', overDark && !isOpen);
    }
    requestAnimationFrame(frame);
  }

  measure();
  document.documentElement.classList.add('has-shelf');
  setActive(mod(Math.round(s), N), 1);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setTab(FILES[active].cat); });
  requestAnimationFrame(frame);
})();
