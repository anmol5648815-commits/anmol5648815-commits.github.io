/* Digital Virtuoso Services: motion layer
   Built on framer-motion's DOM API (no React), vendored at ./vendor/framer-motion-dom.min.js.
   Rules: transform/opacity only, springs for anything the pointer drives,
   interruptible, and nothing at all when reduced motion is requested. */
import { animate, scroll, inView, hover, stagger } from './vendor/framer-motion-dom.min.js';

const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const release = () => root.classList.remove('motion-pending');

const SPRING_ENTER = { type: 'spring', stiffness: 120, damping: 20, mass: 0.9 };
const SPRING_POINTER = { type: 'spring', stiffness: 260, damping: 24 };
const SPRING_SETTLE = { type: 'spring', stiffness: 170, damping: 22 };

if (reduce) {
  release();
} else {
  heroEntrance();
  sheetDepthOnScroll();
  if (finePointer) {
    const sheetHost = document.querySelector('.sheet');
    tilt(document.getElementById('sheet-tilt'), { max: 7, host: sheetHost, glareHost: sheetHost });
    document.querySelectorAll('.tier').forEach((card) => tilt(card, { max: 5, lift: 6, host: wrapStatic(card, 'tier-host') }));
    document.querySelectorAll('.hero__actions .btn--accent, .contact .btn--large').forEach(magnetic);
  }
  revealGroup('.tiers', '.tier', { y: 48, rotateX: 14 });
  revealGroup('#steps', '.step', { y: 24 });
  revealGroup('.quotes', '.quote', { y: 32 });
}

/* 1. Hero: headline is already visible (good for LCP); supporting copy cascades in,
      then the CV sheet drops onto the page in 3D and the redline edit begins. */
function heroEntrance() {
  const copy = [...document.querySelectorAll('.hero__copy [data-enter]')];
  const sheet = document.querySelector('.sheet[data-enter]');
  copy.forEach((el) => { el.style.opacity = '0'; });
  if (sheet) sheet.style.opacity = '0';
  release();

  animate(copy, { opacity: [0, 1], y: [18, 0] }, { ...SPRING_ENTER, delay: stagger(0.07, { startDelay: 0.05 }) });

  if (!sheet) return;
  const landed = animate(
    sheet,
    { opacity: [0, 1], y: [70, 0], rotateX: [32, 0], scale: [0.94, 1] },
    { ...SPRING_ENTER, transformPerspective: 1100, delay: 0.25 }
  );
  let started = false;
  const startEdit = () => { if (!started) { started = true; window.DVS && window.DVS.playEdit(); } };
  Promise.resolve(landed.finished || landed).then(startEdit);
  setTimeout(startEdit, 1600); // never wait on a slow frame budget
}

/* 2. Scroll depth: as the hero leaves, the sheet sinks back into the page. */
function sheetDepthOnScroll() {
  const hero = document.querySelector('.hero');
  const tiltLayer = document.getElementById('sheet-tilt');
  if (!hero || !tiltLayer || matchMedia('(max-width: 900px)').matches) return;
  const wrap = document.createElement('div');
  tiltLayer.parentNode.insertBefore(wrap, tiltLayer);
  wrap.appendChild(tiltLayer);
  wrap.style.transformStyle = 'preserve-3d';
  scroll(
    animate(wrap, { y: [0, -60], rotateX: [0, 12], scale: [1, 0.95] }, { ease: 'linear' }),
    { target: hero, offset: ['start start', 'end start'] }
  );
}

/* Pointer events go to a wrapper that never moves. If the moving element listened itself,
   its edges would rotate away from a still cursor and fire pointerleave (tilt flicker). */
function wrapStatic(el, className) {
  const w = document.createElement('div');
  w.className = className + (el.classList.contains('tier--featured') ? ' ' + className + '--featured' : '');
  el.parentNode.insertBefore(w, el);
  w.appendChild(el);
  return w;
}

/* 3. Pointer tilt with a moving light, sprung so it settles naturally and can be interrupted. */
function tilt(el, { max = 6, lift = 0, host = el, glareHost = el } = {}) {
  if (!el || !host) return;
  let raf = 0;
  hover(host, () => {
    glareHost.classList.add('is-tilting');
    const onMove = (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = host.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;   // 0..1
        const py = (e.clientY - r.top) / r.height;   // 0..1
        glareHost.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
        glareHost.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
        if (glareHost !== el) { el.style.setProperty('--gx', (px * 100).toFixed(1) + '%'); el.style.setProperty('--gy', (py * 100).toFixed(1) + '%'); }
        animate(el, { rotateY: (px - 0.5) * 2 * max, rotateX: (0.5 - py) * 2 * max, y: -lift },
          { ...SPRING_POINTER, transformPerspective: 1000 });
      });
    };
    host.addEventListener('pointermove', onMove);
    return () => {
      cancelAnimationFrame(raf);
      host.removeEventListener('pointermove', onMove);
      glareHost.classList.remove('is-tilting');
      animate(el, { rotateX: 0, rotateY: 0, y: 0 }, { ...SPRING_SETTLE, transformPerspective: 1000 });
    };
  });
}

/* 4. Magnetic CTA: the button leans a few pixels toward the cursor. */
function magnetic(btn) {
  const strength = 0.18, limit = 7;
  hover(btn, () => {
    const onMove = (e) => {
      const r = btn.getBoundingClientRect();
      const dx = Math.max(-limit, Math.min(limit, (e.clientX - (r.left + r.width / 2)) * strength));
      const dy = Math.max(-limit, Math.min(limit, (e.clientY - (r.top + r.height / 2)) * strength));
      animate(btn, { x: dx, y: dy }, SPRING_POINTER);
    };
    btn.addEventListener('pointermove', onMove);
    return () => {
      btn.removeEventListener('pointermove', onMove);
      animate(btn, { x: 0, y: 0 }, SPRING_SETTLE);
    };
  });
}

/* 5. Staggered reveal of a group the first time it scrolls into view.
      Groups already on screen at load are left alone so nothing flickers. */
function revealGroup(groupSel, itemSel, { y = 24, rotateX = 0 } = {}) {
  const group = document.querySelector(groupSel);
  if (!group) return;
  const items = [...group.querySelectorAll(itemSel)];
  if (!items.length || group.getBoundingClientRect().top < innerHeight) return;
  items.forEach((el) => { el.style.opacity = '0'; });
  inView(group, () => {
    animate(items,
      { opacity: [0, 1], y: [y, 0], ...(rotateX ? { rotateX: [rotateX, 0] } : {}) },
      { ...SPRING_ENTER, transformPerspective: 1200, delay: stagger(0.08) });
  }, { amount: 0.2 });
}
