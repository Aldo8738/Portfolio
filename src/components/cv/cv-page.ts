import { gsap, CSSPlugin } from 'gsap';

gsap.registerPlugin(CSSPlugin);
const mounted = new WeakMap<HTMLElement, () => void>();
const cvMotion = { reveal: 0.45, line: 0.65 } as const;

export function mountCvPage(root: HTMLElement): () => void {
  const existing = mounted.get(root);
  if (existing) return existing;
  const events = new AbortController();
  const options = { signal: events.signal };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const entries = Array.from(
    root.querySelectorAll<HTMLElement>('[data-career-entry]'),
  );
  const skills = Array.from(
    root.querySelectorAll<HTMLElement>('[data-skill-id]'),
  );
  const seen = new Set<Element>();
  const timelines = new Set<ReturnType<typeof gsap.timeline>>();
  let context = gsap.context(() => {}, root);
  root.dataset.cvReady = 'true';
  root.dataset.cvMotion = reduced.matches ? 'reduced' : 'full';

  function select(entry: HTMLElement | null) {
    const ids = new Set(
      entry?.dataset.skillIds?.split(' ').filter(Boolean) ?? [],
    );
    if (entry) root.dataset.activeCareer = entry.dataset.careerEntry;
    else delete root.dataset.activeCareer;
    for (const item of entries)
      item.dataset.emphasized = String(item === entry);
    for (const skill of skills) {
      if (entry)
        skill.dataset.related = String(ids.has(skill.dataset.skillId ?? ''));
      else delete skill.dataset.related;
    }
  }

  function getEntry(target: EventTarget | null) {
    if (!(target instanceof Element)) return null;
    const entry = target.closest<HTMLElement>(
      '[data-career-entry][data-kind="employment"]',
    );
    return entry && root.contains(entry) ? entry : null;
  }

  function enter(event: Event) {
    const entry = getEntry(event.target);
    if (entry || event.type === 'focusin') select(entry);
  }
  function leave(event: Event) {
    if (event instanceof PointerEvent && event.pointerType === 'touch') return;
    const next =
      event instanceof FocusEvent || event instanceof PointerEvent
        ? event.relatedTarget
        : null;
    const nextEntry = getEntry(next);
    if (nextEntry === getEntry(event.target)) return;
    select(nextEntry ?? getEntry(document.activeElement));
  }

  function reveal(entry: Element) {
    if (seen.has(entry)) return;
    seen.add(entry);
    if (reduced.matches) return;
    context.add(() => {
      const timeline = gsap.timeline({ defaults: { ease: 'power2.out' } });
      timelines.add(timeline);
      timeline.fromTo(
        entry.querySelector('[data-cv-reveal]'),
        { y: 8, opacity: 0.65 },
        { y: 0, opacity: 1, duration: cvMotion.reveal },
        0,
      );
      timeline.fromTo(
        entry,
        { '--timeline-progress': 0.55 },
        { '--timeline-progress': 1, duration: cvMotion.line },
        0,
      );
      timeline.fromTo(
        entry.querySelector('.career-marker'),
        { scale: 0.75 },
        { scale: 1, duration: cvMotion.reveal },
        0,
      );
    });
  }

  const observer = new IntersectionObserver(
    (changes) => {
      for (const change of changes)
        if (change.isIntersecting) reveal(change.target);
    },
    { threshold: 0.15 },
  );
  entries.forEach((entry) => observer.observe(entry));
  root.addEventListener('pointerover', enter, options);
  root.addEventListener('focusin', enter, options);
  root.addEventListener('pointerout', leave, options);
  root.addEventListener('focusout', leave, options);
  root.addEventListener(
    'pointerdown',
    (event) => {
      if (event.pointerType === 'touch') select(getEntry(event.target));
    },
    options,
  );
  reduced.addEventListener(
    'change',
    () => {
      context.revert();
      context = gsap.context(() => {}, root);
      timelines.clear();
      root.dataset.cvMotion = reduced.matches ? 'reduced' : 'full';
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
  if (!reduced.matches)
    context.add(() => {
      const timeline = gsap.timeline();
      timelines.add(timeline);
      timeline.fromTo(
        root.querySelectorAll('.cv-intro > *'),
        { y: 6, opacity: 0.7 },
        { y: 0, opacity: 1, duration: cvMotion.reveal, stagger: 0.04 },
      );
    });

  const dispose = () => {
    events.abort();
    observer.disconnect();
    context.revert();
    timelines.clear();
    entries.forEach((entry) => delete entry.dataset.emphasized);
    skills.forEach((skill) => delete skill.dataset.related);
    delete root.dataset.cvReady;
    delete root.dataset.cvMotion;
    delete root.dataset.activeCareer;
    mounted.delete(root);
  };
  mounted.set(root, dispose);
  return dispose;
}
