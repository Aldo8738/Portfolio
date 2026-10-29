import { gsap } from 'gsap';
import { createProjectReveal, projectMotion } from './project-motion';

const mounted = new WeakMap<HTMLElement, () => void>();

export function mountCaseStudy(root: HTMLElement): () => void {
  const existing = mounted.get(root);
  if (existing) return existing;
  const events = new AbortController();
  const options = { signal: events.signal };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let context = gsap.context(() => {}, root);
  const timelines = new Map<Element, ReturnType<typeof gsap.timeline>>();
  root.dataset.caseReady = 'true';
  root.dataset.caseMotion = reduced.matches ? 'reduced' : 'full';

  function reveal(section: HTMLElement) {
    if (reduced.matches) return;
    context.add(() => {
      timelines.get(section)?.progress(1).kill();
      const timeline =
        section.dataset.caseReveal === 'hero'
          ? createProjectReveal(section)
          : gsap.timeline({ defaults: { ease: 'power3.out' } }).fromTo(
              section.children,
              { y: projectMotion.copyTravel, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: projectMotion.settle,
                stagger: projectMotion.copyStagger,
              },
            );
      timelines.set(section, timeline);
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.target instanceof HTMLElement)
          reveal(entry.target);
        else timelines.get(entry.target)?.progress(1).kill();
      }
    },
    { threshold: 0, rootMargin: '-10% 0px -10% 0px' },
  );
  root
    .querySelectorAll('[data-case-reveal]')
    .forEach((section) => observer.observe(section));
  reduced.addEventListener(
    'change',
    () => {
      context.revert();
      context = gsap.context(() => {}, root);
      timelines.clear();
      root.dataset.caseMotion = reduced.matches ? 'reduced' : 'full';
    },
    options,
  );
  document.addEventListener(
    'visibilitychange',
    () => {
      timelines.forEach((timeline) => timeline.paused(document.hidden));
    },
    options,
  );

  const dispose = () => {
    events.abort();
    observer.disconnect();
    context.revert();
    timelines.clear();
    delete root.dataset.caseReady;
    delete root.dataset.caseMotion;
    mounted.delete(root);
  };
  mounted.set(root, dispose);
  return dispose;
}
