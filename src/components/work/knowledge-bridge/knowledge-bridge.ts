import { gsap, CSSPlugin } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import { knowledgeBridgeMeasurements } from '../../../content/knowledge-bridge';
import {
  createGraphTimeline,
  knowledgeStoryMotion,
  resetGraphPresentation,
} from './graph-motion';
import { applyGraphLayout } from './graph-layout';
import { mountHistory } from './history-controller';
import { getStoryBeat } from './story-state';

gsap.registerPlugin(CSSPlugin, ScrollTrigger, Flip);
const mounted = new WeakMap<HTMLElement, () => void>();

export function mountKnowledgeBridge(root: HTMLElement): () => void {
  const existing = mounted.get(root);
  if (existing) return existing;
  function required<T extends Element>(selector: string): T {
    const element = root.querySelector<T>(selector);
    if (!element)
      throw new Error(`Knowledge Bridge markup missing: ${selector}`);
    return element;
  }
  const stage = required<HTMLElement>('[data-story-stage]');
  const copy = required<HTMLElement>('[data-story-copy]');
  const figure = required<HTMLElement>('.kb-story-figure');
  const host = required<HTMLElement>('[data-network-host]');
  const heroDock = required<HTMLElement>('[data-hero-dock]');
  const storyDock = required<HTMLElement>('[data-story-dock]');
  const heroValue = required<HTMLElement>('[data-hero-value]');
  const hint = required<HTMLElement>('[data-scroll-hint]');
  const progress = required<HTMLElement>('[data-story-progress-track]');
  const beats = root.querySelectorAll<HTMLElement>('li[data-story-beat]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const events = new AbortController();
  const motion = gsap.matchMedia();
  const disposeHistory = mountHistory(root, reduced);
  const heroTotal = knowledgeBridgeMeasurements[0].reduction;
  let heroTween: gsap.core.Tween | undefined;
  const heroMotion = gsap.context(() => {
    if (reduced.matches) return;
    const count = { value: 0 };
    heroValue.textContent = '0';
    heroTween = gsap.to(count, {
      value: heroTotal,
      duration: knowledgeStoryMotion.heroCountDuration,
      ease: 'power2.out',
      onUpdate: () => {
        heroValue.textContent = count.value.toFixed(1);
      },
      scrollTrigger: { trigger: heroValue, start: 'top 90%', once: true },
    });
  }, root);
  reduced.addEventListener(
    'change',
    () => {
      if (reduced.matches) {
        heroTween?.progress(1).pause();
        heroTween?.scrollTrigger?.kill();
        heroValue.textContent = String(heroTotal);
      }
    },
    { signal: events.signal },
  );

  motion.add(
    {
      wide: '(min-width: 1100px)',
      desktop: '(min-width: 1100px) and (min-height: 650px)',
      tablet:
        '(min-width: 768px) and (max-width: 1099px) and (min-height: 850px)',
      reduced: '(prefers-reduced-motion: reduce)',
      full: '(prefers-reduced-motion: no-preference)',
    },
    (context) => {
      resetGraphPresentation(root);
      const pinned =
        Boolean(context.conditions?.desktop || context.conditions?.tablet) &&
        !context.conditions?.reduced;
      root.dataset.caseMotion = context.conditions?.reduced
        ? 'reduced'
        : 'full';
      root.dataset.storyMode = context.conditions?.reduced
        ? 'static'
        : pinned
          ? 'pinned'
          : 'scroll';
      const desktopGraph = Boolean(context.conditions?.wide) || pinned;
      applyGraphLayout(root, desktopGraph ? 'desktop' : 'mobile');
      const transfers = gsap.context(() => {}, root);
      function placeNetwork(dock: HTMLElement, animate = false) {
        Flip.killFlipsOf(host);
        if (host.parentElement === dock) return;
        const state = animate ? Flip.getState(host) : null;
        dock.append(host);
        if (state)
          transfers.add(() => {
            Flip.from(state, {
              duration: knowledgeStoryMotion.transferDuration,
              ease: 'power2.inOut',
              scale: true,
              absolute: true,
            });
          });
      }
      if (context.conditions?.desktop && !context.conditions?.reduced) {
        root.dataset.networkEnhanced = 'true';
        placeNetwork(
          stage.getBoundingClientRect().top > innerHeight * 0.9
            ? heroDock
            : storyDock,
        );
        ScrollTrigger.create({
          id: 'knowledge-bridge-intro',
          trigger: stage,
          start: 'top 90%',
          end: 'top top',
          onEnter: () => placeNetwork(storyDock, true),
          onLeaveBack: () => placeNetwork(heroDock, true),
        });
      } else {
        delete root.dataset.networkEnhanced;
        placeNetwork(storyDock);
      }
      if (!context.conditions?.reduced) {
        hint.hidden = false;
        progress.hidden = false;
        const timeline = createGraphTimeline(root, !desktopGraph, pinned);
        let current = -1;
        function showBeat() {
          const index = getStoryBeat(timeline.progress());
          if (index === current) return;
          current = index;
          beats.forEach((beat, beatIndex) => {
            beat.dataset.active = String(index === beatIndex);
          });
          root.dataset.storyBeat = String(index);
        }
        timeline.eventCallback('onUpdate', showBeat);
        showBeat();
        const readingAnchor = () =>
          figure.offsetHeight +
          Math.min(200, (innerHeight - figure.offsetHeight) * 0.72);
        ScrollTrigger.create({
          id: 'knowledge-bridge-story',
          trigger: pinned ? stage : copy,
          animation: timeline,
          pin: pinned ? stage : false,
          start: pinned ? 'top top' : () => `top ${readingAnchor()}px`,
          end: pinned
            ? () =>
                `+=${innerHeight * (context.conditions?.tablet ? knowledgeStoryMotion.tabletScrollScreens : knowledgeStoryMotion.scrollScreens)}`
            : () => `bottom ${readingAnchor()}px`,
          scrub: knowledgeStoryMotion.scrub,
          invalidateOnRefresh: true,
          anticipatePin: pinned ? 1 : 0,
          onEnter: () => {
            if (pinned) placeNetwork(storyDock);
          },
          onEnterBack: () => {
            if (pinned) placeNetwork(storyDock);
          },
        });
      }
      return () => {
        transfers.revert();
        Flip.killFlipsOf(host);
        storyDock.append(host);
        host.removeAttribute('style');
        delete root.dataset.networkEnhanced;
        resetGraphPresentation(root);
        applyGraphLayout(root, 'mobile');
        hint.hidden = true;
        progress.hidden = true;
        beats.forEach((beat) => {
          delete beat.dataset.active;
        });
        delete root.dataset.storyBeat;
        root.dataset.storyMode = 'static';
      };
    },
    root,
  );
  root.dataset.caseReady = 'true';
  void document.fonts.ready.then(() => {
    if (mounted.has(root)) ScrollTrigger.refresh();
  });
  const dispose = () => {
    events.abort();
    motion.revert();
    heroMotion.revert();
    disposeHistory();
    storyDock.append(host);
    host.removeAttribute('style');
    resetGraphPresentation(root);
    applyGraphLayout(root, 'mobile');
    heroValue.textContent = String(heroTotal);
    delete root.dataset.caseReady;
    delete root.dataset.caseMotion;
    delete root.dataset.storyMode;
    delete root.dataset.networkEnhanced;
    mounted.delete(root);
  };
  mounted.set(root, dispose);
  return dispose;
}
