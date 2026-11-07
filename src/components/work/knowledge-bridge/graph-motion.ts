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
} as const;

export function resetGraphPresentation(root: HTMLElement) {
  root
    .querySelectorAll(
      '.kb-graph [style], .kb-graph[style], [data-network-host], [data-hero-copy], [data-hero-copy] [style], .kb-hero-metric, .kb-facts, [data-graph-metric], [data-story-progress], .kb-chapter-one-copy, li[data-story-beat], li[data-story-beat] h2, li[data-story-beat] p',
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
  timeline
    .fromTo(
      find('.kb-graph'),
      { opacity: 0 },
      { opacity: 1, duration: 0.08 },
      pinned ? 0.32 : 0.04,
    )
    .fromTo(
      find('.kb-graph'),
      { attr: { viewBox: overloadViewBox[layout] } },
      {
        attr: { viewBox: graphViewBox[layout].story },
        duration: 0.18,
        ease: 'power1.inOut',
      },
      0.6,
    )
    .fromTo(
      find('[data-overload-only]'),
      { opacity: 1 },
      { opacity: 0, duration: 0.18 },
      0.6,
    )
    .fromTo(
      find('.kb-item-mark'),
      { attr: { r: 3 } },
      { attr: { r: 4.5 }, duration: 0.18 },
      0.6,
    )
    .fromTo(
      find('[data-network-detail]'),
      { opacity: 1 },
      { opacity: 0.35, duration: 0.18 },
      0.6,
    )
    .to({}, { duration: 0.22 }, 0.78);
  if (pinned)
    timeline.fromTo(
      find('.kb-chapter-one-copy'),
      { opacity: 1 },
      { opacity: 0, duration: 0.08 },
      0.24,
    );
  return timeline;
}

export function createGraphTimeline(
  root: HTMLElement,
  mobile: boolean,
  focused: boolean,
) {
  const find = (selector: string) => root.querySelectorAll(selector);
  const timeline = gsap.timeline({
    paused: true,
    defaults: { ease: 'none', immediateRender: false },
  });
  timeline
    .addLabel('overload', 0)
    .addLabel('viewport', 25)
    .addLabel('feedback', 50)
    .addLabel('edit', 60)
    .addLabel('return', 68)
    .addLabel('correction', 75)
    .addLabel('evidence', 80)
    .set(find('[data-reveal-group]'), { opacity: 1 }, 0)
    .set(
      find(
        '[data-graph-layer="viewport"], [data-graph-layer="priority"], [data-graph-layer="backend"], [data-backend-node], [data-proposal-label], [data-edit-path], [data-return-path], [data-edit-label], [data-return-label], [data-graph-metric]',
      ),
      { opacity: 0 },
      0,
    )
    .set(find('[data-corrected-edge]'), { opacity: 1 }, 0)
    .set(find('[data-incorrect-edge]'), { opacity: 0 }, 0);

  timeline
    .to(
      find(
        '[data-distant-detail]:not(.kb-node), .kb-node[data-distant-detail] circle',
      ),
      { opacity: 0.45, duration: 4 },
      25,
    )
    .to(find('[data-network-detail]'), { opacity: 0.1, duration: 4 }, 25)
    .to(find('[data-graph-layer="viewport"]'), { opacity: 1, duration: 2 }, 29)
    .fromTo(
      find('[data-viewport-frame]'),
      { strokeDasharray: 1, strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 4, ease: 'power1.inOut' },
      29,
    )
    .to(find('[data-graph-layer="priority"]'), { opacity: 1, duration: 1 }, 35)
    .to(find('[data-graph-layer="priority"]'), { opacity: 0, duration: 2 }, 43)
    .to(find('[data-corrected-edge]'), { opacity: 0, duration: 2 }, 47)
    .to(find('[data-graph-layer="viewport"]'), { opacity: 0, duration: 2 }, 50)
    .to(find('[data-graph-layer="backend"]'), { opacity: 1, duration: 1 }, 53)
    .to(
      find('[data-incorrect-edge], [data-proposal-label]'),
      { opacity: 1, duration: 2 },
      53,
    )
    .to(find('[data-selection-ring]'), { opacity: 1, duration: 2 }, 56)
    .to(find('[data-proposal-label]'), { opacity: 0, duration: 2 }, 56)
    .to(find('[data-incorrect-edge]'), { opacity: 0, duration: 2 }, 58)
    .to(find('[data-backend-node]'), { opacity: 1, duration: 2 }, 58)
    .to(find('[data-selection-ring]'), { opacity: 0, duration: 1 }, 'edit')
    .to(
      find('[data-edit-path], [data-edit-label]'),
      { opacity: 1, duration: 1 },
      'edit',
    )
    .to(
      find('[data-edit-path], [data-edit-label]'),
      { opacity: 0, duration: 1 },
      66,
    )
    .to(
      find('[data-return-path], [data-return-label]'),
      { opacity: 1, duration: 1 },
      'return',
    )
    .to(
      find('[data-return-path], [data-return-label]'),
      { opacity: 0, duration: 1 },
      74,
    )
    .fromTo(
      find('[data-corrected-edge]'),
      { opacity: 0, strokeDasharray: 1, strokeDashoffset: 1 },
      { opacity: 1, strokeDashoffset: 0, duration: 3 },
      'correction',
    )
    .to(find('[data-graph-layer="backend"]'), { opacity: 0, duration: 2 }, 78)
    .to(
      find('[data-network-detail]'),
      { opacity: mobile ? 0.12 : 0.22, duration: 4 },
      80,
    )
    .to(
      find(
        '[data-distant-detail]:not(.kb-node), .kb-node[data-distant-detail] circle',
      ),
      { opacity: 0.45, duration: 4 },
      80,
    )
    .fromTo(
      find('[data-graph-metric]'),
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 6, ease: 'power2.out' },
      82,
    );

  addPacket(
    timeline,
    root,
    '[data-priority-path]',
    '[data-priority-packet]',
    36,
    5,
  );
  addPacket(
    timeline,
    root,
    '[data-edit-path]',
    '[data-feedback-packet]',
    61,
    4,
  );
  addPacket(
    timeline,
    root,
    '[data-return-path]',
    '[data-delivery-packet]',
    69,
    4,
  );
  const prefix = focused ? knowledgeStoryMotion.chapterFraction * 100 : 0;
  const scale = (100 - prefix) / 75;
  for (const tween of timeline.getChildren(false, true, false)) {
    const start = tween.startTime();
    if (start === 0) continue;
    tween
      .duration(tween.duration() * scale)
      .startTime(prefix + (start - 25) * scale);
  }
  timeline.fromTo(
    find('[data-story-progress]'),
    { scaleX: 0 },
    { scaleX: 1, duration: 100 },
    0,
  );
  return timeline;
}

function addPacket(
  timeline: gsap.core.Timeline,
  root: ParentNode,
  pathSelector: string,
  packetSelector: string,
  start: number,
  duration: number,
) {
  const path = root.querySelector<SVGPathElement>(pathSelector);
  const dot = root.querySelector<SVGCircleElement>(packetSelector);
  if (!path || !dot) return;
  const distance = path.getTotalLength();
  const travel = { progress: 0 };
  gsap.set(dot, { attr: { cx: 0, cy: 0 } });
  timeline
    .to(dot, { opacity: 1, duration: 1 }, start)
    .to(
      travel,
      {
        progress: 1,
        duration,
        onUpdate: () => {
          const point = path.getPointAtLength(distance * travel.progress);
          dot.setAttribute('cx', String(point.x));
          dot.setAttribute('cy', String(point.y));
        },
      },
      start,
    )
    .to(dot, { opacity: 0, duration: 1 }, start + duration);
}
