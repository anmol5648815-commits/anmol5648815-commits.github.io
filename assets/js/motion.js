/* Digital Virtuoso Services: section motion (below the shelf)
   framer-motion's DOM API, vendored at ./vendor/framer-motion-dom.min.js.
   House rule from the catalogue design: no opacity fades. Every reveal is a
   mask slide or a clip. Nothing runs when reduced motion is requested. */
import { animate, inView, hover, stagger } from './vendor/framer-motion-dom.min.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const EASE = [0.2, 0.8, 0.2, 1];
const SPRING_POINTER = { type: 'spring', stiffness: 260, damping: 24 };
const SPRING_SETTLE = { type: 'spring', stiffness: 170, damping: 22 };
const below = (el) => el.getBoundingClientRect().top > innerHeight;

if (!reduce) {
  headings();
  clipReveal('.cat', '.cat__row');
  clipReveal('.tiers', '.tier');
  clipReveal('#steps', '.step');
  clipReveal('.quotes', '.quote');
  clipReveal('.facts', '.facts > div');
  if (finePointer) document.querySelectorAll('.contact .btn--large, .reviews__foot .btn').forEach(magnetic);
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
