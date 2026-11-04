import { gsap } from 'gsap';
import { graphPoint, correctionPath } from '../../../content/knowledge-graph';

export const knowledgeStoryMotion = {
  heroCountDuration: 1.8,
  scrollScreens: 2.1,
  tabletScrollScreens: 1.8,
  scrub: 0.25,
  checkpointDuration: 0.32,
  transferDuration: 0.65,
  textRevealDuration: 6,
  textRevealStagger: 3,
} as const;

export function resetGraphPresentation(root: HTMLElement) {
  // Restore authored presentation after overlapping, time-zero SVG tweens revert.
  root
    .querySelectorAll(
      '.kb-graph [style], [data-graph-metric], [data-story-progress], li[data-story-beat], li[data-story-beat] h2, li[data-story-beat] p',
    )
    .forEach((element) => element.removeAttribute('style'));
  root
    .querySelector('[data-graph-layer="viewport"]')
    ?.removeAttribute('transform');
  root.querySelector('[data-graph-scene]')?.removeAttribute('transform');
}

export function createGraphTimeline(
  root: HTMLElement,
  mobile: boolean,
  revealText = true,
) {
  const find = (selector: string) => root.querySelectorAll(selector);
  const timeline = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
  timeline
    .addLabel('overload', 0)
    .addLabel('viewport', 25)
    .addLabel('feedback', 50)
    .addLabel('evidence', 80)
    .set(find('[data-extra-detail]'), { opacity: 0.12 }, 0)
    .set(
      find(
        '[data-graph-layer="viewport"], [data-graph-layer="priority"], [data-graph-layer="backend"], [data-edit-path], [data-return-path], [data-edit-label], [data-return-label], [data-corrected-edge], [data-graph-metric]',
      ),
      { opacity: 0 },
      0,
    )
    .set(find('[data-incorrect-edge]'), { opacity: 1 }, 0)
    .to(
      find('[data-extra-detail]'),
      { opacity: 1, duration: 12, stagger: 0.7 },
      2,
    )
    .to(find('[data-graph-layer="viewport"]'), { opacity: 1, duration: 3 }, 25)
    .fromTo(
      find('[data-viewport-frame]'),
      { strokeDasharray: 1, strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 7, ease: 'power2.inOut' },
      25,
    )
    .to(
      find('[data-distant-detail]'),
      { opacity: 0.17, duration: 7, ease: 'power2.inOut' },
      30,
    )
    .to(find('[data-near-detail]'), { opacity: 0.5, duration: 3 }, 30)
    .to(find('[data-near-detail]'), { opacity: 1, duration: 7, stagger: 1 }, 34)
    .to(find('[data-graph-layer="priority"]'), { opacity: 1, duration: 3 }, 34)
    .to(find('[data-graph-layer="priority"]'), { opacity: 0, duration: 3 }, 46)
    .fromTo(
      find('[data-graph-layer="viewport"]'),
      { attr: { transform: 'translate(-5 0)' } },
      {
        attr: { transform: 'translate(5 0)' },
        duration: 18,
        ease: 'power1.inOut',
      },
      30,
    )
    .to(
      find('[data-graph-layer="viewport"]'),
      { opacity: mobile ? 0 : 0.3, duration: 4 },
      50,
    )
    .to(find('[data-selection-ring]'), { opacity: 1, duration: 3 }, 51)
    .to(find('[data-graph-layer="backend"]'), { opacity: 1, duration: 3 }, 51)
    .to(
      find('[data-edit-path], [data-edit-label]'),
      { opacity: 1, duration: 2 },
      54,
    )
    .fromTo(
      find('[data-edit-path]'),
      { strokeDasharray: 1, strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 4, ease: 'power2.inOut' },
      54,
    )
    .to(find('[data-backend-pulse]'), { opacity: 1, duration: 3 }, 62)
    .to(
      find('[data-return-path], [data-return-label]'),
      { opacity: 1, duration: 2 },
      66,
    )
    .fromTo(
      find('[data-return-path]'),
      { strokeDasharray: 1, strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 4, ease: 'power2.inOut' },
      66,
    )
    .to(find('[data-incorrect-edge]'), { opacity: 0, duration: 3 }, 74)
    .fromTo(
      find('[data-corrected-edge]'),
      { opacity: 0, strokeDasharray: 1, strokeDashoffset: 1 },
      { opacity: 1, strokeDashoffset: 0, duration: 4 },
      74,
    )
    .to(find('[data-backend-pulse]'), { opacity: 0, duration: 3 }, 72)
    .to(
      find(
        '[data-graph-layer="backend"], [data-graph-layer="viewport"], [data-selection-ring]',
      ),
      { opacity: 0, duration: 4 },
      80,
    )
    .to(find('[data-network-detail]'), { opacity: 0.25, duration: 7 }, 80)
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
    timeline
      .to(find('[data-flow-soften]'), { opacity: 0, duration: 5 }, 50)
      .to(
        find('[data-graph-layer="structure"]'),
        { opacity: 0, duration: 5 },
        50,
      )
      .to(find('[data-network-detail]'), { opacity: 0.04, duration: 5 }, 50)
      .to(
        find('[data-flow-soften], [data-graph-layer="structure"]'),
        { opacity: 1, duration: 6 },
        80,
      );
    for (const id of ['skyrim', 'sports', 'rpg']) {
      const flow = graphPoint(id, 'mobile', true);
      const base = graphPoint(id, 'mobile');
      timeline
        .to(
          find(`[data-node-id="${id}"]`),
          {
            attr: { transform: `translate(${flow.x} ${flow.y})` },
            duration: 6,
            ease: 'power2.inOut',
          },
          50,
        )
        .to(
          find(`[data-node-id="${id}"]`),
          {
            attr: { transform: `translate(${base.x} ${base.y})` },
            duration: 6,
            ease: 'power2.inOut',
          },
          80,
        );
    }
    for (const corrected of [false, true]) {
      const selector = corrected
        ? '[data-corrected-edge]'
        : '[data-incorrect-edge]';
      timeline
        .to(
          find(selector),
          {
            attr: { d: correctionPath('mobile', corrected, true) },
            duration: 6,
            ease: 'power2.inOut',
          },
          50,
        )
        .to(
          find(selector),
          {
            attr: { d: correctionPath('mobile', corrected) },
            duration: 6,
            ease: 'power2.inOut',
          },
          80,
        );
    }
  } else {
    timeline
      .to(
        find('.kb-graph'),
        {
          attr: { viewBox: '40 25 860 575' },
          duration: 6,
          ease: 'power2.inOut',
        },
        50,
      )
      .to(
        find('.kb-graph'),
        {
          attr: { viewBox: '40 25 800 550' },
          duration: 6,
          ease: 'power2.inOut',
        },
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
    8,
  );
  addPacket(
    timeline,
    root,
    '[data-edit-path]',
    '[data-feedback-packet]',
    54,
    8,
  );
  addPacket(
    timeline,
    root,
    '[data-return-path]',
    '[data-delivery-packet]',
    66,
    8,
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
