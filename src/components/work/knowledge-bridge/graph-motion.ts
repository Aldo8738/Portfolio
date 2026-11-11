import { gsap } from 'gsap';
import {
  graphViewBox,
  overloadViewBox,
  type GraphLayout,
} from '../../../content/knowledge-graph';

export const knowledgeStoryMotion = {
  heroCountDuration: 1.8,
  scrollScreens: 6.4,
  tabletScrollScreens: 6.4,
  scrub: 0.2,
  checkpointDuration: 0.32,
  readingGap: 160,
  readingFraction: 0.4,
  chapterFraction: 0.625,
  humanAiDuration: 50,
  chapter: {
    problemEnd: 0.18,
    overloadStart: 0.24,
    overloadEnd: 0.42,
    solutionStart: 0.48,
    solutionEnd: 0.64,
    restoreStart: 0.68,
    focusStart: 0.72,
    focusEnd: 0.84,
  },
} as const;

export function resetGraphPresentation(root: HTMLElement) {
  root
    .querySelectorAll(
      '.kb-graph [style], .kb-graph[style], [data-network-host], [data-hero-copy], [data-hero-copy] [style], .kb-hero-metric, .kb-facts, [data-story-progress], .kb-chapter-one-copy, .kb-solution-copy, .kb-human-copy, .kb-human-note, li[data-story-beat], li[data-story-beat] h2, li[data-story-beat] p',
    )
    .forEach((element) => element.removeAttribute('style'));
  root
    .querySelector('[data-graph-layer="viewport"]')
    ?.removeAttribute('transform');
}

export function createChapterTimeline(
  root: HTMLElement,
  layout: GraphLayout,
  pinned: boolean,
) {
  const find = (selector: string) => root.querySelectorAll(selector);
  const timeline = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
  const scene = knowledgeStoryMotion.chapter;
  // One owner for chapter visibility and geometry; reading never changes the graph.
  if (pinned) {
    timeline
      .fromTo(
        find('.kb-chapter-one-copy'),
        { opacity: 1 },
        { opacity: 0, duration: 0.04 },
        scene.problemEnd,
      )
      .fromTo(
        find('.kb-graph'),
        { opacity: 0 },
        { opacity: 1, duration: 0.04 },
        0.2,
      )
      .to(find('.kb-graph'), { opacity: 0, duration: 0.04 }, scene.overloadEnd)
      .fromTo(
        find('.kb-solution-copy'),
        { opacity: 0 },
        { opacity: 1, duration: 0.04 },
        0.44,
      )
      .to(
        find('.kb-solution-copy'),
        { opacity: 0, duration: 0.04 },
        scene.solutionEnd,
      )
      .to(
        find('.kb-graph'),
        { opacity: 1, duration: 0.04 },
        scene.restoreStart,
      );
  }
  timeline
    .fromTo(
      find('.kb-graph'),
      { attr: { viewBox: overloadViewBox[layout] } },
      {
        attr: { viewBox: graphViewBox[layout].story },
        duration: 0.12,
        ease: 'power1.inOut',
      },
      scene.focusStart,
    )
    .fromTo(
      find('[data-overload-only]'),
      { opacity: 1 },
      { opacity: 0, duration: 0.1 },
      0.74,
    )
    .fromTo(
      find('.kb-node:not([data-node-id="berlin"]) .kb-item-mark'),
      { attr: { r: layout === 'desktop' ? 7 : 4.2 } },
      { attr: { r: 4.5 }, duration: 0.12 },
      scene.focusStart,
    )
    .fromTo(
      find('[data-network-detail]'),
      { opacity: 1 },
      { opacity: 0, duration: 0.1 },
      0.74,
    )
    .fromTo(
      find('[data-core-relationships]'),
      { opacity: 0.72 },
      { opacity: 1, duration: 0.08 },
      0.76,
    )
    .to({}, { duration: 0.16 }, scene.focusEnd);
  root.querySelectorAll<SVGTextElement>('.kb-node text').forEach((label) => {
    const style = getComputedStyle(label);
    timeline.fromTo(
      label,
      {
        fill: 'var(--text)',
        opacity: 1,
        fontSize: style.getPropertyValue('--kb-overload-label-size').trim(),
        fontWeight: style.getPropertyValue('--kb-overload-label-weight').trim(),
      },
      {
        fill: 'var(--text)',
        opacity: Number(style.getPropertyValue('--kb-focused-label-opacity')),
        fontSize: style.fontSize,
        fontWeight: style.getPropertyValue('--kb-focused-label-weight').trim(),
        duration: 0.12,
      },
      scene.focusStart,
    );
  });
  return timeline;
}

// Chapter 02 hands directly to Chapter 03 after the focused graph's existing hold.
export function getGraphStoryTiming(pinned: boolean) {
  const start = pinned ? knowledgeStoryMotion.chapterFraction * 100 : 0;
  const end = start + knowledgeStoryMotion.humanAiDuration;
  return { start, end, total: end };
}

export function getLegacyStoryProgress(time: number, pinned: boolean) {
  const { start, end } = getGraphStoryTiming(pinned);
  if (time < start) return time / 100;
  if (time >= end) return 1;
  const progress = (time - start) / (end - start);
  return pinned ? 0.75 + progress * 0.15 : 1 / 3 + progress * 0.4;
}

export function createGraphTimeline(root: HTMLElement, pinned: boolean) {
  const find = (selector: string) => root.querySelectorAll(selector);
  const timing = getGraphStoryTiming(pinned);
  const timeline = gsap.timeline({
    paused: true,
    defaults: { ease: 'none', immediateRender: false },
  });
  timeline
    .set(find('[data-reveal-group]'), { opacity: 1 }, 0)
    .set(
      find(
        '[data-graph-layer="viewport"], [data-graph-layer="priority"], [data-graph-layer="backend"], [data-backend-node], [data-proposal-label], [data-edit-path], [data-return-path], [data-edit-label], [data-return-label]',
      ),
      { opacity: 0 },
      0,
    )
    .set(
      find('[data-corrected-edge]'),
      { opacity: 1, strokeDasharray: 1, strokeDashoffset: 0 },
      0,
    )
    .set(find('[data-incorrect-edge]'), { opacity: 0 }, 0)
    .add(
      createHumanAiTimeline(root, pinned).duration(
        knowledgeStoryMotion.humanAiDuration,
      ),
      timing.start,
    )
    .fromTo(
      find('[data-story-progress]'),
      { scaleX: 0 },
      { scaleX: 1, duration: timing.total },
      0,
    );
  return timeline;
}

function createHumanAiTimeline(root: HTMLElement, pinned: boolean) {
  const find = (selector: string) => root.querySelectorAll(selector);
  const timeline = gsap.timeline({
    defaults: { ease: 'none', immediateRender: false },
  });
  timeline
    .addLabel('read', 0)
    .addLabel('observe', 32)
    .addLabel('correct', 48)
    .addLabel('settled', 62)
    .set(
      find('[data-corrected-edge]'),
      { strokeDasharray: 1, strokeDashoffset: 0 },
      0,
    )
    .to(find('[data-corrected-edge]'), { opacity: 0, duration: 4 }, 0)
    .to(find('[data-core-edge]'), { opacity: 0.2, duration: 4 }, 0)
    .to(find('[data-flow-soften]'), { opacity: 0.35, duration: 4 }, 0)
    .to(find('[data-network-detail]'), { opacity: 0, duration: 4 }, 0)
    .fromTo(
      find('[data-incorrect-edge]'),
      { opacity: 0, stroke: 'var(--text)' },
      { opacity: 1, duration: 4 },
      28,
    )
    .to(find('[data-proposal-label]'), { opacity: 1, duration: 4 }, 28)
    .to(find('[data-human-note]'), { opacity: 1, duration: 4 }, 28)
    .to(find('[data-selection-ring]'), { opacity: 1, duration: 2 }, 'correct')
    .to(
      find('[data-incorrect-edge]'),
      { stroke: 'var(--accent)', duration: 2 },
      'correct',
    )
    .to(find('[data-human-edit-label]'), { opacity: 1, duration: 2 }, 'correct')
    .to(find('[data-proposal-label]'), { opacity: 0, duration: 2 }, 'correct')
    .to(
      find(
        '[data-incorrect-edge], [data-selection-ring], [data-human-edit-label]',
      ),
      { opacity: 0, duration: 2 },
      54,
    )
    .fromTo(
      find('[data-corrected-edge]'),
      { opacity: 0, strokeDasharray: 1, strokeDashoffset: 1 },
      { opacity: 1, strokeDashoffset: 0, duration: 6 },
      56,
    )
    .to(
      find('[data-flow-soften], [data-core-edge]'),
      { opacity: 1, duration: 6 },
      56,
    )
    .fromTo(
      find('[data-ai-learns-label]'),
      { opacity: 0 },
      { opacity: 1, duration: 2 },
      'settled',
    )
    .to(find('[data-ai-learns-label]'), { opacity: 0, duration: 4 }, 96)
    .to({}, { duration: 38 }, 'settled');
  if (pinned)
    timeline
      .fromTo(find('.kb-graph'), { opacity: 1 }, { opacity: 0, duration: 4 }, 0)
      .fromTo(
        find('.kb-human-copy'),
        { opacity: 0 },
        { opacity: 1, duration: 4 },
        4,
      )
      .to(find('.kb-human-copy'), { opacity: 0, duration: 4 }, 24)
      .to(find('.kb-graph'), { opacity: 1, duration: 4 }, 28)
      .to(find('[data-human-note]'), { opacity: 0, duration: 4 }, 96);
  return timeline;
}
