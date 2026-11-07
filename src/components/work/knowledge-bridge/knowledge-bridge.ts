import { gsap, CSSPlugin } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  graphViewBox,
  overloadViewBox,
} from '../../../content/knowledge-graph';
import { knowledgeBridgeMeasurements } from '../../../content/knowledge-bridge';
import {
  createChapterTimeline,
  createGraphTimeline,
  knowledgeStoryMotion,
  resetGraphPresentation,
} from './graph-motion';
import { applyGraphLayout } from './graph-layout';
import { mountHistory } from './history-controller';
import { getStoryBeat, getFocusedStoryBeat } from './story-state';

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
  const stage = required<HTMLElement>('[data-story-stage]');
  const copy = required<HTMLElement>('[data-story-copy]');
  const figure = required<HTMLElement>('.kb-story-figure');
  const storyLayout = required<HTMLElement>('.kb-story-layout');
  const host = required<HTMLElement>('[data-network-host]');
  const storyDock = required<HTMLElement>('[data-story-dock]');
  const chapterDock = required<HTMLElement>('[data-chapter-one-dock]');
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
        const chapterTimeline = createChapterTimeline(root, layout, pinned);
        root.dataset.graphEntry = '0.000';
        const clamp = gsap.utils.clamp(0, 1);
        const setOpacity = gsap.quickSetter(host, 'opacity');
        const setX = gsap.quickSetter(host, 'x', 'px');
        const setY = gsap.quickSetter(host, 'y', 'px');
        let storyTrigger: ScrollTrigger | undefined;
        type Box = { x: number; y: number; width: number; height: number };
        let storyBox: Box | undefined;
        let chapterBox: Box | undefined;
        const storyTimeline = createGraphTimeline(root, !desktopGraph, pinned);
        let chapterTrigger: ScrollTrigger | undefined;
        let sticky = { top: 0, bottom: 0, height: 0, inset: 0, dockOffset: 0 };
        const rendered = {
          x: NaN,
          y: NaN,
          width: NaN,
          height: NaN,
          opacity: NaN,
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
          if (!storyBox || !chapterBox) return;
          // Reuse sampled scroll and refresh-time boxes; no scroll-frame layout reads.
          const scroll = storyTrigger?.scroll() ?? scrollY;
          const chapter = pinned
            ? storyTimeline.progress() / knowledgeStoryMotion.chapterFraction
            : chapterTimeline.progress();
          const blend = pinned
            ? clamp((chapter - 0.88) / 0.12)
            : clamp(
                (scroll - (chapterTrigger?.end ?? 0)) / (viewportHeight * 0.3),
              );
          const fromY = pinned
            ? chapterBox.y - scroll + pinOffset(scroll)
            : Math.min(
                Math.max(chapterBox.y - scroll, viewportHeight * 0.16),
                (chapterTrigger?.end ?? 0) - scroll + viewportHeight * 0.16,
              );
          const toY = pinned
            ? storyBox.y - scroll + pinOffset(scroll)
            : Math.min(
                Math.max(sticky.top - scroll, sticky.inset),
                sticky.bottom - scroll - sticky.height,
              ) + sticky.dockOffset;
          const x = chapterBox.x + (storyBox.x - chapterBox.x) * blend;
          const y = fromY + (toY - fromY) * blend;
          const width =
            chapterBox.width + (storyBox.width - chapterBox.width) * blend;
          const height =
            chapterBox.height + (storyBox.height - chapterBox.height) * blend;
          const opacity =
            scroll < (chapterTrigger?.start ?? 0) && !pinned ? 0 : 1;
          if (opacity !== rendered.opacity) {
            setOpacity(opacity);
            rendered.opacity = opacity;
          }
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
          const to = storyDock.getBoundingClientRect();
          storyBox = {
            x: to.x,
            y: to.y + scroll - pinOffset(scroll),
            width: to.width,
            height: to.height,
          };
          const chapter = chapterDock.getBoundingClientRect();
          chapterBox = {
            x: chapter.x,
            y: chapter.y + scroll - pinOffset(scroll),
            width: chapter.width,
            height: pinned ? chapter.height : innerHeight * 0.65,
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
        chapterTimeline.eventCallback('onUpdate', () => {
          const chapter = chapterTimeline.progress();
          root.dataset.graphEntry = chapter.toFixed(3);
          root.dataset.chapterScene =
            chapter < 0.26
              ? 'text'
              : chapter < 0.6
                ? 'overload'
                : chapter < 0.74
                  ? 'focus'
                  : 'clean';
          queueNetwork();
        });
        const timeline = storyTimeline;
        let current = -1;
        function showBeat(progress = 0) {
          const index = pinned
            ? getFocusedStoryBeat(progress)
            : storyTrigger && storyTrigger.scroll() >= storyTrigger.start
              ? getStoryBeat(0.25 + progress * 0.75)
              : 0;
          if (pinned)
            chapterTimeline.progress(
              Math.min(1, progress / knowledgeStoryMotion.chapterFraction),
            );
          if (index !== current) {
            current = index;
            beats.forEach((beat, beatIndex) => {
              beat.dataset.active = String(index === beatIndex);
            });
            root.dataset.storyBeat = String(index);
          }
          queueNetwork();
        }
        timeline.eventCallback('onUpdate', queueNetwork);
        showBeat();
        const readingAnchor = () =>
          desktopGraph
            ? innerHeight * knowledgeStoryMotion.readingFraction
            : figure.offsetHeight +
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
          onUpdate: (trigger) => showBeat(trigger.progress),
          // GSAP suppresses animation callbacks while restoring progress on refresh.
          onRefresh: (trigger) => {
            storyTrigger = trigger;
            measureNetwork();
            showBeat(trigger.progress);
          },
        });
        if (!pinned) {
          chapterTrigger = ScrollTrigger.create({
            id: 'knowledge-bridge-chapter-one',
            trigger: chapterDock,
            start: 'top 25%',
            end: () => '+=' + innerHeight * 1.5,
            animation: chapterTimeline,
            scrub: knowledgeStoryMotion.scrub,
            invalidateOnRefresh: true,
            onRefresh: (trigger) => {
              chapterTrigger = trigger;
              measureNetwork();
            },
          });
        }
        window.addEventListener('scroll', queueNetwork, {
          passive: true,
          signal: scrollEvents.signal,
        });
        measureNetwork();
      } else {
        root.dataset.networkEnhanced = 'true';
        let previousChapter: boolean | undefined;
        function positionStaticNetwork() {
          const chapter = chapterDock.getBoundingClientRect();
          const inChapter = chapter.bottom > innerHeight * 0.3;
          const target = inChapter
            ? chapter
            : storyDock.getBoundingClientRect();
          if (inChapter !== previousChapter) {
            previousChapter = inChapter;
            root.dataset.chapterScene = inChapter ? 'overload' : 'clean';
            gsap.set(root.querySelector('.kb-graph'), {
              attr: {
                viewBox: inChapter
                  ? overloadViewBox[layout]
                  : graphViewBox[layout].story,
              },
            });
            gsap.set(root.querySelectorAll('[data-overload-only]'), {
              opacity: inChapter ? 1 : 0,
            });
          }
          gsap.set(host, {
            x: target.x,
            y: target.y,
            width: target.width,
            height: inChapter ? innerHeight * 0.6 : target.height,
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
        delete root.dataset.chapterScene;
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
    // Reserve pin space before teardown so native history keeps the current scroll.
    delete root.dataset.caseReady;
    events.abort();
    motion.revert();
    heroMotion.revert();
    disposeHistory();
    resetGraphPresentation(root);
    applyGraphLayout(root, 'mobile');
    heroValue.textContent = String(heroTotal);
    delete root.dataset.caseMotion;
    delete root.dataset.storyMode;
    delete root.dataset.networkEnhanced;
    mounted.delete(root);
  };
  mounted.set(root, dispose);
  return dispose;
}
