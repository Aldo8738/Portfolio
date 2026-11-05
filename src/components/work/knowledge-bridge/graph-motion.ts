import { gsap } from 'gsap';
import {
  graphPoint,
  heroPoint,
  curvedLink,
  correctionPath,
  graphViewBox,
  graphLinks,
  peripheralPoints,
  peripheralPath,
  type GraphLayout,
} from '../../../content/knowledge-graph';

export const knowledgeStoryMotion = {
  heroCountDuration: 1.8,
  scrollScreens: 1.8,
  tabletScrollScreens: 1.5,
  scrub: 0.2,
  checkpointDuration: 0.32,
  readingGap: 280,
  readingFraction: 0.95,
  textRevealDuration: 5,
  textRevealStagger: 2,
  heroExit: {
    metricStart: 0.12,
    descriptionStart: 0.24,
    subtitleStart: 0.34,
    titleStart: 0.46,
    duration: 0.14,
  },
} as const;

export function resetGraphPresentation(root: HTMLElement) {
  root
    .querySelectorAll(
      '.kb-graph [style], .kb-graph[style], [data-network-host], [data-hero-copy], [data-hero-copy] [style], .kb-hero-metric, .kb-hero-steps, .kb-entry-hint, .kb-facts, [data-graph-metric], [data-story-progress], li[data-story-beat], li[data-story-beat] h2, li[data-story-beat] p',
    )
    .forEach((element) => element.removeAttribute('style'));
  root
    .querySelector('[data-graph-layer="viewport"]')
    ?.removeAttribute('transform');
}

export function createGraphIntro(root: HTMLElement, layout: GraphLayout) {
  const find = (selector: string) => root.querySelectorAll(selector);
  const timeline = gsap.timeline({
    paused: true,
    defaults: { ease: 'power1.inOut' },
  });
  const introPoint = (id: string) =>
    id === 'paris' || id === 'france'
      ? heroPoint(id, layout)
      : graphPoint(id, layout);
  timeline.fromTo(
    find('.kb-graph'),
    { attr: { viewBox: graphViewBox[layout].hero } },
    { attr: { viewBox: graphViewBox[layout].story }, duration: 1 },
    0,
  );
  for (const id of ['paris', 'france'] as const) {
    const hero = heroPoint(id, layout),
      story = graphPoint(id, layout);
    timeline.fromTo(
      find('[data-node-id="' + id + '"]'),
      { attr: { transform: 'translate(' + hero.x + ' ' + hero.y + ')' } },
      {
        attr: { transform: 'translate(' + story.x + ' ' + story.y + ')' },
        duration: 1,
      },
      0,
    );
  }
  graphLinks.forEach(([from, to], index) => {
    if (![from, to].some((id) => id === 'paris' || id === 'france')) return;
    timeline.fromTo(
      find('[data-network-edge="' + index + '"]'),
      { attr: { d: curvedLink(introPoint(from), introPoint(to)) } },
      {
        attr: {
          d: curvedLink(graphPoint(from, layout), graphPoint(to, layout)),
        },
        duration: 1,
      },
      0,
    );
  });
  peripheralPoints.forEach((point, index) => {
    if (point.anchor !== 'paris' && point.anchor !== 'france') return;
    timeline.fromTo(
      find('[data-peripheral-path="' + index + '"]'),
      {
        attr: {
          d: curvedLink(
            introPoint(point.anchor),
            layout === 'mobile' ? point.mobile : point,
          ),
        },
      },
      { attr: { d: peripheralPath(index, layout) }, duration: 1 },
      0,
    );
  });
  // Reveal branches once the growing viewBox can contain their labels.
  const expansionStart = layout === 'mobile' ? 0.8 : 0.65;
  timeline
    .fromTo(
      find('[data-corrected-edge]'),
      {
        attr: {
          d: curvedLink(
            heroPoint('paris', layout),
            heroPoint('france', layout),
          ),
        },
      },
      { attr: { d: correctionPath(layout, true) }, duration: 1 },
      0,
    )
    .fromTo(
      find('[data-expansion]'),
      { opacity: 0 },
      { opacity: 1, duration: 1 - expansionStart },
      expansionStart,
    )
    .fromTo(
      find('[data-label-frame]'),
      { opacity: 1 },
      { opacity: 0, duration: 0.6 },
      0.2,
    );
  const exit = knowledgeStoryMotion.heroExit;
  // Clear lower copy first; keep the headline readable until the graph takes focus.
  for (const [selector, start] of [
    ['.kb-hero-metric, .kb-entry-hint', exit.metricStart],
    ['.kb-introduction', exit.descriptionStart],
    ['.kb-subheading', exit.subtitleStart],
    [
      '[data-hero-copy] h1, [data-hero-copy] .eyebrow, .kb-hero-steps',
      exit.titleStart,
    ],
  ] as const) {
    timeline.fromTo(
      find(selector),
      { opacity: 1 },
      { opacity: 0, duration: exit.duration },
      start,
    );
  }
  timeline.fromTo(
    find('.kb-facts'),
    { opacity: 1 },
    { opacity: 0, duration: 0.15 },
    0,
  );
  return timeline;
}

export function createGraphTimeline(
  root: HTMLElement,
  mobile: boolean,
  revealText = true,
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
    .set(find('[data-network-detail], [data-reveal-group]'), { opacity: 0 }, 0)
    .set(
      find(
        '[data-graph-layer="viewport"], [data-graph-layer="priority"], [data-graph-layer="backend"], [data-backend-node], [data-proposal-label], [data-edit-path], [data-return-path], [data-edit-label], [data-return-label], [data-graph-metric]',
      ),
      { opacity: 0 },
      0,
    )
    .set(find('[data-corrected-edge]'), { opacity: 1 }, 0)
    .set(find('[data-incorrect-edge]'), { opacity: 0 }, 0);

  // Small relationship groups reveal in place, then settle before focus begins.
  for (const [group, start] of [1, 7, 13].entries()) {
    timeline.to(
      find('[data-reveal-group="' + group + '"]'),
      { opacity: 1, duration: 4 },
      start,
    );
  }
  timeline
    .to(find('[data-network-detail]'), { opacity: 0.35, duration: 3 }, 18)
    .to(
      find(
        '[data-distant-detail]:not(.kb-node), .kb-node[data-distant-detail] circle',
      ),
      { opacity: 0.16, duration: 4 },
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
    )
    .fromTo(
      find('[data-story-progress]'),
      { scaleX: 0 },
      { scaleX: 1, duration: 100 },
      0,
    );

  if (mobile) {
    // Keep the same node positions; contrast alone makes room for the response.
    timeline
      .to(
        find('[data-flow-soften], [data-graph-layer="structure"]'),
        { opacity: 0.12, duration: 3 },
        47,
      )
      .to(
        find('[data-flow-soften], [data-graph-layer="structure"]'),
        { opacity: 1, duration: 4 },
        80,
      );
  }
  if (revealText) {
    root.querySelectorAll('li[data-story-beat]').forEach((beat, index) => {
      const start = [0, 25, 50, 80][index];
      if (start !== undefined)
        timeline.fromTo(
          beat.querySelectorAll('h2, p'),
          { opacity: 0, y: 12 },
          {
            opacity: 1,
            y: 0,
            duration: knowledgeStoryMotion.textRevealDuration,
            stagger: knowledgeStoryMotion.textRevealStagger,
          },
          start,
        );
    });
  }
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
