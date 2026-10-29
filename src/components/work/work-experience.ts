import { gsap, CSSPlugin } from 'gsap';
import { createProjectReveal, projectMotion as motion } from './project-motion';

gsap.registerPlugin(CSSPlugin);

const mounted = new WeakMap<HTMLElement, () => void>();

export function mountWorkExperience(
  root: HTMLElement,
  { animateEntrance = true }: { animateEntrance?: boolean } = {},
): () => void {
  const existing = mounted.get(root);
  if (existing) return existing;
  const events = new AbortController();
  const options = { signal: events.signal };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const sections = Array.from(
    root.querySelectorAll<HTMLElement>('[data-project-section]'),
  );
  const initiallyRevealed = new Set<Element>(animateEntrance ? [] : sections);
  let context = gsap.context(() => {}, root);
  let timeline: ReturnType<typeof gsap.timeline> | null = null;
  root.dataset.workReady = 'true';
  root.dataset.workMotion = reduced.matches ? 'reduced' : 'full';

  function select(slug: string | null) {
    root.dataset.activeProject = slug ?? '';
  }

  function animateSection(section: HTMLElement) {
    if (reduced.matches) return;
    context.add(() => {
      timeline?.progress(1).kill();
      timeline = createProjectReveal(section);
    });
  }

  function fromHistory() {
    timeline?.progress(1).kill();
    const section = sections.find(
      (section) => `#${section.id}` === location.hash,
    );
    select(section?.dataset.projectSection ?? null);
  }

  function resetMotion() {
    context.revert();
    context = gsap.context(() => {}, root);
    timeline = null;
    root.dataset.workMotion = reduced.matches ? 'reduced' : 'full';
  }

  const observer = new IntersectionObserver(
    (entries) => {
      // The monitor already revealed visible sections; later scroll entries still animate.
      const initialEntries = new Set(
        entries
          .filter((entry) => initiallyRevealed.delete(entry.target))
          .map((entry) => entry.target),
      );
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort(
          (a, b) =>
            Math.abs(a.boundingClientRect.top - innerHeight * 0.2) -
            Math.abs(b.boundingClientRect.top - innerHeight * 0.2),
        );
      const section = visible[0]?.target;
      if (!(section instanceof HTMLElement)) return;
      select(section.dataset.projectSection ?? null);
      if (!initialEntries.has(section)) animateSection(section);
    },
    { threshold: 0, rootMargin: '-10% 0px -10% 0px' },
  );
  sections.forEach((section) => observer.observe(section));
  window.addEventListener('popstate', fromHistory, options);
  window.addEventListener('hashchange', fromHistory, options);
  reduced.addEventListener('change', resetMotion, options);
  document.addEventListener(
    'visibilitychange',
    () => timeline?.paused(document.hidden),
    options,
  );
  fromHistory();
  if (animateEntrance && !reduced.matches && !location.hash)
    context.add(() => {
      timeline = gsap.timeline();
      timeline.fromTo(
        root.querySelectorAll('.work-header > *'),
        { y: motion.copyTravel, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: motion.select,
          stagger: 0.1,
          ease: 'power3.out',
        },
      );
    });

  const dispose = () => {
    events.abort();
    observer.disconnect();
    context.revert();
    delete root.dataset.workReady;
    delete root.dataset.activeProject;
    delete root.dataset.workMotion;
    mounted.delete(root);
  };
  mounted.set(root, dispose);
  return dispose;
}
