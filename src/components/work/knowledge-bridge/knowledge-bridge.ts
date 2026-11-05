import { gsap, CSSPlugin } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { knowledgeBridgeMeasurements } from '../../../content/knowledge-bridge';
import {
  heroPoint,
  curvedLink,
  graphViewBox,
} from '../../../content/knowledge-graph';
import {
  createGraphIntro,
  createGraphTimeline,
  knowledgeStoryMotion,
  resetGraphPresentation,
} from './graph-motion';
import { applyGraphLayout } from './graph-layout';
import { mountHistory } from './history-controller';
import { getStoryBeat } from './story-state';

gsap.registerPlugin(CSSPlugin, ScrollTrigger);
const mounted = new WeakMap<HTMLElement, () => void>();

export function mountKnowledgeBridge(root: HTMLElement): () => void {
  const existing = mounted.get(root);
  if (existing) return existing;
  function required<T extends Element>(selector: string): T {
    const element = root.querySelector<T>(selector);
    if (!element)
      throw new Error('Knowledge Bridge markup missing: ' + selector);
    return element;
  }
  const hero = required<HTMLElement>('.kb-hero');
  const facts = required<HTMLElement>('.kb-facts');
  const stage = required<HTMLElement>('[data-story-stage]');
  const copy = required<HTMLElement>('[data-story-copy]');
  const figure = required<HTMLElement>('.kb-story-figure');
  const storyLayout = required<HTMLElement>('.kb-story-layout');
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
      const desktopGraph = Boolean(context.conditions?.wide) || pinned;
      const layout = desktopGraph ? 'desktop' : 'mobile';
      root.dataset.caseMotion = context.conditions?.reduced
        ? 'reduced'
        : 'full';
      root.dataset.storyMode = context.conditions?.reduced
        ? 'static'
        : pinned
          ? 'pinned'
          : 'scroll';
      applyGraphLayout(root, layout);
      const scrollEvents = new AbortController();

      if (!context.conditions?.reduced) {
        root.dataset.networkEnhanced = 'true';
        hint.hidden = false;
        progress.hidden = false;
        const intro = createGraphIntro(root, layout);
        root.dataset.graphEntry = intro.progress().toFixed(3);
        let entryStart = 0;
        let entryDistance = 0;
        const heroContent = root.querySelectorAll(
          '[data-hero-copy], .kb-hero-metric, .kb-hero-steps, .kb-entry-hint',
        );
        const setX = gsap.quickSetter(host, 'x', 'px');
        const setY = gsap.quickSetter(host, 'y', 'px');
        const setHeroY = gsap.quickSetter(heroContent, 'y', 'px');
        let storyTrigger: ScrollTrigger | undefined;
        let heroBox:
          { x: number; y: number; width: number; height: number } | undefined;
        let storyBox: typeof heroBox;
        let sticky = { top: 0, bottom: 0, height: 0, inset: 0, dockOffset: 0 };
        const rendered = {
          x: NaN,
          y: NaN,
          width: NaN,
          height: NaN,
          heroY: NaN,
          visibility: '',
        };
        let queued = false;
        let viewportHeight = 0;
        function pinOffset(scroll: number) {
          if (!pinned || !storyTrigger) return 0;
          if (storyTrigger.isActive) return scroll - storyTrigger.start;
          return storyTrigger.progress >= 1
            ? storyTrigger.end - storyTrigger.start
            : 0;
        }
        // One fixed scene follows reserved layout targets. Its parent and SVG never change.
        function positionNetwork() {
          gsap.ticker.remove(positionNetwork);
          queued = false;
          if (!heroBox || !storyBox) return;
          // Reuse ScrollTrigger's sampled scroll; a fresh window read can flush SVG layout.
          const scroll = storyTrigger?.scroll() ?? scrollY;
          const blend = intro.progress();
          const heroY = Math.max(
            0,
            Math.min(entryDistance, scroll - entryStart),
          );
          if (desktopGraph && heroY !== rendered.heroY) {
            setHeroY(heroY);
            rendered.heroY = heroY;
          }
          const fromY = heroBox.y - scroll;
          const toY = pinned
            ? storyBox.y - scroll + pinOffset(scroll)
            : Math.min(
                Math.max(sticky.top - scroll, sticky.inset),
                sticky.bottom - scroll - sticky.height,
              ) + sticky.dockOffset;
          const x = heroBox.x + (storyBox.x - heroBox.x) * blend;
          const y = fromY + (toY - fromY) * blend;
          const width =
            heroBox.width + (storyBox.width - heroBox.width) * blend;
          const height =
            heroBox.height + (storyBox.height - heroBox.height) * blend;
          const visibility =
            y + height < 0 || y > viewportHeight ? 'hidden' : 'visible';
          if (visibility !== rendered.visibility) {
            host.style.visibility = visibility;
            rendered.visibility = visibility;
          }
          if (visibility === 'hidden') return;
          if (width !== rendered.width) {
            host.style.width = width + 'px';
            rendered.width = width;
          }
          if (height !== rendered.height) {
            host.style.height = height + 'px';
            rendered.height = height;
          }
          if (x !== rendered.x) {
            setX(x);
            rendered.x = x;
          }
          if (y !== rendered.y) {
            setY(y);
            rendered.y = y;
          }
        }
        function queueNetwork() {
          if (queued || scrollEvents.signal.aborted) return;
          queued = true;
          gsap.ticker.add(positionNetwork);
        }
        function measureNetwork() {
          // Read only on layout refresh, before the frame's placement writes.
          const scroll = scrollY;
          viewportHeight = innerHeight;
          const from = heroDock.getBoundingClientRect(),
            to = storyDock.getBoundingClientRect();
          heroBox = {
            x: from.x,
            y: from.y + scroll,
            width: from.width,
            height: from.height,
          };
          storyBox = {
            x: to.x,
            y: to.y + scroll - pinOffset(scroll),
            width: to.width,
            height: to.height,
          };
          if (!pinned) {
            const parent = storyLayout.getBoundingClientRect(),
              bounds = figure.getBoundingClientRect();
            sticky = {
              top: parent.top + scroll,
              bottom: parent.bottom + scroll,
              height: bounds.height,
              inset: parseFloat(getComputedStyle(figure).top),
              dockOffset: to.top - bounds.top,
            };
          }
          gsap.ticker.remove(positionNetwork);
          positionNetwork();
        }
        scrollEvents.signal.addEventListener(
          'abort',
          () => gsap.ticker.remove(positionNetwork),
          { once: true },
        );
        intro.eventCallback('onUpdate', () => {
          root.dataset.graphEntry = intro.progress().toFixed(3);
          queueNetwork();
        });
        ScrollTrigger.create({
          id: 'knowledge-bridge-entry',
          trigger: facts,
          // Read the full hero in natural flow before fading or holding its copy.
          start: () =>
            Math.max(
              0,
              facts.getBoundingClientRect().bottom +
                scrollY -
                innerHeight +
                parseFloat(getComputedStyle(hero).paddingBottom),
            ),
          endTrigger: stage,
          end: 'top top',
          animation: intro,
          scrub: knowledgeStoryMotion.scrub,
          invalidateOnRefresh: true,
          onRefresh: (trigger) => {
            entryStart = trigger.start;
            entryDistance = trigger.end - trigger.start;
            root.dataset.graphEntry = intro.progress().toFixed(3);
            measureNetwork();
          },
        });
        const timeline = createGraphTimeline(root, !desktopGraph, pinned);
        let current = -1;
        function showBeat() {
          const index = getStoryBeat(timeline.progress());
          if (index !== current) {
            current = index;
            beats.forEach((beat, beatIndex) => {
              beat.dataset.active = String(index === beatIndex);
            });
            root.dataset.storyBeat = String(index);
          }
          queueNetwork();
        }
        timeline.eventCallback('onUpdate', showBeat);
        showBeat();
        const readingAnchor = () =>
          figure.offsetHeight +
          Math.min(
            knowledgeStoryMotion.readingGap,
            (innerHeight - figure.offsetHeight) *
              knowledgeStoryMotion.readingFraction,
          );
        storyTrigger = ScrollTrigger.create({
          id: 'knowledge-bridge-story',
          trigger: pinned ? stage : copy,
          animation: timeline,
          pin: pinned ? stage : false,
          start: pinned ? 'top top' : () => 'top ' + readingAnchor() + 'px',
          end: pinned
            ? () =>
                '+=' +
                innerHeight *
                  (context.conditions?.tablet
                    ? knowledgeStoryMotion.tabletScrollScreens
                    : knowledgeStoryMotion.scrollScreens)
            : () => 'bottom ' + readingAnchor() + 'px',
          scrub: knowledgeStoryMotion.scrub,
          invalidateOnRefresh: true,
          anticipatePin: pinned ? 1 : 0,
          // GSAP suppresses animation callbacks while restoring progress on refresh.
          onRefresh: (trigger) => {
            storyTrigger = trigger;
            measureNetwork();
            showBeat();
          },
        });
        window.addEventListener('scroll', queueNetwork, {
          passive: true,
          signal: scrollEvents.signal,
        });
        measureNetwork();
      } else {
        root.dataset.networkEnhanced = 'true';
        let inHero: boolean | undefined;
        function positionStaticNetwork() {
          const heroBounds = heroDock.getBoundingClientRect();
          const nextInHero = heroBounds.bottom > 0;
          if (inHero !== nextInHero) {
            inHero = nextInHero;
            applyGraphLayout(root, layout);
            gsap.set(root.querySelectorAll('[data-expansion]'), {
              opacity: inHero ? 0 : 1,
            });
            gsap.set(root.querySelectorAll('[data-label-frame]'), {
              opacity: inHero ? 1 : 0,
            });
            if (inHero) {
              gsap.set(root.querySelector('.kb-graph'), {
                attr: { viewBox: graphViewBox[layout].hero },
              });
              for (const id of ['paris', 'france'] as const) {
                const point = heroPoint(id, layout);
                gsap.set(root.querySelector('[data-node-id="' + id + '"]'), {
                  attr: {
                    transform: 'translate(' + point.x + ' ' + point.y + ')',
                  },
                });
              }
              gsap.set(root.querySelector('[data-corrected-edge]'), {
                attr: {
                  d: curvedLink(
                    heroPoint('paris', layout),
                    heroPoint('france', layout),
                  ),
                },
              });
            }
          }
          const target = inHero
            ? heroBounds
            : storyDock.getBoundingClientRect();
          gsap.set(host, {
            left: 0,
            top: 0,
            right: 'auto',
            maxHeight: 'none',
            x: target.x,
            y: target.y,
            width: target.width,
            height: target.height,
            visibility:
              target.bottom < 0 || target.top > innerHeight
                ? 'hidden'
                : 'visible',
          });
        }
        positionStaticNetwork();
        window.addEventListener('scroll', positionStaticNetwork, {
          passive: true,
          signal: scrollEvents.signal,
        });
        window.addEventListener('resize', positionStaticNetwork, {
          passive: true,
          signal: scrollEvents.signal,
        });
        void document.fonts.ready.then(() => {
          if (!scrollEvents.signal.aborted) positionStaticNetwork();
        });
      }
      return () => {
        scrollEvents.abort();
        delete root.dataset.networkEnhanced;
        resetGraphPresentation(root);
        applyGraphLayout(root, 'mobile');
        hint.hidden = true;
        progress.hidden = true;
        beats.forEach((beat) => {
          delete beat.dataset.active;
        });
        delete root.dataset.storyBeat;
        delete root.dataset.graphEntry;
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
