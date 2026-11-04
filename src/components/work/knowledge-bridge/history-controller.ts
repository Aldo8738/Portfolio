import { gsap } from 'gsap';
import { getHistoryFrame } from './history-state';
import { knowledgeStoryMotion } from './graph-motion';

export function mountHistory(root: HTMLElement, reduced: MediaQueryList) {
  const card = root.querySelector<HTMLElement>('[data-checkpoint]');
  const range = root.querySelector<HTMLInputElement>('[data-history-range]');
  const edge = root.querySelector<SVGPathElement>('[data-history-edge]');
  const endpoint = root.querySelector<SVGCircleElement>(
    '[data-history-endpoint]',
  );
  const caption = root.querySelector<HTMLElement>('[data-checkpoint-change]');
  const status = root.querySelector<HTMLElement>('[data-checkpoint-status]');
  const controls = root.querySelector<HTMLElement>(
    '[data-checkpoint-controls]',
  );
  const restore = root.querySelector<HTMLButtonElement>(
    '[data-checkpoint-restore]',
  );
  if (
    !card ||
    !range ||
    !edge ||
    !endpoint ||
    !caption ||
    !status ||
    !controls ||
    !restore
  )
    throw new Error('Knowledge Bridge history markup is incomplete');
  const buttons = root.querySelectorAll<HTMLButtonElement>(
    '[data-checkpoint-select]',
  );
  const events = new AbortController();
  const options = { signal: events.signal };
  const context = gsap.context(() => {}, card);
  const state = { progress: 1 };
  let tween: gsap.core.Tween | undefined;
  function render(announce = false) {
    if (
      !card ||
      !range ||
      !edge ||
      !endpoint ||
      !caption ||
      !status ||
      !restore
    )
      return;
    const frame = getHistoryFrame(state.progress);
    edge.setAttribute('d', frame.path);
    endpoint.setAttribute('cy', String(frame.y));
    card.dataset.checkpointVersion =
      frame.version === null ? 'transition' : String(frame.version);
    range.value = String(Math.round(frame.progress * 100));
    range.setAttribute('aria-valuetext', frame.description);
    edge.ownerSVGElement?.setAttribute('aria-label', frame.description);
    buttons.forEach((button, index) =>
      button.setAttribute('aria-pressed', String(frame.version === index)),
    );
    caption.textContent = frame.caption;
    restore.textContent =
      frame.progress === 0 ? 'Restore correction' : 'Restore original';
    if (announce)
      status.textContent =
        frame.version === 0
          ? 'Original'
          : frame.version === 1
            ? 'Human correction'
            : 'Illustrative transition between saved checkpoints';
  }
  function select(progress: 0 | 1) {
    tween?.kill();
    if (reduced.matches) {
      state.progress = progress;
      render(true);
      return;
    }
    context.add(() => {
      tween = gsap.to(state, {
        progress,
        duration: knowledgeStoryMotion.checkpointDuration,
        ease: 'power1.inOut',
        onUpdate: () => render(),
        onComplete: () => render(true),
      });
    });
  }
  range.addEventListener(
    'input',
    () => {
      tween?.kill();
      state.progress = range.valueAsNumber / 100;
      render();
    },
    options,
  );
  range.addEventListener('change', () => render(true), options);
  buttons.forEach((button, index) =>
    button.addEventListener(
      'click',
      () => select(index === 0 ? 0 : 1),
      options,
    ),
  );
  restore.addEventListener(
    'click',
    () => select(state.progress > 0 ? 0 : 1),
    options,
  );
  reduced.addEventListener(
    'change',
    () => {
      if (reduced.matches) tween?.progress(1).pause();
    },
    options,
  );
  controls.hidden = false;
  restore.hidden = false;
  return () => {
    events.abort();
    context.revert();
    state.progress = 1;
    render(true);
    controls.hidden = true;
    restore.hidden = true;
  };
}
