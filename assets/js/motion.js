/* Digital Virtuoso Services: section motion (below the shelf)
   framer-motion's DOM API, vendored at ./vendor/framer-motion-dom.min.js.
   House rule from the catalogue design: no opacity fades. Every reveal is a
   mask slide or a clip. Nothing runs when reduced motion is requested. */
import { animate, scroll, inView, hover, stagger } from './vendor/framer-motion-dom.min.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const EASE = [0.2, 0.8, 0.2, 1];
const SPRING_POINTER = { type: 'spring', stiffness: 260, damping: 24 };
const SPRING_SETTLE = { type: 'spring', stiffness: 170, damping: 22 };
const below = (el) => el.getBoundingClientRect().top > innerHeight;

if (!reduce) {
  printBand();
  headings();
  clipReveal('.cat', '.cat__row');
  clipReveal('.tiers', '.tier');
  clipReveal('#steps', '.step');
  clipReveal('.quotes', '.quote');
  clipReveal('.facts', '.facts > div');
  if (finePointer) document.querySelectorAll('.finale__cta, .reviews__foot .btn').forEach(magnetic);
  if (finePointer) cataloguePeek();
}

/* The dark band: the photo prints in from the top edge like a plate going
   through the press, then drifts slower than the page (parallax by transform only). */
function printBand() {
  document.querySelectorAll('.band').forEach(printOne);
}
function printOne(band) {
  const media = band.querySelector('.band__media');
  if (!media) return;
  scroll(animate(media, { y: ['-6%', '6%'] }, { ease: 'linear' }), { target: band, offset: ['start end', 'end start'] });
  if (!below(band)) return;
  const img = media.querySelector('img');
  img.style.clipPath = 'inset(0 0 100% 0)';
  inView(band, () => {
    animate(img, { clipPath: ['inset(0% 0% 100% 0%)', 'inset(0% 0% 0% 0%)'], scale: [1.08, 1] },
      { duration: 1.4, ease: [0.76, 0, 0.18, 1] });
  }, { amount: 0.15 });
}

/* Section headings rise out of their own mask */
function headings() {
  document.querySelectorAll('.sec .h2').forEach((h) => {
    if (!below(h)) return;
    h.innerHTML = '<span class="line"><span>' + h.innerHTML + '</span></span>';
    const inner = h.querySelector('.line > span');
    inner.style.transform = 'translateY(110%)';
    inView(h, () => { animate(inner, { y: ['110%', '0%'] }, { duration: 0.9, ease: EASE }); }, { amount: 0.5 });
  });
}

/* Items wipe in from the top edge, like a page printed line by line */
function clipReveal(groupSel, itemSel) {
  const group = document.querySelector(groupSel);
  if (!group || !below(group)) return;
  const items = [...group.querySelectorAll(itemSel)];
  items.forEach((el) => { el.style.clipPath = 'inset(0 0 100% 0)'; el.style.transform = 'translateY(24px)'; });
  inView(group, () => {
    animate(items, { clipPath: ['inset(0% 0% 100% 0%)', 'inset(0% 0% 0% 0%)'], y: [24, 0] },
      { duration: 0.9, ease: EASE, delay: stagger(0.08) })
      .then?.(() => items.forEach((el) => { el.style.clipPath = ''; }));
  }, { amount: 0.15 });
}

/* Magnetic CTA: the button leans a few pixels toward the cursor */
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
    return () => { btn.removeEventListener('pointermove', onMove); animate(btn, { x: 0, y: 0 }, SPRING_SETTLE); };
  });
}

/* Catalogue hover preview: the file's cover follows the pointer, leaning with its speed.
   Revealed by scale and clip, never by opacity. */
function cataloguePeek() {
  const list = document.querySelector('.cat');
  const peek = document.getElementById('peek');
  if (!list || !peek) return;
  const img = peek.querySelector('img');
  let x = 0, y = 0, tx = 0, ty = 0, vx = 0, shown = false, raf = 0, current = '';
  const HIDDEN = 'inset(50% 50% 50% 50%)', SHOWN = 'inset(0% 0% 0% 0%)';
  peek.style.clipPath = HIDDEN;
  peek.style.transform = 'translate3d(-999px,-999px,0)';

  const loop = () => {
    const dx = tx - x;
    x += dx * 0.18; y += (ty - y) * 0.18;
    vx += (dx * 0.18 - vx) * 0.2;                        // smoothed horizontal speed
    const lean = Math.max(-10, Math.min(10, vx * 0.6));  // lean into the movement
    peek.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${(-4.5 + lean).toFixed(2)}deg)`;
    if (shown || Math.abs(dx) > 0.5) raf = requestAnimationFrame(loop); else raf = 0;
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };

  const show = (id) => {
    const src = `assets/img/covers/${id}.webp`;
    if (current !== src) {
      current = src; img.src = src;
      if (shown) animate(img, { scale: [1.08, 1] }, { duration: 0.45, ease: EASE });
    }
    if (!shown) {
      shown = true; x = tx; y = ty; kick();
      animate(peek, { clipPath: [HIDDEN, SHOWN] }, { duration: 0.5, ease: EASE });
    }
  };
  list.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    tx = e.clientX + 28; ty = e.clientY - peek.offsetHeight / 2;
    const row = e.target.closest('.cat__row');
    if (row) show(row.querySelector('[data-open]').dataset.open);
    kick();
  });
  list.addEventListener('pointerleave', () => {
    if (!shown) return;
    shown = false;
    animate(peek, { clipPath: [SHOWN, HIDDEN] }, { duration: 0.3, ease: [0.5, 0, 0.75, 0] });
  });
  addEventListener('scroll', () => {
    if (!shown) return;
    shown = false; peek.getAnimations().forEach((a) => a.cancel()); peek.style.clipPath = HIDDEN;
  }, { passive: true });
}
