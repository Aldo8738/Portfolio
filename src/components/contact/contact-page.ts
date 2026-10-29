import { gsap, CSSPlugin } from 'gsap';

gsap.registerPlugin(CSSPlugin);

export function mountContactPage(root: HTMLElement): () => void {
  const motion = gsap.matchMedia();
  motion.add(
    '(prefers-reduced-motion: no-preference)',
    () => {
      gsap.fromTo(
        root.querySelectorAll('[data-contact-reveal]'),
        { y: 8, opacity: 0.7 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out' },
      );
    },
    root,
  );
  return () => motion.revert();
}
