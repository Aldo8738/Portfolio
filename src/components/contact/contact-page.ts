import { gsap, CSSPlugin } from 'gsap';

gsap.registerPlugin(CSSPlugin);
const mounted = new WeakMap<HTMLElement, () => void>();
const contactMotion = {
  reveal: 0.4,
  offset: 8,
  stagger: 0.06,
  symbols: 0.55,
  symbolTravel: 12,
  hover: 0.22,
  hoverTravel: -4,
  hoverScale: 1.035,
} as const;

export function mountContactPage(root: HTMLElement): () => void {
  const existing = mounted.get(root);
  if (existing) return existing;
  const events = new AbortController();
  const options = { signal: events.signal };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let context = gsap.context(() => {}, root);
  let entrance: ReturnType<typeof gsap.timeline> | undefined;
  root.dataset.contactReady = 'true';
  root.dataset.contactMotion = reduced.matches ? 'reduced' : 'full';

  if (!reduced.matches)
    context.add(() => {
      const from = { y: contactMotion.offset, opacity: 0.7 };
      const to = {
        y: 0,
        opacity: 1,
        duration: contactMotion.reveal,
        stagger: contactMotion.stagger,
      };
      entrance = gsap
        .timeline({ defaults: { ease: 'power2.out' } })
        .fromTo(root.querySelectorAll('[data-contact-heading]'), from, to);
      entrance.fromTo(
        root.querySelectorAll('[data-contact-symbol]'),
        { y: contactMotion.symbolTravel, opacity: 0.7 },
        {
          ...to,
          duration: contactMotion.symbols,
          clearProps: 'transform,opacity',
        },
        0.46,
      );
      entrance
        .fromTo(
          root.querySelector('[data-contact-description]'),
          from,
          to,
          0.46,
        )
        .fromTo(root.querySelector('[data-contact-closing]'), from, to, 0.8);
    });

  function rowFrom(target: EventTarget | null) {
    if (!(target instanceof Element)) return null;
    const row = target.closest<HTMLElement>('a[data-contact-method]');
    return row && root.contains(row) ? row : null;
  }

  function select(row: HTMLElement | null) {
    const id = row?.dataset.contactMethod;
    if (root.dataset.activeContact === id) return;
    if (id) root.dataset.activeContact = id;
    else delete root.dataset.activeContact;
    // Complete the entrance so interactive focus is never visually delayed.
    entrance?.progress(1).kill();
    if (reduced.matches) return;
    context.add(() => {
      gsap.to(root.querySelectorAll('.contact-symbol-art'), {
        y: 0,
        scale: 1,
        duration: contactMotion.hover,
        overwrite: 'auto',
        ease: 'power2.out',
      });
      const art = row?.querySelector('.contact-symbol-art');
      if (art)
        gsap.to(art, {
          y: contactMotion.hoverTravel,
          scale: contactMotion.hoverScale,
          duration: contactMotion.hover,
          overwrite: 'auto',
          ease: 'power2.out',
        });
    });
  }

  function enter(event: Event) {
    const row = rowFrom(event.target);
    if (row) select(row);
  }
  function leave(event: Event) {
    const next =
      event instanceof PointerEvent || event instanceof FocusEvent
        ? event.relatedTarget
        : null;
    select(rowFrom(next) ?? rowFrom(document.activeElement));
  }
  root.addEventListener('pointerover', enter, options);
  root.addEventListener('focusin', enter, options);
  root.addEventListener('pointerout', leave, options);
  root.addEventListener('focusout', leave, options);
  reduced.addEventListener(
    'change',
    () => {
      context.revert();
      context = gsap.context(() => {}, root);
      entrance = undefined;
      root.dataset.contactMotion = reduced.matches ? 'reduced' : 'full';
    },
    options,
  );
  document.addEventListener(
    'visibilitychange',
    () => {
      entrance?.paused(document.hidden);
    },
    options,
  );

  const dispose = () => {
    events.abort();
    context.revert();
    delete root.dataset.activeContact;
    delete root.dataset.contactReady;
    delete root.dataset.contactMotion;
    mounted.delete(root);
  };
  mounted.set(root, dispose);
  return dispose;
}
