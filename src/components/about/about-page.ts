import { gsap, CSSPlugin } from 'gsap';

gsap.registerPlugin(CSSPlugin);
const aboutMotion = {
  duration: 0.45,
  offset: 8,
  stagger: 0.05,
  pause: 0.2,
} as const;

export function mountAboutPage(root: HTMLElement): () => void {
  const motion = gsap.matchMedia();
  const seen = new Set<string>();
  motion.add(
    {
      full: '(prefers-reduced-motion: no-preference)',
      reduced: '(prefers-reduced-motion: reduce)',
    },
    (context) => {
      if (context.conditions?.reduced) {
        seen.add('intro');
        seen.add('ending');
        return;
      }
      const from = { y: aboutMotion.offset, opacity: 0.7 };
      const to = {
        y: 0,
        opacity: 1,
        duration: aboutMotion.duration,
        ease: 'power2.out',
      };
      if (!seen.has('intro')) {
        seen.add('intro');
        gsap.fromTo(root.querySelectorAll('[data-about-intro]'), from, {
          ...to,
          stagger: aboutMotion.stagger,
        });
      }
      const ending = root.querySelector<HTMLElement>('[data-about-ending]');
      if (!ending || seen.has('ending')) return;
      const observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          observer.disconnect();
          seen.add('ending');
          context.add(() => {
            gsap
              .timeline()
              .fromTo(ending.querySelectorAll('[data-about-setup]'), from, {
                ...to,
                stagger: aboutMotion.stagger,
              })
              .fromTo(
                ending.querySelector('[data-about-payoff]'),
                from,
                to,
                `+=${aboutMotion.pause}`,
              );
          });
        },
        { threshold: 0.15 },
      );
      observer.observe(ending);
      return () => observer.disconnect();
    },
    root,
  );
  return () => motion.revert();
}
