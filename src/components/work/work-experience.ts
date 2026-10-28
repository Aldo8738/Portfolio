import { gsap, CSSPlugin } from 'gsap';

gsap.registerPlugin(CSSPlugin);

const mounted = new WeakMap<HTMLElement, () => void>();
const motion = {
  settle: 0.7,
  select: 0.95,
  diagram: 1.1,
  titleTravel: 56,
  copyTravel: 28,
  visualTravel: 36,
} as const;

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
      timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
      const title = section.querySelector<HTMLElement>('[data-project-title]');
      if (title) {
        timeline.fromTo(
          title,
          {
            x: 0,
            y: motion.titleTravel,
            rotation: -1.5,
            scale: 0.96,
            transformOrigin: 'left top',
            opacity: 0,
          },
          {
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            opacity: 1,
            duration: motion.select,
          },
          0,
        );
      }
      timeline.fromTo(
        section.querySelectorAll('[data-copy-reveal]'),
        { opacity: 0, y: motion.copyTravel },
        { opacity: 1, y: 0, duration: motion.settle, stagger: 0.11 },
        0.18,
      );
      const visual = section.querySelector<HTMLElement>('[data-work-visual]');
      if (!visual) return;
      timeline.fromTo(
        visual,
        {
          opacity: 0,
          y: motion.visualTravel,
          scale: 0.94,
          transformOrigin: '50% 50%',
        },
        { opacity: 1, y: 0, scale: 1, duration: motion.diagram },
        0.1,
      );
      timeline.fromTo(
        visual.querySelectorAll('[data-reveal]'),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: motion.diagram, stagger: 0.12 },
        0.22,
      );
      for (const path of Array.from(
        visual.querySelectorAll<SVGPathElement>('[data-trace] path'),
      ).slice(0, 6)) {
        const length = path.getTotalLength();
        timeline.fromTo(
          path,
          { strokeDasharray: length, strokeDashoffset: length },
          { strokeDashoffset: 0, duration: motion.diagram },
          0.28,
        );
      }
      if (visual.dataset.workVisual === 'knowledge-hierarchy') {
        timeline.fromTo(
          visual.querySelector('.hierarchy-scene'),
          { scale: 0.93, transformOrigin: '52% 60%' },
          { scale: 1, duration: 1.15 },
          0,
        );
        timeline.fromTo(
          visual.querySelectorAll('[data-distant]'),
          { opacity: 1 },
          { opacity: 0.32, duration: motion.diagram },
          0.25,
        );
        timeline.fromTo(
          visual.querySelector('[data-tag-suggested]'),
          { opacity: 1 },
          { opacity: 0, duration: 0.2 },
          0.85,
        );
        timeline.fromTo(
          visual.querySelector('[data-tag-corrected]'),
          { opacity: 0 },
          { opacity: 1, duration: 0.2 },
          1,
        );
      }
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
