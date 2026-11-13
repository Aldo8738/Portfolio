import { gsap, CSSPlugin } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { researchBeats } from '../../../content/trading-research';

gsap.registerPlugin(CSSPlugin, ScrollTrigger);

const mounted = new WeakMap<HTMLElement, () => void>();
const storyTiming = {
  transition: 2,
  assembly: 8,
  scrollViewports: 7.5,
  beats: [0, 16, 38, 47, 70, 79],
  end: 107,
} as const;
const entranceMotion = {
  desktop: { travel: 34, rotation: 1.2, duration: 0.95, stagger: 0.25 },
  compact: { travel: 16, rotation: 0.3, duration: 0.65, stagger: 0.14 },
} as const;

export function mountResearchDesk(root: HTMLElement): () => void {
  const existing = mounted.get(root);
  if (existing) return existing;
  const media = gsap.matchMedia();
  let disposed = false;

  function initialize() {
    if (disposed) return;
    const stage = root.querySelector<HTMLElement>('[data-desk-stage]');
    const papers = root.querySelector<HTMLElement>('[data-master-papers]');
    const assessment = root.querySelector<HTMLElement>('.rd-assessment');
    if (!stage || !papers || !assessment) return;
    const cards = Array.from(
      papers.querySelectorAll<HTMLElement>('[data-source]'),
    );

    function createDeskEntrance(compact: boolean) {
      const motion = compact ? entranceMotion.compact : entranceMotion.desktop;
      const rotations = cards.map((card) =>
        Number(gsap.getProperty(card, 'rotation')),
      );
      return gsap.timeline().fromTo(
        cards,
        {
          opacity: 0,
          x: (_index, card: HTMLElement) => {
            const id = card.dataset.source;
            if (id === 'news' || id === 'fundamentals') return -motion.travel;
            if (id === 'discussion' || id === 'portfolio') return motion.travel;
            return 0;
          },
          y: (_index, card: HTMLElement) =>
            card.dataset.source === 'market'
              ? motion.travel
              : motion.travel / 4,
          scale: 0.975,
          rotation: (index) =>
            (rotations[index] ?? 0) +
            (index % 2 === 0 ? -motion.rotation : motion.rotation),
        },
        {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          rotation: (index) => rotations[index] ?? 0,
          duration: motion.duration,
          stagger: motion.stagger,
          ease: 'power3.out',
        },
      );
    }

    media.add(
      '(min-width: 1100px) and (min-height: 760px) and (prefers-reduced-motion: no-preference)',
      () => {
        root.dataset.deskMode = 'stage';
        const intro = root.querySelector('[data-beat="intro"] .rd-copy');
        const explain = root.querySelector('[data-beat="explain"] .rd-copy');
        const synthesis = root.querySelector(
          '[data-beat="synthesis"] .rd-copy',
        );
        const sourceLabel = root.querySelector('[data-beat="sources"] > h2');
        const evidenceLabel = root.querySelector('[data-beat="evidence"] > h2');
        const assessmentLabel = root.querySelector<HTMLElement>(
          '[data-beat="assessment"] > h2',
        );
        const assessmentScale = 0.84;
        const hidden = [
          explain,
          synthesis,
          sourceLabel,
          evidenceLabel,
          assessmentLabel,
          assessment,
        ];
        gsap.set(hidden, { autoAlpha: 0 });
        gsap.set(papers, { opacity: 0.05, '--evidence-visibility': 0 });
        gsap.set(assessment, { y: 25 });

        const timeline = gsap.timeline({
          paused: true,
          defaults: { ease: 'none', duration: storyTiming.transition / 2 },
        });
        const transition = storyTiming.transition;
        const at = (index: number) => storyTiming.beats[index] ?? 0;
        const leave = (index: number) => at(index) - transition;
        const enter = (index: number) => at(index) - transition / 2;
        const assemblyStart = at(1) - storyTiming.assembly;
        researchBeats.forEach((beat, index) =>
          timeline.addLabel(beat.id, at(index)),
        );

        timeline
          .to(intro, { autoAlpha: 0, y: -8 }, assemblyStart - transition / 2)
          .set(papers, { opacity: 1 }, assemblyStart)
          .to(sourceLabel, { autoAlpha: 1 }, assemblyStart)
          .add(
            createDeskEntrance(false).duration(storyTiming.assembly),
            assemblyStart,
          )
          .to(papers, { opacity: 0.05 }, leave(2))
          .to(sourceLabel, { autoAlpha: 0 }, leave(2))
          .to(explain, { autoAlpha: 1 }, enter(2))
          .to(explain, { autoAlpha: 0 }, leave(3))
          .to(papers, { opacity: 1 }, enter(3))
          .to(evidenceLabel, { autoAlpha: 1 }, enter(3))
          .to(papers, { '--evidence-visibility': 1 }, enter(3))
          .to(papers, { opacity: 0.05 }, leave(4))
          .to(evidenceLabel, { autoAlpha: 0 }, leave(4))
          .set(papers, { '--evidence-visibility': 0 }, at(4))
          .to(synthesis, { autoAlpha: 1 }, enter(4))
          .to(synthesis, { autoAlpha: 0 }, leave(5))
          .to(papers, { opacity: 0.5 }, enter(5))
          .to(
            cards,
            {
              x: (_index, card: HTMLElement) => {
                const id = card.dataset.source;
                return id === 'news' || id === 'fundamentals'
                  ? -50
                  : id === 'market'
                    ? 0
                    : 50;
              },
              y: (_index, card: HTMLElement) => {
                // Untransformed layout boxes prevent offsets accumulating on refresh.
                const top = papers.offsetTop + card.offsetTop;
                const scaleInset =
                  (card.offsetHeight * (1 - assessmentScale)) / 2;
                if (card.dataset.source === 'market') {
                  const assessmentBottom =
                    (stage.clientHeight + assessment.offsetHeight) / 2;
                  return Math.max(
                    120,
                    assessmentBottom + 12 - top - scaleInset,
                  );
                }
                if (
                  card.dataset.source === 'news' ||
                  card.dataset.source === 'discussion'
                ) {
                  const labelBottom = assessmentLabel
                    ? assessmentLabel.offsetTop + assessmentLabel.offsetHeight
                    : 32;
                  return Math.max(-80, labelBottom + 24 - top - scaleInset);
                }
                return 70;
              },
              scale: assessmentScale,
            },
            enter(5),
          )
          .to(assessmentLabel, { autoAlpha: 1 }, enter(5))
          .to(assessment, { autoAlpha: 1, y: 0 }, enter(5))
          .to({}, { duration: storyTiming.end - at(5) }, at(5));

        const preview = import.meta.env.DEV
          ? new URLSearchParams(location.search).get('desk')
          : null;
        const previewBeat = researchBeats.find((beat) => beat.id === preview);
        if (previewBeat) {
          timeline.seek(previewBeat.id, false);
        } else {
          ScrollTrigger.create({
            trigger: root,
            pin: stage,
            start: 'top top+=16',
            end: () => `+=${innerHeight * storyTiming.scrollViewports}`,
            animation: timeline,
            scrub: true,
            invalidateOnRefresh: true,
          });
        }
        return () => {
          delete root.dataset.deskMode;
        };
      },
    );

    media.add(
      '(max-width: 1099px) and (prefers-reduced-motion: no-preference), (max-height: 759px) and (prefers-reduced-motion: no-preference)',
      () => {
        ScrollTrigger.create({
          trigger: papers,
          start: 'top 72%',
          end: 'top 10%',
          animation: createDeskEntrance(true),
          scrub: true,
        });
      },
    );
  }

  void document.fonts.ready.then(initialize).catch((error: unknown) => {
    media.revert();
    delete root.dataset.deskMode;
    console.error(
      'Research Desk animation unavailable; showing the static story.',
      error,
    );
  });

  const dispose = () => {
    disposed = true;
    media.revert();
    delete root.dataset.deskMode;
    mounted.delete(root);
  };
  mounted.set(root, dispose);
  return dispose;
}
