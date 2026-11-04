/* Digital Virtuoso Services: site behaviour (no dependencies) */
(function () {
  'use strict';

  var WA_NUMBER = '919752798192';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* WhatsApp links: add a pre-filled message from data-wa */
  document.querySelectorAll('a[data-wa]').forEach(function (a) {
    a.href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(a.getAttribute('data-wa'));
  });

  /* Sticky nav border once scrolled */
  var nav = document.querySelector('.nav');
  var onScroll = function () { nav.classList.toggle('is-scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  var toggle = document.getElementById('nav-toggle');
  var links = document.getElementById('nav-links');
  var setMenu = function (open) {
    toggle.setAttribute('aria-expanded', String(open));
    links.classList.toggle('is-open', open);
    toggle.textContent = open ? 'Close' : 'Menu';
  };
  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });
  links.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
  });
  window.matchMedia('(min-width: 861px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });
  document.addEventListener('click', function (e) {
    if (toggle.getAttribute('aria-expanded') === 'true' && !e.target.closest('.nav')) setMenu(false);
  });

  /* Current section indicator in the nav */
  var navMap = {};
  links.querySelectorAll('a[href^="#"]').forEach(function (a) { navMap[a.getAttribute('href').slice(1)] = a; });
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var a = navMap[en.target.id];
        if (!a) return;
        if (en.isIntersecting) {
          Object.keys(navMap).forEach(function (k) { navMap[k].removeAttribute('aria-current'); });
          a.setAttribute('aria-current', 'location');
        } else if (a.hasAttribute('aria-current')) {
          a.removeAttribute('aria-current');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(navMap).forEach(function (id) { var el = document.getElementById(id); if (el) spy.observe(el); });
  }



  /* Process timeline: line fills as you scroll through the steps */
  var steps = document.getElementById('steps');
  if (steps) {
    var items = steps.querySelectorAll('.step');
    var ticking = false;
    var update = function () {
      ticking = false;
      var r = steps.getBoundingClientRect();
      var anchor = window.innerHeight * 0.6;
      var p = Math.min(1, Math.max(0, (anchor - r.top) / r.height));
      steps.style.setProperty('--p', reduceMotion ? 1 : p.toFixed(3));
      items.forEach(function (it) {
        it.classList.toggle('is-reached', reduceMotion || it.getBoundingClientRect().top < anchor);
      });
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* Mobile booking dock: visible after the hero, hidden near the contact section */
  var dock = document.getElementById('dock');
  var hero = document.querySelector('.hero');
  var contact = document.getElementById('contact');
  if (dock && hero && contact && 'IntersectionObserver' in window) {
    var heroGone = false, contactNear = false;
    var sync = function () {
      var show = heroGone && !contactNear;
      dock.classList.toggle('is-visible', show);
      dock.setAttribute('aria-hidden', String(!show));
      dock.querySelector('a').tabIndex = show ? 0 : -1;
    };
    new IntersectionObserver(function (e) { heroGone = !e[0].isIntersecting; sync(); }).observe(hero);
    new IntersectionObserver(function (e) { contactNear = e[0].isIntersecting; sync(); }, { rootMargin: '0px 0px -20% 0px' }).observe(contact);
  }

  /* Contact form via Formspree */
  var form = document.getElementById('contact-form');
  if (form) {
    var status = document.getElementById('form-status');
    var submit = form.querySelector('.form__submit');
    var required = form.querySelectorAll('[required]');

    /* Show or clear the inline error under one field; returns validity */
    var check = function (el) {
      var ok = el.checkValidity();
      var err = document.getElementById(el.getAttribute('aria-describedby'));
      el.closest('.field').classList.toggle('is-invalid', !ok);
      el.setAttribute('aria-invalid', String(!ok));
      if (err) { err.textContent = ok ? '' : err.getAttribute('data-msg'); err.hidden = ok; }
      return ok;
    };
    required.forEach(function (el) {
      /* Validate when the person leaves a field they've touched, then live once it has shown an error */
      el.addEventListener('blur', function () { if (el.value !== '') check(el); });
      el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', function () {
        if (el.getAttribute('aria-invalid') === 'true') check(el);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.textContent = '';
      status.classList.remove('is-error');

      var bad = [];
      required.forEach(function (el) { if (!check(el)) bad.push(el); });
      if (bad.length) {
        status.textContent = bad.length === 1 ? '1 field needs attention.' : bad.length + ' fields need attention.';
        status.classList.add('is-error');
        bad[0].focus();
        return;
      }

      submit.disabled = true;
      form.setAttribute('aria-busy', 'true');
      submit.textContent = 'Sending…';
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (res) {
          if (!res.ok) throw new Error('bad status');
          form.innerHTML = '<div class="form__done" tabindex="-1"><h3>Message sent</h3><p>Thanks. I’ll reply within 24 hours. For a faster answer, message me on WhatsApp.</p></div>';
          form.querySelector('.form__done').focus();
        })
        .catch(function () {
          submit.disabled = false;
          form.removeAttribute('aria-busy');
          submit.textContent = 'Send message';
          status.innerHTML = 'The message didn’t send. Check your connection and try again, or email <a href="mailto:anmol.digitalvirtuoso@gmail.com">anmol.digitalvirtuoso@gmail.com</a>.';
          status.classList.add('is-error');
        });
    });
  }

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
