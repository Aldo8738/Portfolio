import { gsap, CSSPlugin } from 'gsap';

gsap.registerPlugin(CSSPlugin);

export const projectMotion = {
  settle: 0.7,
  select: 0.95,
  diagram: 1.1,
  titleTravel: 56,
  copyTravel: 28,
  visualTravel: 36,
  copyStagger: 0.11,
} as const;

export function createProjectReveal(section: HTMLElement) {
  const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
  const title = section.querySelector<HTMLElement>('[data-project-title]');
  if (title) {
    timeline.fromTo(
      title,
      {
        x: 0,
        y: projectMotion.titleTravel,
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
        duration: projectMotion.select,
      },
      0,
    );
  }
  const copy = section.querySelectorAll('[data-copy-reveal]');
  if (copy.length > 0)
    timeline.fromTo(
      copy,
      { opacity: 0, y: projectMotion.copyTravel },
      {
        opacity: 1,
        y: 0,
        duration: projectMotion.settle,
        stagger: projectMotion.copyStagger,
      },
      0.18,
    );
  const visual = section.querySelector<HTMLElement>('[data-work-visual]');
  if (!visual) return timeline;
  timeline.fromTo(
    visual,
    {
      opacity: 0,
      y: projectMotion.visualTravel,
      scale: 0.94,
      transformOrigin: '50% 50%',
    },
    { opacity: 1, y: 0, scale: 1, duration: projectMotion.diagram },
    0.1,
  );
  timeline.fromTo(
    visual.querySelectorAll('[data-reveal]'),
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: projectMotion.diagram, stagger: 0.12 },
    0.22,
  );
  for (const path of Array.from(
    visual.querySelectorAll<SVGPathElement>('[data-trace] path'),
  ).slice(0, 6)) {
    const length = path.getTotalLength();
    timeline.fromTo(
      path,
      { strokeDasharray: length, strokeDashoffset: length },
      { strokeDashoffset: 0, duration: projectMotion.diagram },
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
      { opacity: 0.32, duration: projectMotion.diagram },
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
  return timeline;
}
