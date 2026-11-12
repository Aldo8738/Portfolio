import { gsap, CSSPlugin } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { researchBeats } from '../../../content/trading-research';

gsap.registerPlugin(CSSPlugin, ScrollTrigger);

const mounted = new WeakMap<HTMLElement, () => void>();
const storyTiming = {
  transition: 2,
  scrollViewports: 7,
  beats: [0, 9, 31, 40, 63, 72],
  end: 100,
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
        const cards = papers.querySelectorAll<HTMLElement>('[data-source]');
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
        researchBeats.forEach((beat, index) =>
          timeline.addLabel(beat.id, at(index)),
        );

        timeline
          .to(intro, { autoAlpha: 0 }, leave(1))
          .to(papers, { opacity: 1 }, enter(1))
          .to(sourceLabel, { autoAlpha: 1 }, enter(1))
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
